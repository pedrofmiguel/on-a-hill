"use client";

import CircleCursor from "./CircleCursor";
import HeroPortrait from "./HeroPortrait";
import { SPOTIFY_URL } from "../../site";

/**
 * The hero drawing, made into a quiet link to what he builds to.
 *
 * The figure has been wearing headphones since the first version of the
 * drawing; this is the payoff. The hover treatment itself lives in
 * `CircleCursor` — shared with the About drawing so the two behave as one
 * gesture rather than two similar ones.
 */
export default function SoundtrackPortrait({
  className = "",
}: {
  className?: string;
}) {
  return (
    <CircleCursor
      className={className}
      href={SPOTIFY_URL}
      ariaLabel="My building soundtrack — open my Spotify profile"
      label="My building soundtrack ↗"
    >
      <HeroPortrait className="h-full w-full" />
    </CircleCursor>
  );
}
