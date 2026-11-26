"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiCpu,
  FiEdit3,
  FiGitBranch,
  FiLayout,
  FiMessageSquare,
  FiUserPlus,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const EASE = [0.22, 1, 0.36, 1] as const;
const STEP_MS = 2200;

/* Six features = six steps that loop forever */
const FEATURES: { icon: IconType; short: string; title: string; body: string }[] = [
  { icon: FiLayout, short: "Template", title: "Pre-built templates", body: "Ready-made chatbot templates for different business needs." },
  { icon: FiEdit3, short: "Custom", title: "Custom chatbot creation", body: "Create personalized chatbot workflows from scratch." },
  { icon: FiCpu, short: "AI", title: "AI-powered conversations", body: "Deliver intelligent, context-aware customer interactions." },
  { icon: FiGitBranch, short: "Flow", title: "Visual flow builder", body: "Design and customize chatbot conversations with ease." },
  { icon: FiUserPlus, short: "Leads", title: "Lead generation", body: "Capture and qualify potential customers automatically." },
  { icon: FiUsers, short: "Handoff", title: "Human handoff", body: "Connect customers with live agents when needed." },
];

type Ev = { at: number; kind: "sys" | "visitor" | "bot" | "chips" | "lead" | "agent"; text: string; d?: number };
const EVENTS: Ev[] = [
  { at: 0, kind: "sys", text: "Template loaded: Lead capture" },
  { at: 1, kind: "sys", text: "Custom step added: ask team size" },
  { at: 2, kind: "visitor", text: "Is Pro enough for 8 agents?" },
  { at: 2, kind: "bot", text: "Yes, Pro covers up to 10 agents. Want a demo?", d: 0.6 },
  { at: 3, kind: "chips", text: "Book a demo|See pricing" },
  { at: 4, kind: "visitor", text: "Book a demo" },
  { at: 4, kind: "lead", text: "sean@barberco.com saved as a lead", d: 0.6 },
  { at: 5, kind: "agent", text: "Alex joined. I'll take it from here." },
];

/* Static class maps so Tailwind can see them */
const ROW = ["lg:row-start-1", "lg:row-start-2", "lg:row-start-3"];
const RINGS = [
  { s: 560, d: 46, r: false, icon: FiMessageSquare },
  { s: 860, d: 70, r: true },
  { s: 1180, d: 96, r: false, icon: FiZap },
  { s: 1560, d: 130, r: true },
];

function Bubble({ e }: { e: Ev }) {
  const base = "max-w-[88%] text-[13px] leading-relaxed";
  if (e.kind === "sys")
    return (
      <span className="mx-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/55">
        <FiZap className="text-[var(--main-light-green)]" /> {e.text}
      </span>
    );
  if (e.kind === "visitor")
    return <span className={`${base} ml-auto rounded-2xl rounded-br-sm bg-[var(--main-light-green)] px-3.5 py-2 text-black`}>{e.text}</span>;
  if (e.kind === "chips")
    return (
      <span className="flex gap-2">
        {e.text.split("|").map((t) => (
          <span key={t} className="rounded-full border border-[var(--main-green)]/50 bg-[var(--main-green)]/10 px-3 py-1 text-xs font-medium text-[var(--main-light-green)]">
            {t}
          </span>
        ))}
      </span>
    );
  if (e.kind === "lead")
    return (
      <span className="flex items-center gap-2 rounded-xl border border-[var(--main-green)]/40 bg-[var(--main-green)]/10 px-3 py-2 text-xs text-white">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--main-light-green)] text-[10px] text-black">
          <FiCheck />
        </span>
        {e.text}
      </span>
    );
  return (
    <span className={`${base} rounded-2xl rounded-bl-sm bg-white/[0.08] px-3.5 py-2 text-white/90`}>
      <span className="mb-0.5 block text-[10px] font-semibold text-[var(--main-light-green)]">{e.kind === "bot" ? "Livo AI" : "Alex · Team"}</span>
      {e.text}
    </span>
  );
}

/* Heading words rise out of a mask. Triggered from the parent so the mask never blocks it. */
const Words = ({ text, show, grad, delay = 0 }: { text: string; show: boolean; grad?: boolean; delay?: number }) => (
  <span className="block">
    {text.split(" ").map((w, i) => (
      <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
        <motion.span
          className={`inline-block ${grad ? "bg-gradient-to-r from-[var(--main-light-green)] to-[var(--main-green)] bg-clip-text text-transparent" : ""}`}
          initial={{ y: "115%" }}
          animate={show ? { y: 0 } : { y: "115%" }}
          transition={{ duration: 0.8, delay: delay + i * 0.06, ease: EASE }}
        >
          {w}&nbsp;
        </motion.span>
      </span>
    ))}
  </span>
);

