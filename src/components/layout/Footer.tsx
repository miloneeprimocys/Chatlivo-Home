"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { FaApple, FaFacebookF, FaGooglePlay, FaInstagram } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Replace these with your real links */
const GOOGLE_PLAY = "#";
const APP_STORE = "#";
const FACEBOOK = "#";
const INSTAGRAM = "#";

type L = { label: string; href: string };
const COLUMNS: { title: string; links: L[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Live Chat Widget", href: "/products/live-chat" },
      { label: "WhatsApp Chat Widget", href: "/products/whatsapp" },
      { label: "Omnichannel Inbox", href: "/products/omnichannel-inbox" },
      { label: "Shared Inbox", href: "/products/shared-inbox" },
      { label: "Visitor Tracking", href: "/products/visitor-tracking" },
      { label: "Live Chat Translation", href: "/products/translation" },
      { label: "Livo AI", href: "/products/ai-agent" },
    ],
  },
  {
    title: "Channels",
    links: [
      { label: "Live Chat", href: "/products/live-chat" },
      { label: "WhatsApp", href: "/products/whatsapp" },
      { label: "Email", href: "/channels/email" },
      { label: "Instagram", href: "/channels/instagram" },
      { label: "Messenger", href: "/channels/messenger" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Ecommerce", href: "/solutions/ecommerce" },
      { label: "SaaS", href: "/solutions/saas" },
      { label: "Healthcare", href: "/solutions/healthcare" },
      { label: "Education", href: "/solutions/education" },
      { label: "Real Estate", href: "/solutions/real-estate" },
      { label: "Travel & Hospitality", href: "/solutions/travel" },
      { label: "Professional Services", href: "/solutions/professional-services" },
      { label: "Insurance", href: "/solutions/insurance" },
      { label: "Law Firms", href: "/solutions/law-firms" },
      { label: "Automotive", href: "/solutions/automotive" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "Chatlivo vs Smartsupp", href: "/compare/smartsupp" },
      { label: "Chatlivo vs Tidio", href: "/compare/tidio" },
      { label: "Chatlivo vs Crisp", href: "/compare/crisp" },
      { label: "Chatlivo vs tawk.to", href: "/compare/tawk-to" },
      { label: "Chatlivo vs Chatway", href: "/compare/chatway" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "Setup Guides", href: "/guides" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Partners", href: "/partners" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "GDPR", href: "/gdpr" },
    ],
  },
];

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="group inline-flex items-center py-1 text-sm text-white/60 transition-colors hover:text-white">
      <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--main-light-green)] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
        {children}
      </span>
    </Link>
  );
}

function StoreButton({ href, icon: Icon, small, big }: { href: string; icon: typeof FaApple; small: string; big: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--main-light-green)]/60 hover:bg-white/[0.07]"
    >
      <Icon className="text-xl text-white transition-colors group-hover:text-[var(--main-light-green)]" />
      <span className="leading-tight">
        <span className="block text-[10px] text-white/50">{small}</span>
        <span className="block text-sm font-semibold text-white">{big}</span>
      </span>
    </Link>
  );
}

export default function Footer() {
  const markRef = useRef<HTMLDivElement>(null);

  // Wordmark fills with green as it scrolls into view
  const { scrollYProgress: markP } = useScroll({ target: markRef, offset: ["start end", "end 80%"] });
  const clip = useTransform(markP, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);

  // Back-to-top ring shows how far down the page you are
  const { scrollYProgress: pageP } = useScroll();
  const ring = useSpring(pageP, { stiffness: 120, damping: 28 });

  const markStyle = { fontSize: "clamp(4rem, 17.5vw, 17rem)" };

  return (
    <footer className="relative overflow-hidden bg-black text-white">
      {/* top glow line */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px overflow-hidden">
        <motion.span
          className="block h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--main-light-green)] to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[70vw] max-w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(115,195,17,0.16),transparent)] blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 sm:pt-20 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.7fr_repeat(6,minmax(0,1fr))]">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="col-span-2 sm:col-span-3 lg:col-span-1"
          >
            <Link href="/" aria-label="Chatlivo home" className="inline-block">
              <Image src="/images/logo.svg" alt="Chatlivo" width={172} height={32} className="h-8 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Live chat, WhatsApp and Livo AI in one inbox. Answer customers 24/7 with AI and human support.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 lg:flex-col lg:items-start">
              <StoreButton href={GOOGLE_PLAY} icon={FaGooglePlay} small="Get it on" big="Google Play" />
              <StoreButton href={APP_STORE} icon={FaApple} small="Download on the" big="App Store" />
            </div>
            <div className="mt-5 flex gap-2.5">
              {[
                { icon: FaFacebookF, href: FACEBOOK, label: "Facebook" },
                { icon: FaInstagram, href: INSTAGRAM, label: "Instagram" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-base text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--main-light-green)] hover:bg-[var(--main-light-green)] hover:text-black"
                >
                  <s.icon />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {COLUMNS.map((col, ci) => (
            <motion.nav
              key={col.title}
              aria-label={col.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: 0.08 * (ci + 1), ease: EASE }}
            >
              <h3 className="mb-3 text-sm font-semibold text-white">{col.title}</h3>
              <ul className="flex flex-col">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>

        {/* Wordmark */}
        <div ref={markRef} aria-hidden className="relative mt-16 select-none overflow-hidden text-center sm:mt-20">
          <div
            className="font-black leading-[0.9] tracking-tight text-transparent"
            style={{ ...markStyle, WebkitTextStroke: "1px rgba(255,255,255,0.14)" }}
          >
            Chatlivo
          </div>
          <motion.div
            style={{ ...markStyle, clipPath: clip }}
            className="absolute inset-0 bg-gradient-to-b from-[var(--main-light-green)] to-[var(--main-green)] bg-clip-text font-black leading-[0.9] tracking-tight text-transparent"
          >
            Chatlivo
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="relative flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 sm:flex-row">
          <p className="text-sm text-white/50">&copy; {new Date().getFullYear()} Chatlivo. All rights reserved.</p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="group relative grid h-11 w-11 place-items-center rounded-full text-white/80 transition-colors hover:text-[var(--main-light-green)]"
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
          </button>
        </div>
      </div>
    </footer>
  );
}