# on a hill

Pedro Ferreira's portfolio. A Next.js App Router site: an entrance gate that
dissolves into a light monochrome poster, a projects drawer, and an about page
with the work history on a timeline.

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Type** — Martian Mono via `next/font/google`, one face throughout, never
  heavier than 500
- **Styling** — Tailwind CSS v4, with the palette defined as `@theme` tokens in
  `app/globals.css`
- **Motion** — `motion` for component transitions, `lenis` for smooth scroll,
  `three` + `@react-three/fiber` for the grass in the entrance gate

## Running it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

The entrance gate only plays once per session — `sessionStorage` remembers that
you have been through it. Append `?gate` to any URL to force it to replay.

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

## Environment

There is one variable, and on Vercel you can ignore it:

| Variable               | Required                | What it does                                                    |
| ---------------------- | ----------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | No — only for a real domain | Origin used for canonical URLs, Open Graph, `robots.txt`, sitemap |

`app/site.ts` resolves the origin in order: `NEXT_PUBLIC_SITE_URL`, then
`VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then `localhost:3000`. The
two Vercel variables are injected automatically, so the site is correct on a
`*.vercel.app` domain with nothing configured.

Set `NEXT_PUBLIC_SITE_URL` (Production environment only) the day a custom domain
is pointed at the project. See `.env.example`.

## Deploying to Vercel

The repo needs no `vercel.json` — Next.js is detected, and the defaults are
right for this site.

1. Push the branch to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repository. Leave the
   framework preset (Next.js), build command (`next build`) and output directory
   as detected.
3. Deploy. Preview deployments are built for every branch and pull request;
   `main` becomes production.
4. When a custom domain is added, set `NEXT_PUBLIC_SITE_URL` to it in Project
   Settings → Environment Variables (Production), then redeploy so the sitemap
   and share previews pick it up.

Or from the CLI:

```bash
npx vercel        # preview deployment
npx vercel --prod # production
```

Every route is static or prerendered except the intercepted project modal, so
there is nothing to configure around regions, runtimes or caching.

## A note on `AGENTS.md`

`next dev` writes and re-adds the block in `AGENTS.md` itself. Removing it from a
diff only recreates the change; commit it along with your work to keep the tree
clean.
