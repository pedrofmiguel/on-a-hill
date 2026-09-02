"use client";

import { motion, type Transition } from "motion/react";
import { HILLS } from "../hills";

/* The drawing is authored in this box and stretched to the viewport. Stretching
   is deliberate: the hills should always reach both edges, whatever the screen.
   Every stroke carries `vector-effect: non-scaling-stroke`, so the distortion
   moves the *curves* without ever thickening or thinning the ink — a hairline
   stays a hairline at 390px and at 2560px. */
const VW = 1600;
const VH = 900;

/* The crests sat at 44/52/60% down the screen, which was right when they were
   filled silhouettes standing behind the grass. As open lines they have to
   clear the field instead of being drawn through it — a ridge crossing the
   middle of the grass reads as a wire strung over it, not as a horizon. Lifting
   the whole set by 14% of the height puts the nearest ridge just where the
   strokes thin out into paper, so the field looks like it is growing over the
   hill rather than in front of a diagram of one.

   0.14 was not enough: the nearest ridge still crossed the top of the field and
   the headline, reading as a wire strung over both. At 0.20 the three sit
   clearly in the distance with a band of bare paper between them and the grass
   — which is not a gap so much as the middle distance, and is what makes the
   thing read as a landscape rather than as three lines and some hatching. */
const LIFT = 0.2;

/** Crest height as a fraction from the top, sampled the way the old shader
 *  sampled it: `x` runs 0..1 across the width. Same coefficients, same hills —
 *  only the medium has changed, from a fragment shader to a stroked path. */
function crest(h: (typeof HILLS)[number], x: number): number {
  return (
    h.base -
    LIFT +
    h.a1 * Math.sin(x * h.f1 + h.p1) +
    h.a2 * Math.sin(x * h.f2 + h.p2)
  );
}

/** One crest as an SVG path. Sampled rather than fitted: 96 points across the
 *  width is well under a pixel of error at any realistic display size, and it
 *  keeps this readable next to the formula it comes from. */
function crestPath(h: (typeof HILLS)[number], samples = 96): string {
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = (t * VW).toFixed(2);
    const y = (crest(h, t) * VH).toFixed(2);
    d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  }
  return d;
}

/* Back to front. Weight is the only depth cue here — no colour, no fill, no
   atmosphere — so the far ridge is drawn in the tertiary ink at a hairline and
   the near one in full ink at nearly double the width. */
const RIDGES = [
  { d: crestPath(HILLS[0]), stroke: "var(--color-ink-3)", width: 1.2, fromEnd: true },
  { d: crestPath(HILLS[1]), stroke: "var(--color-ink-2)", width: 1.7, fromEnd: false },
  { d: crestPath(HILLS[2]), stroke: "var(--color-ink)", width: 2, fromEnd: true },
];

/* The satellite's orbit, as a fraction of the viewport: `t` runs 0..1 left to
   right, and the return value is a percentage down from the top. A shallow arc
   high in the sky — it has to clear the ridges, or the craft flies through the
   hills on its way past. Both the dashed guide
   line and the satellite itself are generated from this one function, which is
   the only reason they stay glued together across every aspect ratio. */
function orbitY(t: number): number {
  return 15 - 7 * Math.sin(Math.PI * t);
}

const ORBIT_PATH = (() => {
  let d = "";
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const x = (t * VW).toFixed(2);
    const y = ((orbitY(t) / 100) * VH).toFixed(2);
    d += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
  }
  return d;
})();

/* The satellite's keyframes, sampled off the same curve. Percentages of the
   viewport, so the satellite itself never distorts the way the stretched
   drawing behind it does — it is a separate, square-pixel layer that merely
   agrees with the guide line about where the orbit is. */
const STOPS = 24;
const ORBIT_X: string[] = [];
const ORBIT_Y: string[] = [];
for (let i = 0; i <= STOPS; i++) {
  const t = i / STOPS;
  // Starts off the left edge and leaves past the right, so it is always
  // arriving from somewhere rather than spawning in view.
  ORBIT_X.push(`${(-8 + t * 116).toFixed(2)}%`);
  ORBIT_Y.push(`${orbitY(t).toFixed(2)}%`);
}

/** One full crossing. Slow enough to be scenery rather than an event: at 54s a
 *  visitor who reads the greeting and presses Enter sees it move perhaps a
 *  fifth of the way, which is the point — it should feel like it was already
 *  up there before you arrived. */
const ORBIT_SECONDS = 54;

const DRIFT: Transition = {
  duration: ORBIT_SECONDS,
  ease: "linear",
  repeat: Infinity,
  repeatType: "loop",
};

/**
 * The entrance backdrop: paper, three ink ridges, and a satellite tracking
 * across the sky on a dashed orbit.
 *
 * This replaces a WebGL starfield — a full fragment shader that drew a night
 * sky, its stars, two meteors and the same three hills as filled silhouettes.
 * Line-work needs none of that. The whole backdrop is now two small SVGs and
 * no GL context at all, which also means the gate holds one WebGL context (the
 * grass) rather than two.
 *
 * On the way out the ridges do not fade. They withdraw along their own length,
 * like a pen being lifted, by animating `stroke-dashoffset` across a dash
 * pattern exactly as long as the path. Alternating the direction per ridge
 * keeps the three from sliding off as one sheet.
 */
