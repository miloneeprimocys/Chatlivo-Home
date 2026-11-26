"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
const CYCLE = 5500;

type Industry = {
  id: string;
  label: string;
  desc: string;
  href: string;
  image: string;
  icon: IconType;
  accent: string;
};

const INDUSTRIES: Industry[] = [
  {
    id: "stores",
    label: "Online stores",
    desc: "Answer questions about delivery, returns and store policies, so shoppers do not leave with a question unanswered.",
    href: "/solutions/ecommerce",
    image: "/images/LiveChatEcommerce.webp",
    icon: FiShoppingCart,
    accent: "#73C311",
  },
  {
    id: "saas",
    label: "SaaS and apps",
    desc: "Help visitors compare plans, answer setup questions and pass trial users to your team.",
    href: "/solutions/saas",
    image: "/images/SaasHero.webp",
    icon: FiMonitor,
    accent: "#58a600",
  },
  {
    id: "service",
    label: "Service businesses",
    desc: "Reply to enquiries about prices, availability and booking, even outside office hours.",
    href: "/solutions/service-businesses",
    image: "/images/ProfessionalServicesHero.webp",
    icon: FiTool,
    accent: "#73C311",
  },
  {
    id: "health",
    label: "Healthcare",
    desc: "Handle non-clinical questions about hours, locations and appointments. Not for medical advice.",
    href: "/solutions/healthcare",
    image: "/images/LiveChatHealtcareHero.webp",
    icon: FiHeart,
    accent: "#4d9400",
  },
  {
    id: "edu",
    label: "Education",
    desc: "Help students and parents with courses, admissions and fees.",
    href: "/solutions/education",
    image: "/images/EducationHero.webp",
    icon: FiBookOpen,
    accent: "#73C311",
  },
  {
    id: "realestate",
    label: "Real estate",
    desc: "Reply to property enquiries quickly and pass serious leads to an agent.",
    href: "/solutions/real-estate",
    image: "/images/EstateHero.webp",
    icon: FiHome,
    accent: "#58a600",
  },
];

const N = INDUSTRIES.length;
const GAP = 40;
const SIDE = 0.88;
const TILT = 5;
const ROLL = 2;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const wrap = (i: number) => ((i % N) + N) % N;
const circDist = (a: number, b: number) => {
  let d = (((a - b) % N) + N) % N;
  if (d >= N / 2) d -= N;
  return d;
};
const damp = (c: number, t: number, l: number, dt: number) => c + (t - c) * (1 - Math.exp(-l * dt));

