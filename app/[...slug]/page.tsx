import { notFound, redirect } from "next/navigation";

/* Requests for a file, not a page. Anything with a dot in the last segment —
   /favicon.ico, /apple-touch-icon.png, /sw.js, /.well-known/… — is something a
   browser or a crawler is fetching for itself, not somewhere a person navigated.
   
   This is not hypothetical tidiness. Deleting app/favicon.ico stopped
   /favicon.ico being a metadata route, so it fell through to this catch-all and
   every browser's automatic favicon probe was answered with a 307 to the
   homepage — an HTML document where an image was expected. The tab kept showing
   whatever icon the browser had cached from before.
   
   A missing file must 404. Only a missing *page* goes home. */
function looksLikeAFile(segments: string[]): boolean {
  const last = segments[segments.length - 1] ?? "";
  return last.includes(".");
}

/**
 * Everything that matches no other route.
 *
 * Next matches the most specific segment first, so every real page — `/about`,
 * `/projects`, `/projects/<slug>` — is claimed before this one is consulted,
 * and metadata routes (`/icon.svg`, `/robots.txt`, `/sitemap.xml`) and files in
 * `public/` are served ahead of the router entirely. What is left is genuine
 * nonsense: a stale link, a typo, a probe for `/wp-admin`.
 *
 * Left, that is, *plus* every file a browser asks for on its own initiative that
 * happens not to exist — see `looksLikeAFile` above, which is there because one
 * of those was silently being redirected into an HTML page.
 *
 * Those go home rather than to a 404 page. Worth knowing the cost, since it is
 * not free: a crawler asking for a page that does not exist is answered with a
 * redirect to one that does, which search engines read as a soft 404 and treat
 * less kindly than a plain 404. That is the trade being made deliberately —
 * this is a portfolio, and a visitor who mistypes should land somewhere worth
 * looking at instead of at an apology.
 */
export default async function CatchAll({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  if (looksLikeAFile(slug)) notFound();
  redirect("/");
}
