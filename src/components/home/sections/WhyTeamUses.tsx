"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  type MotionValue,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiArrowUpRight, FiClock, FiEye, FiInbox, FiSmartphone, FiTarget, FiZap } from "react-icons/fi";
import type { IconType } from "react-icons";

/** Put Image1.webp in /public/images (or change this path). */
const IMG = "/images/Image1.webp";
const EASE = [0.22, 1, 0.36, 1] as const;

const TOOLS: { id: string; icon: IconType; title: string; body: string }[] = [
  { id: "tracking", icon: FiEye, title: "Live visitor tracking", body: "See active visitors and available browsing context to understand what they may need." },
  { id: "inbox", icon: FiInbox, title: "Shared team inbox", body: "Assign conversations and keep the next reply clear, even as your team grows." },
  { id: "lead", icon: FiTarget, title: "Lead capture", body: "Use pre-chat forms and offline messages to collect enquiries worth following up." },
  { id: "saved", icon: FiZap, title: "Saved replies", body: "Make common answers quicker without sounding like a copy-and-paste robot." },
  { id: "history", icon: FiClock, title: "Conversation history", body: "Give agents useful context when a customer returns or asks for a person." },
  { id: "mobile", icon: FiSmartphone, title: "Mobile access", body: "Stay connected to customer conversations when you are away from your desk." },
];

/* ------------------------------------------------------------------ */
/* Background: the "book shelf" — one book per tool, open book follows */
/* ------------------------------------------------------------------ */
const PAGE = [
  { out: false, w: "60%" },
  { out: true, w: "68%" },
  { out: false, w: "46%" },
  { out: true, w: "56%" },
  { out: false, w: "64%" },
];

