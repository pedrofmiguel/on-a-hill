import type { MetadataRoute } from "next";

/**
 * The web app manifest, for when someone saves the site to a home screen.
 *
 * Written as a route rather than dropped in `public/` as the generator produced
 * it, so the name and the colours come from the same place as the rest of the
 * site's identity instead of drifting from it. The generated file said
 * "MyWebSite" on a white background; both would have shipped.
 *
 * `background_color` is the paper the whole site is printed on, not white. It is
 * what a phone paints behind the icon while the app opens, so a mismatch shows
 * up as a flash of the wrong colour at exactly the moment someone is looking.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pedro's Portfolio",
    short_name: "Pedro",
    description:
      "Pedro Ferreira, fullstack developer and builder. Websites that behave themselves.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2efe9",
    theme_color: "#f2efe9",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
