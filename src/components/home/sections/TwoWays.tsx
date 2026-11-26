"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiLink,
  FiMaximize2,
  FiMessageSquare,
  FiMoreVertical,
  FiPaperclip,
  FiSmile,
  FiX,
} from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

const EASE = [0.22, 1, 0.36, 1] as const;
const BLUE = "#3453c4"; // widget colour from the product screenshots

type View = "home" | "chat" | "wa";
type Way = { id: string; title: string; body: string; cta: string; href: string; icon: IconType; perks: string[]; view: View };

const WAYS: Way[] = [
  {
    id: "chat",
    view: "chat",
    title: "Live Chat Widget",
    body: "Let visitors ask questions without leaving your website. Your team can reply, collect contact details and continue the conversation in Chatlivo.",
    cta: "Explore Live Chat",
    href: "/products/live-chat",
    icon: FiMessageSquare,
    perks: ["Pre-chat form", "Visitor details", "Canned replies"],
  },
  {
    id: "whatsapp",
    view: "wa",
    title: "WhatsApp Chat Widget",
    body: "Give visitors a familiar way to reach your business through WhatsApp. A simple option for people who would rather message you from their phone.",
    cta: "Explore WhatsApp Widget",
    href: "/products/whatsapp",
    icon: FaWhatsapp,
    perks: ["Click to chat", "Prefilled message", "Opens in the app"],
  },
];

/* Auto demo: home box -> pick Live Chat -> home box -> pick WhatsApp */
const SCENES: { k: View; ms: number; to?: 0 | 1 }[] = [
  { k: "home", ms: 2800, to: 0 },
  { k: "chat", ms: 6200 },
  { k: "home", ms: 2800, to: 1 },
  { k: "wa", ms: 4600 },
];

/* ------------------------------------------------------------------ */
/* Chatlivo mark, drawn in code                                        */
/* ------------------------------------------------------------------ */
function Logo({ className = "", stroke = "#73C311", eye = "#111" }: { className?: string; stroke?: string; eye?: string }) {
  return (
    <svg viewBox="0 0 32 27" className={className} fill="none" aria-hidden>
      <path
        d="M7 2h18a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H17l-6 5v-5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z"
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="11" r="3.2" fill="#fff" stroke={eye} strokeWidth="1.6" />
      <circle cx="20.5" cy="11" r="3.2" fill="#fff" stroke={eye} strokeWidth="1.6" />
      <circle cx="12" cy="11.2" r="1.2" fill={eye} />
      <circle cx="21" cy="11.2" r="1.2" fill={eye} />
    </svg>
  );
}

const pop = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

