"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import WindHillCanvas from "./WindHillCanvas";
import FilmGrain from "./FilmGrain";

// Three.js is heavy — load the 3D grass foreground only on the client, after
// first paint, so the backdrop shows instantly and the bundle stays lean.
const GrassField = dynamic(() => import("./GrassField"), { ssr: false });

/**
 * The "world" layer: a starry night backdrop with rolling hills, plus a 3D
 * instanced-grass foreground. Fills its nearest positioned ancestor (the
 * entrance gate), so it's `absolute`, not `fixed`.
 *
 * Everything inside is WebGL / client-only, gated behind a mount flag so the
 * server and first client render stay in sync.
 */
export default function Scene({
  dissolving = false,
}: {
  /** Passed through to the grass so the field can come apart on the way out. */
  dissolving?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  // Defer the WebGL layers to a client-only pass so SSR and first paint match.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-night">
      {mounted && (
        <>
          <div className="absolute inset-0">
            <WindHillCanvas />
          </div>
          <GrassField dissolving={dissolving} />
          <FilmGrain />
        </>
      )}
    </div>
  );
}
