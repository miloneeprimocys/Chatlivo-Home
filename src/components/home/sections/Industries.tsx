"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiBookOpen,
  FiHeart,
  FiHome,
  FiMonitor,
  FiShoppingCart,
  FiTool,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const EASE = [0.22, 1, 0.36, 1] as const;
const CYCLE = 6000;

/* Temporary: using the same image for all */
const IMG = "/images/Image1.webp";

type Industry = {
  id: string;
  label: string;
  desc: string;
  href: string;
  icon: IconType;
};

const INDUSTRIES: Industry[] = [
  {
    id: "stores",
    label: "Online stores",
    desc: "Answer questions about delivery, returns and store policies, so shoppers do not leave with a question unanswered.",
    href: "/solutions/ecommerce",
    icon: FiShoppingCart,
  },
  {
    id: "saas",
    label: "SaaS and apps",
    desc: "Help visitors compare plans, answer setup questions and pass trial users to your team.",
    href: "/solutions/saas",
    icon: FiMonitor,
  },
  {
    id: "service",
    label: "Service businesses",
    desc: "Reply to enquiries about prices, availability and booking, even outside office hours.",
    href: "/solutions/service-businesses",
    icon: FiTool,
  },
  {
    id: "health",
    label: "Healthcare",
    desc: "Handle non-clinical questions about hours, locations and appointments. Not for medical advice.",
    href: "/solutions/healthcare",
    icon: FiHeart,
  },
  {
    id: "edu",
    label: "Education",
    desc: "Help students and parents with courses, admissions and fees.",
    href: "/solutions/education",
    icon: FiBookOpen,
  },
  {
    id: "realestate",
    label: "Real estate",
    desc: "Reply to property enquiries quickly and pass serious leads to an agent.",
    href: "/solutions/real-estate",
    icon: FiHome,
  },
];

const MARQUEE_ITEMS = [...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES];

