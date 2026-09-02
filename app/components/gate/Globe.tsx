"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

/* Geometry, in the drawing's own 1600x900 box. The globe is deliberately larger
   than the frame can hold: its centre sits well below the bottom edge, so what
   is on screen is the top of a world rather than a ball resting on the floor.
   Cropping is what sells the scale — a sphere you can see all of is an object,
   and a sphere you cannot is a place. */
const CX = 800;
/* Dropped from 1120. The crown of the globe landed at 62% of the height, which
   put it directly under the Enter button — the one thing on this screen a
   visitor has to press was sitting on the north pole. At 1215 the horizon of
   the world clears the button with room to spare and the sky above it stays
   open for the type. */
const CY = 1215;
const R = 560;

/** How far the viewpoint sits above the equatorial plane. At 0 the parallels
 *  collapse to straight lines and the globe reads as a flat disc with stripes;
 *  much past 30° and you are looking down at a dome. 18° is enough to see the
 *  curvature of the latitude lines without the poles coming into view. */
const TILT = (18 * Math.PI) / 180;
const SIN_T = Math.sin(TILT);
const COS_T = Math.cos(TILT);

const MERIDIANS = 12;
const PARALLELS = [-60, -30, 0, 30, 60];
const SAMPLES = 64;

/** One full turn. Slower than it sounds: at 78s a visitor sees perhaps a tenth
 *  of a rotation, which is the point — a globe that visibly spins is a widget,
 *  and this should read as something that was already turning. */
const SECONDS_PER_TURN = 78;

/* Orthographic projection. A point on the sphere, viewed from infinitely far
   away, tilted about the horizontal axis. `sy` is negated because SVG's y axis
   points down and the sphere's does not. */
function project(x: number, y: number, z: number): [number, number] {
  return [CX + x, CY - (y * COS_T - z * SIN_T)];
}

/* A meridian: the great circle through both poles at longitude `lon`.

   Traced as a whole circle rather than the visible half. Each meridian is
   entirely in front of or entirely behind the sphere — for a fixed longitude
   the sign of cos(lon) never changes with latitude — so a front/back split
   would make every meridian pop in and out. It would pop exactly at the limb,
   where the meridian lies along the outline and the change is invisible, but
   drawing the whole circle is simpler and gives the better result anyway: you
   can see through the globe, which is what a wireframe is for. */
function meridianPath(lon: number): string {
  let d = "";
  const s = Math.sin(lon);
  const c = Math.cos(lon);
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * Math.PI * 2;
    const ct = Math.cos(t);
    const [x, y] = project(R * ct * s, R * Math.sin(t), R * ct * c);
    d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

/* A parallel: the circle of latitude at `lat` radians.
   These do not move. Spinning a sphere about its polar axis maps every circle
   of latitude onto itself, so the parallels are computed once and never touched
   again — only the meridians are redrawn each frame. */
function parallelPath(lat: number): string {
  let d = "";
  const cy = Math.sin(lat);
  const r = Math.cos(lat);
  for (let i = 0; i <= SAMPLES; i++) {
    const u = (i / SAMPLES) * Math.PI * 2;
    const [x, y] = project(R * r * Math.sin(u), R * cy, R * r * Math.cos(u));
    d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

const PARALLEL_PATHS = PARALLELS.map((deg) => parallelPath((deg * Math.PI) / 180));
const LONGITUDES = Array.from({ length: MERIDIANS }, (_, i) => (i * Math.PI * 2) / MERIDIANS);
/** Rendered on the server and on the first client frame, so the two agree. */
const INITIAL_MERIDIANS = LONGITUDES.map((lon) => meridianPath(lon));

/** The silhouette, and the atmosphere standing off it. */
const OUTLINE = `M${CX - R},${CY} a${R},${R} 0 1,0 ${R * 2},0 a${R},${R} 0 1,0 ${-R * 2},0`;
const HALO_R = R + 26;
const HALO = `M${CX - HALO_R},${CY} a${HALO_R},${HALO_R} 0 1,0 ${HALO_R * 2},0 a${HALO_R},${HALO_R} 0 1,0 ${-HALO_R * 2},0`;

/**
 * A wireframe globe, spun by redrawing its meridians.
 *
 * There is no 2D transform that rotates a sphere. Under orthographic projection
 * each meridian is an ellipse whose shape *and* tilt change as the globe turns,
 * so CSS cannot do it and neither can a scale trick — the honest way is to
 * sample the sphere and rebuild the paths. That is twelve paths of 64 points a
 * frame, which is nothing.
 *
 * Only the meridians are rebuilt. The parallels are invariant under rotation
 * about the polar axis, and the outline is a circle.
 *
 * `d` is written straight to the DOM rather than held in state: at 60fps a
 * state update per frame would re-render this subtree sixty times a second for
 * no reason, and React has nothing to reconcile here. motion still owns
 * `pathLength` on the same elements, which is what lets the globe draw itself on
 * and pull itself off — the two do not collide, because `pathLength="1"`
 * normalises the dash to the path's own length however that length changes.
 */
export default function Globe({
  drawn = false,
  out = false,
  reduced = false,
}: {
  drawn?: boolean;
  out?: boolean;
  reduced?: boolean;
}) {
  const meridians = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const spin = ((now - started) / 1000 / SECONDS_PER_TURN) * Math.PI * 2;
      for (let i = 0; i < LONGITUDES.length; i++) {
        const el = meridians.current[i];
        if (el) el.setAttribute("d", meridianPath(LONGITUDES[i] + spin));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  /* Shared by every line on the globe. The stagger is by index rather than by
     kind, so the sphere assembles itself as a mesh instead of arriving as three
     separate layers of hardware. */
  const draw = (i: number, total: number) => ({
    initial: { pathLength: 0, pathOffset: 0 },
    animate: { pathLength: out || !drawn ? 0 : 1, pathOffset: out ? 1 : 0 },
    transition: {
      duration: out ? 0.7 : reduced ? 0 : 1.5,
      delay: out ? (i / total) * 0.25 : reduced ? 0 : 0.1 + (i / total) * 0.5,
      ease: out ? ([0.7, 0, 0.84, 0] as const) : ([0.16, 1, 0.3, 1] as const),
    },
  });

  const total = 2 + PARALLEL_PATHS.length + LONGITUDES.length;

  return (
    <g fill="none">
      {/* Atmosphere. */}
      <motion.path
        d={HALO}
        stroke="var(--color-ink-3)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        {...draw(0, total)}
      />

      {/* The mesh, drawn under the silhouette so the outline stays crisp where
          the meridians crowd together at the limb. */}
      {PARALLEL_PATHS.map((d, i) => (
        <motion.path
          key={`par-${i}`}
          d={d}
          stroke={PARALLELS[i] === 0 ? "var(--color-ink-2)" : "var(--color-ink-3)"}
          strokeWidth={PARALLELS[i] === 0 ? 1.4 : 1}
          vectorEffect="non-scaling-stroke"
          {...draw(2 + i, total)}
        />
      ))}

      {INITIAL_MERIDIANS.map((d, i) => (
        <motion.path
          key={`mer-${i}`}
          ref={(el) => {
            meridians.current[i] = el;
          }}
          d={d}
          stroke="var(--color-ink-3)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          {...draw(2 + PARALLEL_PATHS.length + i, total)}
        />
      ))}

      {/* The silhouette, last and heaviest. It is the only line that says where
          the world ends. */}
      <motion.path
        d={OUTLINE}
        stroke="var(--color-ink)"
        strokeWidth={2.2}
        vectorEffect="non-scaling-stroke"
        {...draw(1, total)}
      />
    </g>
  );
}
