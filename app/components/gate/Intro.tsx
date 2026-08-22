"use client";

import { motion, useReducedMotion } from "motion/react";
import CloudField from "../site/CloudField";


/**
 * The first thing a visitor sees: a clean sheet of paper with a black
 * greeting, over a smooth, low drift of soft clouds. It sits on the same paper
 * the site itself is printed on, so the very first and very last frames of the
 * entrance rhyme.
 */
export default function Intro() {
  const reduced = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      <CloudField />

      {/* Gentle vignette so the centre greeting stays crisp over the clouds. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, oklch(0.96 0.008 85 / 0.8) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="display-soft text-base text-ink sm:text-lg md:text-xl"
        >
          thanks for coming all this way
        </motion.h1>
      </div>
    </div>
  );
}
