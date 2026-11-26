"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FiArrowRight, FiCheck, FiLock, FiMessageSquare, FiSend } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

/** Put Image1.webp in /public/images (or change this path). */
const IMG = "/images/Image1.webp";
const EASE = [0.22, 1, 0.36, 1] as const;
const CYCLE_MS = 5500;

type Way = { id: string; title: string; body: string; cta: string; href: string; icon: IconType; perks: string[] };

const WAYS: Way[] = [
  {
    id: "chat",
    title: "Live Chat Widget",
    body: "Let visitors ask questions without leaving your website. Your team can reply, collect contact details and continue the conversation in Chatlivo.",
    cta: "Explore Live Chat",
    href: "/products/live-chat",
    icon: FiMessageSquare,
    perks: ["Pre-chat form", "Visitor details", "Canned replies"],
  },
  {
    id: "whatsapp",
    title: "WhatsApp Chat Widget",
    body: "Give visitors a familiar way to reach your business through WhatsApp. A simple option for people who would rather message you from their phone.",
    cta: "Explore WhatsApp Widget",
    href: "/products/whatsapp",
    icon: FaWhatsapp,
    perks: ["Click to chat", "Prefilled message", "Opens in the app"],
  },
];

/* ------------------------------------------------------------------ */
/* The two widgets that "open" on the mock website                     */
/* ------------------------------------------------------------------ */
const pop = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: 0.3 + i * 0.5, duration: 0.45, ease: EASE } }),
};

function LiveChatWidget() {
  return (
    <div className="w-[260px] overflow-hidden rounded-2xl bg-[var(--color-primary)] text-[var(--dark-text)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:w-[300px]">
      <div className="flex items-center gap-3 bg-[var(--dark-text)] px-4 py-3 text-[var(--color-primary)]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--main-light-green)] text-sm font-bold text-[var(--dark-text)]">C</span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">Chatlivo support</span>
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--light-gray)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--main-light-green)]" /> Online now
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-2 bg-[var(--bg-color)] p-3 text-xs">
        <motion.div custom={0} variants={pop} initial="hidden" animate="show" className="ml-auto rounded-2xl rounded-br-sm bg-[var(--main-light-green)] px-3 py-2">
          Hi! Is there a free plan?
        </motion.div>
        <motion.div custom={1} variants={pop} initial="hidden" animate="show" className="w-fit rounded-2xl rounded-bl-sm border border-[var(--borders-color)] bg-[var(--color-primary)] px-3 py-2">
          Yes, start free. No credit card needed.
        </motion.div>
        <motion.div custom={2} variants={pop} initial="hidden" animate="show" className="rounded-xl border border-[var(--borders-color)] bg-[var(--color-primary)] p-2.5">
          <p className="mb-1.5 text-[11px] text-[var(--text-gray)]">Leave your email and we’ll follow up</p>
          <span className="flex items-center gap-2 rounded-lg bg-[var(--bg-light)] px-2.5 py-1.5 text-[var(--light-text)]">
            you@company.com
            <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-[var(--main-green)] text-[var(--dark-text)]"><FiCheck /></span>
          </span>
        </motion.div>
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--borders-color)] px-3 py-2.5 text-xs text-[var(--light-text)]">
        Type your message… <FiSend className="ml-auto text-[var(--main-green)]" />
      </div>
    </div>
  );
}

