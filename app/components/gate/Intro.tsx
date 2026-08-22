"use client";

import { motion, useReducedMotion } from "motion/react";

// Soft clouds. Positions/sizes are fixed (no random) so the composition is
// intentional and stable; the drift is slow enough to read as "the air is
// moving" rather than "something is animating". Cool grey-blue so they're
// visible on white without shouting.
const CLOUDS = [
  { top: "6%", left: "-8%", size: 680, dur: "48s", fromX: "-3%", toX: "6%", fromY: "0%", toY: "-3%", o: 0.85 },
  { top: "30%", left: "60%", size: 780, dur: "60s", fromX: "5%", toX: "-5%", fromY: "2%", toY: "-2%", o: 0.7 },
  { top: "58%", left: "4%", size: 620, dur: "54s", fromX: "-2%", toX: "5%", fromY: "-1%", toY: "2%", o: 0.75 },
  { top: "66%", left: "56%", size: 720, dur: "66s", fromX: "3%", toX: "-4%", fromY: "1%", toY: "-3%", o: 0.6 },
  { top: "-6%", left: "34%", size: 560, dur: "58s", fromX: "-4%", toX: "3%", fromY: "0%", toY: "2%", o: 0.55 },
];

const CLOUD_BG =
  "radial-gradient(circle at 50% 50%, oklch(0.84 0.012 85) 0%, oklch(0.89 0.008 85 / 0.55) 40%, transparent 68%)";

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
      <div aria-hidden className="absolute inset-0">
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className={reduced ? "absolute rounded-full" : "cloud-drift absolute rounded-full"}
            style={
              {
                top: c.top,
                left: c.left,
                width: c.size,
                height: c.size,
                opacity: c.o,
                background: CLOUD_BG,
                filter: "blur(34px)",
                "--dur": c.dur,
                "--fromX": c.fromX,
                "--toX": c.toX,
                "--fromY": c.fromY,
                "--toY": c.toY,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

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
