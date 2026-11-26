"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { FiArrowUp } from "react-icons/fi";

export default function BottomToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 120);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <motion.button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12, scale: visible ? 1 : 0.9 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="group cursor-pointer fixed bottom-5 right-5 z-50 grid h-11 w-11 place-items-center rounded-full bg-black/80 text-white/80 shadow-lg backdrop-blur transition-colors hover:text-[var(--main-light-green)] sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <motion.circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="var(--main-light-green)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength: ring }}
        />
      </svg>
      <FiArrowUp className="relative transition-transform duration-300 group-hover:-translate-y-0.5" />
    </motion.button>
  );
}