export default function ChatbotBuilder() {
  const reduce = !!useReducedMotion();
  const headRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headIn = useInView(headRef, { once: true, amount: 0.2 });
  const inView = useInView(stageRef, { amount: 0.25 });
  const [tick, setTick] = useState(0);
  const running = inView && !reduce;

  useEffect(() => {
    if (reduce) setTick(5);
  }, [reduce]);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setTick((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [tick, running]);

  const step = tick % 6;
  const cycle = Math.floor(tick / 6);

  // Conversation never resets: it scrolls on through repeated cycles
  const visible = [cycle - 1, cycle]
    .filter((c) => c >= 0)
    .flatMap((c) => EVENTS.filter((e) => e.at + c * 6 <= tick).map((e) => ({ e, c, key: `${c}-${e.text}` })))
    .slice(-5);

  return (
    <section className="relative overflow-hidden bg-black py-20 text-white sm:py-28">
      <style>{`
        @keyframes cb-spin { to { transform: rotate(360deg) } }
        @keyframes cb-bar { from { width: 0 } to { width: 100% } }
        @keyframes cb-drift { 0%,100% { transform: translate(0,0) } 50% { transform: translate(60px,40px) } }
        @media (prefers-reduced-motion: reduce) { .cb-anim { animation: none !important } }
      `}</style>

      {/* Ambient background: grid, glows and orbiting rings that fill the whole width */}
      <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_55%,#000,transparent)]" />
      <div aria-hidden className="cb-anim absolute -left-48 top-[18%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(115,195,17,0.3),transparent)] blur-3xl [animation:cb-drift_18s_ease-in-out_infinite]" />
      <div aria-hidden className="cb-anim absolute -right-48 top-[44%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(185,250,106,0.22),transparent)] blur-3xl [animation:cb-drift_22s_ease-in-out_infinite_reverse]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%]">
        {RINGS.map((r, i) => (
          <div
            key={i}
            className="cb-anim absolute rounded-full border border-white/[0.07]"
            style={{ width: r.s, height: r.s, marginLeft: -r.s / 2, marginTop: -r.s / 2, animation: `cb-spin ${r.d}s linear infinite ${r.r ? "reverse" : "normal"}` }}
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--main-light-green)] shadow-[0_0_16px_4px_rgba(185,250,106,0.7)]" />
            <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--main-green)]/70" />
            {r.icon && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                <span
                  className="cb-anim grid h-9 w-9 place-items-center rounded-xl border border-[var(--main-green)]/40 bg-black text-base text-[var(--main-light-green)] shadow-[0_0_24px_-4px_rgba(115,195,17,0.6)]"
                  style={{ animation: `cb-spin ${r.d}s linear infinite ${r.r ? "normal" : "reverse"}` }}
                >
                  <r.icon />
                </span>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div ref={headRef} className="mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={headIn ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--main-green)]/40 bg-[var(--main-green)]/10 px-3.5 py-1 text-xs font-medium text-[var(--main-light-green)]"
          >
            <FiGitBranch /> Chatbot builder
          </motion.span>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl cursor-scan-effect">
            <Words text="AI Chatbot Builder for Customer" show={headIn} />
            <Words text="Support, Lead Generation &" show={headIn} delay={0.15} />
            <Words text="Automation" show={headIn} grad delay={0.3} />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headIn ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Choose ready-made chatbot templates or create custom chatbot workflows to automate customer conversations.
          </motion.p>
        </div>

        {/* Stage: feature cards ─ wires ─ live bot ─ wires ─ feature cards */}
        <div
          ref={stageRef}
          className="relative z-10 mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1.45fr)_56px_minmax(0,1fr)] lg:grid-rows-3 lg:gap-y-4"
        >
          {/* Center: the bot being built */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/95 shadow-[0_40px_140px_-30px_rgba(115,195,17,0.55)] backdrop-blur sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-3 lg:row-start-1 lg:min-h-[470px]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <span className="flex items-center gap-3">
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[var(--main-green)] text-base text-black">
                  <FiCpu />
                  <span className="absolute inset-0 animate-ping rounded-full border border-[var(--main-light-green)] [animation-duration:2.4s]" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">Livo AI · Lead capture bot</span>
                  <span className="text-[11px] text-white/45">Building itself, step {step + 1} of 6</span>
                </span>
              </span>
              <span className="hidden items-center gap-1.5 rounded-full bg-[var(--main-green)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--main-light-green)] sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-light-green)]" /> Live
              </span>
            </div>

            {/* Flow strip */}
            <div className="relative px-6 pb-6 pt-5">
              <div aria-hidden className="absolute inset-x-[2.9rem] top-[2.4rem] h-px bg-white/10 sm:inset-x-[3.4rem]">
                <motion.span
                  animate={{ width: `${(step / 5) * 100}%` }}
                  transition={{ duration: step === 0 ? 0.3 : 0.9, ease: EASE }}
                  className="absolute left-0 top-0 h-[2px] -translate-y-px bg-[var(--main-light-green)] shadow-[0_0_12px_var(--main-light-green)]"
                />
              </div>
              <div className="relative flex justify-between">
                {FEATURES.map((f, i) => {
                  const on = step === i;
                  return (
                    <span key={f.short} className="flex flex-col items-center gap-1.5">
                      <motion.span
                        animate={{ scale: on ? 1.2 : 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className={`relative grid h-9 w-9 place-items-center rounded-full border text-base transition-colors duration-500 sm:h-10 sm:w-10 ${
                          on
                            ? "border-[var(--main-light-green)] bg-[var(--main-light-green)] text-black shadow-[0_0_28px_var(--main-green)]"
                            : step > i
                              ? "border-[var(--main-green)]/60 bg-[var(--main-green)]/20 text-[var(--main-light-green)]"
                              : "border-white/10 bg-[#141414] text-white/35"
                        }`}
                      >
                        <f.icon />
                      </motion.span>
                      <span className={`hidden text-[10px] font-semibold sm:block ${on ? "text-[var(--main-light-green)]" : "text-white/35"}`}>{f.short}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Live chat */}
            <div className="relative flex flex-1 flex-col border-t border-white/10 bg-black/50">
              <div className="flex items-center gap-2 px-4 pt-3 text-[11px] font-medium text-white/45">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-light-green)]" /> Live preview
              </div>
              <div className="relative flex h-[240px] flex-col justify-end gap-2 overflow-hidden p-4 [mask-image:linear-gradient(to_bottom,transparent,#000_22%)] lg:h-[260px]">
                <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {visible.map(({ e, c, key }) => (
                      <motion.div
                        key={key}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, position: "absolute" }}
                        transition={{ duration: 0.45, delay: e.at + c * 6 === tick ? e.d ?? 0 : 0, ease: EASE }}
                        className="flex flex-col"
                      >
                        <Bubble e={e} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature cards + wires */}
          {FEATURES.map((f, i) => {
            const side = i < 3 ? 0 : 1;
            const on = step === i;
            return (
              <div key={f.title} className="contents">
                <motion.div
                  initial={{ opacity: 0, x: side ? 32 : -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, delay: 0.1 + (i % 3) * 0.1, ease: EASE }}
                  className={`h-full ${ROW[i % 3]} ${side ? "lg:col-start-5" : "lg:col-start-1"}`}
                >
                  <button
                    type="button"
                    onClick={() => setTick(cycle * 6 + i)}
                    aria-pressed={on}
                    className={`relative flex h-full w-full items-center overflow-hidden rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow] duration-500 ${
                      on
                        ? "border-[var(--main-green)]/60 bg-[var(--main-green)]/10 shadow-[0_0_60px_-14px_rgba(115,195,17,0.7)]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="flex items-start gap-3.5">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg transition-colors duration-500 ${
                          on ? "bg-[var(--main-light-green)] text-black" : "bg-white/5 text-[var(--main-light-green)]/70"
                        }`}
                      >
                        <f.icon />
                      </span>
                      <span>
                        <span className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tabular-nums text-[var(--main-green)]">0{i + 1}</span>
                          <span className={`text-[15px] font-semibold tracking-tight transition-colors ${on ? "text-white" : "text-white/75"}`}>{f.title}</span>
                        </span>
                        <span className={`mt-1 block text-[13px] leading-relaxed transition-colors ${on ? "text-white/70" : "text-white/45"}`}>{f.body}</span>
                      </span>
                    </span>
                    {on && running && (
                      <span key={`b-${tick}`} aria-hidden className="absolute bottom-0 left-0 h-[2px] bg-[var(--main-light-green)]" style={{ animation: `cb-bar ${STEP_MS}ms linear forwards` }} />
                    )}
                  </button>
                </motion.div>

                {/* wire from card to the bot */}
                <div aria-hidden className={`relative hidden items-center ${ROW[i % 3]} ${side ? "lg:col-start-4" : "lg:col-start-2"} lg:flex`}>
                  <span className={`h-px w-full transition-colors duration-500 ${on ? "bg-[var(--main-green)]/70" : "bg-white/10"}`} />
                  <span className={`absolute ${side ? "right-0" : "left-0"} h-1.5 w-1.5 rounded-full transition-colors duration-500 ${on ? "bg-[var(--main-light-green)]" : "bg-white/20"}`} />
                  {on && (
                    <motion.span
                      key={`w-${tick}`}
                      initial={{ left: side ? "100%" : "-30%" }}
                      animate={{ left: side ? "-30%" : "100%" }}
                      transition={{ duration: 1.1, ease: EASE }}
                      className={`absolute top-1/2 h-[3px] w-8 -translate-y-1/2 rounded-full shadow-[0_0_14px_var(--main-light-green)] ${
                        side ? "bg-gradient-to-l from-transparent to-[var(--main-light-green)]" : "bg-gradient-to-r from-transparent to-[var(--main-light-green)]"
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 mt-12 flex justify-center">
          <Link
            href="https://app.chatlivo.com/signup"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--main-light-green)] px-8 py-4 text-sm font-semibold text-black shadow-[0_0_50px_-8px_rgba(185,250,106,0.65)] transition-transform hover:scale-[1.04] active:scale-95"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Build Your Chatbot Free</span>
            <FiArrowRight className="relative transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}