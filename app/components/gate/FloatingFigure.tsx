"use client";

import { motion } from "motion/react";

/**
 * Pedro, floating.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  PLACEHOLDER. This is a stand-in I drew so the scene could be composed and
 *  judged as a whole. It is not the illustration Pedro sent.
 *
 *  To swap in the real one, follow what `HeroPortrait` already does — that
 *  component is his own vector used as-is, and is the pattern here:
 *
 *    1. Export the artwork as SVG (a single path is ideal) and drop the `d`
 *       string in place of everything inside `<Figure/>` below.
 *    2. Crop the viewBox to the artwork. HeroPortrait's note is worth heeding:
 *       its source was 1536x1024 with the ink occupying only 823x574, so used
 *       raw it carried a third of its own width as invisible padding and
 *       refused to sit where it was put.
 *    3. Use `var(--color-ink)` rather than the file's #000, so the drawing
 *       belongs to the same palette as everything else.
 *    4. If the export is a PNG rather than a vector, it needs a transparent
 *       background — the page is paper (#f2efe9), and a white box would show.
 *
 *  Everything outside `<Figure/>` — the drift, the bob, the exit — is real and
 *  will carry over unchanged.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * The motion is two loops of different lengths running at once: a slow vertical
 * bob and an even slower roll. Deliberately not the same period — matched
 * periods make a figure look like it is on a spring, and the whole point of
 * weightlessness is that nothing is returning it to a resting position.
 */
export default function FloatingFigure({
  drawn = false,
  leaving = false,
  reduced = false,
}: {
  drawn?: boolean;
  leaving?: boolean;
  reduced?: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      /* Off to one side, not in the middle. Centred it sat under the greeting
         and behind the Enter button — the figure has to share this screen with
         the only two pieces of type on it, and the middle belongs to them. */
      className="pointer-events-none absolute left-[22%] top-[60%] w-[min(30vw,9rem)] -translate-x-1/2 -translate-y-1/2 sm:left-[20%] sm:top-[58%] sm:w-[min(18vw,11rem)]"
      initial={{ opacity: 0, y: 24 }}
      animate={
        leaving
          ? // Drifts up and away, turning as it goes. It is weightless; it
            // should leave the way it has been sitting there, not blink out.
            { opacity: 0, y: -160, rotate: -14, scale: 0.9 }
          : { opacity: drawn ? 1 : 0, y: 0 }
      }
      transition={
        leaving
          ? { duration: 1.2, ease: [0.6, 0, 0.9, 0] }
          : { duration: 1.3, delay: drawn ? 0.5 : 0, ease: [0.16, 1, 0.3, 1] }
      }
    >
      <motion.div
        animate={reduced || leaving ? undefined : { y: [-10, 10, -10] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      >
        <motion.div
          animate={reduced || leaving ? undefined : { rotate: [-5, 4, -5] }}
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
        >
          <Figure />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* Geometry rather than draughtsmanship: capsules, circles and one rounded box.
   The reference is a loose hand-drawn figure and this is not trying to be it —
   at 11rem a faithful copy of that line quality turns to mush, and a clean
   simple shape survives the size. It is a placeholder; see the note above. */
function Figure() {
  return (
    <svg viewBox="0 0 200 250" fill="none" className="h-auto w-full">
      <g
        stroke="var(--color-ink)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* Life-support pack, behind everything. */}
        <rect x={72} y={92} width={56} height={54} rx={10} />

        {/* Limbs first, so the torso and helmet sit over their joints and no
            seam shows where they meet. */}
        {/* Waving arm. */}
        <g transform="rotate(-38 74 108)">
          <rect x={58} y={44} width={30} height={68} rx={15} />
        </g>
        <circle cx={40} cy={70} r={14} />
        {/* Trailing arm. */}
        <g transform="rotate(28 126 108)">
          <rect x={112} y={100} width={30} height={66} rx={15} />
        </g>
        <circle cx={158} cy={158} r={14} />
        {/* Legs. */}
        <g transform="rotate(20 84 176)">
          <rect x={69} y={168} width={32} height={70} rx={16} />
        </g>
        <g transform="rotate(-14 120 176)">
          <rect x={105} y={168} width={32} height={74} rx={16} />
        </g>

        {/* The suit. */}
        <rect x={62} y={96} width={76} height={92} rx={30} />
        {/* Chest panel. */}
        <rect x={80} y={116} width={40} height={26} rx={5} />
        <circle cx={91} cy={129} r={4} />
        <path d="M103,126h10M103,133h7" />
        {/* Waist band — the one straight line in a drawing of curves. */}
        <path d="M65,164h70" />

        {/* Collar, then the helmet seated on it. */}
        <path d="M80,98a22,10 0 0 1 40,0" />
        <circle cx={100} cy={58} r={40} />

        {/* Glasses, closed eyes, and a smile: the whole face. Drawing a head
            outline inside the helmet as well only makes two circles fighting. */}
        <circle cx={87} cy={54} r={9} />
        <circle cx={113} cy={54} r={9} />
        <path d="M96,54h8" />
        <path d="M83,54a5,5 0 0 0 8,0M109,54a5,5 0 0 0 8,0" />
        <path d="M92,72a10,8 0 0 0 16,0" />
      </g>

      {/* Hair, filled — the one solid in an outlined drawing, exactly as in the
          reference. It is what stops the head reading as an empty bowl. */}
      <path
        d="M68,44c2,-18 15,-30 32,-30c17,0 30,12 32,30c-6,-8 -14,-12 -22,-11c-9,1 -16,6 -23,10c-7,4 -14,5 -19,1Z"
        fill="var(--color-ink)"
      />
    </svg>
  );
}
