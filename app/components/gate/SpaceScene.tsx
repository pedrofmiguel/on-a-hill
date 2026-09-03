"use client";

import { motion, type Transition } from "motion/react";
import FloatingFigure from "./FloatingFigure";
import Globe from "./Globe";

/* The drawing is authored in this box and stretched to the viewport. Stretching
   is deliberate: the planet should always reach both edges, whatever the screen.
   Every stroke carries `vector-effect: non-scaling-stroke`, so the distortion
   moves the *curves* without ever thickening or thinning the ink — a hairline
   stays a hairline at 390px and at 2560px. */
const VW = 1600;
const VH = 900;

/* Stars, as percentages of the viewport rather than points in the drawing.

   They used to live in the stretched SVG, which turned every one of them into a
   vertical dash on a phone: a cross is the one shape that cannot survive a
   non-uniform scale, because it is defined entirely by its two arms being
   equal. Positioned in percent and drawn at a fixed pixel size, they stay
   crosses at any aspect.

   Fixed positions rather than random ones: the scene is server-rendered and
   then hydrated, and a random field would differ between the two passes. Kept
   out of the lower third, where the planet is. */
const STARS = [
  [7.5, 10.7], [19.9, 18.7], [13.4, 33.3], [6, 44.7], [26.9, 8.2], [35, 23.8],
  [43, 13.1], [52.8, 29.1], [60.4, 10.2], [68, 23.1], [75.6, 13.6], [84.5, 29.8],
  [91.9, 17.6], [95.3, 38.2], [46.4, 39.6], [24.1, 48], [72.5, 44], [37.8, 52.2],
  [88.8, 50.2], [16.8, 23.8], [64.5, 36.7], [55, 47.6],
] as const;

/* Two satellites on their own tracks. `t` runs 0..1 across the width and the
   result is a percentage down from the top, so both the dashed guide and the
   craft riding it come from one function — the only reason they stay glued
   together across aspect ratios. */
const TRACKS = [
  {
    y: (t: number) => 17 - 6 * Math.sin(Math.PI * t),
    size: 74,
    seconds: 54,
    startAt: 0.2,
    reverse: false,
  },
  {
    // Kept in the sky with the first one. At 40% this track ran straight
    // through the greeting, and a satellite crossing behind a headline reads as
    // a mistake rather than as depth — everything below the type belongs to the
    // planet and the figure.
    y: (t: number) => 28 + 4 * Math.sin(Math.PI * t),
    size: 46,
    seconds: 86,
    startAt: 0.62,
    reverse: true,
  },
];

const STOPS = 24;

