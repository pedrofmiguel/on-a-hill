// Hill crest curves for the entrance backdrop.
//
// `x` runs 0..1 across the width and the result is a fraction down from the
// top. These coefficients outlived the fragment shader that used to evaluate
// them per pixel: LineSky now samples the same functions in JS and stroke them
// as SVG paths, so the hills are the same hills, drawn instead of filled.

export const HILLS = [
  {
    name: "far",
    base: 0.44,
    a1: 0.028,
    f1: 1.6,
    p1: 0.4,
    a2: 0.014,
    f2: 4.2,
    p2: 1.6,
  },
  {
    name: "mid",
    base: 0.52,
    a1: 0.034,
    f1: 2.2,
    p1: 1.0,
    a2: 0.018,
    f2: 5.5,
    p2: 0.2,
  },
  {
    name: "near",
    base: 0.60,
    a1: 0.038,
    f1: 2.8,
    p1: 0.7,
    a2: 0.022,
    f2: 6.5,
    p2: 2.0,
  },
] as const;

/** Primary crest — the foreground hill line (near layer). */
export const CREST = HILLS[2];

/** Crest height as a fraction from the TOP of the viewport (0 = top, 1 = bottom). */
export function crestY(x: number): number {
  return (
    CREST.base +
    CREST.a1 * Math.sin(x * CREST.f1 + CREST.p1) +
    CREST.a2 * Math.sin(x * CREST.f2 + CREST.p2)
  );
}
