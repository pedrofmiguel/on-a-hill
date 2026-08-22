"use client";

import { useEffect, useRef } from "react";

const TILE = 256;

/**
 * Full-screen animated film grain, composited over every scene layer so the
 * backdrop and 3D grass share the same photo-like texture.
 */
export default function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: true,
    }) as CanvasRenderingContext2D | null;
    if (!context) return;
    // Declared non-null below so the RAF closure doesn't re-narrow.
    const ctx: CanvasRenderingContext2D = context;

    canvas.width = TILE;
    canvas.height = TILE;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const img = ctx.createImageData(TILE, TILE);
    const data = img.data;
    let raf = 0;

    function paint() {
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 38;
      }
      ctx.putImageData(img, 0, 0);
      if (!reduced) raf = requestAnimationFrame(paint);
    }

    paint();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[4] h-full w-full opacity-40"
      style={{
        imageRendering: "pixelated",
        mixBlendMode: "overlay",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
