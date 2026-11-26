"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  type MotionValue,
  cubicBezier,
  motion,
  transform,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiArrowRight, FiCheck, FiCpu, FiGlobe, FiHelpCircle, FiUser } from "react-icons/fi";
import type { IconType } from "react-icons";

type MV = MotionValue<number>;

/** Put Image1.webp in /public/images (or change this path). */
const IMG = "/images/Image1.webp";
const SOFT = cubicBezier(0.22, 1, 0.36, 1);

/* ------------------------------------------------------------------ */
/* Scroll-scrubbed helpers (m = progress 0 → 1)                        */
/* ------------------------------------------------------------------ */
function Reveal({
  m, a, b, y = 14, x = 0, s = 1, className, children,
}: { m: MV; a: number; b: number; y?: number; x?: number; s?: number; className?: string; children?: ReactNode }) {
  const t = useTransform(m, [a, b], [0, 1], { ease: SOFT });
  const tf = useTransform(t, (v) => `translate3d(${x * (1 - v)}px,${y * (1 - v)}px,0) scale(${s + (1 - s) * v})`);
  return (
    <motion.div style={{ opacity: t, transform: tf }} className={className}>
      {children}
    </motion.div>
  );
}

function Count({ m, a, b, to }: { m: MV; a: number; b: number; to: number }) {
  const s = useTransform(m, (v) => String(Math.round(transform(v, [a, b], [0, to]))));
  return <motion.span>{s}</motion.span>;
}

