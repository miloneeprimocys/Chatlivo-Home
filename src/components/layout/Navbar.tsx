"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from "framer-motion";
import {
  FiArrowRight,
  FiBookOpen,
  FiChevronDown,
  FiCpu,
  FiEye,
  FiGlobe,
  FiHeart,
  FiHelpCircle,
  FiHome,
  FiInbox,
  FiMap,
  FiMessageSquare,
  FiShoppingCart,
  FiTool,
  FiUsers,
  FiLayers,
  FiBook,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

type Item = { label: string; desc: string; href: string; icon: IconType };
type Menu = { label: string; items: Item[] };

const MENUS: Menu[] = [
  {
    label: "Products",
    items: [
      { label: "Live Chat Widget", desc: "Chat with visitors in real time", href: "/products/live-chat", icon: FiMessageSquare },
      { label: "WhatsApp Chat Widget", desc: "Turn WhatsApp into a sales channel", href: "/products/whatsapp", icon: FaWhatsapp },
      { label: "Omnichannel Inbox", desc: "Every channel, one conversation view", href: "/products/omnichannel-inbox", icon: FiLayers },
      { label: "Shared Inbox", desc: "Assign, tag and resolve as a team", href: "/products/shared-inbox", icon: FiInbox },
      { label: "Visitor Tracking", desc: "See who is on your site right now", href: "/products/visitor-tracking", icon: FiEye },
      { label: "Live Chat Translation", desc: "Reply in the language they write in", href: "/products/translation", icon: FiGlobe },
      { label: "Primo AI Agent", desc: "Answers instantly, hands off to humans", href: "/products/ai-agent", icon: FiCpu },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Ecommerce", desc: "Recover carts, answer product questions", href: "/solutions/ecommerce", icon: FiShoppingCart },
      { label: "SaaS", desc: "Onboard and support users in-app", href: "/solutions/saas", icon: FiTool },
      { label: "Healthcare", desc: "Book and answer patients faster", href: "/solutions/healthcare", icon: FiHeart },
      { label: "Education", desc: "Handle admissions and student queries", href: "/solutions/education", icon: FiBook },
      { label: "Real Estate", desc: "Qualify buyers before you call", href: "/solutions/real-estate", icon: FiHome },
      { label: "Travel & Hospitality", desc: "Support guests around the clock", href: "/solutions/travel", icon: FiMap },
      { label: "All solutions", desc: "Browse by industry", href: "/solutions", icon: FiUsers },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Blog", desc: "Guides on support and lead capture", href: "/blog", icon: FiBookOpen },
      { label: "Help Center", desc: "Answers to common questions", href: "/help", icon: FiHelpCircle },
      { label: "Setup Guides", desc: "Install Chatlivo in minutes", href: "/guides", icon: FiTool },
    ],
  },
];

const LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Contact Us", href: "/contact" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const listV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
};
const rowV: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/* Hamburger that morphs into an X */
function Burger({ open }: { open: boolean }) {
  const line = "absolute left-0 h-[2px] w-full rounded-full bg-white";
  return (
    <span className="relative block h-4 w-5">
      <motion.span
        className={`${line} top-0`}
        animate={open ? { y: 7, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
      <motion.span
        className={`${line} top-[7px]`}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className={`${line} bottom-0`}
        animate={open ? { y: -7, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>("Products");

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  // Lock page scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  // Escape closes; resizing to desktop closes the drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobile(false);
        setOpen(null);
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setMobile(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const solid = scrolled && !mobile;

  return (
    <>
      <motion.header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
        <nav
          onMouseLeave={() => setOpen(null)}
          className={`relative flex w-full max-w-6xl items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 sm:px-4 sm:py-2.5 md:px-6 ${
            solid
              ? "border-white/10 bg-black/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          {/* Logo */}
          <Link href="/" onClick={() => setMobile(false)} className="flex items-center gap-2" aria-label="Chatlivo home">
            <Image
              src="/images/logo.svg"
              alt="ChatLivo"
              width={172}
              height={32}
              priority
              className="h-7 w-auto sm:h-8"
            />
          </Link>

          {/* Desktop menu */}
          <ul className="hidden items-center gap-1 lg:flex">
            {MENUS.map((menu) => (
              <li key={menu.label} className="relative" onMouseEnter={() => setOpen(menu.label)}>
                <button
                  onClick={() => setOpen(open === menu.label ? null : menu.label)}
                  onFocus={() => setOpen(menu.label)}
                  aria-expanded={open === menu.label}
                  className="relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--main-light-green)]"
                >
                  {open === menu.label && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{menu.label}</span>
                  <FiChevronDown
                    className={`relative transition-transform duration-300 ${open === menu.label ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {open === menu.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.97, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="absolute left-1/2 top-full w-[340px] -translate-x-1/2 pt-4"
                    >
                      <div className="isolate rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] ring-1 ring-black">
                        {menu.items.map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03 * i, duration: 0.3, ease: EASE }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setOpen(null)}
                              className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.06]"
                            >
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--main-green)]/15 text-lg text-[var(--main-light-green)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--main-light-green)] group-hover:text-black">
                                <item.icon />
                              </span>
                              <span className="flex-1">
                                <span className="block text-sm font-medium text-white">{item.label}</span>
                                <span className="block text-xs text-white/50">{item.desc}</span>
                              </span>
                              <FiArrowRight className="-translate-x-2 text-white/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[var(--main-light-green)]" />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}

            {LINKS.map((l) => (
              <li key={l.label} onMouseEnter={() => setOpen(null)}>
                <Link
                  href={l.href}
                  className="rounded-full px-4 py-2 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="https://app.chatlivo.com"
              className="group relative hidden overflow-hidden rounded-full bg-[var(--main-light-green)] px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.04] active:scale-95 sm:inline-flex"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Go To App</span>
            </Link>
            <button
              onClick={() => setMobile((v) => !v)}
              aria-label={mobile ? "Close menu" : "Open menu"}
              aria-expanded={mobile}
              className={`grid h-10 w-10 place-items-center rounded-full border transition-colors lg:hidden ${
                mobile ? "border-[var(--main-light-green)]/50 bg-[var(--main-green)]/15" : "border-white/15"
              }`}
            >
              <Burger open={mobile} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at calc(100% - 2.25rem) 2.75rem)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at calc(100% - 2.25rem) 2.75rem)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at calc(100% - 2.25rem) 2.75rem)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-0 z-40 flex h-[100dvh] flex-col bg-black lg:hidden"
          >
            {/* Backdrop */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_80%_50%_at_80%_0%,#000,transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(115,195,17,0.35),transparent)]"
            />

            {/* Scrollable list */}
            <motion.div
              variants={listV}
              initial="hidden"
              animate="show"
              className="relative flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-24 sm:px-8"
            >
              {MENUS.map((m, idx) => {
                const isOpen = mobileSection === m.label;
                return (
                  <motion.div key={m.label} variants={rowV} className="border-b border-white/10">
                    <button
                      onClick={() => setMobileSection(isOpen ? null : m.label)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 py-4 text-left"
                    >
                    
                      <span
                        className={`flex-1 text-[1.7rem] font-semibold leading-none tracking-tight transition-colors ${
                          isOpen ? "text-white" : "text-white/60"
                        }`}
                      >
                        {m.label}
                      </span>
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full border text-base transition-all duration-300 ${
                          isOpen
                            ? "rotate-180 border-[var(--main-light-green)] bg-[var(--main-light-green)] text-black"
                            : "border-white/15 text-white/70"
                        }`}
                      >
                        <FiChevronDown />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 gap-2 pb-4 min-[480px]:grid-cols-2">
                            {m.items.map((item, i) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.04 * i, duration: 0.35, ease: EASE }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={() => setMobile(false)}
                                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-colors active:bg-white/10"
                                >
                                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--main-green)]/15 text-lg text-[var(--main-light-green)]">
                                    <item.icon />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium text-white">{item.label}</span>
                                    <span className="line-clamp-1 text-xs text-white/50">{item.desc}</span>
                                  </span>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {LINKS.map((l, i) => (
                <motion.div key={l.label} variants={rowV} className="border-b border-white/10">
                  <Link
                    href={l.href}
                    onClick={() => setMobile(false)}
                    className="group flex items-center gap-4 py-4"
                  >
                  
                    <span className="flex-1 text-[1.7rem] font-semibold leading-none tracking-tight text-white/60 transition-colors group-active:text-white">
                      {l.label}
                    </span>
                    <FiArrowRight className="text-xl text-white/40 transition-transform group-active:translate-x-1 group-active:text-[var(--main-light-green)]" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Solid top bar: hides the list scrolling behind the logo / X */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[4.5rem] border-b border-white/10 bg-black sm:h-[5rem]"
            />

            {/* Sticky bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
              className="relative shrink-0 border-t border-white/10 bg-black/80 px-5 pt-4 backdrop-blur-xl sm:px-8"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <Link
                href="https://app.chatlivo.com"
                onClick={() => setMobile(false)}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--main-light-green)] py-4 text-base font-semibold text-black active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full animate-[shine_2.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <span className="relative">Go To App</span>
                <FiArrowRight className="relative transition-transform group-active:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}