"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiMessageSquare, FiSearch, FiX } from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1] as const;

type QA = { q: string; a: string };

/* NOTE: answers are starter copy written from your site content. Please review before publishing. */
const FAQS: QA[] = [
  {
    q: "What is Chatlivo?",
    a: "Chatlivo is live chat software that brings website chat, WhatsApp, Instagram, Messenger and email into one inbox. Livo AI can answer routine questions, and your team steps in whenever a conversation needs a person.",
  },
  {
    q: "What is Livo AI?",
    a: "Livo AI is Chatlivo's AI customer support agent. Add your website content and FAQs, and it replies to suitable questions instantly, even when your team is away. When a conversation needs a person, it hands over to your agents.",
  },
  {
    q: "Can Livo AI reply on WhatsApp, Instagram, Messenger and email?",
    a: "Chatlivo gathers all of these channels in one inbox, so your team can reply to each of them from a single screen. See the Livo AI page for the channels it is currently available on.",
  },
  {
    q: "What is the difference between the live chat widget and the WhatsApp widget?",
    a: "The live chat widget lets visitors talk to you without leaving your website, and your team can collect contact details and continue the conversation in Chatlivo. The WhatsApp widget gives visitors a familiar way to message your business from their phone. Many businesses offer both.",
  },
  {
    q: "Can my team reply in a different language than the customer?",
    a: "Yes. Live chat translation works in both directions, so a customer can write in Spanish while your team reads and answers in English, with no copying and pasting into a translator.",
  },
  {
    q: "What is the Livo AI reply shortcut?",
    a: "Type a quick draft, then use the shortcut to have Livo AI rewrite and improve it. It fixes the tone and tidies the wording so you can send a clear reply without starting from a blank box.",
  },
  {
    q: "Can I build my own chatbot?",
    a: "Yes. You can start from a ready-made chatbot template or build a custom workflow from scratch with the visual flow builder. Chatbots can answer questions, capture leads and hand over to a person.",
  },
  {
    q: "Is Chatlivo free to start?",
    a: "Yes. There is a free plan and no credit card is required to sign up. Visit the Pricing page to compare plans.",
  },
  {
    q: "How do I add Chatlivo to my website?",
    a: "Create your account, copy the install snippet from your dashboard and add it to your site. The Setup Guides walk through the most common platforms step by step.",
  },
  {
    q: "Can a person take over from the AI?",
    a: "Yes. When a conversation needs a person, your agents can take over in the same inbox and see the full conversation history, so the customer never has to repeat themselves.",
  },
  {
    q: "Is Chatlivo an alternative to Tidio or Smartsupp?",
    a: "Chatlivo covers similar ground, with live chat, messaging apps and AI in one inbox. Our comparison pages set out how it differs from other tools so you can judge what fits your team.",
  },
  {
    q: "Is customer data secure?",
    a: "We take data protection seriously. Our Privacy Policy and GDPR information explain how customer data is collected and handled, and you can read them from the footer of this site.",
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
      className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
        open
          ? "border-[var(--main-green)] bg-[var(--main-green)]"
          : "border-[var(--borders-color)] bg-white group-hover:border-[var(--main-green)]"
      }`}
    >
      <span className="absolute h-[2px] w-3 rounded bg-[var(--dark-text)]" />
      <motion.span
        className="absolute h-3 w-[2px] rounded bg-[var(--dark-text)]"
        animate={{ scaleY: open ? 0 : 1, rotate: open ? 90 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
    </span>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.map((f, i) => ({ ...f, n: i })).filter((f) => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="relative overflow-hidden bg-white py-16 text-[var(--dark-text)] sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(185,250,106,0.35),transparent)] blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14">
        {/* Left column */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--main-green)]"
            >
              <span className="h-px w-6 bg-[var(--main-green)]" /> FAQ
            </motion.span>
            <h2 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
              {["Questions People Ask", "Before They Start"].map((line, li) => (
                <span key={li} className="block">
                  {line.split(" ").map((w, i) => (
                    <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                      <motion.span
                        className={`inline-block ${li === 1 ? "text-[var(--main-green)]" : ""}`}
                        initial={{ y: "110%" }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: li * 0.2 + i * 0.06, ease: EASE }}
                      >
                        {w}&nbsp;
                      </motion.span>
                    </span>
                  ))}
                </span>
              ))}
            </h2>
            <p className="mt-4 text-base text-[var(--text-gray)]">Short answers about Livo AI, channels, widgets and plans.</p>

            <label className="relative mt-6 block">
              <span className="sr-only">Search questions</span>
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions"
                className="w-full rounded-full border border-[var(--borders-color)] bg-[var(--bg-color)] py-3 pl-11 pr-10 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-[var(--placeholder-color)] focus:border-[var(--main-green)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(115,195,17,0.15)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[var(--text-gray)] hover:bg-[var(--bg-light)]"
                >
                  <FiX />
                </button>
              )}
            </label>

            <div className="relative mt-6 hidden overflow-hidden rounded-2xl bg-[var(--dark-text)] p-5 text-white lg:block">
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(closest-side,rgba(115,195,17,0.6),transparent)]"
              />
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-[var(--main-light-green)] text-lg text-black"
              >
                <FiMessageSquare />
              </motion.span>
              <p className="relative mt-4 text-base font-semibold">Still have questions?</p>
              <p className="relative mt-1 text-sm text-white/60">Our team is happy to help you get set up.</p>
              <Link href="/contact" className="group relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--main-light-green)]">
                <span className="border-b-2 border-[var(--main-green)] pb-0.5">Talk to our team</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="lg:col-span-8">
          <ul className="border-t border-[var(--borders-color)]">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((f, idx) => {
                const isOpen = open === f.n;
                return (
                  <motion.li
                    key={f.n}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: Math.min(idx, 6) * 0.04, ease: EASE }}
                    className={`relative border-b border-[var(--borders-color)] transition-colors duration-300 ${isOpen ? "bg-[var(--bg-color)]" : ""}`}
                  >
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
                        onClick={() => setOpen(isOpen ? null : f.n)}
                        className="group flex w-full items-center gap-4 px-3 py-5 text-left sm:px-5"
                      >
                        <span className="w-7 shrink-0 text-xs font-bold tabular-nums text-[var(--main-green)]">
                          {String(f.n + 1).padStart(2, "0")}
                        </span>
                        <span className={`flex-1 text-[15px] font-semibold tracking-tight transition-colors sm:text-base ${isOpen ? "text-[var(--dark-text)]" : "text-[var(--text-label)]"}`}>
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
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="pb-6 pl-[3.25rem] pr-4 text-sm leading-relaxed text-[var(--text-gray)] sm:pl-[4.25rem] sm:pr-16 sm:text-[15px]">
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
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center text-sm text-[var(--text-gray)]">
              No questions match &ldquo;{query}&rdquo;.{" "}
              <Link href="/contact" className="font-semibold text-[var(--text-label)] underline decoration-[var(--main-green)] underline-offset-4">
                Ask our team
              </Link>
            </motion.p>
          )}

          <Link href="/contact" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-label)] lg:hidden">
            <span className="border-b-2 border-[var(--main-green)] pb-0.5">Still have questions? Talk to our team</span>
            <FiArrowRight className="text-[var(--main-green)] transition-transform group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}