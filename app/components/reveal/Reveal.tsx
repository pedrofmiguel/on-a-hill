"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRevealed } from "./store";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fades and lifts its children in once the entrance gate has handed off.
 *
 * Stagger by passing increasing `delay` values down a page — the delays are
 * intentionally hand-placed rather than automatic, so the order reads as
 * composed (label, then headline, then the quiet supporting line).
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.9,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  /** Use "span" inside headings and paragraphs, where a div would be invalid. */
  as?: "div" | "span";
}) {
  const ready = useRevealed();
  const reduced = useReducedMotion();

  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, y: 0 };

  const Tag = as === "span" ? motion.span : motion.div;

  return (
    <Tag
      data-reveal
      className={className}
      initial={hidden}
      animate={ready ? shown : hidden}
      transition={{
        duration: reduced ? 0.35 : duration,
        ease: EASE,
        delay: ready && !reduced ? delay : 0,
      }}
    >
      {children}
    </Tag>
  );
}
