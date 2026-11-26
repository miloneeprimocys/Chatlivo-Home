"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight cursor: ONE glowing green dot that follows the mouse smoothly.
 * - Only shows inside elements marked with `data-cursor-zone` (the Hero section)
 * - No canvas, no particles: one element, one rAF loop that sleeps when idle
 * - Grows into a soft ring over links and buttons, shrinks on press
 * - Disabled on touch devices
 */
export default function NeonCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const dot = dotRef.current!;
    document.documentElement.classList.add("nc-on");

    const m = { x: -100, y: -100 };
    const d = { x: -100, y: -100 };
    let raf = 0;
    let running = false;
    let inside = false;
    let ticking = false;

    const setInside = (v: boolean) => {
      if (inside === v) return;
      inside = v;
      dot.style.opacity = v ? "1" : "0";
      if (v) {
        d.x = m.x;
        d.y = m.y;
      }
    };

    const loop = () => {
      d.x += (m.x - d.x) * 0.22;
      d.y += (m.y - d.y) * 0.22;
      dot.style.transform = `translate3d(${d.x}px,${d.y}px,0) translate(-50%,-50%)`;
      if (Math.abs(m.x - d.x) > 0.1 || Math.abs(m.y - d.y) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    const evaluate = (t: Element | null) => {
      const zone = !!t?.closest?.("[data-cursor-zone]");
      setInside(zone);
      if (zone) dot.dataset.s = t?.closest?.("a,button,[role=button]") ? "hover" : "";
      return zone;
    };

    const onMove = (e: PointerEvent) => {
      m.x = e.clientX;
      m.y = e.clientY;
      if (!evaluate(e.target as Element | null)) return;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    // Hero scrolls away under a still cursor: re-check what is under it
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        evaluate(document.elementFromPoint(m.x, m.y));
      });
    };

    const onDown = () => (dot.dataset.s = "down");
    const onUp = () => (dot.dataset.s = "");
    const onLeave = () => setInside(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("nc-on");
    };
  }, []);

  return (
    <>
      <style>{`
        html.nc-on [data-cursor-zone],
        html.nc-on [data-cursor-zone] * { cursor: none !important; }
        .nc-dot {
          position: fixed; top: 0; left: 0; z-index: 10000;
          pointer-events: none; opacity: 0; transition: opacity .2s; will-change: transform;
        }
        .nc-dot i {
          display: block; width: 12px; height: 12px; border-radius: 50%;
          background: #B9FA6A;
          box-shadow: 0 0 8px #B9FA6A, 0 0 22px rgba(115,195,17,.85);
          transition: transform .25s cubic-bezier(.22,1,.36,1), background .25s, box-shadow .25s;
        }
        .nc-dot[data-s="hover"] i {
          transform: scale(3.2);
          background: rgba(185,250,106,.16);
          box-shadow: 0 0 0 1px rgba(185,250,106,.9), 0 0 24px rgba(115,195,17,.5);
        }
        .nc-dot[data-s="down"] i { transform: scale(.7); }
      `}</style>
      <div ref={dotRef} aria-hidden className="nc-dot">
        <i />
      </div>
    </>
  );
}