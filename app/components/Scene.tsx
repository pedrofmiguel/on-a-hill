"use client";

import SpaceScene from "./gate/SpaceScene";

/**
 * The "world" layer behind the entrance: paper, the curve of the Earth,
 * satellites, meteors, and a figure floating among them.
 *
 * There is no WebGL here any more. This started as a night-sky fragment shader
 * with 42,000 instanced grass blades, became a drawn hill with the same grass,
 * and is now entirely SVG — the three.js field went out with the hill it grew
 * on. Nothing to import dynamically, nothing to compile, nothing to defer: the
 * scene renders on the server and is on screen in the first frame.
 *
 * Fills its nearest positioned ancestor (the entrance gate), so it's
 * `absolute`, not `fixed`.
 */
export default function Scene({
  drawn = false,
  leaving = false,
  linesOut = false,
  reduced = false,
}: {
  /** Fonts are up: the drawing may begin. */
  drawn?: boolean;
  /** The exit has begun: satellites and figure leave. */
  leaving?: boolean;
  /** A beat later: the planet withdraws along its own length. */
  linesOut?: boolean;
  reduced?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-paper">
      <SpaceScene
        drawn={drawn}
        leaving={leaving}
        linesOut={linesOut}
        reduced={reduced}
      />
    </div>
  );
}
