"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FaApple, FaFacebookF, FaGooglePlay, FaInstagram } from "react-icons/fa";

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

/** Interactive background: dot matrix that reacts to cursor proximity + subtle signal ripples */
function InteractiveNodeField({ footerRef }: { footerRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const ripples = useRef<{ x: number; y: number; born: number }[]>([]);

  useEffect(() => {
    const footer = footerRef.current;
    const canvas = canvasRef.current;
    if (!footer || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spacing = 28;
    const influenceRadius = 155;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    const resize = () => {
      const rect = footer.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(footer);

    const onMove = (e: globalThis.MouseEvent) => {
      const rect = footer.getBoundingClientRect();
      pointer.current.x = e.clientX - rect.left;
      pointer.current.y = e.clientY - rect.top;
      pointer.current.active = true;
    };

    const onLeave = () => {
      pointer.current.active = false;
    };

    const onClick = (e: globalThis.MouseEvent) => {
      const rect = footer.getBoundingClientRect();
      ripples.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        born: performance.now(),
      });
      if (ripples.current.length > 6) ripples.current.shift();
    };

    // Occasional gentle ambient pulse like an incoming message ping
    const pingInterval = window.setInterval(() => {
      if (width > 120 && height > 120) {
        ripples.current.push({
          x: width * (0.2 + Math.random() * 0.6),
          y: height * (0.2 + Math.random() * 0.6),
          born: performance.now(),
        });
        if (ripples.current.length > 6) ripples.current.shift();
      }
    }, 2800);

    footer.addEventListener("mousemove", onMove);
    footer.addEventListener("mouseleave", onLeave);
    footer.addEventListener("click", onClick);

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // Prune finished ripples
      ripples.current = ripples.current.filter((r) => now - r.born < 1600);

      const px = pointer.current.x;
      const py = pointer.current.y;
      const isActive = pointer.current.active;

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * spacing + 14;
          const baseY = row * spacing + 14;

          let drawX = baseX;
          let drawY = baseY;
          let energy = 0;

          if (isActive) {
            const dx = baseX - px;
            const dy = baseY - py;
            const dist = Math.hypot(dx, dy);

            if (dist < influenceRadius && dist > 0.001) {
              const t = 1 - dist / influenceRadius;
              const eased = t * t;
              // Subtle magnetic attraction / gentle swirl offset
              drawX += (dx / dist) * eased * 5;
              drawY += (dy / dist) * eased * 5;
              energy = Math.max(energy, eased);
            }
          }

          for (const r of ripples.current) {
            const age = now - r.born;
            const progress = age / 1600;
            const ringRadius = progress * 240;
            const ringBand = 34;
            const d = Math.abs(Math.hypot(baseX - r.x, baseY - r.y) - ringRadius);
            if (d < ringBand) {
              const wave = (1 - d / ringBand) * (1 - progress);
              energy = Math.max(energy, wave * 0.85);
            }
          }

          const radius = 1.15 + energy * 1.9;
          const alpha = 0.14 + energy * 0.72;

          if (energy > 0.12) {
            ctx.fillStyle = `rgba(115, 195, 17, ${Math.min(1, alpha)})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(pingInterval);
      ro.disconnect();
      footer.removeEventListener("mousemove", onMove);
      footer.removeEventListener("mouseleave", onLeave);
      footer.removeEventListener("click", onClick);
    };
  }, [footerRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-90 [mask-image:radial-gradient(ellipse_85%_80%_at_50%_45%,#000_45%,transparent_100%)]"
    />
  );
}

/** Gently pulls interactive controls toward the cursor */
function MagneticPull({
  children,
  strength = 0.25,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.35 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 py-1 text-sm text-white/60 transition-colors duration-200 hover:text-white"
    >
      <span className="h-1.5 w-1.5 -translate-x-1 scale-0 rounded-full bg-[var(--main-light-green)] transition-all duration-200 group-hover:translate-x-0 group-hover:scale-100" />
      <span className="relative transition-transform duration-200 group-hover:translate-x-0.5 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[var(--main-light-green)] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
        {children}
      </span>
    </Link>
  );
}

function StoreButton({ href, icon: Icon, small, big }: { href: string; icon: typeof FaApple; small: string; big: string }) {
  return (
    <MagneticPull strength={0.22}>
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 360, damping: 22 }}>
        <Link
          href={href}
          className="group flex items-center gap-3 rounded-xl border border-white/15 bg-black/70 px-4 py-2.5 backdrop-blur-xs transition-[border-color,background-color] duration-300 hover:border-[var(--main-light-green)]/75 hover:bg-white/[0.08]"
        >
          <Icon className="text-xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:text-[var(--main-light-green)]" />
          <span className="leading-tight">
            <span className="block text-[10px] text-white/50">{small}</span>
            <span className="block text-sm font-semibold text-white">{big}</span>
          </span>
        </Link>
      </motion.div>
    </MagneticPull>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-black text-white"
    >
      {/* Interactive dot-matrix node field + click/ambient signal ripples */}
      <InteractiveNodeField footerRef={footerRef} />

      {/* Top accent sweep */}
      <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-px overflow-hidden">
        <motion.span
          className="block h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--main-light-green)] to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 sm:pt-20 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.7fr_repeat(6,minmax(0,1fr))]">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: "some" }}
            transition={{ duration: 0.65, ease: EASE }}
            className="col-span-2 sm:col-span-3 lg:col-span-1"
          >
            <Link href="/" aria-label="Chatlivo home" className="inline-block transition-transform duration-300 hover:scale-[1.02]">
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
                <MagneticPull key={s.label} strength={0.35}>
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} transition={{ type: "spring", stiffness: 420, damping: 20 }}>
                    <Link
                      href={s.href}
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/70 text-base text-white/70 backdrop-blur-xs transition-colors duration-300 hover:border-[var(--main-light-green)] hover:bg-[var(--main-light-green)] hover:text-black"
                    >
                      <s.icon />
                    </Link>
                  </motion.div>
                </MagneticPull>
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
              viewport={{ once: false, amount: "some" }}
              transition={{ duration: 0.65, delay: 0.06 * (ci + 1), ease: EASE }}
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

        {/* Bottom bar */}
        <div className="relative mt-4 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 sm:mt-8 sm:flex-row">
          <p className="text-sm text-white/50">&copy; {new Date().getFullYear()} Chatlivo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}