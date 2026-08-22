// Hill crest curves shared by the WebGL backdrop (WindHillCanvas).
// Each layer is drawn back-to-front for a simple rolling-hill silhouette.

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

function hillGlsl(name: string, h: (typeof HILLS)[number]): string {
  return `
float hill_${name}(float x){
  return ${h.base.toFixed(4)}
    + ${h.a1.toFixed(4)} * sin(x * ${h.f1.toFixed(4)} + ${h.p1.toFixed(4)})
    + ${h.a2.toFixed(4)} * sin(x * ${h.f2.toFixed(4)} + ${h.p2.toFixed(4)});
}`;
}

/** GLSL hill crest helpers injected into the fragment shader. */
export const HILLS_GLSL = HILLS.map((h) => hillGlsl(h.name, h)).join("\n");