/** Guide line for a track, in the stretched drawing's coordinates. */
function trackPath(track: (typeof TRACKS)[number]): string {
  let d = "";
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const x = t * VW;
    const y = (track.y(t) / 100) * VH;
    d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

/* Keyframes for a craft, as viewport percentages so it never inherits the
   backdrop's distortion.

   The cycle is rotated to *begin* partway along. That is not a flourish: this
   screen doubles as the loading state, and a craft starting at -8% spends the
   entire wait outside the frame — a blank sheet of paper with nothing on it.
   Rotating moves the loop's discontinuity (the jump from one edge to the other)
   to a point where it is off-screen at both ends, so it cannot be seen. */
function trackKeyframes(track: (typeof TRACKS)[number]) {
  const xs: string[] = [];
  const ys: string[] = [];
  for (let i = 0; i <= STOPS; i++) {
    const t = ((i / STOPS + track.startAt) % 1 + 1) % 1;
    const along = track.reverse ? 1 - t : t;
    xs.push(`${(-8 + along * 116).toFixed(2)}%`);
    ys.push(`${track.y(t).toFixed(2)}%`);
  }
  return { xs, ys };
}

/* Meteors. Short, infrequent, and never near the middle of the screen, where
   the greeting sits. `delay` staggers them so they never streak in unison —
   two meteors on the same frame reads as a glitch, not as weather. */
const METEORS = [
  { x: 18, y: 12, len: 92, angle: 28, delay: 2.4, every: 11 },
  { x: 68, y: 30, len: 66, angle: 34, delay: 7.1, every: 15 },
  { x: 88, y: 8, len: 78, angle: 24, delay: 12.6, every: 19 },
];

/**
 * The entrance backdrop: paper, a wireframe globe too large for the frame,
 * satellites on dashed tracks, the occasional meteor, and a figure floating
 * above the world.
 *
 * This replaces a drawn hill, which replaced a WebGL starfield. With the grass
 * gone there is no GL context anywhere on the site — the whole entrance is now
 * two SVGs and some transforms.
 *
 * On the way out nothing fades. Every line of the globe withdraws along its own
 * length, like a pen being lifted, by animating motion's `pathLength`; the craft
 * climb away; the figure drifts up out of frame.
 */
export default function SpaceScene({
  drawn = false,
  leaving = false,
  linesOut = false,
  reduced = false,
}: {
  /** Fonts are up: start drawing. Until this flips only the satellites and the
   *  stars are on the paper, and the screen reads as a drawing not yet made. */
  drawn?: boolean;
  /** The satellites climb out of frame, the figure drifts away. */
  leaving?: boolean;
  /** A beat later: the globe is pulled off, line by line. */
  linesOut?: boolean;
  reduced?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      {/* Tracks. Stretched to the viewport on purpose — they are gentle open
          curves and distortion only changes how lazily they sweep, which is
          exactly what you want a satellite's path to do on any screen. */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        fill="none"
      >
        {TRACKS.map((track, i) => (
          <motion.path
            key={`track-${i}`}
            d={trackPath(track)}
            stroke="var(--color-rule)"
            strokeWidth={1}
            strokeDasharray="3 7"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: leaving ? 0 : 1 }}
            transition={{
              duration: leaving ? 0.5 : 1.2,
              delay: leaving ? 0 : 0.1,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      <Stars drawn={drawn} leaving={leaving} />

      {/* The planet keeps its proportions.

          `xMidYMax slice` rather than `none`: the limb is an arc of a circle and
          the whole illusion depends on how shallow it is. Stretched to a phone
          it became a steep dome sitting on the bottom of the screen — a ball,
          not the edge of a world. Slicing preserves the curve and crops instead,
          and anchoring to YMax keeps the horizon pinned to the bottom of the
          frame whatever the aspect, which is the one thing about it that must
          not move. */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <Globe drawn={drawn} out={linesOut} reduced={reduced} />
      </svg>

      {TRACKS.map((track, i) => (
        <Satellite key={i} track={track} leaving={leaving} reduced={reduced} />
      ))}

      {METEORS.map((m, i) => (
        <Meteor key={i} meteor={m} leaving={leaving} reduced={reduced} />
      ))}

      <FloatingFigure leaving={leaving} drawn={drawn} reduced={reduced} />
    </div>
  );
}

/* Stars as small crosses rather than dots. A dot at this size is a speck of
   dust on the screen; two crossed hairlines read as a mark someone made. */
function Stars({ drawn, leaving }: { drawn: boolean; leaving: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {STARS.map(([x, y], i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{ left: `${x}%`, top: `${y}%`, width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : drawn ? 0.75 : 0.3 }}
          transition={{
            // Scattered arrival, so the field doesn't switch on as one sheet.
            duration: leaving ? 0.4 : 1.1,
            delay: leaving ? 0 : (i % 7) * 0.09,
            ease: "easeOut",
          }}
        >
          <svg viewBox="0 0 11 11" fill="none" className="h-full w-full">
            <path d="M0.5,5.5h10M5.5,0.5v10" stroke="var(--color-ink-3)" strokeWidth={1} />
          </svg>
        </motion.span>
      ))}
    </div>
  );
}

/* Drawn at its own scale in its own little box, then flown across the screen by
   the wrapper. Keeping the craft out of the stretched SVG is what stops it
   turning into a squashed lozenge on a wide monitor. */
function Satellite({
  track,
  leaving,
  reduced,
}: {
  track: (typeof TRACKS)[number];
  leaving: boolean;
  reduced: boolean;
}) {
  const { xs, ys } = trackKeyframes(track);
  const drift: Transition = {
    duration: track.seconds,
    ease: "linear",
    repeat: Infinity,
    repeatType: "loop",
  };
  const h = Math.round((track.size / 74) * 44);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        width: track.size,
        height: h,
        marginLeft: -track.size / 2,
        marginTop: -h / 2,
      }}
      initial={{ left: xs[0], top: ys[0], opacity: 0 }}
      animate={
        leaving
          ? // Not a fade: it climbs out under its own power, which is the only
            // exit that keeps it a machine rather than a decal.
            { opacity: 0, y: -140, scale: 0.7 }
          : { left: xs, top: ys, opacity: 1 }
      }
      transition={
        leaving
          ? { duration: 1.1, ease: [0.6, 0, 0.9, 0] }
          : {
              left: reduced ? { duration: 0 } : drift,
              top: reduced ? { duration: 0 } : drift,
              // Up almost at once: while everything else waits, the satellites
              // are what tell the visitor the page is alive rather than broken.
              opacity: { duration: 0.7, delay: 0.1, ease: "easeOut" },
            }
      }
    >
      <motion.svg
        viewBox="0 0 74 44"
        fill="none"
        className="h-full w-full"
        style={{ transform: track.reverse ? "scaleX(-1)" : undefined }}
        /* A slow roll. Satellites are not rigid in the sky and a dead-level one
           reads as a sticker; ±3° over half a minute is barely visible frame to
           frame and completely changes how alive it looks. */
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
          <path d="M20 22h7M47 22h7" />
          {/* Solar panels — a rectangle each, ruled into cells. Three lines is
              enough to say "panel"; more turns to moiré at this size. */}
          <rect x={2} y={11} width={18} height={22} />
          <path d="M8 11v22M14 11v22M2 22h18" />
          <rect x={54} y={11} width={18} height={22} />
          <path d="M60 11v22M66 11v22M54 22h18" />
          <rect x={27} y={13} width={20} height={18} rx={2} />
          <path d="M27 19h20" />
          <path d="M37 31v5" />
          <path d="M31 40a7 7 0 0 1 12 0" />
          <path d="M37 13V6" />
        </g>

        {/* The beacon — the one thing on this screen allowed the accent. */}
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

/* A meteor is a head and a tail and nothing else. It runs, then waits a long
   time — `repeatDelay` is what keeps this scenery instead of a fireworks
   display. Reduced motion gets none: a fast streak across the periphery is
   exactly the kind of movement that setting exists to suppress. */
function Meteor({
  meteor,
  leaving,
  reduced,
}: {
  meteor: (typeof METEORS)[number];
  leaving: boolean;
  reduced: boolean;
}) {
  if (reduced) return null;

  const rad = (meteor.angle * Math.PI) / 180;
  const dx = Math.cos(rad) * meteor.len;
  const dy = Math.sin(rad) * meteor.len;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: `${meteor.x}%`, top: `${meteor.y}%`, width: 1, height: 1 }}
      initial={{ opacity: 0 }}
      animate={
        leaving
          ? { opacity: 0 }
          : { opacity: [0, 0, 1, 1, 0], x: [0, 0, dx * 0.35, dx, dx * 1.15], y: [0, 0, dy * 0.35, dy, dy * 1.15] }
      }
      transition={
        leaving
          ? { duration: 0.3 }
          : {
              duration: 1.6,
              times: [0, 0.05, 0.35, 0.85, 1],
              ease: "easeIn",
              repeat: Infinity,
              repeatDelay: meteor.every,
              delay: meteor.delay,
            }
      }
    >
      <svg
        width={meteor.len}
        height={meteor.len}
        viewBox={`0 0 ${meteor.len} ${meteor.len}`}
        fill="none"
        style={{ transform: `translate(-100%, -100%) rotate(${meteor.angle}deg)`, transformOrigin: "100% 100%" }}
      >
        <path
          d={`M0,0 L${meteor.len - 4},${meteor.len - 4}`}
          stroke="var(--color-ink-3)"
          strokeWidth={1}
          strokeDasharray="2 5"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={meteor.len - 3} cy={meteor.len - 3} r={2} fill="var(--color-ink)" />
      </svg>
    </motion.div>
  );
}