export default function LineSky({
  leaving = false,
  ridgesOut = false,
  reduced = false,
}: {
  /** The satellite climbs out of frame and the orbit fades. */
  leaving?: boolean;
  /** A beat later: the ridges withdraw. Scheduled by the gate rather than
   *  derived from `leaving` here, so the whole exit stays readable in one
   *  place instead of being reconstructed from delays in two files. */
  ridgesOut?: boolean;
  reduced?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        fill="none"
      >
        {/* The orbit, drawn as a surveyor's dashed line. It is the one piece of
            the sky that says this is a diagram rather than a landscape. */}
        <motion.path
          d={ORBIT_PATH}
          stroke="var(--color-rule)"
          strokeWidth={1}
          strokeDasharray="3 7"
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{
            duration: leaving ? 0.5 : 1.6,
            delay: leaving ? 0 : 0.5,
            ease: "easeOut",
          }}
        />

        {RIDGES.map((r, i) => (
          <motion.path
            key={i}
            d={r.d}
            stroke={r.stroke}
            strokeWidth={r.width}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            /* `pathLength` and `pathOffset` are motion's own props, not SVG
               attributes: it normalises the path to a length of 1 and derives
               stroke-dasharray/dashoffset from them itself.
       
               This was originally hand-rolled — pathLength={1} as a plain
               attribute plus a strokeDasharray of "1 1" and an animated
               strokeDashoffset. It silently did nothing. motion recognises
               `pathLength`, takes ownership of both dash properties, and
               overwrites them every frame, so the ridges simply sat there fully
               drawn through the entire exit. Use the library's API, not the
               CSS underneath it.
       
               pathLength 1 → 0 shrinks the visible run away; pathOffset says
               which end it retreats toward, which is what lets the three ridges
               leave in different directions instead of as one sheet. */
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{
              pathLength: ridgesOut ? 0 : 1,
              pathOffset: ridgesOut && r.fromEnd ? 1 : 0,
            }}
            transition={{
              // Drawn in back to front on arrival; pulled out front to back on
              // the way out, so the near ridge is the last thing to leave.
              duration: ridgesOut ? 0.75 : reduced ? 0 : 1.5,
              delay: ridgesOut
                ? 0.08 * (RIDGES.length - 1 - i)
                : reduced
                  ? 0
                  : 0.15 * i,
              ease: ridgesOut ? [0.7, 0, 0.84, 0] : [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </svg>

      <Satellite leaving={leaving} reduced={reduced} />
    </div>
  );
}

/* Drawn at its own scale in its own little box, then flown across the screen by
   the wrapper. Keeping the craft out of the stretched SVG is what stops it
   turning into a squashed lozenge on a wide monitor. */
function Satellite({ leaving, reduced }: { leaving: boolean; reduced: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{ width: 74, height: 44, marginLeft: -37, marginTop: -22 }}
      initial={{ left: ORBIT_X[0], top: ORBIT_Y[0], opacity: 0 }}
      animate={
        leaving
          ? // Not a fade: it climbs out of frame under its own power, which is
            // the only exit that keeps it a machine rather than a decal.
            { opacity: 0, y: -140, scale: 0.7 }
          : { left: ORBIT_X, top: ORBIT_Y, opacity: 1 }
      }
      transition={
        leaving
          ? { duration: 1.1, ease: [0.6, 0, 0.9, 0] }
          : {
              left: reduced ? { duration: 0 } : DRIFT,
              top: reduced ? { duration: 0 } : DRIFT,
              opacity: { duration: 1.4, delay: 0.8, ease: "easeOut" },
            }
      }
    >
      <motion.svg
        viewBox="0 0 74 44"
        fill="none"
        className="h-full w-full"
        /* A slow roll. Satellites are not rigid in the sky and a dead-level
           one reads as a sticker; ±3° over half a minute is barely visible
           frame to frame and completely changes how alive it looks. */
        animate={reduced ? undefined : { rotate: [-3, 3, -3] }}
        transition={{ duration: 26, ease: "easeInOut", repeat: Infinity }}
      >
        <g
          stroke="var(--color-ink)"
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          {/* Booms out to the panels. */}
          <path d="M20 22h7M47 22h7" />

          {/* Solar panels — a rectangle each, ruled into cells. Three lines is
              enough to say "panel"; more turns to moiré at this size. */}
          <rect x={2} y={11} width={18} height={22} />
          <path d="M8 11v22M14 11v22M2 22h18" />
          <rect x={54} y={11} width={18} height={22} />
          <path d="M60 11v22M66 11v22M54 22h18" />

          {/* The bus. */}
          <rect x={27} y={13} width={20} height={18} rx={2} />
          <path d="M27 19h20" />

          {/* Dish, on its stalk, pointed back down at the hill. */}
          <path d="M37 31v5" />
          <path d="M31 40a7 7 0 0 1 12 0" />

          {/* Antenna. */}
          <path d="M37 13V6" />
        </g>

        {/* The beacon. The one moving part that is not the craft itself, and
            the only thing on this screen allowed to use the accent. */}
        <motion.circle
          cx={37}
          cy={4}
          r={2}
          fill="var(--color-accent)"
          animate={reduced ? undefined : { opacity: [1, 1, 0.15, 1] }}
          transition={{
            duration: 3.4,
            times: [0, 0.55, 0.72, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
    </motion.div>
  );
}
