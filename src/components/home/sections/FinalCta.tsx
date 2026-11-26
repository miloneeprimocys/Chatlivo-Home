"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type MotionValue,
  cubicBezier,
  motion,
  transform,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiArrowRight, FiCheck } from "react-icons/fi";

type MV = MotionValue<number>;

/** Put Image1.webp in /public/images (or change this path). */
const IMG = "/images/Image1.webp";
const SOFT = cubicBezier(0.22, 1, 0.36, 1);
const PLAY_DURATION_MS = 5200;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function Reveal({
  m, a, b, y = 14, s = 1, className, children,
}: { m: MV; a: number; b: number; y?: number; s?: number; className?: string; children?: ReactNode }) {
  const t = useTransform(m, [a, b], [0, 1], { ease: SOFT });
  const tf = useTransform(t, (v) => `translate3d(0,${y * (1 - v)}px,0) scale(${s + (1 - s) * v})`);
  return (
    <motion.div style={{ opacity: t, transform: tf }} className={className}>
      {children}
    </motion.div>
  );
}

/** A chat bubble: shows typing dots first, then the message. */
function Bubble({ m, a, className, children }: { m: MV; a: number; className: string; children: ReactNode }) {
  const dots = useTransform(m, [a, a + 0.012, a + 0.03, a + 0.045], [0, 1, 1, 0]);
  const body = useTransform(m, [a + 0.04, a + 0.055], [0, 1]);
  return (
    <Reveal m={m} a={a} b={a + 0.014} s={0.9} className={`relative origin-bottom ${className}`}>
      <motion.div style={{ opacity: body }}>{children}</motion.div>
      <motion.span style={{ opacity: dots }} className="absolute left-4 top-1/2 flex -translate-y-1/2 gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-gray)]" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </motion.span>
    </Reveal>
  );
}

/** Button that leans toward the cursor */
function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x: sx, y: sy }} className="inline-block">
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating chat tags that later gather into the word "Chatlivo"       */
/* ------------------------------------------------------------------ */
type Tone = "g" | "l" | "d" | "w" | "k";
type TagCfg = { label: string; x: number; y: number; size: "s" | "m" | "l"; tone: Tone; desk?: boolean };

const TONE: Record<Tone, string> = {
  g: "bg-[var(--main-light-green)] text-[var(--dark-text)]",
  l: "bg-[var(--light-green)] text-[var(--dark-text)]",
  d: "bg-[var(--dark-text)] text-[var(--main-light-green)]",
  w: "border border-[var(--borders-color)] bg-[var(--color-primary)] text-[var(--dark-text)]",
  k: "border border-[var(--borders-color)] bg-[var(--bg-light)] text-[var(--dark-text)]",
};
const SIZE = { s: "px-1.5 py-0.5 text-[9px]", m: "px-2 py-1 text-xs", l: "px-3 py-1.5 text-sm" };

const TAGS: TagCfg[] = [
  { label: "Hi there!", x: 8, y: 14, size: "m", tone: "l" },
  { label: "Pricing?", x: 27, y: 12, size: "l", tone: "g" },
  { label: "Seen ✓", x: 49, y: 8, size: "s", tone: "w", desk: true },
  { label: "Order status", x: 70, y: 10, size: "m", tone: "k" },
  { label: "Free plan", x: 85, y: 21, size: "l", tone: "d", desk: true },
  { label: "Translate", x: 75, y: 26, size: "m", tone: "g" },
  { label: "Typing…", x: 14, y: 30, size: "s", tone: "w", desk: true },
  { label: "Refund", x: 30, y: 28, size: "s", tone: "l", desk: true },
  { label: "WhatsApp", x: 8, y: 47, size: "l", tone: "g" },
  { label: "Book a demo", x: 22, y: 57, size: "s", tone: "k", desk: true },
  { label: "Instagram DM", x: 10, y: 66, size: "m", tone: "l" },
  { label: "AI agent", x: 30, y: 46, size: "s", tone: "d", desk: true },
  { label: "Live chat", x: 79, y: 45, size: "l", tone: "w" },
  { label: "Handoff", x: 90, y: 57, size: "s", tone: "l", desk: true },
  { label: "Inbox", x: 70, y: 58, size: "s", tone: "g", desk: true },
  { label: "Thanks!", x: 7, y: 82, size: "m", tone: "d" },
  { label: "Reply faster", x: 21, y: 89, size: "l", tone: "k" },
  { label: "Messenger", x: 36, y: 77, size: "s", tone: "g", desk: true },
  { label: "Email", x: 50, y: 91, size: "m", tone: "l" },
  { label: "Support 24/7", x: 65, y: 79, size: "m", tone: "w" },
  { label: "New lead", x: 80, y: 85, size: "l", tone: "g" },
  { label: "Set up in minutes", x: 91, y: 75, size: "s", tone: "k", desk: true },
];

