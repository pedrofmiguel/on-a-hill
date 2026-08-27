"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Reveals its children as they scroll into view.
 *
 * Distinct from `Reveal`, which waits on the entrance gate's one-shot latch and
 * fires everything on a page at once. This one is per-element and triggered by
 * the viewport, which is what a timeline wants: each entry arrives as you reach
 * it rather than all of them the moment the page loads.
 *
 * `once` so a row settles and stays settled — re-animating on the way back up
 * turns a long page into a flicker book.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      // Picked up by the <noscript> rule in layout.tsx, so these stay visible
      // when there is no JS to animate them.
      data-reveal
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      // Fire a little before the element is fully on screen, so the motion is
      // finishing as it reaches comfortable reading position.
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduced ? 0.3 : 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
