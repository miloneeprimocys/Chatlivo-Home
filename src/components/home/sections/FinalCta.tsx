"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { FiArrowRight, FiCheck, FiMail, FiMessageSquare } from "react-icons/fi";
import { FaFacebookMessenger, FaInstagram, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Button that leans toward the cursor */
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
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={leave} style={{ x: sx, y: sy }} className="inline-block">
      {children}
    </motion.div>
  );
}

type Chip = { icon: IconType; pos: string; color: string; fg: string; dur: number; delay: number; depth: number };

const CHIPS: Chip[] = [
  { icon: FaWhatsapp, pos: "left-[6%] top-[22%]", color: "#25D366", fg: "#fff", dur: 5.5, delay: 0, depth: -40 },
  { icon: FaInstagram, pos: "left-[14%] bottom-[18%]", color: "#E1306C", fg: "#fff", dur: 6.5, delay: 0.6, depth: -90 },
  { icon: FiMessageSquare, pos: "right-[7%] top-[18%]", color: "#B9FA6A", fg: "#000", dur: 6, delay: 0.3, depth: -70 },
  { icon: FaFacebookMessenger, pos: "right-[15%] bottom-[20%]", color: "#0A7CFF", fg: "#fff", dur: 5.8, delay: 0.9, depth: -30 },
  { icon: FiMail, pos: "right-[30%] top-[8%]", color: "#fff", fg: "#000", dur: 7, delay: 1.2, depth: -55 },
];

function FloatChip({ c, p }: { c: Chip; p: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const y = useTransform(p, [0, 1], [-c.depth, c.depth]);
  return (
    <motion.div style={{ y }} className={`pointer-events-none absolute hidden md:block ${c.pos}`}>
      <motion.span
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.4 + c.delay * 0.3 }}
        className="block"
      >
        <motion.span
          animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
          className="grid h-12 w-12 place-items-center rounded-2xl text-2xl shadow-[0_18px_40px_-14px_rgba(0,0,0,0.5)] lg:h-14 lg:w-14"
          style={{ background: c.color, color: c.fg }}
        >
          <c.icon />
        </motion.span>
      </motion.span>
    </motion.div>
  );
}

export default function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const lines = [
    { text: "Ready to Make Replying", grad: false },
    { text: "a Little Easier?", grad: true },
  ];

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-gradient-to-br from-[#143d04] via-[#2f6a05] to-[var(--main-green)] py-20 text-white sm:py-28"
    >
      <style>{`
        @keyframes cta-shine { 0%,60% { transform: translateX(-120%) } 100% { transform: translateX(120%) } }
        @keyframes cta-ring { 0% { transform: translate(-50%,-50%) scale(.3); opacity: .45 } 100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .cta-anim { animation: none !important; } }
      `}</style>

      {/* Background layers */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_70%_80%_at_50%_50%,#000,transparent)]"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(185,250,106,0.55),transparent)] blur-2xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -70, 0], y: [0, -30, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 -right-24 -z-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.28),transparent)] blur-2xl"
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[620px] w-[620px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="cta-anim absolute left-1/2 top-1/2 h-full w-full rounded-full border border-white/40"
            style={{ animation: `cta-ring 6s ease-out ${i * 2}s infinite` }}
          />
        ))}
      </div>

      {CHIPS.map((c, i) => (
        <FloatChip key={i} c={c} p={scrollYProgress} />
      ))}

      {/* Content */}
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          {lines.map((l, li) => (
            <span key={li} className="block">
              {l.text.split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <motion.span
                    className={`inline-block ${l.grad ? "bg-gradient-to-r from-[var(--main-light-green)] to-white bg-clip-text text-transparent" : ""}`}
                    initial={{ y: "115%", rotate: 4 }}
                    whileInView={{ y: 0, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: li * 0.3 + i * 0.08, ease: EASE }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg"
        >
          Start free, add Chatlivo to your website and see how it feels to answer customers from one inbox.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.75, duration: 0.7, ease: EASE }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <Link
              href="https://app.chatlivo.com/signup"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#143d04] shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)] transition-transform active:scale-95"
            >
              <span
                aria-hidden
                className="cta-anim absolute inset-0 bg-gradient-to-r from-transparent via-[var(--main-light-green)]/70 to-transparent"
                style={{ animation: "cta-shine 3.4s ease-in-out infinite" }}
              />
              <span className="relative">Start Free</span>
              <FiArrowRight className="relative transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/50 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white hover:bg-white/10 active:scale-95"
            >
              Talk to Our Team
            </Link>
          </Magnetic>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.7 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/80"
        >
          {["Free plan available", "No credit card required", "Set up in minutes"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--main-light-green)] text-[9px] text-black">
                <FiCheck />
              </span>
              {t}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}