function Tag({ m, t, i, active }: { m: MV; t: TagCfg; i: number; active: boolean }) {
  const k = useTransform(m, [0.36 + (i % 6) * 0.008, 0.55], [0, 1], { ease: SOFT });
  const x = useTransform(k, [0, 1], ["0cqw", `${50 - t.x}cqw`]);
  const y = useTransform(k, [0, 1], ["0cqh", `${50 - t.y}cqh`]);
  const sc = useTransform(k, [0, 1], [1, 0.2]);
  const o = useTransform(m, [0.36, 0.5, 0.56], [1, 1, 0]);
  const drift = useTransform(m, [0, 0.3], [0, ((i % 5) - 2) * 14]);

  return (
    <motion.div
      style={{ left: `${t.x}%`, top: `${t.y}%`, x, y, scale: sc, opacity: o }}
      className={`absolute z-20 ${t.desk ? "hidden md:block" : ""}`}
    >
      <motion.div style={{ y: drift }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className={`cf-float block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded font-mono font-medium uppercase tracking-wide ${TONE[t.tone]} ${SIZE[t.size]}`}
            style={
              {
                "--r": `${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg`,
                "--dx": `${((i % 3) - 1) * 10}px`,
                "--dy": `${((i % 4) - 1.5) * 8}px`,
                "--d": `${4 + (i % 5)}s`,
                animationDelay: `${-i * 0.7}s`,
              } as CSSProperties
            }
          >
            {t.label}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Big word                                                            */
/* ------------------------------------------------------------------ */
function Letter({ m, ch, i, accent }: { m: MV; ch: string; i: number; accent: boolean }) {
  const a = 0.5 + i * 0.012;
  const t = useTransform(m, [a, a + 0.06], [0, 1], { ease: SOFT });
  const y = useTransform(t, [0, 1], ["60%", "0%"]);
  const f = useTransform(t, [0, 1], ["blur(14px)", "blur(0px)"]);
  const sc = useTransform(t, [0, 1], [1.4, 1]);
  return (
    <motion.span
      style={{ opacity: t, y, filter: f, scale: sc }}
      className={`inline-block ${accent ? "text-[var(--main-green)]" : "text-[var(--dark-text)]"}`}
    >
      {ch}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Finale background: never plain white. Grid drift, sonar rings and    */
/* soft chat bubbles keep rising behind the call to action.             */
/* ------------------------------------------------------------------ */
const RISERS = Array.from({ length: 9 }, (_, i) => ({
  l: (i * 11 + 6) % 90,
  w: 46 + ((i * 17) % 44),
  dur: 14 + ((i * 3) % 8),
  delay: -((i * 3.1) % 20),
  dx: ((i % 3) - 1) * 24,
  o: 0.55 + (i % 3) * 0.15,
}));

function EndBackdrop({ o }: { o: MV }) {
  return (
    <motion.div aria-hidden style={{ opacity: o }} className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[var(--color-primary)] to-[var(--light-green)]/50">
      <div className="cf-pan absolute inset-0 opacity-70 [background-image:linear-gradient(var(--borders-color)_1px,transparent_1px),linear-gradient(90deg,var(--borders-color)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_90%_at_50%_50%,#000,transparent)]" />
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="cf-ring absolute left-1/2 top-1/2 h-[70cqmin] w-[70cqmin] rounded-full border border-[var(--main-green)]/35"
          style={{ animationDelay: `${i * 2.4}s` }}
        />
      ))}
      {RISERS.map((r, i) => (
        <span
          key={i}
          className="cf-riser"
          style={
            {
              left: `${r.l}%`,
              width: r.w,
              height: r.w * 0.5,
              animationDuration: `${r.dur}s`,
              animationDelay: `${r.delay}s`,
              "--dx": `${r.dx}px`,
              "--o": r.o,
            } as CSSProperties
          }
        />
      ))}
    </motion.div>
  );
}

/* Cell edge: animates from its start inset (% of the band) to 0.
   The middle cell keeps a steady size (about 240 x 250px) however wide the band is. */
function useEdge(e: MV, nv: MV, box: { current: { w: number; h: number } }, axis: "x" | "y") {
  return useTransform([e, nv], ([v]: number[]) => {
    const { w, h } = box.current;
    const pct = axis === "x" ? ((w - Math.min(240, w * 0.46)) / 2 / w) * 100 : ((h - Math.min(h * 0.5, 250)) / 2 / h) * 100;
    return `${pct * (1 - v)}%`;
  });
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function FinalCta() {
  const bandRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const box = useRef({ w: 1200, h: 520 });
  const wm = useRef({ y0: 0, s0: 2.6 });
  const nv = useMotionValue(0);
  const rawProgress = useMotionValue(0);
  const [isInView, setIsInView] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const measure = () => {
      const b = bandRef.current;
      const w = wordRef.current;
      if (!b || !w) return;
      const W = b.clientWidth;
      const H = b.clientHeight;
      box.current = { w: W, h: H };
      wm.current = {
        y0: H / 2 - (w.offsetTop + w.offsetHeight / 2),
        s0: Math.min(2.8, (W * 0.8) / w.offsetWidth),
      };
      nv.set(nv.get() + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    [bandRef.current, colRef.current].forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [nv]);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;

    let rafId = 0;
    let startTime: number | null = null;

    const stopPlayback = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      startTime = null;
    };

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / PLAY_DURATION_MS);
      rawProgress.set(p);

      if (p < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = 0;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          stopPlayback();
          rawProgress.set(0);
          setIsInView(true);
          setRunKey((k) => k + 1);
          rafId = requestAnimationFrame(step);
        } else {
          stopPlayback();
          setIsInView(false);
          rawProgress.set(0);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      stopPlayback();
    };
  }, [rawProgress]);

  const m = useSpring(rawProgress, { stiffness: 75, damping: 32, mass: 0.65, restDelta: 0.0005 });

  /* The white cell: starts as the middle square of the grid, then fills the band */
  const e = useTransform(m, [0.04, 0.26], [0, 1], { ease: SOFT });
  const top = useEdge(e, nv, box, "y");
  const bottom = useEdge(e, nv, box, "y");
  const left = useEdge(e, nv, box, "x");
  const right = useEdge(e, nv, box, "x");
  const sq = useTransform(e, [0, 1], [-20, 0]);
  const cellText = useTransform(m, [0.04, 0.14], [1, 0]);
  const hint = useTransform(m, [0, 0.05], [1, 0]);
  const endO = useTransform(m, [0.28, 0.5], [0, 1]);

  /* Statement, ring, word */
  const stmtO = useTransform(m, [0.2, 0.27, 0.34, 0.4], [0, 1, 1, 0]);
  const stmtY = useTransform(m, [0.2, 0.27, 0.34, 0.4], [24, 0, 0, -24]);
  const ringS = useTransform(m, [0.5, 0.64], [0, 3.2]);
  const ringO = useTransform(m, [0.5, 0.53, 0.64], [0, 0.7, 0]);
  const wordY = useTransform([m, nv], ([v]: number[]) => transform(v, [0.62, 0.73], [wm.current.y0, 0]));
  const wordS = useTransform([m, nv], ([v]: number[]) => transform(v, [0.62, 0.73], [wm.current.s0, 1]));

  return (
    <section className="w-full bg-[linear-gradient(135deg,color-mix(in_srgb,var(--main-green)_40%,black),color-mix(in_srgb,var(--main-green)_68%,black)_55%,var(--main-green))]">
      <style>{`
        @keyframes cf-float { from { transform: translate3d(0,0,0) rotate(var(--r)); } to { transform: translate3d(var(--dx),var(--dy),0) rotate(calc(var(--r) * -1)); } }
        @keyframes cf-pan { to { background-position: 44px 44px; } }
        @keyframes cf-ring { 0% { transform: translate(-50%,-50%) scale(.2); opacity: .55; } 100% { transform: translate(-50%,-50%) scale(1.7); opacity: 0; } }
        @keyframes cf-rise { 0% { transform: translate3d(0,0,0); opacity: 0; } 15% { opacity: var(--o); } 85% { opacity: var(--o); } 100% { transform: translate3d(var(--dx),-125cqh,0); opacity: 0; } }
        .cf-float { animation: cf-float var(--d) ease-in-out infinite alternate; }
        .cf-pan { animation: cf-pan 18s linear infinite; }
        .cf-ring { animation: cf-ring 7s ease-out infinite; }
        .cf-riser { position: absolute; bottom: -50px; border-radius: 12px; border: 1px solid var(--light-green); background: color-mix(in srgb, var(--light-green) 40%, transparent); opacity: 0; animation: cf-rise linear infinite; }
        @media (prefers-reduced-motion: reduce) { .cf-float, .cf-pan, .cf-ring, .cf-riser { animation: none; } .cf-riser { opacity: .4; bottom: 20%; } }
      `}</style>

      {/* Normal compact section height — no sticky scroll track */}
      <div
        ref={bandRef}
        className="relative h-[clamp(520px,78svh,640px)] w-full overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--main-green)_40%,black),color-mix(in_srgb,var(--main-green)_68%,black)_55%,var(--main-green))] sm:h-[clamp(460px,64svh,560px)] [container-type:size]"
      >
        {/* Green phase: fine grid, grid lines that follow the cell, image tiles */}
        <div className="absolute inset-0 [background-image:linear-gradient(color-mix(in_srgb,var(--color-primary)_10%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-primary)_10%,transparent)_1px,transparent_1px)] [background-size:44px_44px]" />
        <motion.div style={{ width: right, height: bottom }} className="absolute bottom-0 right-0 hidden overflow-hidden sm:block">
          <Image src={IMG} alt="" fill sizes="40vw" className="object-cover opacity-40 mix-blend-multiply grayscale" />
        </motion.div>
        <motion.div style={{ width: left, height: top }} className="absolute left-0 top-0 hidden overflow-hidden sm:block">
          <Image src={IMG} alt="" fill sizes="40vw" className="object-cover opacity-30 mix-blend-multiply grayscale" />
        </motion.div>
        <motion.span aria-hidden style={{ left }} className="absolute inset-y-0 w-px bg-[var(--color-primary)]/40" />
        <motion.span aria-hidden style={{ right }} className="absolute inset-y-0 w-px bg-[var(--color-primary)]/40" />
        <motion.span aria-hidden style={{ top }} className="absolute inset-x-0 h-px bg-[var(--color-primary)]/40" />
        <motion.span aria-hidden style={{ bottom }} className="absolute inset-x-0 h-px bg-[var(--color-primary)]/40" />

        {/* The white cell (carries the animated finale background once it fills the band) */}
        <motion.div style={{ top, bottom, left, right }} className="absolute z-10 bg-[var(--color-primary)]">
          <EndBackdrop o={endO} />
          <motion.div style={{ opacity: cellText }} className="absolute left-3 top-3 text-[13px] font-medium leading-snug text-[var(--dark-text)] sm:text-[15px]">
            Have a question?
            <br />
            We’ll answer in seconds.
            <span className="mt-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-green)]" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </span>
          </motion.div>
          <motion.span style={{ opacity: cellText }} className="absolute bottom-2 left-3 text-xs text-[var(--text-gray)]">↳</motion.span>

          <motion.span aria-hidden style={{ left: sq, top: sq }} className="absolute h-5 w-5 bg-[var(--main-light-green)]" />
          <motion.span aria-hidden style={{ right: sq, top: sq }} className="absolute h-5 w-5 bg-[var(--dark-text)]" />
          <motion.span aria-hidden style={{ left: sq, bottom: sq }} className="absolute h-5 w-5 bg-[var(--light-green)]" />
          <motion.span aria-hidden style={{ right: sq, bottom: sq }} className="absolute h-5 w-5 bg-[var(--text-label)]" />
        </motion.div>

        {/* Floating chat tags */}
        {TAGS.map((t, i) => (
          <Tag key={`${runKey}-${t.label}`} m={m} t={t} i={i} active={isInView} />
        ))}

        <motion.p style={{ opacity: hint }} className="absolute inset-x-0 bottom-5 z-30 text-center text-xs text-[var(--color-primary)]/80">
          Bringing every conversation together
        </motion.p>

        {/* Statement */}
        <motion.p
          style={{ opacity: stmtO, y: stmtY }}
          className="absolute inset-x-0 top-1/2 z-30 mx-auto max-w-2xl -translate-y-1/2 px-6 text-center text-[clamp(1.3rem,2.8vw,2.2rem)] font-medium leading-snug tracking-tight text-[var(--dark-text)]"
        >
          Customers write everywhere. <span className="text-[var(--text-gray)]">Chatlivo brings it all into one place.</span>
        </motion.p>

        {/* Shock ring as everything lands */}
        <motion.span
          aria-hidden
          style={{ scale: ringS, opacity: ringO }}
          className="absolute left-1/2 top-1/2 z-10 h-[40cqmin] w-[40cqmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--main-green)]"
        />

        {/* Word + conversation, centred together as one block */}
        <div ref={colRef} className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 px-4 text-[var(--dark-text)]">
          <motion.div ref={wordRef} style={{ y: wordY, scale: wordS }}>
            <h2 aria-label="Chatlivo" className="flex whitespace-nowrap text-[clamp(2.75rem,8cqw,5.5rem)] font-extrabold leading-none tracking-tighter">
              {"Chatlivo".split("").map((ch, i) => (
                <Letter key={i} m={m} ch={ch} i={i} accent={i >= 4} />
              ))}
            </h2>
          </motion.div>

          <div className="flex w-[min(92cqw,560px)] flex-col items-center gap-3">
            <div className="flex items-end justify-center gap-2">
              <Reveal m={m} a={0.69} b={0.72} s={0.5}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--dark-text)] text-sm font-bold text-[var(--main-light-green)]">
                C
              </Reveal>
              <Bubble m={m} a={0.7} className="w-fit max-w-full rounded-2xl rounded-bl-sm bg-[var(--bg-light)] px-4 py-3 text-base font-semibold sm:text-lg">
                Ready to make replying a little easier?
              </Bubble>
            </div>

            <Bubble m={m} a={0.8} className="w-fit max-w-full rounded-2xl bg-[var(--bg-light)] px-4 py-3 text-center text-sm leading-relaxed text-[var(--text-label)] sm:text-[15px]">
              Start free, add Chatlivo to your website and see how it feels to answer customers from one inbox.
            </Bubble>

            <Reveal m={m} a={0.9} b={0.935} y={20} s={0.85} className="flex flex-wrap justify-center gap-2.5 pt-1">
              <Magnetic>
                <Link
                  href="https://app.chatlivo.com/signup"
                  className="group inline-flex items-center gap-2 rounded-full bg-[var(--main-light-green)] px-6 py-3 text-sm font-semibold text-[var(--dark-text)] shadow-[0_14px_30px_-14px_rgba(115,195,17,0.9)] transition-transform active:scale-95"
                >
                  Start Free <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-[var(--dark-text)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--dark-text)] transition-colors hover:bg-[var(--dark-text)] hover:text-[var(--color-primary)] active:scale-95"
                >
                  Talk to Our Team
                </Link>
              </Magnetic>
            </Reveal>

            <Reveal m={m} a={0.955} b={0.985} className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-[var(--text-gray)]">
              {["Free plan available", "No credit card required", "Set up in minutes"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--main-green)] text-[9px] text-[var(--dark-text)]">
                    <FiCheck />
                  </span>
                  {t}
                </span>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}