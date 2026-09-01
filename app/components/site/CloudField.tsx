"use client";

import { useReducedMotion } from "motion/react";

/**
 * The soft drifting cloud bed from the entrance screen, extracted so the hero
 * can stand on the same weather.
 *
 * Positions and sizes are fixed rather than random, so the composition is
 * deliberate and identical on every load, and the drift is slow enough to read
 * as "the air is moving" rather than "something is animating".
 */
const CLOUDS = [
  { top: "6%", left: "-8%", size: 680, dur: "48s", fromX: "-3%", toX: "6%", fromY: "0%", toY: "-3%", o: 0.85 },
  { top: "30%", left: "60%", size: 780, dur: "60s", fromX: "5%", toX: "-5%", fromY: "2%", toY: "-2%", o: 0.7 },
  { top: "58%", left: "4%", size: 620, dur: "54s", fromX: "-2%", toX: "5%", fromY: "-1%", toY: "2%", o: 0.75 },
  { top: "66%", left: "56%", size: 720, dur: "66s", fromX: "3%", toX: "-4%", fromY: "1%", toY: "-3%", o: 0.6 },
  { top: "-6%", left: "34%", size: 560, dur: "58s", fromX: "-4%", toX: "3%", fromY: "0%", toY: "2%", o: 0.55 },
];

const CLOUD_BG =
  "radial-gradient(circle at 50% 50%, oklch(0.84 0.012 85) 0%, oklch(0.89 0.008 85 / 0.55) 40%, transparent 68%)";

export default function CloudField({
  /** Scales every cloud's opacity. The hero wants them fainter than the
   *  entrance screen does, since type has to sit on top of them. */
  intensity = 1,
  className = "",
}: {
  intensity?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className={
            reduced ? "absolute rounded-full" : "cloud-drift absolute rounded-full"
          }
          style={
            {
              top: c.top,
              left: c.left,
              width: c.size,
              height: c.size,
              opacity: c.o * intensity,
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
  );
}