export default function Industries() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillTextRef = useRef<HTMLSpanElement>(null);

  const activeRef = useRef(0);
  const targetRef = useRef(0);
  const visibleRef = useRef(false);
  const lockRef = useRef(false);
  const swipeRef = useRef<number | null>(null);

  const inView = useInView(sectionRef, { amount: 0.2 });
  const [active, setActive] = useState(0);

  const lock = () => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, 6000);
  };

  const step = (dir: 1 | -1, user = true) => {
    if (user) lock();
    targetRef.current = Math.round(targetRef.current) + dir;
  };

  const goTo = (i: number) => {
    lock();
    targetRef.current = Math.round(targetRef.current) + circDist(i, Math.round(targetRef.current));
  };

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const waveX = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let last = performance.now();
    let v = 0;
    let cw = 760;
    let ch = 410;
    let px = -200;
    let py = -200;
    let mx = -200;
    let my = -200;

    const layout = () => {
      const vw = window.innerWidth;
      const mobile = vw < 768;
      cw = mobile ? Math.max(280, Math.min(vw * 0.88, 420)) : Math.max(540, Math.min(vw * 0.62, 920));
      ch = mobile ? 420 : 410;

      if (stageRef.current) {
        stageRef.current.style.height = `${ch + 28}px`;
      }

      cardRefs.current.forEach((el) => {
        if (!el) return;
        el.style.width = `${cw}px`;
        el.style.height = `${ch}px`;
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      v = damp(v, targetRef.current, reduce ? 100 : 5.5, dt);

      const inner = (cw * (1 + SIDE)) / 2 + GAP;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = circDist(i, v);
        const ad = Math.abs(d);
        const k = Math.min(1, ad);
        const x = Math.sign(d) * (ad <= 1 ? ad * inner : inner + (ad - 1) * (cw * SIDE + GAP));
        const sc = 1 - (1 - SIDE) * k;
        const ry = clamp(d, -1, 1) * TILT;
        const rz = clamp(d, -1, 1) * ROLL;

        el.style.transform = `translate3d(calc(-50% + ${x}px),0,0) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`;
        el.style.filter = `brightness(${(1 - 0.16 * k).toFixed(3)})`;
        el.style.opacity = String(clamp(1 - 0.35 * k, 0.45, 1));
        el.style.visibility = ad > 1.7 ? "hidden" : "visible";
        el.style.zIndex = String(10 - Math.round(ad * 3));
        el.dataset.side = ad > 0.5 ? "true" : "false";
      });

      const idx = wrap(Math.round(v));
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }

      if (fine && pillRef.current) {
        px += (mx - px) * 0.25;
        py += (my - py) * 0.25;
        pillRef.current.style.transform = `translate3d(${px}px,${py}px,0) translate(-50%,-50%)`;
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (!fine) return;
      mx = e.clientX;
      my = e.clientY;
      const t = e.target as Element | null;
      const card = t?.closest?.("[data-ind-card]") as HTMLElement | null;
      const text = pillTextRef.current;
      if (!text) return;

      if (card) {
        const d = circDist(Number(card.dataset.indCard), v);
        if (Math.abs(d) > 0.5) {
          text.textContent = d < 0 ? "Previous" : "Next";
          text.dataset.on = "true";
          return;
        }
      }
      text.dataset.on = "false";
    };

    const hidePill = () => {
      if (pillTextRef.current) pillTextRef.current.dataset.on = "false";
    };

    const auto = window.setInterval(() => {
      if (!visibleRef.current || lockRef.current || reduce || !inView) return;
      step(1, false);
    }, CYCLE);

    const io = new IntersectionObserver(
      ([en]) => {
        visibleRef.current = en.isIntersecting;
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    layout();
    window.addEventListener("resize", layout);
    window.addEventListener("pointermove", onMove, { passive: true });
    sectionRef.current?.addEventListener("pointerleave", hidePill);
    raf = requestAnimationFrame(tick);

    const sec = sectionRef.current;
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(auto);
      io.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", onMove);
      sec?.removeEventListener("pointerleave", hidePill);
    };
  }, [inView, reduce]);

  const onCardClick = (i: number) => {
    if (i !== activeRef.current) goTo(i);
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[var(--bg-color)] pt-14 pb-8 text-[var(--dark-text)] sm:pt-20 sm:pb-10"
    >
      <style>{`
        .ind-pill { transform: scale(0); opacity: 0; transition: transform .25s cubic-bezier(.2,.8,.2,1), opacity .2s; }
        .ind-pill[data-on="true"] { transform: scale(1); opacity: 1; }
        .ind-card[data-side="true"] { cursor: none; }
        @media (pointer: coarse) {
          .ind-pill-wrap { display: none !important; }
          .ind-card[data-side="true"] { cursor: pointer; }
        }
      `}</style>

      {/* Keep original light background & subtle signal wave */}
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
          <h2 className="text-2xl cursor-scan-effect font-bold leading-[1.12] tracking-tight text-[var(--dark-text)] sm:text-4xl lg:text-[2.6rem]">
            Live Chat and AI Support for Every{" "}
            <span className="inline-block rounded-md px-2 text-[var(--dark-text)]">
              Kind of Business
            </span>
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-[var(--text-gray)] sm:text-base">
            Different businesses get different questions. See how Chatlivo fits yours.
          </p>
        </motion.div>

        {/* 3D Perspective Carousel Stage */}
        <div
          ref={stageRef}
          className="relative mx-auto mb-10 w-full max-w-7xl [perspective:1800px] [touch-action:pan-y] sm:mb-12"
          onPointerDown={(e) => {
            swipeRef.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (swipeRef.current === null) return;
            const dx = e.clientX - swipeRef.current;
            swipeRef.current = null;
            if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
          }}
        >
          {INDUSTRIES.map((ind, i) => {
            const on = active === i;
            const Icon = ind.icon;

            return (
              <article
                key={ind.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                data-ind-card={i}
                data-side="false"
                onClick={() => onCardClick(i)}
                className="ind-card absolute bottom-3 left-1/2 flex select-none flex-col overflow-hidden rounded-3xl border bg-[var(--color-primary)] will-change-transform [transform-origin:50%_100%] transition-[border-color,box-shadow] duration-300 md:bottom-6 md:flex-row"
                style={{
                  borderColor: on ? ind.accent : "var(--borders-color)",
                  boxShadow: on
                    ? "0 24px 60px -24px rgba(115, 195, 17, 0.28)"
                    : "0 14px 35px -24px rgba(0, 0, 0, 0.12)",
                }}
              >
                {/* Left Image */}
                <div className="relative h-[42%] w-full shrink-0 overflow-hidden bg-[var(--bg-light)] md:h-full md:w-[46%]">
                  <Image
                    src={ind.image}
                    alt={ind.label}
                    fill
                    sizes="(min-width: 768px) 420px, 90vw"
                    className="object-cover"
                    draggable={false}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                  />
                </div>

                {/* Right Content */}
                <div className="flex min-h-0 flex-1 flex-col justify-between p-5 sm:p-6 md:p-8">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--light-green)] text-xl text-[var(--dark-text)]">
                        <Icon />
                      </span>
                      <span className="font-mono text-xs font-semibold text-[var(--light-text)]">
                        0{i + 1} / 0{N}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold leading-tight tracking-tight text-[var(--dark-text)] sm:text-2xl lg:text-[1.75rem]">
                      {ind.label}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-gray)] sm:text-base">
                      {ind.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--borders-color)] pt-4">
                    <Link
                      href={ind.href}
                      onClick={(e) => e.stopPropagation()}
                      className="group/link inline-flex items-center gap-2 text-sm font-semibold text-[var(--main-green)]"
                    >
                      <span className="border-b border-[var(--main-green)]/40 pb-0.5 transition-colors group-hover/link:border-[var(--main-green)]">
                        See how it works
                      </span>
                      <FiArrowRight className="transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Previous / Next hover pill */}
      <div ref={pillRef} aria-hidden className="ind-pill-wrap pointer-events-none fixed left-0 top-0 z-[9999]">
        <span
          ref={pillTextRef}
          data-on="false"
          className="ind-pill block rounded-full bg-[var(--dark-text)] px-4 py-2 text-[11px] font-medium text-[var(--color-primary)] shadow-lg"
        >
          Next
        </span>
      </div>
    </section>
  );
}