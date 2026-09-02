import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

/**
 * There is a sitemap (see `sitemap.ts`), and until now nothing told a crawler
 * where to find it. This is that pointer.
 *
 * The URL is built from `SITE_URL` rather than hardcoded, so a preview build
 * advertises its own sitemap instead of production's. Preview deployments are
 * served with `X-Robots-Tag: noindex` by Vercel, so nothing here puts a
 * half-finished branch into a search index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
