"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate as tween,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiEye,
  FiInbox,
  FiMail,
  FiMessageSquare,
  FiSmartphone,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import { FaAndroid, FaApple, FaFacebookMessenger, FaInstagram, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

/** The ONLY image in this section. Put Hand1.webp in /public/images. */
const HAND = "/images/Hand1.webp";
const EASE = [0.22, 1, 0.36, 1] as const;
const CYCLE_MS = 3200;

/* Same order as the bento grid, reading left to right, top to bottom */
const TOOLS: { id: string; icon: IconType; title: string; body: string }[] = [
  { id: "tracking", icon: FiEye, title: "Live visitor tracking", body: "See active visitors and available browsing context to understand what they may need." },
  { id: "mobile", icon: FiSmartphone, title: "Mobile access", body: "Stay connected to customer conversations when you are away from your desk." },
  { id: "inbox", icon: FiInbox, title: "Shared team inbox", body: "Assign conversations and keep the next reply clear, even as your team grows." },
  { id: "lead", icon: FiTarget, title: "Lead capture", body: "Use pre-chat forms and offline messages to collect enquiries worth following up." },
  { id: "saved", icon: FiZap, title: "Saved replies", body: "Make common answers quicker without sounding like a copy-and-paste robot." },
  { id: "history", icon: FiClock, title: "Conversation history", body: "Give agents useful context when a customer returns or asks for a person." },
];

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
type VP = { run: boolean; reduce: boolean };

/** Steady clock for the visuals. Pauses when off screen; `still` freezes it on a finished frame. */
function useTick(ms: number, run: boolean, still?: number) {
  const [t, setT] = useState(still ?? 0);
  useEffect(() => {
    if (still !== undefined) {
      setT(still);
      return;
    }
    if (!run) return;
    const id = setInterval(() => setT((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms, run, still]);
  return t;
}

/** Cycles 0..len-1 on an interval */
function useStep(len: number, ms: number, run: boolean, reduce: boolean, start = 0) {
  const [s, setS] = useState(start);
  useEffect(() => {
    if (reduce || !run) return;
    const id = setInterval(() => setS((v) => (v + 1) % len), ms);
    return () => clearInterval(id);
  }, [len, ms, run, reduce]);
  return s;
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const typed = (s: string, t: number, start: number, per = 1.5) =>
  s.slice(0, clamp(Math.floor((t - start) / per), 0, s.length));

/* ------------------------------------------------------------------ */
/* Background: light "book shelf", one book per tool, open book follows */
/* ------------------------------------------------------------------ */
const PAGE = [
  { out: false, w: "60%" },
  { out: true, w: "68%" },
  { out: false, w: "46%" },
  { out: true, w: "56%" },
  { out: false, w: "64%" },
];


/* ------------------------------------------------------------------ */
/* 1. Visitor tracking: live line chart, marker walks the day          */
/* ------------------------------------------------------------------ */
const TP: [number, number][] = [
  [28, 124],
  [108, 100],
  [188, 74],
  [268, 50],
];
const TL = ["10 AM", "12 PM", "2 PM", "Now"];
const TV = [128, 214, 286, 342];
const LINE = TP.map(([x, y], i) => {
  if (i === 0) return `M${x} ${y}`;
  const [px, py] = TP[i - 1];
  const mx = (px + x) / 2;
  return `C${mx} ${py} ${mx} ${y} ${x} ${y}`;
}).join(" ");
const AREA = `${LINE} L268 140 L28 140 Z`;

function LiveCount({ to, run }: { to: number; run: boolean }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString("en-US"));
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!run || done) return;
    const c = tween(mv, to, { duration: 1.6, ease: EASE, onComplete: () => setDone(true) });
    return () => c.stop();
  }, [run, done, mv, to]);
  return <motion.span>{text}</motion.span>;
}

function TrackingVisual({ run, reduce }: VP) {
  const step = useStep(TP.length, 1800, run, reduce, reduce ? 3 : 0);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (run) setDrawn(true);
  }, [run]);
  const show = drawn || reduce;
  const [x, y] = TP[step];
  const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

  return (
    <div className="w-full">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-gray)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-green)]" /> Website visitors today
      </p>
      <p className="mb-1 text-3xl font-bold tabular-nums tracking-tight text-[var(--dark-text)]">
        <LiveCount to={1248} run={run || reduce} />
      </p>

      <div className="relative aspect-[2/1] w-full">
        <svg viewBox="0 0 320 160" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
          <defs>
            <linearGradient id="wt-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#73C311" stopOpacity="0.3" />
              <stop offset="1" stopColor="#73C311" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[60, 100, 140].map((gy) => (
            <line key={gy} x1="12" x2="308" y1={gy} y2={gy} stroke="rgba(0,0,0,0.07)" strokeDasharray="3 5" />
          ))}
          <motion.path
            d={AREA}
            fill="url(#wt-area)"
            initial={{ opacity: 0 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
          <motion.path
            d={LINE}
            stroke="var(--main-green)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: show ? 1 : 0 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          {TP.map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r="3.5" fill="#fff" stroke="var(--main-green)" strokeWidth="1.8" opacity={i <= step ? 1 : 0.45} />
          ))}
          <motion.line
            stroke="var(--main-green)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            y2="140"
            x1={x}
            x2={x}
            y1={y}
            initial={false}
            animate={{ x1: x, x2: x, y1: y }}
            transition={spring}
          />
          {!reduce && (
            <motion.circle
              cx={x}
              cy={y}
              r="6"
              fill="none"
              stroke="var(--main-green)"
              strokeWidth="1.5"
              animate={{ cx: x, cy: y, r: [6, 18], opacity: [0.6, 0] }}
              transition={{
                cx: spring,
                cy: spring,
                r: { duration: 1.6, repeat: Infinity, ease: "easeOut" },
                opacity: { duration: 1.6, repeat: Infinity, ease: "easeOut" },
              }}
            />
          )}
          <motion.circle
            cx={x}
            cy={y}
            r="5.5"
            fill="var(--main-green)"
            stroke="#fff"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 0 6px rgba(115,195,17,0.8))" }}
            initial={false}
            animate={{ cx: x, cy: y }}
            transition={spring}
          />
        </svg>

        <motion.div
          initial={false}
          animate={{ left: `${(x / 320) * 100}%`, top: `${(y / 160) * 100}%` }}
          transition={spring}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+12px)]"
        >
          <span className="block min-w-[88px] rounded-full border border-[var(--main-green)]/50 bg-white px-2.5 py-1 text-center text-[11px] font-semibold text-[var(--dark-text)] shadow-md">
            <motion.span key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="block whitespace-nowrap">
              {TL[step]}: {TV[step]}
            </motion.span>
          </span>
        </motion.div>
      </div>

      <div className="relative h-5 w-full">
        {TL.map((l, i) => (
          <span
            key={l}
            style={{ left: `${(TP[i][0] / 320) * 100}%` }}
            className={`absolute -translate-x-1/2 text-[10px] font-semibold transition-colors duration-300 ${
              step === i ? "text-[var(--main-green)]" : "text-[var(--light-text)]"
            }`}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Mobile access: the only image (Hand1.webp) + live notifications  */
/* ------------------------------------------------------------------ */
const NOTES = [
  { t: "New lead", s: "/pricing" },
  { t: "Maya replied", s: "WhatsApp" },
  { t: "Chat assigned", s: "to Alex" },
];

function MobileVisual({ run, reduce }: VP) {
  const n = useStep(NOTES.length, 2600, run, reduce);
  const note = NOTES[n];

  return (
    <div className="absolute inset-0">
      <div
        aria-hidden
        className="absolute left-1/2 top-[16%] h-[64%] w-[78%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(185,250,106,0.6),transparent)] blur-2xl"
      />

      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <Image src={HAND} alt="Chatlivo mobile app in hand" fill sizes="(min-width:1024px) 380px, 90vw" className="object-contain object-bottom" />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/70 to-transparent" />

      {/* live notification, fixed box so swapping text never moves anything */}
      <div className="absolute left-0 top-0 z-10 h-9 w-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={n}
            initial={{ opacity: 0, x: -16, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--main-green)]/40 bg-white px-3 text-[11px] font-semibold text-[var(--dark-text)] shadow-md"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--main-green)] opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-[var(--main-green)]" />
            </span>
            <span>{note.t}</span>
            <span className="font-mono text-[#3f7d0a]">{note.s}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        animate={reduce ? undefined : { y: [0, 6, 0], rotate: [-3, -1, -3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-14 z-10 flex items-center gap-2 rounded-xl border border-[var(--main-green)]/30 bg-[var(--light-green)] px-3 py-1.5 text-xs font-bold text-[var(--dark-text)] shadow-md"
      >
        <FaApple /> <FaAndroid className="text-[#3f7d0a]" /> Works on iOS &amp; Android
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Shared inbox: channels feed one inbox, each chat gets an owner   */
/* ------------------------------------------------------------------ */
const IW = 260;
const IH = 190;
const CX = 130;
const CY = 95;
const CHANNELS: { icon: IconType; color: string; x: number; y: number }[] = [
  { icon: FaWhatsapp, color: "#25D366", x: 60, y: 44 },
  { icon: FaInstagram, color: "#E1306C", x: 200, y: 44 },
  { icon: FaFacebookMessenger, color: "#0A7CFF", x: 60, y: 146 },
  { icon: FiMail, color: "#EA4335", x: 200, y: 146 },
];
const WHO = ["Alex", "Maya", "Sam", "Raj"];

function InboxVisual({ run, reduce }: VP) {
  const step = useStep(CHANNELS.length, 2000, run, reduce);
  const cur = CHANNELS[step];

  return (
    <div className="relative mx-auto aspect-[260/190] w-full max-w-[260px]">
      <svg viewBox={`0 0 ${IW} ${IH}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
        {CHANNELS.map((c, i) => (
          <line
            key={i}
            x1={c.x}
            y1={c.y}
            x2={CX}
            y2={CY}
            stroke="var(--main-green)"
            strokeOpacity={step === i ? 0.85 : 0.3}
            strokeWidth="1.5"
            strokeDasharray="4 5"
            className="wt-dash"
            style={{ transition: "stroke-opacity .4s" }}
          />
        ))}
        {!reduce && run && (
          <motion.circle
            key={step}
            r="4.5"
            fill="var(--main-green)"
            style={{ filter: "drop-shadow(0 0 6px var(--main-green))" }}
            initial={{ cx: cur.x, cy: cur.y, opacity: 0 }}
            animate={{ cx: CX, cy: CY, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        )}
      </svg>

      {CHANNELS.map((c, i) => {
        const Icon = c.icon;
        const on = step === i;
        return (
          <span
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(c.x / IW) * 100}%`, top: `${(c.y / IH) * 100}%` }}
          >
            <motion.span
              animate={reduce ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              className="block"
            >
              <span
                style={{ color: c.color }}
                className={`grid h-10 w-10 place-items-center rounded-xl border bg-white text-xl transition-all duration-500 ${
                  on
                    ? "scale-110 border-[var(--main-green)] shadow-[0_0_24px_-4px_rgba(115,195,17,0.7)]"
                    : "border-[var(--borders-color)] shadow-sm"
                }`}
              >
                <Icon />
              </span>
            </motion.span>
          </span>
        );
      })}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-[var(--main-green)]/50 bg-white text-2xl text-[var(--main-green)] shadow-[0_10px_30px_-10px_rgba(115,195,17,0.6)]">
          <FiInbox />
          {!reduce && run && (
            <span
              key={step}
              className="wt-ping absolute inset-0 rounded-2xl border-2 border-[var(--main-green)]"
              style={{ animation: "wt-ping 1s ease-out 1s both" }}
            />
          )}
        </span>
      </div>

      <div className="absolute left-1/2 top-[calc(50%+38px)] h-6 w-[96px] -translate-x-1/2">
        <AnimatePresence initial={false}>
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.9, duration: 0.35 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-[var(--dark-text)] text-[10px] font-semibold text-[var(--main-light-green)]"
          >
            <FiArrowRight /> {WHO[step]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Lead capture: form fills itself, cursor clicks, lead is saved    */
/* ------------------------------------------------------------------ */
const L_NAME = "Emma Wilson";
const L_EMAIL = "emma@acme.io";

function Field({ label, value, active, done }: { label: string; value: string; active: boolean; done: boolean }) {
  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-lg border px-3 transition-colors duration-300 ${
        active ? "border-[var(--main-green)] bg-[var(--light-green)]/25" : "border-[var(--borders-color)] bg-[var(--bg-color)]"
      }`}
    >
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[9px] font-semibold uppercase tracking-wide text-[var(--light-text)]">{label}</span>
        <span className="block min-h-[16px] truncate text-[12px] font-medium text-[var(--dark-text)]">
          {value}
          {active && <span className="ml-px inline-block h-3 w-px translate-y-0.5 animate-pulse bg-[var(--main-green)]" />}
        </span>
      </span>
      <span
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--main-green)] text-[9px] text-black transition-all duration-300 ${
          done ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <FiCheck />
      </span>
    </div>
  );
}

function LeadVisual({ run, reduce }: VP) {
  const tick = useTick(70, run, reduce ? 70 : undefined);
  const t = tick % 120;
  const name = typed(L_NAME, t, 6);
  const email = typed(L_EMAIL, t, 30);
  const nameDone = name.length === L_NAME.length;
  const emailDone = email.length === L_EMAIL.length;
  const pressed = t >= 54 && t < 58;
  const sent = t >= 58;
  const fade = t >= 108;
  const cur = t < 30 ? { left: "58%", top: "30%" } : t < 50 ? { left: "64%", top: "54%" } : { left: "56%", top: "82%" };

  return (
    <div className="relative h-full w-full">
      <motion.div
        animate={{ opacity: fade ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute left-1/2 top-1/2 w-[min(100%,270px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--borders-color)] bg-white p-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.25)]"
      >
        <Field label="Name" value={name} active={t >= 2 && !nameDone} done={nameDone} />
        <div className="h-2" />
        <Field label="Email" value={email} active={t >= 28 && !emailDone} done={emailDone} />
        <motion.div
          animate={{ scale: pressed ? 0.95 : 1 }}
          transition={{ duration: 0.12 }}
          className={`mt-3 flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors duration-300 ${
            sent ? "bg-[var(--main-green)] text-black" : "bg-[var(--main-light-green)] text-[var(--dark-text)]"
          }`}
        >
          {sent ? (
            <>
              <FiCheck /> Lead captured
            </>
          ) : (
            "Start chat"
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {t >= 62 && t < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-full border border-[var(--main-green)]/40 bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--dark-text)] shadow-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--main-green)]" /> +1 lead sent to CRM
          </motion.div>
        )}
      </AnimatePresence>

      {!reduce && (
        <motion.div
          aria-hidden
          initial={false}
          animate={{ ...cur, opacity: t >= 2 && t < 66 ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="pointer-events-none absolute z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--dark-text)" stroke="#fff" strokeWidth="1.5">
            <path d="M5 3l14 7-6 2-2 6z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Saved replies: type a shortcut, hit Tab, template expands        */
/* ------------------------------------------------------------------ */
const REPLIES = [
  { cmd: "/pricing", text: "Hi {name}, plans start free. Pro is $12 per agent each month." },
  { cmd: "/refund", text: "Hi {name}, I have started the refund for order {order}. It lands in 3–5 days." },
  { cmd: "/shipping", text: "Hi {name}, order {order} ships today. Tracking follows by email." },
];
const VARS: Record<string, string> = { name: "Emma", order: "#1042" };
type Unit = { s: string; v?: string };
const toUnits = (text: string): Unit[] =>
  text
    .split(/(\{[a-z]+\})/)
    .flatMap((p) => (/^\{[a-z]+\}$/.test(p) ? [{ s: p, v: p.slice(1, -1) }] : p.split("").map((c) => ({ s: c }))));
const UNITS = REPLIES.map((r) => toUnits(r.text));
const S_LEN = 160;

function SavedVisual({ run, reduce }: VP) {
  const tick = useTick(50, run, reduce ? 100 : undefined);
  const i = Math.floor(tick / S_LEN) % REPLIES.length;
  const t = tick % S_LEN;
  const r = REPLIES[i];
  const units = UNITS[i];

  const cmd = typed(r.cmd, t, 4, 2.2);
  const expandAt = 34;
  const expanded = t >= expandAt;
  const count = clamp(Math.floor((t - expandAt) * 1.5), 0, units.length);
  const full = count === units.length;
  const resolved = expanded && full && t >= expandAt + units.length / 1.5 + 10;
  const tabOn = t >= 30 && t < 38;
  const fade = t >= 140;

  const segs: Unit[] = [];
  units.slice(0, count).forEach((u) => {
    const last = segs[segs.length - 1];
    if (!u.v && last && !last.v) last.s += u.s;
    else segs.push({ ...u });
  });

  return (
    <div className="w-full">
      <div className="flex gap-2">
        {REPLIES.map((x, k) => (
          <span
            key={x.cmd}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors duration-300 ${
              k === i
                ? "border-[var(--main-green)] bg-[var(--light-green)]/60 text-[var(--dark-text)]"
                : "border-[var(--borders-color)] bg-white text-[var(--text-gray)]"
            }`}
          >
            <FiZap className={k === i ? "text-[var(--main-green)]" : ""} /> {x.cmd}
          </span>
        ))}
      </div>

      <div className="mt-3 flex h-[112px] flex-col rounded-xl border border-[var(--main-green)]/40 bg-white shadow-sm">
        <div className="flex-1 overflow-hidden px-3 pt-2.5 text-[12px] leading-5">
          <motion.div animate={{ opacity: fade ? 0 : 1 }} transition={{ duration: 0.3 }}>
            {!expanded ? (
              <span className="font-mono text-[var(--dark-text)]">
                {cmd}
                <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-[var(--main-green)]" />
              </span>
            ) : (
              <p className="whitespace-pre-wrap text-[var(--dark-text)]">
                {segs.map((s, k) =>
                  s.v ? (
                    <span
                      key={k}
                      className={`mx-px rounded px-1 py-px transition-colors duration-500 ${
                        resolved ? "bg-[var(--main-green)]/20 font-semibold" : "bg-[var(--light-green)]/70 font-mono text-[11px] text-[#3f7d0a]"
                      }`}
                    >
                      {resolved ? VARS[s.v] : s.s}
                    </span>
                  ) : (
                    <span key={k}>{s.s}</span>
                  )
                )}
              </p>
            )}
          </motion.div>
        </div>
        <div className="flex h-8 shrink-0 items-center justify-between border-t border-[var(--borders-color)] px-3 text-[10px] text-[var(--light-text)]">
          <span>{expanded ? "Template inserted" : "Typing shortcut…"}</span>
          <span
            className={`rounded border px-1.5 py-0.5 font-mono transition-colors duration-200 ${
              tabOn ? "border-[var(--main-green)] bg-[var(--main-green)] text-black" : "border-[var(--borders-color)] bg-[var(--bg-light)]"
            }`}
          >
            Tab
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Conversation history: a returning customer, full timeline        */
/* ------------------------------------------------------------------ */
function HistoryVisual({ run, reduce }: VP) {
  const tick = useTick(900, run, reduce ? 6 : undefined);
  const t = tick % 10;
  const v1 = t >= 1 && t < 9;
  const v2 = t >= 2 && t < 9;
  const typing = t >= 3 && t < 5;
  const v3 = t >= 5 && t < 9;
  const rail = t === 0 || t >= 9 ? 0 : t >= 5 ? 1 : t >= 2 ? 0.55 : 0.12;
  const show = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  const dot = (on: boolean) =>
    `absolute -left-8 top-0.5 h-3.5 w-3.5 rounded-full border-2 bg-white transition-colors duration-500 ${
      on ? "border-[var(--main-green)]" : "border-[var(--borders-color)]"
    }`;

  return (
    <div className="relative h-full w-full">
      <span aria-hidden className="absolute bottom-2 left-[6px] top-2 w-px bg-black/10" />
      <motion.span
        aria-hidden
        animate={{ scaleY: rail }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute bottom-2 left-[6px] top-2 w-px origin-top bg-[var(--main-green)]"
      />

      <div className="flex flex-col gap-3 pl-8">
        <motion.div animate={show(v1)} transition={{ duration: 0.45, ease: EASE }} className="relative">
          <span className={dot(v1)} />
          <p className="mb-1 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--light-text)]">
            2 days ago
            <span className="flex items-center gap-1 rounded-full border border-[var(--borders-color)] bg-white px-1.5 py-0.5 normal-case tracking-normal text-[var(--dark-text)]">
              <FaWhatsapp className="text-[#25D366]" /> WhatsApp
            </span>
          </p>
          <p className="w-fit max-w-[92%] rounded-2xl rounded-tl-sm bg-[var(--bg-light)] px-3 py-1.5 text-[12px] text-[var(--dark-text)]">
            Hi, do you support WhatsApp?
          </p>
        </motion.div>

        <motion.div animate={show(v2)} transition={{ duration: 0.45, ease: EASE }} className="relative">
          <span className={dot(v2)} />
          <p className="mb-1 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--light-text)]">
            Today
            <span className="flex items-center gap-1 rounded-full border border-[var(--borders-color)] bg-white px-1.5 py-0.5 normal-case tracking-normal text-[var(--dark-text)]">
              <FiMessageSquare className="text-[var(--main-green)]" /> Live chat
            </span>
          </p>
          <p className="w-fit max-w-[92%] rounded-2xl rounded-tl-sm bg-[var(--bg-light)] px-3 py-1.5 text-[12px] text-[var(--dark-text)]">
            Ready to upgrade our team plan!
          </p>
        </motion.div>

        <div className="relative h-[62px]">
          <span className={dot(v3 || typing)} />
          <motion.span
            animate={{ opacity: typing ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 top-0 flex items-center gap-1 rounded-2xl rounded-br-sm bg-[var(--light-green)] px-3.5 py-2.5"
          >
            {[0, 1, 2].map((k) => (
              <motion.span
                key={k}
                className="h-1.5 w-1.5 rounded-full bg-[var(--main-green)]"
                animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.15 }}
              />
            ))}
          </motion.span>
          <motion.div
            animate={show(v3)}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute right-0 top-0 w-[92%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[var(--main-light-green)] to-[var(--main-green)] px-3 py-2 text-[12px] font-medium leading-snug text-black shadow-md"
          >
            Welcome back! Picked up right from your WhatsApp chat.
            <span className="mt-0.5 block text-[9px] font-semibold text-black/55">Alex · just now</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card: mouse spotlight + 3D tilt + lift, one shell for every tool    */
/* ------------------------------------------------------------------ */
type Layout = { wrap: string; inner: string; visual: string; textFirst?: boolean };

/* Grid (lg): row 1 = tracking (2 cols) + mobile (col 3, 2 rows tall); row 2 = inbox, lead; row 3 = saved + history (2 cols) */
const LAYOUT: Record<string, Layout> = {
  tracking: {
    wrap: "md:col-span-2",
    inner: "flex flex-col gap-6 md:grid md:grid-cols-2 md:items-center md:gap-10",
    visual: "w-full",
    textFirst: true,
  },
  mobile: {
    wrap: "md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1",
    inner: "flex flex-col gap-5 md:grid md:grid-cols-2 md:items-center md:gap-8 lg:flex lg:flex-col lg:items-stretch",
    visual: "relative h-[340px] md:h-[380px] lg:h-auto lg:min-h-[340px] lg:flex-1",
  },
  inbox: { wrap: "", inner: "flex flex-col gap-5", visual: "flex min-h-[190px] items-center justify-center" },
  lead: { wrap: "", inner: "flex flex-col gap-5", visual: "relative h-[190px]" },
  saved: {
    wrap: "md:col-span-2 lg:col-span-1",
    inner: "flex flex-col gap-5 md:grid md:grid-cols-2 md:items-center md:gap-8 lg:flex lg:flex-col lg:items-stretch",
    visual: "relative flex h-[190px] flex-col justify-center",
  },
  history: {
    wrap: "md:col-span-2",
    inner: "flex flex-col gap-6 md:grid md:grid-cols-2 md:items-center md:gap-10",
    visual: "relative h-[200px]",
    textFirst: true,
  },
};

function Copy({ t, n }: { t: (typeof TOOLS)[number]; n: number }) {
  const Icon = t.icon;
  return (
    <div className="relative">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--borders-color)] bg-[var(--light-green)]/40 text-base text-[var(--main-green)] transition-all duration-300 group-hover:bg-[var(--main-green)] group-hover:text-white">
          <Icon />
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--dark-text)]">{t.title}</h3>
        <span className="ml-auto font-mono text-xs text-[var(--light-text)]">0{n + 1}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-gray)]">{t.body}</p>
    </div>
  );
}

function Card({
  t,
  n,
  on,
  bar,
  onEnter,
  onLeave,
  children,
}: {
  t: (typeof TOOLS)[number];
  n: number;
  on: boolean;
  bar: boolean;
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
}) {
  const L = LAYOUT[t.id];
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 220, damping: 22 });
  const spot = useMotionTemplate`radial-gradient(260px circle at ${px}px ${py}px, rgba(115,195,17,0.14), transparent 70%)`;

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => {
    mx.set(0);
    my.set(0);
    onLeave();
  };

  const copy = <Copy t={t} n={n} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (n % 3) * 0.1, ease: EASE }}
      className={`h-full [perspective:900px] ${L.wrap}`}
    >
      <motion.div
        onPointerMove={move}
        onPointerEnter={onEnter}
        onPointerLeave={leave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={`group relative h-full overflow-hidden rounded-3xl border bg-white p-6 transition-[border-color,box-shadow] duration-300 ${L.inner} ${
          on
            ? "border-[var(--main-green)] shadow-[0_24px_50px_-24px_rgba(115,195,17,0.4)]"
            : "border-[var(--borders-color)] shadow-sm hover:border-[var(--gray-border)]"
        }`}
      >
        <motion.div
          aria-hidden
          style={{ background: spot }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {L.textFirst && copy}
        <div className={L.visual}>{children}</div>
        {!L.textFirst && copy}
        {bar && (
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-[2px] bg-[var(--main-green)]"
            style={{ animation: `wt-bar ${CYCLE_MS}ms linear forwards` }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function WhyTeamUses() {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const inView = useInView(ref, { margin: "-20% 0px" });
  const [auto, setAuto] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (reduce || !inView || hover !== null) return;
    const id = setInterval(() => setAuto((a) => (a + 1) % TOOLS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce, inView, hover]);

  const idx = hover ?? auto;
  const run = inView && !reduce;
  const vp: VP = { run, reduce };

  const visuals: Record<string, ReactNode> = {
    tracking: <TrackingVisual {...vp} />,
    mobile: <MobileVisual {...vp} />,
    inbox: <InboxVisual {...vp} />,
    lead: <LeadVisual {...vp} />,
    saved: <SavedVisual {...vp} />,
    history: <HistoryVisual {...vp} />,
  };

  return (
    <section ref={ref} className="relative overflow-hidden bg-[var(--color-primary)] py-20 text-[var(--dark-text)] ">
      <style>{`
        @keyframes wt-bar { from { width: 0 } to { width: 100% } }
        @keyframes wt-dash { to { stroke-dashoffset: -18 } }
        @keyframes wt-ping { 0% { opacity: 0 } 1% { opacity: .7; transform: scale(1) } 100% { opacity: 0; transform: scale(1.6) } }
        .wt-dash { animation: wt-dash 1.2s linear infinite }
        @media (prefers-reduced-motion: reduce) { .wt-dash, .wt-ping { animation: none !important } }
      `}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#f8faf5]">
  <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[var(--main-green)]/12 blur-[150px]" />
  <div className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-[var(--main-light-green)]/25 blur-[160px]" />
</div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--main-green)]"
          >
            <span className="h-px w-8 bg-[var(--main-green)]" />
            Why teams use Chatlivo
            <span className="h-px w-8 bg-[var(--main-green)]" />
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="cursor-scan-effect text-3xl font-bold leading-[1.1] tracking-tight text-[var(--dark-text)] sm:text-5xl"
          >
            The Everyday Tools Behind Better{" "}
            <span className="relative isolate inline-block">
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
                className="absolute inset-x-0 bottom-1 -z-10 h-[0.4em] origin-left rounded-sm "
              />
              Customer Conversations
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-gray)] sm:text-lg"
          >
            Support is rarely one big problem. It is dozens of small moments: a missed message, a repeated question, a
            visitor who leaves before asking. These tools help your team stay on top of them.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {TOOLS.map((t, i) => (
            <Card
              key={t.id}
              t={t}
              n={i}
              on={idx === i}
              bar={idx === i && hover === null && run}
              onEnter={() => setHover(i)}
              onLeave={() => setHover(null)}
            >
              {visuals[t.id]}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}