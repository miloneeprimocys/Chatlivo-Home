"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Animation Helpers                                                   */
/* ------------------------------------------------------------------ */
function TopAnimatedBorder({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const waveShift = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["-25%", "115%"]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden">
      <style>{`
        @keyframes fr-border-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fr-border-pulse { animation: none !important; }
        }
      `}</style>

      {/* Traveling highlight beam along the wave edge */}
      <motion.div
        style={{ left: glowX }}
        className="fr-border-pulse absolute top-[38px] z-20 h-[3px] w-56 rounded-full bg-gradient-to-r from-transparent via-[#B9FA6A] to-transparent shadow-[0_0_18px_#73C311] sm:top-[76px] md:top-[96px]"
      />

      {/* Bigger, continuous wave with zero white seam */}
      <motion.div style={{ x: waveShift }} className="-ml-20 w-[calc(100%+240px)]">
        <svg
          viewBox="0 0 1800 180"
          fill="none"
          preserveAspectRatio="none"
          className="h-24 w-full sm:h-28 md:h-36"
        >
          <defs>
            <linearGradient id="frTopDarkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="55%" stopColor="#0b1704" />
              <stop offset="100%" stopColor="#1b3609" />
            </linearGradient>
            <linearGradient id="frLimeWaveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#73C311" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#B9FA6A" stopOpacity="1" />
              <stop offset="100%" stopColor="#73C311" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Solid dark fill from top edge down into a deep wave */}
          <path
            d="M0 0 H1800 V72 C1480 158 1180 22 860 112 C540 198 260 44 0 128 Z"
            fill="url(#frTopDarkGrad)"
          />

          {/* Bold glowing lime wave crest */}
          <path
            d="M0 128 C260 44 540 198 860 112 C1180 22 1480 158 1800 72"
            stroke="url(#frLimeWaveStroke)"
            strokeWidth="4"
          />

          {/* Secondary dashed wave line beneath for depth */}
          <path
            d="M0 144 C280 64 560 212 880 128 C1200 44 1500 172 1800 90"
            stroke="#73C311"
            strokeOpacity="0.45"
            strokeWidth="1.75"
            strokeDasharray="8 7"
          />
        </svg>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */
interface StackCard {
  id: string;
  number: string;
  title: string;
  description: string;
  linkText: string;
  image: string;
  imageOnLeft?: boolean;
}

const cards: StackCard[] = [
  {
    id: "omnichannel",
    number: "01",
    title: "One omnichannel inbox, a reply for every channel",
    description:
      "Website chat, WhatsApp, Instagram, Messenger and email all arrive in one shared inbox. Reply from a single screen, see the whole conversation history and always know who is handling what.",
    linkText: "Explore the multichannel inbox",
    image: "/fasterreplies/Omni1.png",
    imageOnLeft: false,
  },
  {
    id: "translation",
    number: "02",
    title: "They write in their language. You reply in yours.",
    description:
      "Chatlivo translates conversations in both directions. A customer can write in Spanish while you read and answer in English, with no copying and pasting into a translator.",
    linkText: "See live chat translation",
    image: "/fasterreplies/Omni2.png",
    imageOnLeft: true,
  },
  {
    id: "ai-shortcut",
    number: "03",
    title: "Reply in seconds, not minutes",
    description:
      "Type a quick draft, then use the Livo AI shortcut to rewrite and improve it. Fix the tone, tidy the wording and send a clear reply without starting from a blank box.",
    linkText: "Explore the reply assistant",
    image: "/fasterreplies/Omni3.png",
    imageOnLeft: false,
  },
  {
    id: "multilingual",
    number: "04",
    title: "Support global customers in 50+ languages",
    description:
      "Automatically detect each visitor's language and deliver instant, natural replies across every channel. Your team stays productive in one language while customers feel at home in theirs.",
    linkText: "Explore multilingual support",
    image: "/fasterreplies/Omni4.png",
    imageOnLeft: true,
  },
];

interface CardViewProps {
  card: StackCard;
  y?: MotionValue<any> | number;
  scale?: MotionValue<number> | number;
  dim?: MotionValue<number> | number;
  zIndex: number;
  isAbsolute?: boolean;
}

function CardView({ card, y = 0, scale = 1, dim = 0, zIndex, isAbsolute = false }: CardViewProps) {
  const isLeft = card.imageOnLeft;

  return (
    <motion.div
      style={{ y, scale, transformOrigin: "top center", zIndex }}
      className={`${isAbsolute ? "absolute top-0 left-0" : "relative"} w-full rounded-2xl sm:rounded-3xl bg-white border border-[#73C311]/25 pt-4 sm:pt-4.5 px-5 sm:px-7 lg:px-8 pb-4 sm:pb-6 lg:pb-7 shadow-[0_-2px_15px_rgba(0,0,0,0.03),0_14px_35px_rgba(0,0,0,0.06)] overflow-hidden transition-shadow duration-300`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isLeft
            ? "radial-gradient(circle at 10% 20%, rgba(115, 195, 17, 0.05) 0%, transparent 60%)"
            : "radial-gradient(circle at 90% 15%, rgba(115, 195, 17, 0.05) 0%, transparent 60%)",
        }}
      />
      <motion.div
        style={{ opacity: dim }}
        className="absolute inset-0 bg-gray-900/[0.08] pointer-events-none z-30 rounded-2xl sm:rounded-3xl"
      />

      <div className="relative z-10 flex items-center gap-3 sm:gap-4 pb-2.5 sm:pb-3 border-b border-gray-200">
        <span className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold font-mono text-[#73C311] select-none tracking-tight leading-none shrink-0">
          {card.number}
        </span>
        <h3 className="text-base sm:text-lg md:text-xl lg:text-[23px] font-semibold text-gray-950 leading-snug tracking-tight text-left">
          {card.title}
        </h3>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start mt-3 sm:mt-3.5">
        <div className={`lg:col-span-6 flex flex-col items-start ${isLeft ? "order-1 lg:order-2" : "order-1"}`}>
          <p className="text-[14.5px] sm:text-[15.5px] lg:text-[16.5px] text-gray-600 leading-relaxed mb-4 sm:mb-4.5 text-left max-w-xl font-normal">
            {card.description}
          </p>
          <div className="inline-block">
            <motion.div
              whileHover="hover"
              className="relative overflow-hidden bg-gradient-to-r from-[#a0e65a] to-[#73C311] text-[#0d0e0e] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(115,195,17,0.25)] cursor-pointer group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>{card.linkText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                variants={{ hover: { x: ["-100%", "200%"] } }}
                transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] pointer-events-none"
              />
            </motion.div>
          </div>
        </div>

        <div className={`lg:col-span-6 flex items-center justify-center ${isLeft ? "order-2 lg:order-1" : "order-2"}`}>
          <div className="relative w-full rounded-2xl bg-gray-50/50 border border-gray-100 overflow-hidden h-[220px] sm:h-[240px]">
            <Image
              src={card.image}
              alt={card.title}
              fill
              sizes="(min-width: 1024px) 540px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FasterReplies() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // Master timing for card movements
  const scale0 = useTransform(scrollYProgress, [0.04, 0.32, 0.63, 0.94], [1, 0.97, 0.94, 0.91]);
  const dim0 = useTransform(scrollYProgress, [0.04, 0.32, 0.63, 0.94], [0, 0.03, 0.06, 0.09]);
  const y1 = useTransform(scrollYProgress, [0.04, 0.32], [800, 72]);
  const scale1 = useTransform(scrollYProgress, [0.35, 0.63, 0.94], [1, 0.97, 0.94]);
  const dim1 = useTransform(scrollYProgress, [0.35, 0.63, 0.94], [0, 0.03, 0.06]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.63], [800, 144]);
  const scale2 = useTransform(scrollYProgress, [0.66, 0.94], [1, 0.97]);
  const dim2 = useTransform(scrollYProgress, [0.66, 0.94], [0, 0.03]);
  const y3 = useTransform(scrollYProgress, [0.66, 0.94], [800, 216]);

  const headingText = "Reply Faster, in Any Language, From One Inbox";
  const words = headingText.split(" ");

  return (
    <section
      ref={trackRef}
      className="relative bg-white pt-20 sm:pt-24 md:pt-28 h-[185vh] sm:h-[195vh] lg:h-[205vh]"
    >
      <TopAnimatedBorder scrollYProgress={scrollYProgress} />

      <div className="sticky top-[68px] sm:top-[72px] w-full pb-8 sm:pb-12 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200/80 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] mb-3"
          >
            <span className="w-2 h-2 rounded-full bg-[#73C311] animate-pulse" />
            <span className="text-black text-xs font-semibold uppercase tracking-wider">FASTER REPLIES</span>
          </motion.div>

          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-950 leading-tight tracking-tight mb-2.5 text-center max-w-4xl mx-auto"
          >
            {words.map((word, i) => (
              <span key={i} className="inline-block whitespace-nowrap cursor-scan-effect">
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
                {i < words.length - 1 && "\u00A0"}
              </span>
            ))}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[14.5px] sm:text-[15.5px] text-gray-600 mx-auto text-center leading-relaxed max-w-2xl"
          >
            Customers write wherever it is easiest for them. Your team should not have to hunt for messages in five different places.
          </motion.p>
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="relative w-full pb-56 sm:pb-60">
            <CardView card={cards[0]} scale={scale0} dim={dim0} zIndex={10} isAbsolute={false} />
            <CardView card={cards[1]} y={y1} scale={scale1} dim={dim1} zIndex={20} isAbsolute={true} />
            <CardView card={cards[2]} y={y2} scale={scale2} dim={dim2} zIndex={30} isAbsolute={true} />
            <CardView card={cards[3]} y={y3} scale={1} dim={0} zIndex={40} isAbsolute={true} />
          </div>
        </div>
      </div>
    </section>
  );
}