function Backdrop({ idx }: { idx: number }) {
  const cols = TOOLS.map((_, i) => (i === idx ? "5fr" : "1fr")).join(" ");
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0a0f0a]">
      <div className="absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-[var(--main-green)]/15 blur-[160px]" />
      <div className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-[var(--main-light-green)]/10 blur-[170px]" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--main-green)]/10 blur-[180px]" />

      <div className="relative h-full w-full blur-[2px] saturate-[0.5] opacity-40">
        <div
          className="grid h-full transition-[grid-template-columns] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [container-type:inline-size]"
          style={{ gridTemplateColumns: cols }}
        >
          {TOOLS.map((b, i) => {
            const open = i === idx;
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`relative min-w-0 overflow-hidden border-r border-white/[0.04] transition-[background-color,box-shadow] duration-1000 ${
                  open
                    ? "bg-[var(--main-green)]/[0.08] shadow-[inset_16px_0_24px_-20px_rgba(185,250,106,0.2),inset_-16px_0_24px_-20px_rgba(185,250,106,0.2)]"
                    : "bg-transparent"
                }`}
              >
                <div className={`absolute inset-0 transition-opacity duration-500 ${open ? "opacity-0" : "opacity-100 delay-500"}`}>
                  <span className="absolute inset-x-3 top-16 h-px bg-white/10" />
                  <span className="absolute inset-x-3 top-[4.4rem] h-px bg-white/10" />
                  <span className="absolute inset-x-3 bottom-16 h-px bg-white/10" />
                  <span className="absolute inset-x-3 bottom-[4.4rem] h-px bg-white/10" />
                  <span className="absolute left-1/2 top-28 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-[var(--main-green)]/20 text-sm text-[var(--main-light-green)]">
                    <Icon />
                  </span>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180 whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/20 [writing-mode:vertical-rl]">
                    {b.title}
                  </span>
                </div>

                <span
                  className={`absolute left-6 top-0 h-14 w-4 bg-[var(--main-green)]/50 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "translate-y-0 delay-500" : "-translate-y-full"
                  }`}
                  style={{ clipPath: "polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)" }}
                />

                <div
                  style={{ width: "calc(100cqw * 5 / 10)" }}
                  className={`absolute left-0 top-0 h-full px-10 pt-28 transition-opacity ${open ? "opacity-100 delay-500 duration-700" : "opacity-0 duration-200"}`}
                >
                  <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-[var(--main-light-green)]">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--main-green)]/20 text-sm">
                      <Icon />
                    </span>
                    {b.title}
                  </div>
                  <div className="flex flex-col gap-3">
                    {PAGE.map((m, k) => (
                      <div
                        key={k}
                        style={{ width: m.w, transitionDelay: open ? `${700 + k * 110}ms` : "0ms" }}
                        className={`space-y-1.5 rounded-2xl px-4 py-3 transition-all duration-700 ${
                          m.out ? "ml-auto bg-[var(--main-light-green)]/10" : "bg-white/[0.05]"
                        } ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
                      >
                        <span className="block h-1.5 w-full rounded-full bg-white/10" />
                        <span className="block h-1.5 w-2/3 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keep just the top/bottom fade, remove the heavy dark overlay */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0f0a] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0f0a] to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small animated visual, unique per card                              */
/* ------------------------------------------------------------------ */
function Visual({ id }: { id: string }) {
  switch (id) {
    case "tracking":
      return (
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--main-green)]"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
          <span className="ml-1 text-[10px] font-semibold tracking-wide text-[var(--main-green)]">LIVE</span>
        </span>
      );
    case "inbox":
      return (
        <span className="flex -space-x-2">
          {["A", "M", "S"].map((c) => (
            <span key={c} className="grid h-6 w-6 place-items-center rounded-full border-2 border-[var(--dark-text)] bg-white/10 text-[10px] font-semibold text-white">
              {c}
            </span>
          ))}
        </span>
      );
    case "lead":
      return (
        <span className="flex w-14 flex-col gap-1">
          {[100, 70].map((w, i) => (
            <motion.span
              key={i}
              className="block h-1.5 rounded-full bg-white/20"
              initial={{ width: 0 }}
              whileInView={{ width: `${w}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: EASE }}
            />
          ))}
          <span className="block h-1.5 w-1/3 rounded-full bg-[var(--main-green)]" />
        </span>
      );
    case "saved":
      return (
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[var(--main-green)]">/thanks</span>
      );
    case "history":
      return (
        <span className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${i === 3 ? "bg-[var(--main-green)]" : "bg-white/20"}`} />
              {i < 3 && <span className="h-px w-3 bg-white/10" />}
            </span>
          ))}
        </span>
      );
    default:
      return (
        <span className="relative grid h-7 w-4 place-items-center rounded-[5px] border border-white/30">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[var(--main-green)]"
            animate={{ scale: [1, 1.7, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </span>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Card: mouse spotlight + 3D tilt + hover lift                        */
/* ------------------------------------------------------------------ */
function ToolCard({
  t, i, on, onEnter, onLeave,
}: { t: (typeof TOOLS)[number]; i: number; on: boolean; onEnter: () => void; onLeave: () => void }) {
  const Icon = t.icon;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 22 });
  const spot = useMotionTemplate`radial-gradient(260px circle at ${px}px ${py}px, rgba(185,250,106,0.1), transparent 70%)`;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (i % 3) * 0.1 + Math.floor(i / 3) * 0.1, ease: EASE }}
      className="[perspective:900px] h-full"
    >
      <motion.div
        onPointerMove={move}
        onPointerEnter={onEnter}
        onPointerLeave={leave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border p-6 transition-[border-color,background-color,box-shadow] duration-300 ${
          on ? "border-[var(--main-green)]/50 bg-[var(--dark-text)] shadow-[0_20px_40px_-20px_rgba(115,195,17,0.3)]" : "border-white/10 bg-[var(--dark-text)]"
        }`}
      >
        <motion.div
          aria-hidden
          style={{ background: spot }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative flex items-start justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg text-[var(--main-green)] transition-all duration-300 group-hover:bg-[var(--main-green)] group-hover:text-black">
            <Icon />
          </span>
          <Visual id={t.id} />
        </div>

        <h3 className="relative mt-5 text-lg font-bold tracking-tight text-white">{t.title}</h3>
        <p className="relative mt-2 flex-1 text-sm leading-relaxed text-white/60">{t.body}</p>

        <div className="relative mt-6 flex items-center justify-between">
          <span className="font-mono text-xs text-white/30">0{i + 1}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-sm text-white/50 transition-all duration-300 group-hover:border-[var(--main-green)] group-hover:bg-[var(--main-green)] group-hover:text-black">
            <FiArrowUpRight />
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Image1.webp showcase                                                */
/* ------------------------------------------------------------------ */
function Showcase({ y }: { y: MotionValue<number> }) {
  return (
    <motion.div style={{ y }} className="relative mx-auto w-full max-w-[460px] [perspective:1400px] lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, rotateY: -10, y: 30 }}
        whileInView={{ opacity: 1, rotateY: -5, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
        className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-[var(--dark-text)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <Image src={IMG} alt="Chatlivo dashboard preview" fill sizes="(min-width:1024px) 460px, 90vw" className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-text)] via-transparent to-transparent" />
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--main-green)]/50 to-transparent" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-4 top-8 flex items-center gap-2 rounded-full border border-white/10 bg-[var(--dark-text)] px-3 py-1.5 text-xs font-medium text-white shadow-lg"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--main-green)] opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--main-green)]" />
        </span>
        24 visitors online
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-full border border-[var(--main-green)]/30 bg-[var(--main-green)] px-3 py-1.5 text-xs font-bold text-black shadow-[0_0_20px_-5px_rgba(115,195,17,0.8)]"
      >
        <FiTarget /> New lead captured
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function WhyTeamUses() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "-20% 0px" });
  const [auto, setAuto] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (reduce || !inView || hover !== null) return;
    const id = setInterval(() => setAuto((a) => (a + 1) % TOOLS.length), 3200);
    return () => clearInterval(id);
  }, [reduce, inView, hover]);

  const idx = hover ?? auto;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[var(--dark-text)] py-20 text-white sm:py-28">
      <Backdrop idx={idx} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--main-green)]"
            >
              <span className="h-px w-8 bg-[var(--main-green)]" />
              Why teams use Chatlivo
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
            >
              The Everyday Tools Behind Better{" "}
              <span className="relative inline-block isolate">
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
                  className="absolute inset-x-0 bottom-1 -z-10 h-[0.4em] origin-left "
                />
                Customer Conversations
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
            >
              Support is rarely one big problem. It is dozens of small moments: a missed message, a repeated question, a
              visitor who leaves before asking. These tools help your team stay on top of them.
            </motion.p>
          </div>

          <div className="lg:col-span-5">
            <Showcase y={imgY} />
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {TOOLS.map((t, i) => (
            <ToolCard key={t.id} t={t} i={i} on={idx === i} onEnter={() => setHover(i)} onLeave={() => setHover(null)} />
          ))}
        </div>
      </div>
    </section>
  );
}