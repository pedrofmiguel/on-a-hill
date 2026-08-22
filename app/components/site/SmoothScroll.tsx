"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Weighted scrolling: the page keeps moving for a moment after the wheel stops,
 * instead of snapping to a halt.
 *
 * The instance is kept on `window` so the two places that take the page over —
 * the entrance gate and the full-screen menu — can stop it rather than fight
 * it. `overflow: hidden` on <body> does not stop Lenis on its own, because
 * Lenis drives scroll from wheel and touch events rather than from the
 * scrollbar.
 */
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    // Smoothing hijacks the scroll wheel, which is exactly what someone asking
    // for reduced motion is asking us not to do.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // ~1s of glide. Long enough to feel weighted, short enough that the page
      // still arrives where you pointed it.
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      // Touch devices already have momentum scrolling from the OS, and doubling
      // it up feels broken.
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

/** Freeze/thaw the page scroll from anywhere (gate, menu, modal). */
export function setScrollLocked(locked: boolean) {
  if (typeof window === "undefined") return;
  if (locked) window.__lenis?.stop();
  else window.__lenis?.start();
}