function WhatsAppWidget() {
  return (
    <div className="w-[260px] overflow-hidden rounded-2xl bg-[var(--color-primary)] text-[var(--dark-text)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:w-[300px]">
      <div className="flex items-center gap-3 bg-[var(--main-green)] px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--dark-text)] text-lg text-[var(--main-light-green)]"><FaWhatsapp /></span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">Chat on WhatsApp</span>
          <span className="text-[11px]">Typically replies in minutes</span>
        </span>
      </div>
      <div className="flex flex-col gap-2.5 bg-[var(--bg-light)] p-3 text-xs">
        <motion.div custom={0} variants={pop} initial="hidden" animate="show" className="w-fit max-w-[85%] rounded-2xl rounded-tl-sm bg-[var(--color-primary)] px-3 py-2 shadow-sm">
          Hi there! How can we help you today?
        </motion.div>
        <motion.div custom={1} variants={pop} initial="hidden" animate="show" className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--main-light-green)] px-3 py-2">
          I’d like to book a demo
        </motion.div>
      </div>
      <motion.div custom={2} variants={pop} initial="hidden" animate="show" className="p-3">
        <span className="flex items-center justify-center gap-2 rounded-xl bg-[var(--main-green)] py-2.5 text-sm font-semibold">
          Start chat <FiArrowRight />
        </span>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Option card: spotlight follows the cursor, details unfold on hover   */
