import { redirect } from "next/navigation";

/**
 * Everything that matches no other route.
 *
 * Next matches the most specific segment first, so every real page — `/about`,
 * `/projects`, `/projects/<slug>` — is claimed before this one is consulted,
 * and metadata routes (`/icon.svg`, `/robots.txt`, `/sitemap.xml`) and files in
 * `public/` are served ahead of the router entirely. What is left is genuine
 * nonsense: a stale link, a typo, a probe for `/wp-admin`.
 *
 * Those go home rather than to a 404 page. Worth knowing the cost, since it is
 * not free: a crawler asking for a page that does not exist is answered with a
 * redirect to one that does, which search engines read as a soft 404 and treat
 * less kindly than a plain 404. That is the trade being made deliberately —
 * this is a portfolio, and a visitor who mistypes should land somewhere worth
 * looking at instead of at an apology.
 */
export default function CatchAll() {
  redirect("/");
}