export default function Industries() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.2 });

  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  

  const running = inView && !manual && !reduce;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % INDUSTRIES.length), CYCLE);
    return () => clearTimeout(t);
  }, [active, running]);

  const pick = (i: number) => {
    setActive(i);
    setManual(true);
    // Resume auto-play shortly after the user clicks
    setTimeout(() => setManual(false), CYCLE + 1000);
  };

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const waveX = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  const rawTiltX = useSpring(0, { stiffness: 220, damping: 24 });
  const rawTiltY = useSpring(0, { stiffness: 220, damping: 24 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rawTiltY.set(x * 9);
    rawTiltX.set(y * -9);
  };

  const handleMouseLeave = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  const ind = INDUSTRIES[active];
  const ActiveIcon = ind.icon;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[var(--bg-color)] pt-14 text-[var(--dark-text)] sm:pt-20"
    >
      {/* Subtle Light Backdrop with Scroll-Driven Signal Wave */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          style={reduce ? undefined : { y: bgY }}
          className="absolute -inset-x-40 -top-28 h-[560px] bg-[radial-gradient(ellipse_at_center,rgba(115,195,17,0.14),transparent_62%)]"
        />
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, #000 15%, transparent 75%)",
          }}
        />
        <motion.svg
          style={reduce ? undefined : { x: waveX }}
          className="absolute inset-x-0 top-1/2 h-44 w-[110%] -translate-x-[5%] -translate-y-1/2 opacity-40"
          viewBox="0 0 1200 160"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80 Q 200 25, 400 80 T 800 80 T 1200 80"
            stroke="var(--main-green)"
            strokeOpacity="0.22"
            strokeWidth="1.5"
          />
          <path
            d="M0 105 Q 240 145, 480 105 T 960 105 T 1200 105"
            stroke="var(--gray-border)"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        </motion.svg>
      </div>

      <div className="relative flex w-full flex-col">
        {/* Compact Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mb-8 max-w-3xl px-4 text-center sm:mb-10 sm:px-6"
        >
          <span className="mb-2.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--main-green)]">
            <span className="h-px w-6 bg-[var(--main-green)]" /> Who it is for
          </span>
          <h2 className="text-2xl font-bold leading-[1.12] tracking-tight text-[var(--dark-text)] sm:text-4xl lg:text-[2.6rem]">
            Live Chat and AI Support for Every{" "}
            <span className="inline-block rounded-md  px-2 text-[var(--dark-text)]">
              Kind of Business
            </span>
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--text-gray)] sm:text-base">
            Different businesses get different questions. See how Chatlivo fits yours.
          </p>
        </motion.div>

        {/* Full-Width Open Layout (No Restrictive Inner Box) */}
        <div className="mx-auto mb-10 grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-4 sm:mb-12 sm:gap-8 sm:px-6 md:grid-cols-12 lg:gap-12 lg:px-10">
             {/* Left: Active Industry Card */}
          <div className="relative z-10 order-2 md:order-1 md:col-span-5 [perspective:1000px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={ind.id}
                initial={reduce ? false : { opacity: 0, x: -24, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, x: 24, filter: "blur(6px)" }}
                transition={{ duration: 0.42, ease: EASE }}
                onMouseMove={(e) => {
                  if (reduce) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - r.left) / r.width - 0.5;
                  const y = (e.clientY - r.top) / r.height - 0.5;
                  e.currentTarget.style.setProperty("--rx", `${y * -8}deg`);
                  e.currentTarget.style.setProperty("--ry", `${x * 8}deg`);
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty("--rx", "0deg");
                  e.currentTarget.style.setProperty("--ry", "0deg");
                }}
                style={{ transform: "rotateX(var(--rx, 0)) rotateY(var(--ry, 0))", transformStyle: "preserve-3d", transition: "transform 0.25s ease-out" }}
                className="group relative overflow-hidden rounded-3xl border border-[var(--borders-color)] bg-[var(--color-primary)] p-6 shadow-[0_20px_45px_-24px_rgba(0,0,0,0.08)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_rgba(115,195,17,0.35)] sm:p-8"
              >
                {/* Spotlight glow that follows the cursor */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(185,250,106,0.18), transparent 60%)",
                  }}
                />

                {/* Animated gradient border on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, var(--main-light-green), transparent 40%, transparent 60%, var(--main-green))",
                    padding: "1px",
                    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />

                <div className="relative mb-5 flex items-center justify-between">
                  {/* Magnetic Floating Icon with Pulse Ring */}
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {/* Pulsing ring behind icon */}
                    <motion.span 
                      className="absolute inset-0 rounded-2xl border-2 border-[var(--main-green)]"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--light-green)] text-xl text-[var(--dark-text)] overflow-hidden sm:h-14 sm:w-14 sm:text-2xl">
                      {/* Shimmer sweep across the icon block */}
                      <span
                        aria-hidden
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                      />
                      <ActiveIcon className="relative" />
                    </span>
                  </motion.div>

                  {/* Animated Dotted Accent */}
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--main-green)]"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Staggered Word-by-Word Title Reveal */}
                <h3 className="relative text-2xl font-bold leading-tight tracking-tight text-[var(--dark-text)] sm:text-3xl">
                  {ind.label.split(" ").map((word, i) => (
                    <motion.span
                      key={`${ind.id}-${word}`}
                      initial={reduce ? false : { opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
                      className="inline-block mr-2"
                    >
                      {word}
                    </motion.span>
                  ))}
                </h3>

                <p className="relative mt-3 text-sm leading-relaxed text-[var(--text-gray)] sm:text-base">
                  {ind.desc}
                </p>

                <Link
                  href={ind.href}
                  className="group/link relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--main-green)]"
                >
                  <span className="border-b border-[var(--main-green)]/40 pb-0.5 transition-colors group-hover/link:border-[var(--main-green)]">
                    See how it works
                  </span>
                  <FiArrowRight className="transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: 3D Tilt + Hover Zoom Image Showcase */}
          <div className="relative order-1 h-[260px] [perspective:1200px] sm:h-[330px] md:order-2 md:col-span-7 lg:h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={ind.id}
                initial={reduce ? false : { opacity: 0, scale: 1.04, rotateY: -8 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: EASE }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={
                  reduce
                    ? undefined
                    : {
                        rotateX: rawTiltX,
                        rotateY: rawTiltY,
                        transformStyle: "preserve-3d",
                      }
                }
                className="group relative h-full w-full overflow-hidden rounded-3xl border border-[var(--borders-color)] bg-[var(--color-primary)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.16)]"
              >
                <Image
                  src={IMG}
                  alt={ind.label}
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-color)]/75 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-65" />

                {/* Floating live label */}
                <div className="pointer-events-none absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 rounded-2xl border border-black/10 bg-[var(--color-primary)]/95 px-4 py-2.5 text-[var(--dark-text)] shadow-sm backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-0.5">
                  <span className="inline-flex items-center gap-2 text-xs font-bold sm:text-sm">
                    <span className="h-2 w-2 rounded-full bg-[var(--main-green)]" />
                    {ind.label}
                  </span>
                  <span className="rounded-full bg-[var(--light-green)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--dark-text)]">
                    Chatlivo Support
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

            {/* Full-Width Edge-to-Edge Interactive Timeline Strip */}
        <div className="relative w-full overflow-hidden border-y border-[var(--borders-color)] bg-[var(--color-primary)]">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--color-primary)] to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--color-primary)] to-transparent sm:w-32" />

          <motion.div
            className="flex w-max min-w-full"
            animate={reduce ? undefined : { x: ["0%", "-33.33%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity, repeatType: "loop" }}
          >
            {MARQUEE_ITEMS.map((x, i) => {
              const logicalIndex = i % INDUSTRIES.length;
              const isActive = active === logicalIndex;

              return (
                <button
                  key={`${x.id}-${i}`}
                  type="button"
                  onClick={() => pick(logicalIndex)}
                  aria-pressed={isActive}
                  className={`group relative flex min-w-[150px] flex-col items-start justify-center border-r border-[var(--borders-color)] px-5 py-3 text-left transition-colors duration-300 last:border-none sm:min-w-[180px] sm:px-7 ${
                    isActive ? "bg-[var(--bg-light)]" : "hover:bg-[var(--bg-color)]"
                  }`}
                >
                  <span
                    className={`mb-1 font-mono text-[10px] font-semibold transition-colors ${
                      isActive ? "text-[var(--main-green)]" : "text-[var(--light-text)]"
                    }`}
                  >
                    0{logicalIndex + 1}
                  </span>

                  <span
                    className={`text-xs font-bold transition-colors whitespace-nowrap sm:text-sm ${
                      isActive
                        ? "text-[var(--dark-text)]"
                        : "text-[var(--text-gray)] group-hover:text-[var(--dark-text)]"
                    }`}
                  >
                    {x.label}
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-[var(--borders-color)]">
                    {isActive && (
                      <motion.div
                        key={`prog-${x.id}-${running ? "run" : "static"}`}
                        className="h-full origin-left bg-[var(--main-green)]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={running ? { duration: CYCLE / 1000, ease: "linear" } : { duration: 0.25 }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}