/**
 * Site-level identity: the things that change the day a domain is bought, kept
 * in one place so that day is a one-line edit rather than a search.
 */

/**
 * The site's own origin — used for canonical URLs, Open Graph images and the
 * sitemap.
 *
 * Nothing is hardcoded, because there is no custom domain yet. Resolved at
 * build time, in order of preference:
 *
 *   NEXT_PUBLIC_SITE_URL           set this once a real domain is bought
 *   VERCEL_PROJECT_PRODUCTION_URL  the project's stable *.vercel.app domain
 *   VERCEL_URL                     this specific deployment (preview builds)
 *   http://localhost:3000          local development
 *
 * Vercel supplies its variables as bare hostnames with no protocol, so they
 * have to be prefixed. Getting this wrong is quiet rather than loud: the build
 * still succeeds and the pages still render, but every share preview points at
 * a domain that isn't yours.
 */
function normalize(value: string): string {
  const withProtocol = /^https?:\/\//.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return normalize(explicit);

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return normalize(vercel);

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/**
 * Contact address. A placeholder until the domain question is settled — it is
 * an address *at* a domain that may never be bought, so it is almost certainly
 * not deliverable yet. Referenced by the footer, the menu and the hero.
 */
export const CONTACT_EMAIL = "hello@pedroferreira.dev";
