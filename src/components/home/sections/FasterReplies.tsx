"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import {
  type MotionValue,
  cubicBezier,
  motion,
  transform,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiArrowRight, FiCheck, FiGlobe, FiInbox, FiMessageSquare, FiSend, FiZap } from "react-icons/fi";
import { FaFacebookMessenger, FaInstagram, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

type MV = MotionValue<number>;

const SOFT = cubicBezier(0.22, 1, 0.36, 1);

/* Dark surfaces used inside the dark cards */
const CARD = "rounded-xl border border-white/10 bg-white/[0.05]";
const CARD_SOFT = "rounded-xl border border-white/10 bg-white/[0.03]";
const BUB_IN = "w-fit max-w-[92%] rounded-2xl rounded-bl-sm bg-white/10 px-3 py-2 text-xs text-white";
const BUB_OUT = "ml-auto w-fit max-w-[92%] rounded-2xl rounded-br-sm bg-[var(--main-light-green)] px-3 py-2 text-xs text-black";
const CHIP = "rounded-full bg-[var(--main-green)]/20 px-2 py-0.5 text-[10px] font-semibold text-[var(--main-light-green)]";
const CHIP_SOLID = "rounded-full bg-[var(--main-light-green)] px-2 py-0.5 text-[10px] font-semibold text-black";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function Reveal({
  m, a, b, x = 0, y = 12, s = 1, className, children,
}: { m: MV; a: number; b: number; x?: number; y?: number; s?: number; className?: string; children?: ReactNode; }) {
  const t = useTransform(m, [a, b], [0, 1], { ease: SOFT });
  const tf = useTransform(t, (v) => `translate3d(${x * (1 - v)}px,${y * (1 - v)}px,0) scale(${s + (1 - s) * v})`);
  return <motion.div style={{ opacity: t, transform: tf }} className={className}>{children}</motion.div>;
}

function Typed({ m, a, b, text }: { m: MV; a: number; b: number; text: string }) {
  const s = useTransform(m, (v) => text.slice(0, Math.round(transform(v, [a, b], [0, text.length]))));
  return <motion.span>{s}</motion.span>;
}

function Count({ m, a, b, to }: { m: MV; a: number; b: number; to: number }) {
  const s = useTransform(m, (v) => String(Math.round(transform(v, [a, b], [0, to]))));
  return <motion.span>{s}</motion.span>;
}

/* ------------------------------------------------------------------ */
/* Scene 1: one inbox                                                  */
/* ------------------------------------------------------------------ */
const ROWS = [
  { icon: FiMessageSquare, name: "Sean Barber", text: "Is Pro enough for 8 agents?", time: "now" },
  { icon: FaWhatsapp, name: "Priya Shah", text: "Is my order shipped?", time: "2m" },
  { icon: FaInstagram, name: "Lena Fischer", text: "Can I get a refund?", time: "4m" },
  { icon: FaFacebookMessenger, name: "Omar Haddad", text: "Do you have a showroom?", time: "9m" },
];

function InboxScene({ m }: { m: MV }) {
  const hl = useTransform(m, [0.5, 0.6], [0, 1]);
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">Inbox</span>
        <span className={CHIP}><Count m={m} a={0} b={0.3} to={128} /> open</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
        {ROWS.map((r, i) => (
          <Reveal key={r.name} m={m} a={i * 0.06} b={0.14 + i * 0.06} x={i % 2 ? 60 : -60} y={0} className={`${CARD} relative flex items-center gap-2.5 px-3 py-2`}>
            {i === 0 && <motion.span style={{ opacity: hl }} className="pointer-events-none absolute inset-0 rounded-xl border border-[var(--main-green)] bg-[var(--main-green)]/10" />}
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
              {r.name[0]}
              <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-white/10 bg-[#0c0f0b] text-[8px] text-[var(--main-light-green)]"><r.icon /></span>
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-white">{r.name}</span>
              <span className="block truncate text-[11px] text-white/50">{r.text}</span>
            </span>
            <span className="relative flex items-center gap-1.5">
              {i === 0 && (
                <>
                  <Reveal m={m} a={0.55} b={0.66} y={0} s={0.7} className={`${CHIP_SOLID} hidden whitespace-nowrap sm:block`}>Assigned to Alex</Reveal>
                  <Reveal m={m} a={0.68} b={0.78} y={0} s={0.5} className="grid h-4 w-4 place-items-center rounded-full bg-[var(--main-green)] text-[10px] text-black"><FiCheck /></Reveal>
                </>
              )}
              <span className="text-[10px] text-white/35">{r.time}</span>
            </span>
          </Reveal>
        ))}
      </div>
      <Reveal m={m} a={0.3} b={0.45} className={`${CARD_SOFT} flex items-center gap-2 px-3 py-2 text-xs text-white/50`}>
        <FiMessageSquare className="text-[var(--main-light-green)]" />
        <span className="truncate">Replying to Sean on Website chat</span>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">Enter</span>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 2: live chat translation                                      */
/* ------------------------------------------------------------------ */
function Pane({ icon: Icon, title, sub, children }: { icon: IconType; title: string; sub: string; children: ReactNode }) {
  return (
    <div className={`${CARD} flex min-w-0 flex-1 flex-col overflow-hidden`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--main-green)]/20 text-xs text-[var(--main-light-green)]"><Icon /></span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-xs font-semibold text-white">{title}</span>
          <span className="block truncate text-[10px] text-white/45">{sub}</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2 p-2.5">{children}</div>
    </div>
  );
}

function Travel({ m, a, b, from, to, top, label }: { m: MV; a: number; b: number; from: string; to: string; top: string; label: string }) {
  const left = useTransform(m, [a, b], [from, to]);
  const opacity = useTransform(m, [a, a + (b - a) * 0.2, b - (b - a) * 0.2, b], [0, 1, 1, 0]);
  return (
    <motion.div style={{ left, opacity, top }} className="pointer-events-none absolute z-10 flex -translate-x-1/2 items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-[var(--main-light-green)] ring-4 ring-[var(--main-green)]/30" />
      <span className="whitespace-nowrap rounded-full border border-[var(--main-green)] bg-black px-2 py-0.5 text-[10px] font-semibold text-[var(--main-light-green)] shadow-sm">{label}</span>
    </motion.div>
  );
}

function TranslateScene({ m }: { m: MV }) {
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-white"><FiGlobe className="text-[var(--main-light-green)]" /> Live chat translation</span>
        <Reveal m={m} a={0.08} b={0.16} y={0} s={0.7} className={`${CHIP} flex items-center gap-1`}>ES <FiArrowRight /> EN</Reveal>
      </div>
      <div className="relative flex min-h-0 flex-1 gap-2.5">
        <Reveal m={m} a={0} b={0.1} y={16} className="flex min-w-0 flex-1">
          <Pane icon={FiInbox} title="Your inbox" sub="English">
            <Reveal m={m} a={0.32} b={0.4} y={10} className={BUB_IN}>Hi, do you ship to Dubai?</Reveal>
            <Reveal m={m} a={0.46} b={0.54} y={10} className={BUB_OUT}>Yes, in 3–5 days!</Reveal>
          </Pane>
        </Reveal>
        <Reveal m={m} a={0.04} b={0.14} y={16} className="flex min-w-0 flex-1">
          <Pane icon={FaWhatsapp} title="Lucía" sub="Español · WhatsApp">
            <Reveal m={m} a={0.14} b={0.22} y={10} className={BUB_OUT}>Hola, ¿envían a Dubái?</Reveal>
            <Reveal m={m} a={0.64} b={0.72} y={10} className={BUB_IN}>¡Sí, en 3–5 días!</Reveal>
          </Pane>
        </Reveal>
        <Travel m={m} a={0.22} b={0.34} from="75%" to="25%" top="34%" label="ES → EN" />
        <Travel m={m} a={0.54} b={0.66} from="25%" to="75%" top="56%" label="EN → ES" />
      </div>
      <Reveal m={m} a={0.8} b={0.9} s={0.92} className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--main-green)]/40 bg-[var(--main-green)]/10 py-1.5 text-xs font-medium text-[var(--main-light-green)]">
        <FiCheck /> Translated both ways, no copy and paste
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 3: Primo AI shortcut                                          */
/* ------------------------------------------------------------------ */
const ROUGH = "pls wait. will check ur order n tell u asap";
const POLISHED = "Thanks for your patience, Sean. I'm checking your order now and will update you within a few minutes.";

function AiScene({ m }: { m: MV }) {
  const roughO = useTransform(m, [0.34, 0.44], [1, 0]);
  const keyO = useTransform(m, [0.28, 0.33, 0.44], [0, 1, 0]);
  const keyY = useTransform(m, [0.28, 0.33, 0.44], [0, 2, 0]);
  const shimX = useTransform(m, [0.32, 0.5], ["-110%", "110%"]);
  const shimO = useTransform(m, [0.32, 0.36, 0.46, 0.5], [0, 1, 1, 0]);
  const caretO = useTransform(m, [0.44, 0.46, 0.74, 0.76], [0, 1, 1, 0]);
  const typedO = useTransform(m, [0.84, 0.9], [1, 0]);
  const sendS = useTransform(m, [0.76, 0.8, 0.84], [1, 1.14, 1]);

  return (
    <div className="flex h-full flex-col justify-between gap-2.5">
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2">
        <Reveal m={m} a={0} b={0.1} y={10} className={BUB_IN}>Where is my order? I&apos;ve been waiting 3 days.</Reveal>
        <div className="min-h-[62px]">
          <Reveal m={m} a={0.84} b={0.92} y={30} className={`${BUB_OUT} !max-w-[95%]`}>
            {POLISHED}
            <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-black/60"><FiCheck /> Sent just now</span>
          </Reveal>
        </div>
      </div>
      <Reveal m={m} a={0.05} b={0.16} y={16} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-[11px] text-white/50">
          <span>Reply to Sean</span>
          <Reveal m={m} a={0.9} b={0.97} y={0} s={0.7} className={`${CHIP_SOLID} flex items-center gap-1`}><FiZap /> Replied in 8 seconds</Reveal>
        </div>
        <div className="relative grid min-h-[68px] px-3 py-2 text-xs leading-relaxed">
          <motion.span style={{ opacity: roughO }} className="col-start-1 row-start-1 text-white/35 line-through">{ROUGH}</motion.span>
          <motion.span style={{ opacity: typedO }} className="col-start-1 row-start-1 text-white">
            <Typed m={m} a={0.44} b={0.74} text={POLISHED} />
            <motion.i style={{ opacity: caretO }} className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-[var(--main-light-green)]" />
          </motion.span>
          <motion.span aria-hidden style={{ x: shimX, opacity: shimO }} className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--main-green)]/25 to-transparent" />
        </div>
        <div className="flex items-center gap-1.5 border-t border-white/10 px-3 py-1.5">
          <motion.span style={{ y: keyY }} className="relative flex items-center gap-1 overflow-hidden rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">
            <motion.span style={{ opacity: keyO }} className="absolute inset-0 bg-[var(--main-light-green)]" />
            <FiZap className="relative" /> <span className="relative">⌘ J</span>
          </motion.span>
          <Reveal m={m} a={0.36} b={0.44} y={0} s={0.7} className={CHIP}>Friendly tone</Reveal>
          <Reveal m={m} a={0.42} b={0.5} y={0} s={0.7} className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/55 sm:block">Wording tidied</Reveal>
          <motion.span style={{ scale: sendS }} className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-[var(--main-light-green)] text-black"><FiSend /></motion.span>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
type Leaf = { id: string; tab: string; icon: IconType; title: string; body: string; cta: string; href: string; scene: (m: MV) => ReactNode; };

const LEAVES: Leaf[] = [
  { id: "inbox", tab: "One inbox", icon: FiInbox, title: "One omnichannel inbox, a reply for every channel", body: "Website chat, WhatsApp, Instagram, Messenger and email all arrive in one shared inbox. Reply from a single screen, see the whole conversation history and always know who is handling what.", cta: "Explore the omnichannel inbox", href: "/products/omnichannel-inbox", scene: (m) => <InboxScene m={m} /> },
  { id: "translate", tab: "Any language", icon: FiGlobe, title: "They write in their language. You reply in yours.", body: "Chatlivo translates conversations in both directions. A customer can write in Spanish while you read and answer in English, with no copying and pasting into a translator.", cta: "See live chat translation", href: "/products/translation", scene: (m) => <TranslateScene m={m} /> },
  { id: "ai", tab: "Instant replies", icon: FiZap, title: "Reply in seconds, not minutes", body: "Type a quick draft, then use the Primo AI shortcut to rewrite and improve it. Fix the tone, tidy the wording and send a clear reply without starting from a blank box.", cta: "Meet Primo AI", href: "/products/ai-agent", scene: (m) => <AiScene m={m} /> },
];

/* ------------------------------------------------------------------ */
/* Stacking card: sticks near the top, next card slides over it        */
/* ------------------------------------------------------------------ */
function StackCard({ leaf, i, last, cardRef, nextRef }: { leaf: Leaf; i: number; last: boolean; cardRef: RefObject<HTMLDivElement | null>; nextRef: RefObject<HTMLDivElement | null>; }) {
  const Icon = leaf.icon;
  const rise = useScroll({ target: cardRef, offset: ["start 95%", "start 15%"] }).scrollYProgress;
  const p = useSpring(rise, { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.0005 });
  const cover = useScroll({ target: nextRef, offset: ["start end", "start 30%"] }).scrollYProgress;
  const scale = useTransform(cover, [0, 1], [1, last ? 1 : 0.95]);
  const dim = useTransform(cover, [0, 1], [0, last ? 0 : 0.5]);

  return (
    <motion.div ref={cardRef} style={{ scale, top: `calc(6rem + ${i * 14}px)`, transformOrigin: "50% 0%" }} className={`sticky ${last ? "" : "mb-6 sm:mb-8"}`}>
      <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0f0a] shadow-[0_30px_70px_-30px_rgba(15,40,5,0.65)] transition-shadow duration-500 hover:shadow-[0_40px_90px_-30px_rgba(63,125,10,0.7)] lg:h-[min(520px,calc(100svh-11rem))] lg:rounded-[2rem]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--main-light-green)] to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--main-green)]/20 blur-[90px]" />

        <div className="relative grid h-full gap-4 p-4 sm:p-6 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-10">
          <div className="flex flex-col justify-center lg:col-span-5">
            <span className="mb-3 flex items-center gap-2.5 text-xs font-semibold text-white/60">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--main-green)]/20 text-base text-[var(--main-light-green)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"><Icon /></span>
              {leaf.tab}
              <span className="ml-auto font-mono text-white/30 lg:hidden">0{i + 1}</span>
            </span>
            <h3 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-[2rem] lg:leading-[1.15]">{leaf.title}</h3>
            <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/65 sm:line-clamp-none sm:text-sm lg:mt-3 lg:text-[15px]">{leaf.body}</p>
            <Link href={leaf.href} className="group/link mt-3 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white lg:mt-5">
              <span className="border-b-2 border-[var(--main-light-green)] pb-0.5">{leaf.cta}</span>
              <FiArrowRight className="text-[var(--main-light-green)] transition-transform duration-300 group-hover/link:translate-x-1" />
            </Link>
          </div>

          <div className="relative lg:col-span-7 lg:h-full lg:max-h-[420px]">
            <span className="pointer-events-none absolute -top-6 right-2 hidden select-none font-mono text-6xl font-bold text-white/[0.05] lg:block">0{i + 1}</span>
            <div className="h-[250px] rounded-2xl border border-white/10 bg-black/40 p-3.5 text-white transition-transform duration-500 sm:h-[290px] lg:h-full lg:p-4 lg:group-hover:-translate-y-1">
              {leaf.scene(p)}
            </div>
          </div>
        </div>

        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Background: Minimal static grid + soft depth                        */
/* ------------------------------------------------------------------ */
function StaticBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[var(--bg-color)]">
      {/* Subtle architectural grid */}
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_20%,transparent_80%)]" />
      
      {/* Very soft, static glows to give depth to the light background */}
      <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[var(--main-light-green)]/10 blur-[120px]" />
      <div className="absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full bg-[var(--main-green)]/5 blur-[120px]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export default function FasterReplies() {
  const sectionRef = useRef<HTMLElement>(null);
  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const refs = [r0, r1, r2];

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={sectionRef} className="relative bg-[var(--bg-color)] text-[var(--dark-text)]">
      {/* Background sits fixed behind the cards */}
      <div className="sticky top-0 -mb-[100svh] h-[100svh] overflow-hidden">
        <StaticBackdrop />
        <motion.div aria-hidden style={{ scaleX: bar }} className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left bg-[var(--main-green)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-10">
        <div className="mb-8 max-w-3xl sm:mb-12">
            <span className="mb-2.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--main-green)]">
            <span className="h-px w-6 bg-[var(--main-green)]" /> Faster replies
          </span>
          <h2 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-[var(--dark-text)] sm:text-4xl lg:text-[2.75rem]">
            Reply Faster, in Any Language,{" "}
            <span className="relative isolate inline-block">
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0.5 -z-10 h-[0.45em] "
              />
              From One Inbox
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[var(--text-gray)] sm:text-base">
            Customers write wherever it is easiest for them. Your team should not have to hunt for messages in five
            different places.
          </p>
        </div>

        <div>
          {LEAVES.map((l, i) => (
            <StackCard key={l.id} leaf={l} i={i} last={i === LEAVES.length - 1} cardRef={refs[i]} nextRef={refs[Math.min(i + 1, LEAVES.length - 1)]} />
          ))}
        </div>
      </div>
    </section>
  );
}