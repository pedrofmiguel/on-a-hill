// The site's fixed backdrop: paper, lit slightly from above, with the corners
// settled a shade darker. Two gradients and nothing else — the point of this
// layer is that you never notice it, only that the page doesn't feel like a
// default white browser window.
export default function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, oklch(0.975 0.008 85) 0%, oklch(0.955 0.01 85) 45%, oklch(0.94 0.012 85) 100%)",
        }}
      />

      {/* Vignette, barely there — enough to hold the composition in. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 115% at 50% 40%, transparent 60%, oklch(0.86 0.014 85 / 0.55) 100%)",
        }}
      />
    </div>
  );
}
