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
 * Google Analytics 4 measurement ID.
 *
 * Public by design — it ships in the client bundle on every page, and there is
 * nothing to protect. It lives here with the rest of the site's identity rather
 * than in an env var precisely because it is not a secret and never varies: an
 * unset variable would mean analytics silently not reporting, which is the kind
 * of failure nobody notices for six months.
 *
 * Note this is gtag.js / GA4, not Tag Manager, despite the googletagmanager.com
 * host the script is served from. They are different products: GTM containers
 * have `GTM-` ids and would need `GoogleTagManager` instead of
 * `GoogleAnalytics`.
 */
export const GA_ID = "G-3EE3TGCE51";

/**
 * Whether to report at all.
 *
 * Off in development, so `next dev` never counts as traffic. Off on Vercel
 * preview deployments, so a branch nobody has seen does not land in the same
 * property as the real site and quietly skew a month of numbers.
 *
 * Deliberately phrased as "not a preview" rather than "is production". If
 * `NEXT_PUBLIC_VERCEL_ENV` is ever absent — a different host, a change on
 * Vercel's side — the first form keeps reporting from the live site and the
 * second would silently stop. Given the choice between over-reporting on
 * previews and never reporting at all, this fails toward working.
 */
export const ANALYTICS_ENABLED =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_VERCEL_ENV !== "preview" &&
  process.env.NEXT_PUBLIC_VERCEL_ENV !== "development";

/**
 * Contact address. Referenced by the footer, the menu and the hero — a real
 * mailbox, deliberately not tied to the site's own domain so it keeps working
 * whatever happens to that.
 */
export const CONTACT_EMAIL = "pmferreiradev@gmail.com";

/**
 * The soundtrack he builds to. Hung off the hero drawing (the one wearing the
 * headphones) rather than listed as a link, because it is an aside about the
 * person, not a way to contact him.
 */
export const SPOTIFY_URL =
  "https://open.spotify.com/user/obarrier?si=9bd567fa03d842d5";

/** Where to find him. Used by the footer and the full-screen menu. */
export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/pedrofmiguel" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pedro-ferreira-7651a4136/",
  },
] as const;