/* ------------------------------------------------------------------ */
function WayCard({
  way, active, running, onActivate, onRelease,
}: { way: Way; active: boolean; running: boolean; onActivate: () => void; onRelease: () => void }) {
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
      className={`group relative overflow-hidden rounded-3xl border bg-[var(--color-primary)] p-6 transition-[border-color,box-shadow,transform] duration-500 ${
        active
          ? "-translate-y-1 border-[var(--main-green)] shadow-[0_30px_60px_-30px_rgba(115,195,17,0.55)]"
          : "border-[var(--borders-color)] shadow-sm"
      }`}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(260px_circle_at_var(--x,50%)_var(--y,50%),var(--light-green),transparent_70%)]" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={`grid h-11 w-11 place-items-center rounded-xl text-xl transition-all duration-500 ${active ? "scale-110 rotate-[-6deg] bg-[var(--dark-text)] text-[var(--main-light-green)]" : "bg-[var(--light-green)] text-[var(--dark-text)]"}`}>
            <Icon />
          </span>
          <span className={`flex items-center gap-1.5 rounded-full bg-[var(--bg-light)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-gray)] transition-all duration-500 ${active ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"}`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-green)]" /> In the preview
          </span>
        </div>

        <h3 className="mt-5 text-xl font-bold tracking-tight text-[var(--dark-text)]">{way.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-gray)]">{way.body}</p>

        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <ul className="flex flex-wrap gap-2 pt-4">
              {way.perks.map((p, k) => (
                <li
                  key={p}
                  style={{ transitionDelay: active ? `${150 + k * 90}ms` : "0ms" }}
                  className={`flex items-center gap-1.5 rounded-full border border-[var(--borders-color)] bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-[var(--text-label)] transition-all duration-500 ${active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                >
                  <FiCheck className="text-[var(--main-green)]" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link href={way.href} className="group/link mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-label)]">
          <span className="border-b-2 border-[var(--main-green)] pb-0.5">{way.cta}</span>
          <FiArrowRight className="text-[var(--main-green)] transition-transform duration-300 group-hover/link:translate-x-1.5" />
        </Link>
      </div>

      {active && running && (
        <span key={`t-${way.id}`} aria-hidden className="absolute bottom-0 left-0 h-[3px] bg-[var(--main-green)]" style={{ animation: `tw-timer ${CYCLE_MS}ms linear forwards` }} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
const Words = ({ text, delay = 0 }: { text: string; delay?: number }) => (
  <span className="block">
    {text.split(" ").map((w, i) => (
      <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
        <motion.span
          className="inline-block"
          initial={{ y: "110%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + i * 0.07, ease: EASE }}
        >
          {w}&nbsp;
        </motion.span>
      </span>
    ))}
  </span>
);

export default function TwoWays() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const inView = useInView(stageRef, { amount: 0.4 });
  const running = inView && !paused && !reduce;

  // Gentle auto-demo until the visitor takes over with hover, focus or click
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => 1 - a), CYCLE_MS);
    return () => clearTimeout(t);
  }, [active, running]);

  const take = (i: number) => {
    setActive(i);
    setPaused(true);
  };

  // Marquee behind the heading, and the stage opening up as it scrolls in
  const { scrollYProgress: sec } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const marqueeX = useTransform(sec, [0, 1], ["6%", "-22%"]);
  const { scrollYProgress: enter } = useScroll({ target: stageRef, offset: ["start 95%", "start 35%"] });
  const clip = useTransform(enter, [0, 1], ["inset(9% 13% 9% 13% round 48px)", "inset(0% 0% 0% 0% round 28px)"]);
  const scale = useTransform(enter, [0, 1], [0.94, 1]);
  const { scrollYProgress: par } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const imgY = useTransform(par, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--color-primary)] py-4 sm:py-6 text-[var(--dark-text)] ">
      <style>{`@keyframes tw-timer { from { width: 0 } to { width: 100% } }`}</style>

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
        {/* Header */}
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
        {/* Stage: a mock website that opens each widget */}
        <div ref={stageRef} className="mt-6 rounded-[28px] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.35)]">
          <motion.div
            style={{ clipPath: clip, scale }}
            className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-light)] sm:aspect-[16/10] lg:aspect-[16/8.2]"
          >
            <motion.div style={{ y: imgY }} className="absolute inset-x-0 -top-[8%] h-[116%]">
              <Image src={IMG} alt="Website with the Live Chat and WhatsApp widgets" fill sizes="(min-width: 1152px) 1100px, 100vw" className="object-cover" priority={false} />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 border-b border-[var(--borders-color)] bg-[var(--color-primary)]/85 px-4 py-2.5 backdrop-blur">
              <span className="flex gap-1.5">
                {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--borders-color)]" />)}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--bg-light)] px-3 py-1 text-[11px] text-[var(--text-gray)]">
                <FiLock className="text-[var(--main-green)]" /> yourwebsite.com
              </span>
            </div>

            {/* colour wash that sweeps out from the launcher whenever the widget changes */}
            <motion.div
              key={`wash-${active}`}
              initial={{ clipPath: "circle(0% at 90% 88%)", opacity: 0.5 }}
              animate={{ clipPath: "circle(140% at 90% 88%)", opacity: 0 }}
              transition={{ duration: 1, ease: EASE }}
              className="pointer-events-none absolute inset-0 z-[5] bg-[var(--main-light-green)]"
            />

            <div className="absolute bottom-[88px] right-4 z-20 sm:bottom-[104px] sm:right-6" style={{ transformOrigin: "100% 100%" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.8, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  style={{ transformOrigin: "100% 100%" }}
                >
                  {active === 0 ? <LiveChatWidget /> : <WhatsAppWidget />}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-4 right-4 z-20 flex gap-3 sm:bottom-6 sm:right-6">
              {WAYS.map((w, i) => (
                <button
                  key={w.id}
                  type="button"
                  aria-label={`Preview ${w.title}`}
                  aria-pressed={active === i}
                  onClick={() => take(i)}
                  className={`relative grid h-12 w-12 place-items-center rounded-full text-xl shadow-lg transition-[transform,background-color,color] duration-300 hover:scale-110 sm:h-14 sm:w-14 sm:text-2xl ${
                    active === i ? "bg-[var(--dark-text)] text-[var(--main-light-green)]" : "bg-[var(--color-primary)] text-[var(--dark-text)]"
                  }`}
                >
                  {active === i && (
                    <motion.span layoutId="tw-ring" transition={{ type: "spring", stiffness: 380, damping: 30 }} className="absolute -inset-1.5 rounded-full border-2 border-[var(--main-green)]" />
                  )}
                  <w.icon />
                </button>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 z-20 hidden items-center gap-2 rounded-full bg-[var(--color-primary)]/90 px-3 py-1.5 text-xs font-medium text-[var(--text-label)] backdrop-blur sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--main-green)]" />
              <AnimatePresence mode="wait">
                <motion.span key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                  Preview · {WAYS[active].title}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Option cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {WAYS.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
            >
              <WayCard way={w} active={active === i} running={running} onActivate={() => take(i)} onRelease={() => setPaused(false)} />
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--text-gray)]">
          Offer both options so customers can reach you in the way that feels easiest to them.
        </p>
      </div>
    </section>
  );
}