"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  type MotionValue,
  cubicBezier,
  motion,
  transform,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiArrowRight, FiCheck, FiCpu, FiGlobe, FiHelpCircle, FiSend, FiUser, FiZap } from "react-icons/fi";
import type { IconType } from "react-icons";

type MV = MotionValue<number>;

const SHOTS = [
  { src: "/livoai/TrainAiHero.webp", label: "Website knowledge" },
  { src: "/livoai/AiAssistant.webp", label: "Custom FAQs & rules" },
  { src: "/livoai/AiHandoff.webp", label: "Smart human handoff" },
];
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

/* ------------------------------------------------------------------ */
/* Full-width background: soft shade + knowledge streams into the agent */
/* ------------------------------------------------------------------ */
const SOURCES = [0.09, 0.26, 0.44, 0.61, 0.79, 0.93];

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

    const off = m.on("change", () => {
      measure();
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
      off();
    };
  }, [tRef, m]);

  // soft shade that drifts slowly with scroll
  const b1x = useTransform(m, [0, 1], ["0%", "22%"]);
  const b1y = useTransform(m, [0, 1], ["0%", "14%"]);
  const b2x = useTransform(m, [0, 1], ["0%", "-18%"]);
  const b2y = useTransform(m, [0, 1], ["0%", "-12%"]);

  const sx = g.w - 24;

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-[#f6faef] via-[#ecf4df] to-[#e1edcf]"
    >
      <style>{`
        @keyframes ma-packet { to { stroke-dashoffset: -1; } }
        @media (prefers-reduced-motion: reduce) { .ma-packet { animation: none !important; } }
      `}</style>

      {/* drifting shade */}
      <motion.div
        style={{ x: b1x, y: b1y }}
        className="absolute -left-40 -top-32 h-[560px] w-[560px] rounded-full bg-[var(--main-green)]/20 blur-[140px] 2xl:h-[720px] 2xl:w-[720px]"
      />
      <motion.div
        style={{ x: b2x, y: b2y }}
        className="absolute -bottom-40 -right-32 h-[560px] w-[560px] rounded-full bg-[var(--main-light-green)]/45 blur-[150px] 2xl:h-[720px] 2xl:w-[720px]"
      />
      {/* pale halo behind the chat + screenshots so they read clearly */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_72%_52%,rgba(255,255,255,0.6),transparent)]" />

      {/* Light dot grid */}
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(47,106,5,0.10)_1px,transparent_1.3px)] [background-size:28px_28px] [mask-image:linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)]" />

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
            const ey = g.ty + (i - 2.5) * 1.5;
            const d = `M${sx} ${y} C ${g.tx + (sx - g.tx) * 0.65} ${y}, ${g.tx + (sx - g.tx) * 0.3} ${ey}, ${g.tx} ${ey}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="var(--main-green)" strokeOpacity={0.32} strokeWidth={1.25} />
                <g opacity={0.75}>
                  <path
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke="var(--main-green)"
                    strokeOpacity={0.85}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeDasharray="0.05 0.95"
                    className="ma-packet"
                    style={{ animation: `ma-packet ${5 + (i % 3) * 1.6}s linear ${-i * 1.1}s infinite` }}
                  />
                </g>
                <circle cx={sx} cy={y} r={3.5} fill="var(--main-green)" />
              </g>
            );
          })}
        </svg>
      )}

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
      className={`relative flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-500 2xl:px-5 2xl:py-2.5 2xl:text-base ${
        active
          ? "border-[var(--main-green)] text-[var(--dark-text)] bg-[var(--light-green)]/40"
          : "border-[var(--borders-color)] text-[var(--text-gray)] hover:border-[var(--gray-border)] hover:text-[var(--dark-text)] bg-white"
      }`}
    >
      <s.icon className={active ? "text-[var(--main-green)]" : ""} />
      {s.label}
      <motion.span style={{ scaleX: fill }} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--main-green)]" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive chat: type your own, or let the demo type for you       */
/* ------------------------------------------------------------------ */
type Msg = { from: "user" | "ai" | "agent"; text: string };

const KB: { k: string[]; a: string; human?: boolean }[] = [
  { k: ["human", "agent", "person", "team member"], a: "Sure thing! Let me bring in someone from the team with everything we just talked about.", human: true },
  { k: ["refund"], a: "You’re covered by our published refund policy. Want me to pull up the exact details for you?" },
  { k: ["setup", "install", "fast"], a: "It’s super quick—just drop a small snippet on your site and you’re good to go in a few minutes." },
  { k: ["free", "trial", "plan"], a: "Yep, there’s a free plan to get started right away—no credit card needed." },
  { k: ["language", "multilingual"], a: "Yes! Visitors can chat in their own language and your team can reply comfortably too." },
  { k: ["learn", "website", "train"], a: "Just connect your pages and FAQs—I’ll pick up your info and answer naturally in your voice." },
  { k: ["weekend", "hours", "open"], a: "Here’s what our published support hours say about weekends—happy to help check anything else!" },
];

const AUTO = [
  "How does Primo AI learn from my website?",
  "What is your refund policy?",
  "Can I talk to a human agent?",
];

const SUGGEST = [
  "What is your refund policy?",
  "How fast does setup take?",
  "Do you offer a 14-day free trial?",
  "Do you have a plan for a small team?",
  "Is there a free plan available?",
  "Can I talk to a human agent?",
  "Do you support multiple languages?",
  "How does Primo AI learn from my website?",
];

function ChatWidget({ active, play }: { active: number; play: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const touched = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  const send = useCallback((text: string) => {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setBusy(true);
    const low = q.toLowerCase();
    const hit = KB.find((e) => e.k.some((w) => low.includes(w)));
    later(() => {
      setMsgs((m) => [
        ...m,
        { from: "ai", text: hit ? hit.a : "Let me check your help docs for that—and if it needs a closer look, I’ll loop in the team." },
      ]);
      setBusy(false);
      if (hit?.human) later(() => setMsgs((m) => [...m, { from: "agent", text: "Alex joined the conversation" }]), 900);
    }, 1100);
  }, []);

  const sendRef = useRef(send);
  sendRef.current = send;

  const take = () => {
    touched.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Demo: types one question per step until the visitor takes over
  useEffect(() => {
    if (!play || touched.current) return;
    const q = AUTO[active];
    let i = 0;
    let id: ReturnType<typeof setTimeout>;
    const type = () => {
      if (touched.current) return;
      i += 1;
      setInput(q.slice(0, i));
      if (i < q.length) id = setTimeout(type, 34);
      else id = setTimeout(() => !touched.current && sendRef.current(q), 380);
    };
    id = setTimeout(type, 600);
    return () => clearTimeout(id);
  }, [active, play]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes ma-marq { to { transform: translateX(-50%); } }
        .ma-marq { animation: ma-marq 46s linear infinite; }
        .ma-marq:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .ma-marq { animation: none; } }
      `}</style>

      <div className="flex items-center gap-2.5 border-b border-[var(--borders-color)] bg-[var(--main-light-green)] px-4 py-3 2xl:gap-3 2xl:px-5 2xl:py-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm text-[var(--dark-text)] 2xl:h-10 2xl:w-10 2xl:text-base">
          <FiCpu />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-[var(--dark-text)] 2xl:text-base">Primo AI</span>
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--dark-text)]/70 2xl:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--main-green)]" /> Online · Instant answers
          </span>
        </span>
      </div>

      <div className="flex h-[200px] flex-col justify-end gap-2 overflow-hidden bg-white px-4 py-3 2xl:h-[260px] 2xl:gap-2.5 2xl:px-5 2xl:py-4">
        {msgs.length === 0 && !busy && (
          <p className="mb-auto pt-2 text-center text-[11px] text-[var(--text-gray)] 2xl:text-xs">Ask anything about your business…</p>
        )}
        <AnimatePresence initial={false}>
          {msgs.slice(-4).map((m, i) =>
            m.from === "agent" ? (
              <motion.div
                key={`${msgs.length}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex w-fit items-center gap-2 self-center rounded-full border border-[var(--main-green)] bg-[var(--light-green)] px-3 py-1 text-[11px] font-semibold text-[var(--dark-text)] 2xl:px-3.5 2xl:py-1.5 2xl:text-xs"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--dark-text)] text-[9px] text-white 2xl:h-5 2xl:w-5 2xl:text-[10px]">A</span>
                {m.text} <FiCheck />
              </motion.div>
            ) : (
              <motion.div
                key={`${msgs.length}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-fit max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed 2xl:px-4 2xl:py-2.5 2xl:text-sm ${
                  m.from === "user"
                    ? "ml-auto rounded-br-sm bg-[var(--main-light-green)] text-[var(--dark-text)]"
                    : "rounded-bl-sm border border-[var(--borders-color)] bg-[var(--bg-color)] text-[var(--dark-text)]"
                }`}
              >
                {m.text}
              </motion.div>
            ),
          )}
          {busy && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm border border-[var(--borders-color)] bg-[var(--bg-color)] px-3 py-2.5 2xl:px-4 2xl:py-3"
            >
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-green)] 2xl:h-2 2xl:w-2" style={{ animationDelay: `${d * 150}ms` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Or try asking */}
      <div className="border-t border-[var(--borders-color)] bg-[var(--bg-color)] py-2 2xl:py-2.5">
        <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-gray)] 2xl:px-5 2xl:text-[11px]">Or try asking</p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
          <div className="ma-marq flex w-max gap-2 pr-2">
            {[...SUGGEST, ...SUGGEST].map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  take();
                  send(q);
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--borders-color)] bg-white px-3 py-1 text-[11px] text-[var(--dark-text)] transition-colors hover:border-[var(--main-green)] hover:bg-[var(--light-green)]/40 2xl:px-3.5 2xl:py-1.5 2xl:text-xs"
              >
                <FiZap className="text-[var(--main-green)]" />
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-[var(--borders-color)] bg-white px-3 py-2.5 2xl:gap-2.5 2xl:px-4 2xl:py-3.5">
        <input
          value={input}
          onChange={(e) => {
            take();
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              take();
              send(input);
            }
          }}
          onFocus={take}
          placeholder="Type your message here"
          aria-label="Message Primo AI"
          className="min-w-0 flex-1 rounded-full border border-[var(--main-green)]/60 bg-white px-4 py-2 text-xs text-[var(--dark-text)] outline-none transition-shadow placeholder:text-[var(--text-gray)] focus:shadow-[0_0_0_3px_rgba(115,195,17,0.2)] 2xl:px-5 2xl:py-2.5 2xl:text-sm"
        />
        <button
          type="button"
          aria-label="Send"
          onClick={() => {
            take();
            send(input);
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--main-light-green)] text-sm text-[var(--dark-text)] transition-transform hover:scale-110 active:scale-95 2xl:h-10 2xl:w-10 2xl:text-base"
        >
          <FiSend />
        </button>
      </div>

      <p className="border-t border-[var(--borders-color)] bg-[var(--bg-color)] px-4 py-2 text-center text-[10px] leading-snug text-[var(--text-gray)] 2xl:px-5 2xl:py-2.5 2xl:text-[11px] lg:text-right">
        Example only. Actual replies depend on your business knowledge and configuration.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screenshot card: placed cleanly without overlapping the chat box     */
/* ------------------------------------------------------------------ */
function ShotCard({ active, m }: { active: number; m: MV }) {
  return (
    <div className="relative z-10 mt-5 w-full max-w-[360px] sm:mt-6 sm:w-[62%] lg:mt-0 lg:w-[44%] lg:max-w-[340px] lg:self-end 2xl:w-[48%] 2xl:max-w-[460px]">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="rounded-2xl border border-white bg-white p-1.5 shadow-[0_30px_60px_-24px_rgba(47,106,5,0.45),0_8px_20px_-10px_rgba(0,0,0,0.15)] ring-1 ring-[var(--borders-color)] 2xl:rounded-3xl 2xl:p-2">
          <div className="relative aspect-[8/5] overflow-hidden rounded-xl bg-[var(--bg-color)] 2xl:rounded-2xl">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={SHOTS[active].src}
                  alt={SHOTS[active].label}
                  fill
                  quality={95}
                  sizes="(min-width: 1536px) 460px, (min-width: 1024px) 340px, 70vw"
                  className="object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>

            {/* scan line, restarts on every swap */}
            <motion.span
              key={`scan-${active}`}
              aria-hidden
              initial={{ top: "0%", opacity: 0 }}
              animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute inset-x-0 z-10 h-0.5 bg-[var(--main-green)] shadow-[0_0_18px_var(--main-green)]"
            />

            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-1.5 bg-gradient-to-t from-black/55 to-transparent p-2.5 pt-8 text-[10px] font-semibold 2xl:gap-2 2xl:p-3.5 2xl:pt-10 2xl:text-xs">
              <span className="rounded-full bg-[var(--main-light-green)] px-2 py-0.5 text-[var(--dark-text)] 2xl:px-2.5 2xl:py-1">
                <Count m={m} a={0.02} b={0.3} to={128} /> pages read
              </span>
              <Reveal m={m} a={0.36} b={0.5} y={6} className="rounded-full bg-white px-2 py-0.5 text-[var(--dark-text)] shadow-sm 2xl:px-2.5 2xl:py-1">
                <Count m={m} a={0.36} b={0.6} to={24} /> FAQs
              </Reveal>
              <Reveal m={m} a={0.7} b={0.8} y={6} className="rounded-full bg-white px-2 py-0.5 text-[var(--dark-text)] shadow-sm 2xl:px-2.5 2xl:py-1">
                Handoff on
              </Reveal>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 pl-1 text-[11px] font-medium text-[var(--text-gray)] 2xl:mt-2.5 2xl:text-xs"
          >
            {SHOTS[active].label}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function MeetAI() {
  const trackRef = useRef<HTMLElement>(null);
  const tRef = useRef<HTMLSpanElement>(null);
  const deskRef = useRef(true);
  const dv = useMotionValue(0);
  const [active, setActive] = useState(0);
  const inView = useInView(trackRef, { amount: 0.25, once: true });

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

  const chatRY = useTransform(m, [0, 0.3], [-9, 0]);

  return (
    <section ref={trackRef} className="relative bg-[#ecf4df] text-[var(--dark-text)] lg:h-[300vh]">
      <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]">
        <Backdrop m={m} tRef={tRef} />

        <div className="relative mx-auto grid max-w-[88rem] items-center gap-12 px-6 py-20 lg:h-full lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-0 2xl:max-w-[104rem] 2xl:gap-12 2xl:px-14">
          {/* Copy */}
          <div className="lg:col-span-5">
            <Reveal m={m} a={-0.1} b={0.04} y={20}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--borders-color)] bg-white px-3 py-1 text-xs font-medium text-[var(--text-label)] shadow-sm 2xl:px-3.5 2xl:py-1.5 2xl:text-sm">
                <FiCpu className="text-[var(--main-green)]" /> New focus · Meet Primo AI
              </span>
              <h2 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl text-[var(--dark-text)] cursor-scan-effect 2xl:text-6xl">
                Meet Primo AI,{" "}
                <span className="text-[var(--main-green)]">
                  Your AI Customer Support Agen<span ref={tRef}>t</span>
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-gray)] 2xl:max-w-xl 2xl:text-lg">
                Give Primo AI the answers your business already knows. Connect your website pages and FAQs so visitors
                get clear, helpful answers anytime—and whenever a real person is needed, your team steps right in with
                the full context.
              </p>
            </Reveal>

            <div className="mt-7 flex flex-wrap gap-2.5 2xl:gap-3">
              {STEPS.map((s, i) => (
                <Step key={s.label} m={m} s={s} active={active === i} onClick={() => jump(i)} />
              ))}
            </div>

            <div className="mt-5 h-6 text-sm text-[var(--text-gray)] 2xl:text-base" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-green)]" />
                  {STEPS[active].note}
                </motion.p>
              </AnimatePresence>
            </div>

            <Link href="/products/ai-agent" className="group mt-7 inline-flex items-center gap-2 font-semibold text-[var(--main-green)] 2xl:text-lg">
              <span className="border-b-2 border-[var(--main-green)] pb-0.5">Discover Primo AI</span>
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>

          {/* Screenshot card + chat card side-by-side so neither overlaps the other */}
          <div className="relative mx-auto flex w-full max-w-[780px] flex-col items-center justify-end gap-6 lg:col-span-7 lg:h-[580px] lg:max-w-none lg:flex-row lg:items-center lg:gap-5 2xl:h-[720px] 2xl:max-w-[960px] 2xl:gap-7 [perspective:1600px]">
            <ShotCard active={active} m={m} />

            <motion.div
              style={{ rotateY: chatRY }}
              className="w-full max-w-[420px] shrink-0 overflow-hidden rounded-3xl border border-[var(--borders-color)] bg-[var(--color-primary)] text-[var(--dark-text)] shadow-[0_24px_60px_-24px_rgba(47,106,5,0.3),0_0_40px_-10px_rgba(115,195,17,0.18)] lg:w-[54%] 2xl:w-[50%] 2xl:max-w-[500px]"
            >
              <ChatWidget active={active} play={inView} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