/** Bubble whose text types out with scroll, without the bubble resizing while it types. */
function TypedBubble({ m, a, b, text, className }: { m: MV; a: number; b: number; text: string; className: string }) {
  const typed = useTransform(m, (v) => text.slice(0, Math.round(transform(v, [a, b], [0, text.length]))));
  const dots = useTransform(m, [a - 0.06, a - 0.04, a - 0.005, a + 0.01], [0, 1, 1, 0]);
  return (
    <Reveal m={m} a={a - 0.06} b={a - 0.03} className={`${className} relative`}>
      <span className="invisible block px-3 py-2">{text}</span>
      <motion.span className="absolute inset-0 px-3 py-2">{typed}</motion.span>
      <motion.span style={{ opacity: dots }} className="absolute left-3 top-1/2 flex -translate-y-1/2 gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--dark-text)]" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </motion.span>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Full-width background: knowledge streams flowing into the agent     */
/* ------------------------------------------------------------------ */
const SOURCES = [0.09, 0.26, 0.44, 0.61, 0.79, 0.93]; // start heights as a fraction of section height

function Backdrop({ m, tRef }: { m: MV; tRef: React.RefObject<HTMLSpanElement | null> }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [g, setG] = useState({ w: 0, h: 0, tx: 0, ty: 0 });

  useEffect(() => {
    let raf = 0;
    let tries = 0;

    const measure = () => {
      const box = boxRef.current;
      const t = tRef.current;
      if (!box || !t) {
        // heading not mounted yet: retry for a few frames
        if (tries++ < 30) raf = requestAnimationFrame(measure);
        return;
      }
      const b = box.getBoundingClientRect();
      const r = t.getBoundingClientRect();
      if (!b.width || !r.width) {
        if (tries++ < 30) raf = requestAnimationFrame(measure);
        return;
      }
      setG({
        w: b.width,
        h: b.height,
        tx: r.left - b.left + r.width * 0.55,
        ty: r.top - b.top + r.height * 0.58,
      });
    };

    measure();
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1000);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);

    // re-measure once the heading's entrance animation has finished (it starts shifted down)
    const off = m.on("change", (v) => {
      if (v > 0.05) {
        measure();
        off();
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
      off();
    };
  }, [tRef, m]);

  const draw = useTransform(m, [0, 0.16], [0, 1]);
  const flow = useTransform(m, [0.08, 0.22], [0, 0.65]);
  const beamY = useTransform(m, [0, 0.32], ["0%", "100%"]);
  const beamO = useTransform(m, [0, 0.04, 0.28, 0.34], [0, 0.6, 0.6, 0]);

  const sx = g.w - 24;

  return (
    <div ref={boxRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes ma-packet { to { stroke-dashoffset: -1; } }
        @media (prefers-reduced-motion: reduce) { .ma-packet { animation: none !important; } }
      `}</style>

      <div className="absolute inset-0 [background-image:radial-gradient(color-mix(in_srgb,var(--color-primary)_14%,transparent)_1px,transparent_1.3px)] [background-size:28px_28px] [mask-image:linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)]" />

      {g.w > 0 && (
        <svg
          className="absolute inset-0 hidden sm:block"
          width={g.w}
          height={g.h}
          viewBox={`0 0 ${g.w} ${g.h}`}
          style={{ overflow: "visible" }}
        >
          {SOURCES.map((f, i) => {
            const y = f * g.h;
            const ey = g.ty + (i - 2.5) * 1.5; // tiny spread so lines don't overlap exactly
            const d = `M${sx} ${y} C ${g.tx + (sx - g.tx) * 0.65} ${y}, ${g.tx + (sx - g.tx) * 0.3} ${ey}, ${g.tx} ${ey}`;
            return (
              <g key={i}>
                <motion.path d={d} fill="none" stroke="var(--main-green)" strokeOpacity={0.3} strokeWidth={1.2} style={{ pathLength: draw }} />
                <motion.g style={{ opacity: flow }}>
                  <path
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke="var(--main-light-green)"
                    strokeOpacity={0.6}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeDasharray="0.05 0.95"
                    className="ma-packet"
                    style={{ animation: `ma-packet ${5 + (i % 3) * 1.6}s linear ${-i * 1.1}s infinite` }}
                  />
                </motion.g>
                <circle cx={sx} cy={y} r={3.5} fill="var(--main-light-green)" />
              </g>
            );
          })}
        </svg>
      )}

      <motion.div style={{ top: beamY, opacity: beamO }}
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--main-light-green)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */
const STEPS: { icon: IconType; label: string; note: string; a: number; b: number }[] = [
  { icon: FiGlobe, label: "Website knowledge", note: "Reading your website and help pages", a: 0, b: 0.34 },
  { icon: FiHelpCircle, label: "Custom FAQs", note: "Matching your FAQs to the visitor’s question", a: 0.34, b: 0.67 },
  { icon: FiUser, label: "Human handoff", note: "Passing the chat to a teammate, with full context", a: 0.67, b: 1 },
];

function Step({ m, s, active, onClick }: { m: MV; s: (typeof STEPS)[number]; active: boolean; onClick: () => void }) {
  const fill = useTransform(m, [s.a, s.b], [0, 1]);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-500 ${
        active
          ? "border-[var(--main-light-green)] text-[var(--color-primary)]"
          : "border-[var(--text-gray)] text-[var(--light-gray)] hover:border-[var(--light-gray)]"
      }`}
    >
      <s.icon className={active ? "text-[var(--main-light-green)]" : ""} />
      {s.label}
      <motion.span style={{ scaleX: fill }} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--main-light-green)]" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
const Q1 = "Do you offer support on weekends?";
const A1 = "Here’s what our published support policy says about weekend availability…";
const Q2 = "I need a custom arrangement.";
const A2 = "That’s best handled by a team member. I can pass this conversation along.";

const BUB_IN = "w-fit max-w-[88%] rounded-2xl rounded-bl-sm bg-[var(--bg-light)] px-3 py-2 text-xs";
const BUB_OUT = "ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-sm bg-[var(--main-light-green)] text-xs";

export default function MeetAI() {
  const trackRef = useRef<HTMLElement>(null);
  const tRef = useRef<HTMLSpanElement>(null);
  const deskRef = useRef(true);
  const dv = useMotionValue(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => {
      deskRef.current = mq.matches;
      dv.set(dv.get() + 1);
    };
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [dv]);

  // Desktop: pinned stage. Mobile: progress while the section crosses the screen.
  const pinned = useScroll({ target: trackRef, offset: ["start start", "end end"] }).scrollYProgress;
  const flowing = useScroll({ target: trackRef, offset: ["start 75%", "end 55%"] }).scrollYProgress;
  const raw = useTransform([pinned, flowing, dv], ([a, b]: number[]) => (deskRef.current ? a : b));
  const m = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.0005 });

  useEffect(() => {
    const pick = (v: number) => (v < 0.34 ? 0 : v < 0.67 ? 1 : 2);
    setActive(pick(m.get()));
    return m.on("change", (v) => setActive(pick(v)));
  }, [m]);

  const jump = (i: number) => {
    const el = trackRef.current;
    if (!el || !deskRef.current) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top: top + [0.03, 0.42, 0.78][i] * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  // Image card: colour is revealed as the scan passes, then it keeps drifting
  const reveal = useTransform(m, [0.02, 0.3], ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]);
  const scanTop = useTransform(m, [0.02, 0.3], ["0%", "100%"]);
  const scanO = useTransform(m, [0.02, 0.06, 0.27, 0.32], [0, 1, 1, 0]);
  const imgY = useTransform(m, [0, 1], [30, -40]);
  const chatRY = useTransform(m, [0, 0.3], [-9, 0]);
  const emptyO = useTransform(m, [0.1, 0.28, 0.32], [1, 1, 0]);

  return (
    <section ref={trackRef} className="relative bg-black text-[var(--color-primary)] lg:h-[300vh]">
      <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]">
        <Backdrop m={m} tRef={tRef} />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:h-full lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-0">
          {/* Copy */}
          <div className="lg:col-span-5">
            <Reveal m={m} a={-0.1} b={0.04} y={20}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--text-gray)] px-3 py-1 text-xs font-medium text-[var(--light-gray)]">
                <FiCpu className="text-[var(--main-light-green)]" /> New focus · Meet Primo AI
              </span>
              <h2 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
                Meet Primo AI,{" "}
                <span className="text-[var(--main-light-green)]">
                  Your AI Customer Support Agen<span ref={tRef}>t</span>
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--light-gray)]">
                Give Primo AI the answers your business already has. Add your website content and FAQs, and let it
                handle suitable questions, even when your team is away. When a conversation needs a person, your agents
                can take over.
              </p>
            </Reveal>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {STEPS.map((s, i) => (
                <Step key={s.label} m={m} s={s} active={active === i} onClick={() => jump(i)} />
              ))}
            </div>

            <div className="mt-5 h-6 text-sm text-[var(--light-gray)]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-light-green)]" />
                  {STEPS[active].note}
                </motion.p>
              </AnimatePresence>
            </div>

            <Link href="/products/ai-agent" className="group mt-7 inline-flex items-center gap-2 font-semibold text-[var(--main-light-green)]">
              <span className="border-b-2 border-[var(--main-green)] pb-0.5">Discover Primo AI</span>
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>

          {/* Chat card + knowledge card */}
          <div className="relative mx-auto h-[600px] w-full max-w-[600px] lg:col-span-7 lg:h-[560px] lg:max-w-none [perspective:1600px]">
            <motion.div
              style={{ rotateY: chatRY }}
              className="absolute right-0 top-0 w-[92%] max-w-[440px] overflow-hidden rounded-3xl bg-[var(--color-primary)] text-[var(--dark-text)] shadow-[0_40px_100px_-30px_rgba(115,195,17,0.45)] lg:right-[2%]"
            >
              <div className="flex items-center gap-2 border-b border-[var(--borders-color)] px-4 py-3 text-[11px] font-semibold text-[var(--text-gray)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--main-light-green)] text-xs text-[var(--dark-text)]">
                  <FiCpu />
                </span>
                Example · Primo AI
              </div>

              <div className="relative flex h-[300px] flex-col justify-end gap-2.5 overflow-hidden px-4 py-4">
                <motion.div style={{ opacity: emptyO }} className="absolute inset-x-4 top-5 space-y-2.5">
                  {[70, 52, 84].map((w, i) => (
                    <span key={i} className="block h-2.5 animate-pulse rounded-full bg-[var(--bg-light)]" style={{ width: `${w}%`, animationDelay: `${i * 200}ms` }} />
                  ))}
                  <span className="block pt-1 text-[11px] text-[var(--text-gray)]">Reading your website…</span>
                </motion.div>

                <Reveal m={m} a={0.3} b={0.37} className={BUB_IN}>{Q1}</Reveal>
                <TypedBubble m={m} a={0.43} b={0.55} text={A1} className={BUB_OUT} />
                <Reveal m={m} a={0.62} b={0.68} className={BUB_IN}>{Q2}</Reveal>
                <TypedBubble m={m} a={0.74} b={0.86} text={A2} className={BUB_OUT} />
                <Reveal m={m} a={0.88} b={0.95} s={0.9}
                  className="flex w-fit items-center gap-2 self-center rounded-full border border-[var(--main-green)] bg-[var(--light-green)] px-3 py-1 text-[11px] font-semibold">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--dark-text)] text-[9px] text-[var(--color-primary)]">A</span>
                  Alex joined the conversation <FiCheck />
                </Reveal>
              </div>

              <p className="border-t border-[var(--borders-color)] px-4 py-3 text-[11px] leading-snug text-[var(--text-gray)]">
                Example only. Actual replies depend on your business knowledge and configuration.
              </p>
            </motion.div>

            <motion.div style={{ y: imgY }} className="absolute bottom-0 left-0 z-10 w-[62%] max-w-[330px]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--text-gray)] bg-[var(--text-label)] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)]">
                <Image src={IMG} alt="" fill sizes="330px" className="object-cover opacity-40 grayscale" />
                <motion.div style={{ clipPath: reveal }} className="absolute inset-0">
                  <Image src={IMG} alt="Primo AI knowledge settings" fill sizes="330px" className="object-cover" />
                </motion.div>
                <motion.span style={{ top: scanTop, opacity: scanO }}
                  className="absolute inset-x-0 h-0.5 bg-[var(--main-light-green)] shadow-[0_0_18px_var(--main-light-green)]" />

                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-1.5 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-[10px] font-semibold">
                  <span className="rounded-full bg-[var(--main-light-green)] px-2 py-0.5 text-[var(--dark-text)]">
                    <Count m={m} a={0.02} b={0.3} to={128} /> pages read
                  </span>
                  <Reveal m={m} a={0.36} b={0.5} y={6} className="rounded-full bg-[var(--light-green)] px-2 py-0.5 text-[var(--dark-text)]">
                    <Count m={m} a={0.36} b={0.6} to={24} /> FAQs
                  </Reveal>
                  <Reveal m={m} a={0.7} b={0.8} y={6} className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[var(--dark-text)]">
                    Handoff on
                  </Reveal>
                </div>
              </div>
              <p className="mt-2 pl-1 text-[11px] font-medium text-[var(--light-gray)]">Primo AI knowledge settings</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
