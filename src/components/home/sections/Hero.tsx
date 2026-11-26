"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  transform,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiMail,
  FiMessageSquare,
  FiPlay,
  FiSearch,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { FaFacebookMessenger, FaInstagram, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";
import NeonCursor from "../../NeonCursor";

const EASE = [0.22, 1, 0.36, 1] as const;
const DEMO_H = 520; // approximate unscaled dashboard height

/* ------------------------------------------------------------------ */
/* Headline: each word slides up out of a mask                         */
/* ------------------------------------------------------------------ */
function Line({ text, delay = 0, gradient = false }: { text: string; delay?: number; gradient?: boolean }) {
  const words = text.split(" ");
  return (
    <span className="block">
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={`inline-block ${
              gradient
                ? "bg-gradient-to-r from-[var(--main-light-green)] via-[var(--medium-green)] to-[var(--main-green)] bg-clip-text text-transparent"
                : ""
            }`}
            initial={{ y: "115%", rotate: 4 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: delay + i * 0.08, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Living background: sonar rings, rising chat bubbles, stage light    */
/* ------------------------------------------------------------------ */
type Bubble = { l: number; w: number; dur: number; delay: number; op: number; r: number; dx: number; layer: 0 | 1 };

// deterministic (no Math.random) so server and client markup match
const BUBBLES: Bubble[] = Array.from({ length: 16 }, (_, i) => ({
  l: (i * 37 + 7) % 94,
  w: 56 + ((i * 29) % 72),
  dur: 18 + ((i * 7) % 14),
  delay: -((i * 5.3) % 26),
  op: 0.3 + (i % 4) * 0.12,
  r: i % 2 ? 5 : -5,
  dx: ((i % 3) - 1) * 40,
  layer: (i % 2) as 0 | 1,
}));

function BubbleField({ layer, y }: { layer: 0 | 1; y: MotionValue<number> }) {
  return (
    <motion.div aria-hidden style={{ y }} className="pointer-events-none absolute inset-0">
      {BUBBLES.filter((b) => b.layer === layer).map((b, i) => (
        <span
          key={i}
          className="hero-bubble"
          style={
            {
              left: `${b.l}%`,
              width: b.w,
              height: b.w * 0.52,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              "--o": b.op,
              "--dx": `${b.dx}px`,
              "--r": `${b.r}deg`,
            } as CSSProperties
          }
        >
          <i style={{ width: "78%" }} />
          <i style={{ width: "52%" }} />
        </span>
      ))}
    </motion.div>
  );
}

function Backdrop({ p }: { p: MotionValue<number> }) {
  const stageY = useTransform(p, [0, 0.3], ["20svh", "0svh"]);
  const ringsO = useTransform(p, [0, 0.5, 0.9], [1, 1, 0.35]);
  const glowO = useTransform(p, [0, 0.3, 0.6, 1], [0.35, 0.6, 1, 0.55]);
  const glowS = useTransform(p, [0, 0.35, 0.7], [0.7, 1.15, 1.4]);
  const farY = useTransform(p, [0, 1], [0, -140]);
  const nearY = useTransform(p, [0, 1], [0, -320]);

  return (
    <>
      <style>{`
        .hero-bubble {
          position: absolute; bottom: -90px; display: flex; flex-direction: column; justify-content: center; gap: 6px;
          padding: 0 12px; border-radius: 16px; opacity: 0; will-change: transform, opacity;
          border: 1px solid rgba(185,250,106,.28);
          background: linear-gradient(160deg, rgba(185,250,106,.13), rgba(115,195,17,.04));
          box-shadow: 0 0 26px -8px rgba(115,195,17,.55);
          animation: hero-rise linear infinite;
        }
        .hero-bubble i { display: block; height: 3px; border-radius: 3px; background: rgba(185,250,106,.38); }
        .hero-bubble::after {
          content: ""; position: absolute; left: 14px; bottom: -5px; width: 9px; height: 9px; transform: rotate(45deg);
          border-right: 1px solid rgba(185,250,106,.28); border-bottom: 1px solid rgba(185,250,106,.28);
          background: rgba(20,36,8,.9);
        }
        @keyframes hero-rise {
          0% { transform: translate3d(0,0,0) rotate(var(--r)); opacity: 0; }
          8% { opacity: var(--o); }
          88% { opacity: var(--o); }
          100% { transform: translate3d(var(--dx),-118svh,0) rotate(calc(var(--r) * -1)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .hero-bubble { animation: none; opacity: .15; bottom: 30%; } }
      `}</style>

      {/* grid, revealed outward on load */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
        className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_65%,#000,transparent)]"
      />
      <div aria-hidden className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[var(--main-green)]/20 blur-[140px]" />
      <div aria-hidden className="absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-[var(--main-light-green)]/10 blur-[150px]" />

      {/* stage light: swells as the demo takes the centre */}
      <motion.div
        aria-hidden
        style={{ y: stageY, opacity: glowO, scale: glowS }}
        className="absolute left-1/2 top-1/2 h-[70svh] w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(115,195,17,0.3),transparent)]"
      />

      {/* Single sonar shockwave on load */}
      <motion.div aria-hidden style={{ y: stageY, opacity: ringsO }} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--main-light-green)] shadow-[0_0_60px_rgba(185,250,106,0.5)]"
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 1.9, delay: 0.3, ease: "easeOut" }}
        />
      </motion.div>

      {/* rising conversations, two depths with scroll parallax */}
      <BubbleField layer={0} y={farY} />
      <BubbleField layer={1} y={nearY} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Live conversation demo                                              */
/* ------------------------------------------------------------------ */
type Msg = { from: "visitor" | "ai" | "agent"; text: string };

const SCRIPT: Msg[] = [
  { from: "visitor", text: "Do you ship to Dubai? And is Pro enough for a team of 8?" },
  { from: "ai", text: "Yes, delivery to Dubai takes 3–5 days, and Pro covers up to 10 agents. Want a quick walkthrough?" },
  { from: "visitor", text: "Yes please." },
  { from: "ai", text: "Done. What's the best email to send the invite to?" },
  { from: "visitor", text: "sean@barberco.com" },
  { from: "agent", text: "Hi Sean, Alex here. I'll take it from here and book your demo." },
];

function Typing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-white/[0.07] px-4 py-3"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--main-light-green)]"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  );
}

function ChatDemo() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) {
      setShown(SCRIPT.length);
      return;
    }
    if (shown >= SCRIPT.length) {
      const t = setTimeout(() => setShown(0), 5000);
      return () => clearTimeout(t);
    }
    const wait = SCRIPT[shown].from === "visitor" ? 1100 : 1800;
    const t = setTimeout(() => setShown((s) => s + 1), wait);
    return () => clearTimeout(t);
  }, [shown, reduce]);

  const nextIsReply = shown < SCRIPT.length && SCRIPT[shown].from !== "visitor";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--main-green)] text-sm font-semibold text-black">
            S
          </span>
          <div>
            <p className="text-sm font-medium text-white">Sean Barber</p>
            <p className="flex items-center gap-1.5 text-[11px] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--main-light-green)]" /> Online · Pricing page
            </p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={shown >= 6 ? "human" : "ai"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="whitespace-nowrap rounded-full border border-[var(--main-green)]/40 bg-[var(--main-green)]/10 px-3 py-1 text-[11px] font-medium text-[var(--main-light-green)]"
          >
            {shown >= 6 ? "Handled by Alex" : "Handled by Primo AI"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex h-[340px] flex-none flex-col justify-end gap-2.5 overflow-hidden p-5">
        <AnimatePresence initial={false}>
          {SCRIPT.slice(0, shown).map((m, i) => (
            <motion.div
              key={`${i}-${m.text}`}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                m.from === "visitor"
                  ? "ml-auto rounded-br-sm bg-[var(--main-light-green)] text-black"
                  : "rounded-bl-sm bg-white/[0.07] text-white/90"
              }`}
            >
              {m.from !== "visitor" && (
                <span className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--main-light-green)]">
                  {m.from === "ai" ? <FiZap /> : <FiUser />}
                  {m.from === "ai" ? "Primo AI" : "Alex · Support"}
                </span>
              )}
              {m.text}
            </motion.div>
          ))}
          {nextIsReply && <Typing key="typing" />}
        </AnimatePresence>
      </div>

      <div className="min-h-[76px] px-5 pb-5">
        <AnimatePresence>
          {shown >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-xl border border-[var(--main-green)]/40 bg-[var(--main-green)]/10 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--main-light-green)] text-black">
                  <FiCheck />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">Lead captured</p>
                  <p className="truncate text-[11px] text-white/60">sean@barberco.com · Pro plan · Team of 8</p>
                </div>
                <span className="hidden rounded-md bg-[var(--red)]/20 px-2 py-0.5 text-[10px] font-medium text-[#ff8da0] sm:block">
                  High priority
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const CONVERSATIONS: { name: string; msg: string; icon: IconType; time: string }[] = [
  { name: "Sean Barber", msg: "sean@barberco.com", icon: FiMessageSquare, time: "now" },
  { name: "Priya Shah", msg: "Is my order shipped?", icon: FaWhatsapp, time: "2m" },
  { name: "Lena Fischer", msg: "Can I get a refund?", icon: FaInstagram, time: "9m" },
  { name: "Omar Haddad", msg: "Need an invoice copy", icon: FiMail, time: "21m" },
];

function Stats() {
  const rows = [
    { l: "First reply", v: "3s" },
    { l: "Leads today", v: "28" },
    { l: "Solved by AI", v: "74%" },
  ];
  return (
    <aside className="hidden w-56 shrink-0 border-l border-white/10 p-4 min-[1180px]:block">
      <p className="pb-3 text-sm font-semibold text-white">Today</p>
      {rows.map((r) => (
        <div key={r.l} className="mb-2 rounded-xl bg-white/[0.04] p-3">
          <p className="text-[11px] text-white/45">{r.l}</p>
          <p className="text-xl font-semibold text-[var(--main-light-green)]">{r.v}</p>
        </div>
      ))}
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-sm bg-[var(--main-green)]/70"
            animate={{ height: [`${h * 0.5}%`, `${h}%`, `${h * 0.5}%`] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </aside>
  );
}

function Dashboard() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-0 rounded-[26px] shadow-[0_40px_120px_-20px_rgba(115,195,17,0.45)]" />
      <div className="relative overflow-hidden rounded-[27px] p-px">
        <div
          aria-hidden
          className="absolute -inset-[80%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,rgba(255,255,255,0.08)_0_55%,#B9FA6A_80%,rgba(255,255,255,0.08)_100%)]"
        />
        <div className="relative overflow-hidden rounded-[26px] bg-[#0c0c0c]">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--main-light-green)] to-transparent" />
          <div className="flex items-center gap-4 border-b border-white/10 px-5 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-white/15" />
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white/40">
              <FiSearch /> Search conversations
              <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">⌘ K</span>
            </div>
          </div>
          <div className="flex">
            <aside className="hidden w-60 shrink-0 border-r border-white/10 p-3 md:block">
              <p className="px-2 pb-3 pt-1 text-sm font-semibold text-white">Conversations</p>
              {CONVERSATIONS.map((c, i) => (
                <div
                  key={c.name}
                  className={`mb-1 flex items-center gap-3 rounded-xl p-3 ${i === 0 ? "bg-[var(--main-green)]/15" : ""}`}
                >
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm text-white">
                    {c.name[0]}
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-black text-[9px] text-[var(--main-light-green)]">
                      <c.icon />
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{c.name}</span>
                    <span className="block truncate text-xs text-white/45">{c.msg}</span>
                  </span>
                  <span className="text-[10px] text-white/35">{c.time}</span>
                </div>
              ))}
            </aside>
            <ChatDemo />
            <Stats />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Idle orbs: icon-only channels floating around the demo at rest      */
/* ------------------------------------------------------------------ */
type Orb = { icon: IconType; bg: string; fg: string; glow: string; pos: string; delay: number; dx: number; dy: number; dur: number };

const ORBS: Orb[] = [
  { icon: FaWhatsapp, bg: "#25D366", fg: "#fff", glow: "#25D366", pos: "-left-2 top-[10%] sm:-left-6", delay: 1.3, dx: 7, dy: -12, dur: 5.2 },
  { icon: FaInstagram, bg: "linear-gradient(135deg,#FEDA75,#FA7E1E,#D62976,#962FBF)", fg: "#fff", glow: "#E1306C", pos: "-right-2 top-[4%] sm:-right-6", delay: 1.45, dx: -6, dy: 10, dur: 6 },
  { icon: FiMessageSquare, bg: "#73C311", fg: "#000", glow: "#73C311", pos: "left-[20%] -top-7", delay: 1.6, dx: 9, dy: 6, dur: 5.8 },
  { icon: FaFacebookMessenger, bg: "linear-gradient(135deg,#00B2FF,#006AFF)", fg: "#fff", glow: "#0A7CFF", pos: "-right-3 top-[44%] sm:-right-8", delay: 1.75, dx: -8, dy: -9, dur: 5.6 },
  { icon: FiMail, bg: "#B9FA6A", fg: "#000", glow: "#B9FA6A", pos: "-left-3 top-[48%] sm:-left-8", delay: 1.9, dx: 8, dy: 9, dur: 6.4 },
];

function IdleOrb({ p, o }: { p: MotionValue<number>; o: Orb }) {
  const opacity = useTransform(p, [0.02, 0.12], [1, 0]);
  const scale = useTransform(p, [0.02, 0.12], [1, 0.3]);
  return (
    <motion.div style={{ opacity, scale }} className={`absolute z-20 ${o.pos}`}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 15, delay: o.delay }}
      >
        <motion.div
          animate={{ x: [0, o.dx, 0, -o.dx, 0], y: [0, o.dy, 0, o.dy / 2, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
          className="relative grid h-10 w-10 place-items-center rounded-2xl text-xl sm:h-12 sm:w-12 sm:text-2xl"
          style={{ background: o.bg, color: o.fg, boxShadow: `0 0 28px -4px ${o.glow}, 0 10px 30px -10px rgba(0,0,0,.8)` }}
        >
          <span className="absolute inset-0 animate-ping rounded-2xl opacity-25" style={{ background: o.bg }} />
          <o.icon className="relative" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Social badges: each pops in and leaves in its own way               */
/* ------------------------------------------------------------------ */
type BadgeCfg = {
  icon: IconType;
  label: string;
  sub: string;
  color: string;
  bg: string;
  pos: string;
  tin: number;
  tout: number;
  from: [number, number, number];
  exit: [number, number, number, number];
  float: number;
};

const BADGES: BadgeCfg[] = [
  {
    icon: FaWhatsapp, label: "WhatsApp", sub: "3 new messages", color: "#25D366", bg: "#25D366",
    pos: "left-0 top-[8%] lg:-left-[7%]", tin: 0.34, tout: 0.72,
    from: [-240, -80, -30], exit: [-280, -220, -45, 0.6], float: 0,
  },
  {
    icon: FaInstagram, label: "Instagram", sub: "New DM", color: "#E1306C",
    bg: "linear-gradient(135deg,#FEDA75,#FA7E1E,#D62976,#962FBF)",
    pos: "right-0 top-[18%] lg:-right-[8%]", tin: 0.41, tout: 0.77,
    from: [240, -140, 30], exit: [0, 0, 540, 0], float: 0.8,
  },
  {
    icon: FaFacebookMessenger, label: "Messenger", sub: "Asked about pricing", color: "#0A7CFF",
    bg: "linear-gradient(135deg,#00B2FF,#006AFF)",
    pos: "left-0 bottom-[16%] lg:-left-[6%]", tin: 0.48, tout: 0.82,
    from: [-220, 160, -18], exit: [-40, 340, -12, 0.8], float: 1.6,
  },
  {
    icon: FiMail, label: "Email", sub: "Invoice request", color: "#B9FA6A", bg: "#B9FA6A",
    pos: "right-0 bottom-[8%] lg:-right-[6%]", tin: 0.55, tout: 0.86,
    from: [260, 140, 18], exit: [380, 40, 20, 0.9], float: 2.2,
  },
  {
    icon: FiMessageSquare, label: "Live Chat", sub: "Visitor on /pricing", color: "#73C311", bg: "#73C311",
    pos: "left-[40%] -top-[6%]", tin: 0.62, tout: 0.9,
    from: [0, -220, 0], exit: [0, -30, 0, 0], float: 1.1,
  },
];

function Badge({ p, cfg }: { p: MotionValue<number>; cfg: BadgeCfg }) {
  const { tin, tout } = cfg;
  const opacity = useTransform(p, [tin, tin + 0.06, tout, tout + 0.08], [0, 1, 1, 0]);
  const x = useTransform(p, [tin, tin + 0.12, tout, tout + 0.12], [cfg.from[0], 0, 0, cfg.exit[0]]);
  const y = useTransform(p, [tin, tin + 0.12, tout, tout + 0.12], [cfg.from[1], 0, 0, cfg.exit[1]]);
  const rotate = useTransform(p, [tin, tin + 0.12, tout, tout + 0.12], [cfg.from[2], 0, 0, cfg.exit[2]]);
  const scale = useTransform(p, [tin, tin + 0.09, tin + 0.14, tout, tout + 0.12], [0.2, 1.15, 1, 1, cfg.exit[3]]);

  return (
    <motion.div style={{ opacity, x, y, rotate, scale }} className={`absolute z-20 ${cfg.pos}`}>
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: cfg.float }}
        className="relative flex items-center gap-2.5 rounded-2xl border bg-[#0a0a0a]/90 px-3 py-2 backdrop-blur-md sm:gap-3 sm:px-3.5 sm:py-2.5"
        style={{ borderColor: `${cfg.color}66`, boxShadow: `0 0 30px -6px ${cfg.color}, inset 0 0 18px -10px ${cfg.color}` }}
      >
        <span
          className="grid h-8 w-8 place-items-center rounded-xl text-lg text-white sm:h-9 sm:w-9"
          style={{ background: cfg.bg, color: cfg.bg === "#B9FA6A" || cfg.bg === "#73C311" ? "#000" : "#fff" }}
        >
          <cfg.icon />
        </span>
        <span className="leading-tight">
          <span className="block text-xs font-semibold text-white sm:text-sm">{cfg.label}</span>
          <span className="hidden text-[11px] text-white/55 sm:block">{cfg.sub}</span>
        </span>
        <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: cfg.color }} />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-black" style={{ background: cfg.color }} />
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: copy on top, demo rising beneath it, 100vh sticky stage       */
/* ------------------------------------------------------------------ */
export default function Hero() {
  const trackRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const [short, setShort] = useState(false);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.35 });

  // Layout numbers live in a ref and are read inside transforms, so resizes just work
  const L = useRef({ s0: 0.9, s1: 1.05, y0: 220, ry: 16 });
  const lv = useMotionValue(0);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const W = Math.min(w * 0.94, 1000);
      const dh = demoRef.current?.offsetHeight || DEMO_H;
      const s1 = Math.max(0.5, Math.min(1.1, (h - 130) / dh, (w * 0.94) / W));
      const s0 = Math.min(s1 * (w >= 640 ? 0.92 : 0.84), 1);
      const el = textRef.current;
      const textBottom = el ? el.offsetTop + el.offsetHeight : h * 0.5;
      const top = Math.min(Math.max(textBottom + 32, h * 0.48), h * 0.74);
      L.current = { s0, s1, y0: top + (dh * s0) / 2 - h / 2, ry: w >= 640 ? 16 : 10 };
      setShort(h < 820);
      lv.set(lv.get() + 1);
    };
    calc();
    window.addEventListener("resize", calc);
    const ro = new ResizeObserver(calc);
    if (textRef.current) ro.observe(textRef.current);
    if (demoRef.current) ro.observe(demoRef.current);
    return () => {
      window.removeEventListener("resize", calc);
      ro.disconnect();
    };
  }, [lv]);

  // Copy lifts away
  const textO = useTransform(p, [0, 0.2], [1, 0]);
  const textY = useTransform(p, [0, 0.25], [0, -90]);
  const textBlur = useTransform(p, [0, 0.22], ["blur(0px)", "blur(12px)"]);
  const textPE = useTransform(p, (v) => (v > 0.12 ? "none" : "auto"));
  const fadeO = useTransform(p, [0, 0.12], [1, 0]);

  // Demo rises from beneath the copy to the centre, flattens and grows
  const demoY = useTransform([p, lv], ([v]: number[]) => transform(v, [0, 0.3], [L.current.y0, 0]));
  const demoScale = useTransform([p, lv], ([v]: number[]) => transform(v, [0, 0.3], [L.current.s0, L.current.s1]));
  const demoRotX = useTransform([p, lv], ([v]: number[]) => transform(v, [0, 0.3], [L.current.ry, 0]));

  return (
    <section ref={trackRef} data-cursor-zone className="relative h-[300vh] bg-black text-white">
      <NeonCursor />

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Backdrop p={p} />

        {/* Copy (top, centred) */}
        <motion.div
          style={{ opacity: textO, y: textY, filter: textBlur, pointerEvents: textPE }}
          className="absolute inset-x-0 top-0 z-10"
        >
          <div ref={textRef} className="mx-auto max-w-5xl px-6 pt-24 text-center sm:pt-28">
            {!short && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="mb-5 hidden items-center gap-2 rounded-full border border-[var(--main-green)]/40 bg-[var(--main-green)]/10 px-4 py-2 text-sm font-medium text-[var(--main-light-green)] sm:inline-flex"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--main-light-green)] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--main-light-green)]" />
                </span>
                AI-Powered Live Chat Software for Every Business
              </motion.div>
            )}

            <h1 className="text-[2.1rem] font-bold leading-[1.06] tracking-tight sm:text-5xl min-[1180px]:text-[3.4rem] min-[1360px]:text-[4rem]">
              <Line text="AI Live Chat Software" delay={0.15} />
              <Line text="That Turns Visitors Into Leads" delay={0.45} gradient />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
              className="mx-auto mt-5 hidden max-w-2xl text-base leading-relaxed text-pri/65 sm:block lg:text-lg"
            >
              One dashboard for live chat, your AI agent and every messaging app. Primo answers in seconds, your team
              steps in when it matters, and no lead slips away overnight.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.15, ease: EASE }}
              className="mt-6 flex items-center justify-center gap-3"
            >
              <Link
                href="https://app.chatlivo.com/signup"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[var(--main-light-green)] px-6 py-3.5 text-base font-semibold text-black shadow-[0_0_40px_-5px_rgba(185,250,106,0.55)] transition-transform hover:scale-[1.04] active:scale-95 sm:px-8"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Get Started Free</span>
                <FiArrowRight className="relative transition-transform group-hover:translate-x-1" />
              </Link>
              {/* <Link
                href="#demo"
                className="group hidden items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-base font-medium text-white transition-colors hover:border-[var(--main-light-green)]/60 hover:bg-white/5 sm:inline-flex"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs transition-colors group-hover:bg-[var(--main-light-green)] group-hover:text-black">
                  <FiPlay />
                </span>
                See it live
              </Link> */}
            </motion.div>

            {!short && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-3 hidden text-sm text-white/40 sm:block"
              >
                Free plan available. No credit card required.
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Demo + orbs + badges: rises, then centres */}
        <div className="pointer-events-none absolute inset-0 z-10 [perspective:1800px]">
          <motion.div
            id="demo"
            ref={demoRef}
            style={{ y: demoY, scale: demoScale, rotateX: demoRotX, transformOrigin: "50% 50%" }}
            className="pointer-events-auto absolute left-1/2 top-1/2 w-[min(94vw,1000px)] -translate-x-1/2 -translate-y-1/2"
          >
            {ORBS.map((o, i) => (
              <IdleOrb key={i} p={p} o={o} />
            ))}
            {BADGES.map((b) => (
              <Badge key={b.label} p={p} cfg={b} />
            ))}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
            >
              <Dashboard />
            </motion.div>
          </motion.div>
        </div>

       
      </div>
    </section>
  );
}
