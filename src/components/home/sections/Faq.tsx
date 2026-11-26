"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiMessageSquare,
  FiMoreHorizontal,
  FiSearch,
  FiSend,
  FiX,
  FiZap,
} from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1] as const;

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "What is Chatlivo?",
    a: "Chatlivo is a friendly inbox for customer conversations. It pulls website chat, a WhatsApp widget, Instagram, Messenger, email and Livo AI into one calm workspace so your team never has to tab-hunt.",
  },
  {
    q: "What is Livo AI?",
    a: "Think of Livo AI as a helpful teammate who knows your site and FAQs inside out. It handles everyday questions day and night, and hands the chat smoothly to a real person whenever a human touch makes sense.",
  },
  {
    q: "Can Livo AI reply on WhatsApp, Instagram, Messenger and email?",
    a: "Yes. Once you connect a channel, Livo AI can chime in there just like on your website. Every message still lands in one shared inbox so you can jump in whenever you like.",
  },
  {
    q: "What is the difference between the live chat widget and the WhatsApp widget?",
    a: "You get both on your site. Live chat keeps visitors right on the page while they ask quick questions, and WhatsApp lets people who live on their phones message you there. Both feed the exact same inbox.",
  },
  {
    q: "Can my team reply in a different language than the customer?",
    a: "Yes. Chatlivo translates back and forth naturally, so a visitor can write in their own words while your team reads and replies comfortably in theirs.",
  },
  {
    q: "What is the Livo AI reply shortcut?",
    a: "It is a handy nudge right inside your reply box. Jot down a rough thought, hit the Livo AI shortcut, and it polishes the wording so you can send a warm, clear answer in seconds.",
  },
  {
    q: "Can I build my own chatbot?",
    a: "Yes. Start with a ready-made template or shape your own flow visually. Chatbots can greet visitors, pick up helpful details and pass the conversation to your team without making people wait.",
  },
  {
    q: "Is Chatlivo free to start?",
    a: "Yes. You can start free with 1 agent, 25 conversations a month, and live chat plus WhatsApp—no credit card required. Paid plans start at $12 a month, and our pricing page breaks down what is included with Livo AI.",
  },
  {
    q: "How do I add Chatlivo to my website?",
    a: "Drop in one short snippet before your closing body tag or use a plugin. It plays nicely with WordPress, Shopify, Wix, Webflow, Next.js, Laravel, React and custom builds.",
  },
  {
    q: "Can a person take over from the AI?",
    a: "Of course. Your team can step in at any moment, and the whole conversation comes along with it so customers never feel like they are starting over.",
  },
  {
    q: "Is Chatlivo an alternative to Tidio or Smartsupp?",
    a: "It helps with similar day-to-day workflows—live chat, bots, AI replies and a shared inbox. A nice difference is that Chatlivo pairs live chat and WhatsApp widgets out of the box and starts free, so you can try it and see what fits your team best.",
  },
  {
    q: "Is customer data secure?",
    a: "Yes. Conversations travel over encrypted connections on secure infrastructure built around GDPR best practices to keep customer details safe.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 cursor-pointer ${
        open
          ? "rotate-180 border-[var(--main-green)] bg-[var(--main-light-green)]"
          : "border-[var(--borders-color)] bg-[var(--bg-light)] group-hover:border-[var(--main-green)] group-hover:bg-[var(--light-green)]/50"
      }`}
    >
      <span
        className={`absolute h-[2px] w-3 rounded transition-colors ${
          open ? "bg-[var(--dark-text)]" : "bg-[var(--text-gray)]"
        }`}
      />
      <motion.span
        className={`absolute h-3 w-[2px] rounded transition-colors ${
          open ? "bg-[var(--dark-text)]" : "bg-[var(--text-gray)]"
        }`}
        animate={{ scaleY: open ? 0 : 1, rotate: open ? 90 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
    </span>
  );
}

function ChatStreamBackdrop({ reduce }: { reduce: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], [-24, 24]);

  const streams = [
    { left: "4%", top: "14%", w: "w-36", delay: 0, dur: 6.2 },
    { right: "4%", top: "28%", w: "w-40", delay: 1.2, dur: 7.1 },
    { left: "6%", top: "58%", w: "w-32", delay: 2.1, dur: 6.7 },
    { right: "6%", top: "76%", w: "w-36", delay: 0.7, dur: 7.4 },
  ];

  return (
    <div ref={sectionRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
      <div className="sticky top-20 h-[560px] w-full">
        <div className="absolute -left-40 top-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(115,195,17,0.12),transparent)] blur-[110px]" />
        <div className="absolute -right-40 bottom-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(185,250,106,0.22),transparent)] blur-[110px]" />

        <motion.div style={reduce ? undefined : { y: driftY }} className="relative h-full w-full">
          {streams.map((s, idx) => (
            <motion.div
              key={idx}
              style={{ left: s.left, right: s.right, top: s.top }}
              animate={
                reduce
                  ? undefined
                  : {
                      y: [0, -10, 0],
                      opacity: [0.35, 0.6, 0.35],
                    }
              }
              transition={{
                duration: s.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: s.delay,
              }}
              className={`absolute hidden ${s.w} rounded-2xl border border-[var(--borders-color)] bg-white/80 p-3 shadow-sm backdrop-blur-[2px] xl:block`}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--main-green)]" />
                <span className="h-1.5 w-14 rounded-full bg-black/10" />
              </div>
              <div className="space-y-1.5">
                <span className="block h-1.5 w-full rounded-full bg-black/[0.07]" />
                <span className="block h-1.5 w-3/4 rounded-full bg-[var(--main-light-green)]/70" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function Faq() {
  const reduce = !!useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeBubble, setActiveBubble] = useState<{
    q: string;
    a: string;
    key: string;
  }>({
    q: FAQS[0].q,
    a: FAQS[0].a,
    key: "faq-0",
  });
  const [isReplying, setIsReplying] = useState(false);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.map((f, i) => ({ ...f, n: i })).filter(
      (f) => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (reduce) {
      setIsReplying(false);
      return;
    }
    setIsReplying(true);
    const timer = setTimeout(() => setIsReplying(false), 550);
    return () => clearTimeout(timer);
  }, [activeBubble.key, reduce]);

  const handleSelectFaq = (index: number) => {
    const nextOpen = open === index ? null : index;
    setOpen(nextOpen);
    const target = FAQS[index];
    if (target) {
      setActiveBubble({
        q: target.q,
        a: target.a,
        key: `faq-${index}-${Date.now()}`,
      });
    }
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customPrompt.trim();
    if (!trimmed) return;

    const words = trimmed.toLowerCase().split(/\s+/);
    const matched = FAQS.find((item) =>
      words.some(
        (w) =>
          w.length > 3 &&
          (item.q.toLowerCase().includes(w) || item.a.toLowerCase().includes(w))
      )
    );

    setActiveBubble({
      q: trimmed,
      a: matched
        ? matched.a
        : "Chatlivo brings website chat, a WhatsApp widget, Instagram, Messenger, email and Livo AI together in one shared inbox. If you have a specific setup in mind, our team would love to help you directly.",
      key: `custom-${Date.now()}`,
    });
    setCustomPrompt("");
  };

  return (
    <section className="relative w-full overflow-x-clip bg-[#f8faf5] py-16 text-[var(--dark-text)] sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChatStreamBackdrop reduce={reduce} />

      {/* Main Grid */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-10">
        {/* Left Column */}
        <div className="relative h-full lg:col-span-5">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--main-green)]"
            >
              <span className="h-px w-6 bg-[var(--main-green)]" /> Helpful answers
            </motion.span>

            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className="text-3xl font-bold leading-[1.1] tracking-tight text-[var(--dark-text)] sm:text-4xl lg:text-5xl cursor-scan-effect"
            >
              Common Questions, <br className="hidden sm:block" />
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-10 h-[0.35em]"
                />
                Plain &amp; Simple
              </span>
            </motion.h2>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
              className="text-sm leading-relaxed text-[var(--text-gray)] sm:text-base"
            >
              Curious how Livo AI, channels, widgets, or plans work in practice? Here is what most teams ask first.
            </motion.p>

            {/* Search Input */}
            <label className="relative block">
              <span className="sr-only">Search questions</span>
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--light-text)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by topic or keyword..."
                className="w-full rounded-2xl border border-[var(--borders-color)] bg-white py-3.5 pl-11 pr-10 text-sm text-[var(--dark-text)] shadow-sm outline-none transition-all duration-300 placeholder:text-[var(--light-text)] focus:border-[var(--main-green)] focus:shadow-[0_0_0_4px_rgba(115,195,17,0.14)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[var(--text-gray)] hover:bg-[var(--bg-light)] hover:text-[var(--dark-text)]"
                >
                  <FiX />
                </button>
              )}
            </label>

            {/* Sticky Live Chat Thread Widget */}
            <div className="relative hidden lg:block">
              <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-b from-[var(--main-green)]/20 to-transparent blur-md" />

              <div className="relative overflow-hidden rounded-3xl border border-[var(--borders-color)] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)]">
                {/* Widget Header */}
                <div className="flex items-center justify-between border-b border-[var(--borders-color)] bg-[var(--bg-light)]/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative grid h-9 w-9 place-items-center rounded-full bg-[var(--main-light-green)] text-[var(--dark-text)]">
                      <FiZap className="text-sm" />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-[var(--main-green)]">
                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                      </span>
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs font-bold text-[var(--dark-text)] sm:text-sm">Livo AI</p>
                      <p className="text-[11px] font-medium text-[var(--text-gray)]">
                        Tap any question or try your own
                      </p>
                    </div>
                  </div>
                  <FiMoreHorizontal className="text-[var(--light-text)]" />
                </div>

                {/* Animated Thread */}
                <div className="flex min-h-[210px] flex-col justify-between gap-3 bg-[#fcfdfb] p-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeBubble.key}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="space-y-3"
                    >
                      <div className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-sm bg-[var(--main-light-green)] px-3.5 py-2.5 text-xs font-semibold leading-snug text-[var(--dark-text)] shadow-xs">
                        {activeBubble.q}
                      </div>

                      {isReplying ? (
                        <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[var(--borders-color)] bg-white px-3.5 py-2.5">
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={dot}
                              className="h-1.5 w-1.5 rounded-full bg-[var(--main-green)]"
                              animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                              transition={{
                                duration: 0.85,
                                repeat: Infinity,
                                delay: dot * 0.14,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={reduce ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="max-w-[95%] rounded-2xl rounded-bl-sm border border-[var(--borders-color)] bg-white px-3.5 py-3 text-xs leading-relaxed text-[var(--text-gray)] shadow-xs"
                        >
                          {activeBubble.a}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-gray)]">
                    <span className="inline-flex items-center gap-1.5">
                      <FiMessageSquare className="text-[var(--main-green)]" />
                      Still unsure about something?
                    </span>
                    <Link
                      href="/contact"
                      className="group inline-flex items-center gap-1 font-semibold text-[var(--dark-text)] hover:text-[var(--main-green)]"
                    >
                      <span>Chat with us</span>
                      <FiArrowRight className="text-[var(--main-green)] transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Interactive Prompt Input */}
                <form
                  onSubmit={handleSendPrompt}
                  className="flex items-center gap-2 border-t border-[var(--borders-color)] bg-white p-2.5"
                >
                  <input
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ask a quick question..."
                    className="flex-1 rounded-xl bg-[var(--bg-light)] px-3.5 py-2 text-xs text-[var(--dark-text)] outline-none placeholder:text-[var(--light-text)] focus:bg-[var(--light-green)]/30"
                  />
                  <button
                    type="submit"
                    aria-label="Send question"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--main-green)] text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    <FiSend className="text-xs" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Scrollable FAQ Accordion */}
        <div className="lg:col-span-7">
          <ul className="overflow-hidden rounded-2xl border border-[var(--borders-color)] bg-white shadow-sm">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((f, idx) => {
                const isOpen = open === f.n;
                return (
                  <motion.li
                    key={f.n}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    exit={reduce ? undefined : { opacity: 0, x: -16 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(idx, 6) * 0.035,
                      ease: EASE,
                    }}
                    className={`group relative border-b border-[var(--borders-color)] last:border-b-0 transition-colors duration-300 ${
                      isOpen ? "bg-[#f9fcf5]" : "hover:bg-[var(--bg-light)]/50"
                    }`}
                  >
                    {isOpen && (
                      <motion.div
                        layoutId="faq-glow"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--light-green)]/45 to-transparent"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    )}

                    {isOpen && (
                      <motion.span
                        layoutId="faq-bar"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        className="absolute left-0 top-0 h-full w-[3px] bg-[var(--main-green)]"
                      />
                    )}

                    <h3>
                      <button
                        type="button"
                        id={`faq-q-${f.n}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${f.n}`}
                        onClick={() => handleSelectFaq(f.n)}
                        className="relative flex w-full items-center gap-4 px-4 py-5 text-left sm:gap-5 sm:px-6 sm:py-6"
                      >
                        <span
                          className={`w-7 shrink-0 font-mono text-xs font-bold tabular-nums transition-colors sm:w-8 sm:text-sm ${
                            isOpen
                              ? "text-[var(--main-green)]"
                              : "text-[var(--light-text)] group-hover:text-[var(--text-gray)]"
                          }`}
                        >
                          {String(f.n + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`flex-1 text-[15px] font-semibold tracking-tight transition-colors sm:text-lg ${
                            isOpen
                              ? "text-[var(--dark-text)]"
                              : "text-[var(--text-label)] group-hover:text-[var(--dark-text)]"
                          }`}
                        >
                          {f.q}
                        </span>
                        <PlusMinus open={isOpen} />
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-a-${f.n}`}
                          role="region"
                          aria-labelledby={`faq-q-${f.n}`}
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduce ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="relative z-10 overflow-hidden"
                        >
                          <p className="pb-6 pl-[3.25rem] pr-5 text-sm leading-relaxed text-[var(--text-gray)] sm:pb-8 sm:pl-[4.75rem] sm:pr-12 sm:text-base">
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {items.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center text-sm text-[var(--text-gray)]"
            >
              Nothing turned up for &ldquo;{query}&rdquo;.{" "}
              <Link
                href="/contact"
                className="font-semibold text-[var(--dark-text)] underline decoration-[var(--main-green)] decoration-2 underline-offset-4"
              >
                Reach out to our team
              </Link>
            </motion.p>
          )}

          {/* Mobile Chat Support Link */}
          <Link
            href="/contact"
            className="group mt-8 flex items-center justify-between rounded-2xl border border-[var(--borders-color)] bg-white p-4 text-sm font-semibold text-[var(--dark-text)] shadow-xs transition-colors hover:border-[var(--main-green)] lg:hidden"
          >
            <span>Have a question we didn&apos;t cover? Let&apos;s chat</span>
            <FiArrowRight className="text-[var(--main-green)] transition-transform group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}