/* ------------------------------------------------------------------ */
/* 1. Home chat box (same layout as your HomeChatBox component)        */
/* ------------------------------------------------------------------ */
function HomeBox({ hint, onPick }: { hint: 0 | 1 | null; onPick: (i: 0 | 1) => void }) {
  const rows = [
    {
      i: 0 as const,
      title: "Chat with us",
      sub: "We reply immediately!",
      icon: (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-black/[0.03]">
          <Logo className="h-6 w-7" />
        </span>
      ),
      arrow: "text-[var(--main-green)]",
    },
    {
      i: 1 as const,
      title: "WhatsApp",
      sub: "Chat with us on WhatsApp.",
      icon: (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366]/10 text-[22px] text-[#25D366]">
          <FaWhatsapp />
        </span>
      ),
      arrow: "text-[#25D366]",
    },
  ];

  return (
    <div className="w-[calc(100vw-4rem)] max-w-[340px] overflow-hidden rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.14)]" style={{ background: BLUE }}>
      <div className="px-6 pb-8 pt-6 text-white">
        <div className="mb-4 flex -space-x-3">
          {["P", "K"].map((c) => (
            <span key={c} className="grid h-10 w-10 place-items-center rounded-full bg-white/45 text-xs font-bold">
              {c}
            </span>
          ))}
        </div>
        <h3 className="text-2xl font-bold tracking-tight">How can we help?</h3>
        <p className="mt-1.5 text-sm font-medium opacity-95">Type your message here</p>
      </div>

      <div className="relative -mt-4 flex flex-col gap-3 rounded-t-[24px] border border-gray-200 bg-white px-4 pb-4 pt-4">
        {rows.map((r) => (
          <button
            key={r.i}
            type="button"
            onClick={() => onPick(r.i)}
            className={`group flex w-full items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition hover:shadow-md ${
              hint === r.i ? "tw-hint" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              {r.icon}
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold text-slate-900">{r.title}</span>
                <span className="text-[12px] leading-tight text-slate-500">{r.sub}</span>
              </span>
            </span>
            <IoSend size={18} className={`${r.arrow} transition-transform group-hover:translate-x-0.5`} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Livo AI chat window                                              */
/* ------------------------------------------------------------------ */
function ChatWindow({ reduce }: { reduce: boolean }) {
  const [n, setN] = useState(reduce ? 4 : 0);
  useEffect(() => {
    if (reduce) return;
    const ids = [350, 1700, 2600, 4000].map((ms, i) => setTimeout(() => setN(i + 1), ms));
    return () => ids.forEach(clearTimeout);
  }, [reduce]);

  return (
    <div className="flex h-[410px] w-[calc(100vw-4rem)] max-w-[340px] flex-col overflow-hidden rounded-[24px] p-1 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]" style={{ background: BLUE }}>
      <div className="flex items-center gap-3 px-3 py-2.5 text-white">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white">
          <Logo className="h-5 w-6" />
        </span>
        <span className="text-sm font-bold">Livo AI</span>
        <FiMaximize2 className="ml-auto text-sm opacity-90" />
        <FiMoreVertical className="text-base opacity-90" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-[20px] bg-white">
        <div className="flex flex-1 flex-col gap-2.5 overflow-hidden px-3 pt-3 text-[12px] leading-relaxed text-black">
          <AnimatePresence initial={false}>
            {n >= 1 && (
              <motion.div key="b" variants={pop} initial="hidden" animate="show" className="flex items-end gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--bg-light)]">
                  <Logo className="h-3 w-3.5" stroke="#111" eye="#111" />
                </span>
                <span className="rounded-2xl rounded-bl-sm bg-[#f0f0f0] px-3 py-2">
                  👋 Hi! I’m the Chatlivo AI Assistant. Looking for pricing, setup help or a demo? Tell me what you need and I’ll help you get started.
                </span>
              </motion.div>
            )}
            {n >= 2 && (
              <motion.div key="v" variants={pop} initial="hidden" animate="show" className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2 text-white" style={{ background: BLUE }}>
                Is there a free plan?
              </motion.div>
            )}
            {n === 3 && (
              <motion.div key="t" variants={pop} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.15 } }} className="flex items-end gap-2">
                <span className="w-6 shrink-0" />
                <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#f0f0f0] px-3.5 py-3">
                  {[0, 1, 2].map((k) => (
                    <motion.span
                      key={k}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--text-gray)]"
                      animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.15 }}
                    />
                  ))}
                </span>
              </motion.div>
            )}
            {n >= 4 && (
              <motion.div key="r" variants={pop} initial="hidden" animate="show" className="flex items-end gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--bg-light)]">
                  <Logo className="h-3 w-3.5" stroke="#111" eye="#111" />
                </span>
                <span className="rounded-2xl rounded-bl-sm bg-[#f0f0f0] px-3 py-2">
                  Yes, you can start free. No credit card needed. Want me to set it up?
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-3 pb-2 pt-2">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--borders-color)] px-3 py-2.5 text-xs text-[var(--light-text)]">
            Type your message here
            <FiPaperclip className="ml-auto text-base text-[var(--text-gray)]" />
            <FiSmile className="text-base text-[var(--text-gray)]" />
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-gray)]">
            <Logo className="h-3 w-3.5" /> Powered by <b className="text-black">Chatlivo</b>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. WhatsApp popup                                                   */
/* ------------------------------------------------------------------ */
function WhatsAppPopup({ reduce }: { reduce: boolean }) {
  return (
    <div className="w-[calc(100vw-4rem)] max-w-[330px] overflow-hidden rounded-2xl border bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)]" style={{ borderColor: BLUE }}>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900">How can we help?</h3>
        <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-[#25D366]" />
          </span>
          We reply immediately!
        </p>
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1, 0.96, 1] }}
          transition={{ duration: 0.4, delay: 2.2, times: [0, 0.01, 0.5, 1] }}
          className="mt-5 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
          style={{ background: BLUE }}
        >
          <FaWhatsapp className="text-base" /> Start Chat
        </motion.div>
      </div>
      <p className="flex items-center justify-center gap-1.5 border-t border-[var(--borders-color)] py-3 text-xs text-[var(--text-gray)]">
        <Logo className="h-3 w-3.5" /> Powered by <b className="text-black">Chatlivo</b>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Option card: spotlight follows the cursor, highlights when active    */
/* ------------------------------------------------------------------ */
function WayCard({
  way,
  active,
  running,
  ms,
  stepKey,
  onActivate,
  onRelease,
}: {
  way: Way;
  active: boolean;
  running: boolean;
  ms: number;
  stepKey: number;
  onActivate: () => void;
  onRelease: () => void;
}) {
  const Icon = way.icon;
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <div
      onMouseEnter={onActivate}
      onMouseLeave={onRelease}
      onMouseMove={move}
      onFocusCapture={onActivate}
      onBlurCapture={onRelease}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-[var(--color-primary)] p-5 transition-[border-color,box-shadow,transform] duration-500 sm:p-6 ${
        active
          ? "-translate-y-0.5 border-[var(--main-green)] shadow-[0_30px_60px_-30px_rgba(115,195,17,0.55)]"
          : "border-[var(--borders-color)] shadow-sm"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(260px_circle_at_var(--x,50%)_var(--y,50%),var(--light-green),transparent_70%)]"
      />

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <span
            className={`grid h-11 w-11 place-items-center rounded-xl text-xl transition-all duration-500 ${
              active ? "rotate-[-6deg] scale-110 bg-[var(--dark-text)] text-[var(--main-light-green)]" : "bg-[var(--light-green)] text-[var(--dark-text)]"
            }`}
          >
            <Icon />
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full bg-[var(--bg-light)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-gray)] transition-all duration-500 ${
              active ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
            }`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-green)]" /> In the preview
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold tracking-tight text-[var(--dark-text)] sm:text-xl">{way.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-gray)]">{way.body}</p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {way.perks.map((p) => (
            <li
              key={p}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-500 ${
                active
                  ? "border-[var(--main-green)]/60 bg-[var(--light-green)]/50 text-[var(--dark-text)]"
                  : "border-[var(--borders-color)] bg-[var(--color-primary)] text-[var(--text-label)]"
              }`}
            >
              <FiCheck className="text-[var(--main-green)]" /> {p}
            </li>
          ))}
        </ul>

        <Link href={way.href} className="group/link mt-auto inline-flex w-fit items-center gap-2 pt-4 text-sm font-semibold text-[var(--text-label)]">
          <span className="border-b-2 border-[var(--main-green)] pb-0.5">{way.cta}</span>
          <FiArrowRight className="text-[var(--main-green)] transition-transform duration-300 group-hover/link:translate-x-1.5" />
        </Link>
      </div>

      {active && running && (
        <span
          key={`t-${way.id}-${stepKey}`}
          aria-hidden
          className="absolute bottom-0 left-0 h-[3px] bg-[var(--main-green)]"
          style={{ animation: `tw-timer ${ms}ms linear forwards` }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function TwoWays() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  const [pick, setPick] = useState<View | null>(null);
  const inView = useInView(stageRef, { amount: 0.4 });
  const running = inView && !pick && !reduce;

  // Auto demo, steps through SCENES until the visitor takes over
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setS((v) => (v + 1) % SCENES.length), SCENES[s].ms);
    return () => clearTimeout(t);
  }, [s, running]);

  const release = () => {
    if (pick) {
      const i = SCENES.findIndex((x) => x.k === pick);
      if (i >= 0) setS(i);
    }
    setPick(null);
  };

  // A tap or click on the stage hands control back after a few seconds
  useEffect(() => {
    if (!pick) return;
    const t = setTimeout(release, 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick]);

  const view: View = pick ?? (reduce ? "home" : SCENES[s].k);
  const hint = !pick && !reduce && view === "home" ? (SCENES[s].to ?? null) : null;
  const activeIdx = view === "chat" ? 0 : view === "wa" ? 1 : -1;

  // Marquee behind the heading, and the stage opening up as it scrolls in
  const { scrollYProgress: sec } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const marqueeX = useTransform(sec, [0, 1], ["6%", "-22%"]);
  const { scrollYProgress: enter } = useScroll({ target: stageRef, offset: ["start 95%", "start 35%"] });
  const clip = useTransform(enter, [0, 1], ["inset(9% 13% 9% 13% round 48px)", "inset(0% 0% 0% 0% round 28px)"]);
  const scale = useTransform(enter, [0, 1], [0.94, 1]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--color-primary)] py-4 text-[var(--dark-text)] sm:py-6">
      <style>{`
        @keyframes tw-timer { from { width: 0 } to { width: 100% } }
        @keyframes tw-hint { to { border-color: var(--main-green); box-shadow: 0 12px 26px -12px rgba(115,195,17,.7); transform: translateY(-2px) } }
        .tw-hint { animation: tw-hint .5s ease 1.3s forwards }
        @keyframes tw-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @media (prefers-reduced-motion: reduce) { .tw-hint { animation: none !important } .tw-float { animation: none !important } }
      `}</style>

      {/* Ghost marquee zone: height = font size, badge sits dead-centre on the text */}
      <div className="relative flex h-[clamp(7rem,10vw,13rem)] w-full items-center justify-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center">
          <motion.div
            style={{ x: marqueeX }}
            className="select-none whitespace-nowrap text-[clamp(7rem,10vw,13rem)] font-black leading-none tracking-tight text-[var(--bg-light)]"
          >
            Live chat · WhatsApp · Live chat · WhatsApp · Live chat · WhatsApp
          </motion.div>
        </div>

        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 inline-flex items-center gap-2 rounded-full border border-[var(--borders-color)] bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-[var(--text-label)]"
        >
          <FiMessageSquare className="text-[var(--main-green)]" /> Live chat + WhatsApp widgets
        </motion.span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-6 text-base leading-relaxed text-[var(--text-gray)] sm:mt-8"
          >
            Not every visitor likes to contact a business in the same way. Some want to chat right on your site. Others
            prefer WhatsApp. Why make them choose only one?
          </motion.p>
        </div>

        {/* Cards on the left (stacked), live widget preview on the right */}
        <div className="mt-8 grid gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-6">
          <div className="order-2 grid gap-4 lg:order-1 lg:col-span-4 lg:grid-rows-2">
            {WAYS.map((w, i) => (
              <motion.div
                key={w.id}
                className="h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
              >
                <WayCard
                  way={w}
                  active={activeIdx === i}
                  running={running}
                  ms={SCENES[s].ms}
                  stepKey={s}
                  onActivate={() => setPick(w.view)}
                  onRelease={release}
                />
              </motion.div>
            ))}
          </div>

          {/* Stage: the widget page, exactly as a visitor sees it */}
          <div ref={stageRef} className="order-1 rounded-[28px] shadow-[0_50px_100px_-50px_rgba(0,0,0,0.3)] lg:order-2 lg:col-span-8 lg:h-full">
            <motion.div
              style={{ clipPath: clip, scale }}
              className="relative h-[540px] w-full overflow-hidden bg-[#f7f7f7] sm:h-[560px] lg:h-full lg:min-h-[560px]"
            >
              {/* widget page background */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 bottom-0 top-[22%] rounded-tl-[72px] bg-[#eef6e2]" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_34%,rgba(255,255,255,0.7)_34.2%,rgba(255,255,255,0.7)_42%,transparent_42.2%)]" />
                <div className="absolute -bottom-40 -right-24 h-[420px] w-[420px] rounded-full bg-[var(--light-green)]/45 blur-[110px]" />
                <div className="absolute -left-24 top-1/3 h-[320px] w-[320px] rounded-full bg-[var(--main-light-green)]/20 blur-[110px]" />
              </div>

              {/* "Your Link" card, shown on the widget page in preview mode */}
              <div className="pointer-events-none absolute left-[7%] top-1/2 hidden w-[240px] -translate-y-1/2 select-none lg:block">
                <div className="relative rounded-3xl border-2 border-dashed border-[var(--main-green)]/55 px-8 pb-8 pt-14 text-center">
                  <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--main-green)]/55 bg-white" />
                  <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-[var(--main-green)]/55 bg-white" />
                  <span className="absolute -top-[46px] left-1/2 -translate-x-1/2 rounded-full bg-[#f7f7f7] p-2">
                    <span className="tw-float grid h-[76px] w-[76px] place-items-center rounded-full bg-[var(--main-green)]/10 text-3xl text-[var(--main-green)]" style={{ animation: "tw-float 4s ease-in-out infinite" }}>
                      <FiLink />
                    </span>
                  </span>
                  <h4 className="text-xl font-semibold tracking-wide">Your Link</h4>
                  <p className="mt-1.5 break-all text-sm opacity-90">
                    ex: <span className="font-medium">https://yourwebsite.com</span>
                  </p>
                </div>
              </div>

              {/* the widget, switching between home box, live chat and WhatsApp */}
              <div className="absolute bottom-[76px] right-4 z-20 sm:bottom-[84px] sm:right-6" style={{ transformOrigin: "100% 100%" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, scale: 0.85, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.92, y: 16, filter: "blur(5px)" }}
                    transition={{ duration: 0.45, ease: EASE }}
                    style={{ transformOrigin: "100% 100%" }}
                  >
                    {view === "home" && <HomeBox hint={hint} onPick={(i) => setPick(i === 0 ? "chat" : "wa")} />}
                    {view === "chat" && <ChatWindow reduce={reduce} />}
                    {view === "wa" && <WhatsAppPopup reduce={reduce} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* launcher: "Connect with us" pill when closed, round X when a widget is open */}
              <div className="absolute bottom-4 right-4 z-20 h-12 sm:bottom-6 sm:right-6">
                <AnimatePresence mode="popLayout" initial={false}>
                  {view === "home" ? (
                    <motion.button
                      key="pill"
                      type="button"
                      onClick={() => setPick("chat")}
                      aria-label="Open chat"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      style={{ transformOrigin: "100% 50%", background: `linear-gradient(90deg, ${BLUE}, #6a82dd)` }}
                      className="absolute bottom-0 right-0 flex h-12 items-center gap-3 whitespace-nowrap rounded-full pl-5 pr-1 text-sm font-medium text-white shadow-[0_14px_30px_-12px_rgba(52,83,196,0.7)] hover:scale-[1.03] active:scale-95"
                    >
                      Connect with us
                      <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: BLUE }}>
                        <Logo className="h-4 w-5" stroke="#fff" eye="#fff" />
                      </span>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="x"
                      type="button"
                      onClick={() => setPick("home")}
                      aria-label="Close chat"
                      initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      style={{ background: BLUE }}
                      className="absolute bottom-0 right-0 grid h-12 w-12 place-items-center rounded-full text-xl text-white shadow-[0_14px_30px_-12px_rgba(52,83,196,0.7)] hover:scale-105 active:scale-95"
                    >
                      <FiX />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--text-gray)]">
          Offer both options so customers can reach you in the way that feels easiest to them.
        </p>
      </div>
    </section>
  );
}