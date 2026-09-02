"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LineSky from "./gate/LineSky";

// Three.js is heavy — load the grass foreground only on the client, after first
// paint, so the drawing shows instantly and the bundle stays lean.
const GrassField = dynamic(() => import("./GrassField"), { ssr: false });

/**
 * The "world" layer: a drawn one. Paper, three ink ridges and a satellite on a
 * dashed orbit, with a field of ink strokes for grass in front of them.
 *
 * This used to be a starry night — a WebGL sky shader with stars, meteors and
 * filled hill silhouettes, plus a film-grain pass over the top. All of that is
 * gone. The backdrop is SVG now, which means it paints on the first frame with
 * no GL context of its own, and the gate holds one WebGL context instead of
 * two.
 *
 * Fills its nearest positioned ancestor (the entrance gate), so it's
 * `absolute`, not `fixed`.
 */
export default function Scene({
  drawn = false,
  leaving = false,
  ridgesOut = false,
  dissolving = false,
  reduced = false,
  onGrassReady,
}: {
  /** The field has painted; the ridges may start being drawn. */
  drawn?: boolean;
  /** Raised once, when the field's first frame lands. */
  onGrassReady?: () => void;
  /** The exit has begun: the satellite climbs away and the orbit fades. */
  leaving?: boolean;
  /** Later still — the ridges withdraw along their own length. */
  ridgesOut?: boolean;
  /** A beat after `leaving` — the field tears loose and blows downwind. */
  dissolving?: boolean;
  reduced?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  // Only the WebGL layer needs deferring. The drawing is plain SVG and can go
  // up on the server's markup, so the screen is never empty paper.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-paper">
      <LineSky
        drawn={drawn}
        leaving={leaving}
        ridgesOut={ridgesOut}
        reduced={reduced}
      />
      {/* Faded rather than switched on. The field's first frame is a complete
          field — 15,000 blades appearing between one frame and the next is a
          pop, however fast the load was. */}
      {mounted && (
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: drawn ? 1 : 0 }}
        >
          <GrassField dissolving={dissolving} onReady={onGrassReady} />
        </div>
      )}
    </div>
  );
}
