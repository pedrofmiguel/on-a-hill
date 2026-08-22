// The single source of truth for the work shown on /projects.
//
// Add, remove, or reorder entries here — the carousel, the modal, the full
// project pages, and the sitemap all read from this list. Keep `slug` stable
// once a project is live, since it's the shareable URL (/projects/<slug>).

export type Project = {
  slug: string;
  title: string;
  /** e.g. "Code", "Design + Code" — mirrors the label style in the reference. */
  role: string;
  year: string;
  /** One or two sentences. Shown on the card and at the top of the modal. */
  summary: string;
  /** Longer prose for the detail view. Each string is a paragraph. */
  body: string[];
  /** Short technology / discipline tags rendered as pills. */
  tags: string[];
  /** Optional live link. */
  url?: string;
  /** Accent used for the card's ambient glow (any CSS color). */
  accent: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "on-a-hill",
    title: "On a Hill",
    role: "Design + Code",
    year: "2026",
    summary:
      "This site. It makes you touch grass before it shows you anything.",
    body: [
      "Built with Next.js and React Three Fiber. The entrance is a field of 42,000 instanced blades bending in a GLSL wind shader, under a hand-authored starfield.",
      "Press Enter and the field comes apart: every blade erodes from the base, tumbles, and blows off downwind while cloud rolls in over the hill. The cloud then clears, and the site is behind it.",
      "Everything after that is monospace on paper. One typeface, hairlines instead of boxes, and no colour anywhere except the block each project gets to itself.",
    ],
    tags: ["Next.js", "React Three Fiber", "GLSL", "Motion", "Lenis"],
    url: "https://github.com/",
    accent: "oklch(0.66 0.2 34)",
  },
  {
    slug: "field-notes",
    title: "Field Notes",
    role: "Code",
    year: "2025",
    summary:
      "A writing surface that gets out of the way — local-first, keyboard-driven, syncs when it can.",
    body: [
      "A markdown editor with an opinion: no chrome until you need it. Offline-first with a small sync layer, built to feel instant on any connection.",
      "Placeholder entry — swap this for a real project. The structure (summary, body paragraphs, tags, link) is all you need to fill in.",
    ],
    tags: ["React", "IndexedDB", "TypeScript"],
    accent: "oklch(0.62 0.15 200)",
  },
  {
    slug: "atlas",
    title: "Atlas",
    role: "Design + Code",
    year: "2025",
    summary:
      "A component system and docs site for a small product team — tokens, primitives, and the guardrails around them.",
    body: [
      "Design tokens as the contract between design and code, a headless component layer on top, and a living documentation site that renders the real components.",
      "Placeholder entry — replace with your own work. Add a `url` field to surface a live link with the red arrow, like the reference.",
    ],
    tags: ["Design Systems", "Tailwind", "Storybook"],
    accent: "oklch(0.64 0.16 145)",
  },
  {
    slug: "signal",
    title: "Signal",
    role: "Code",
    year: "2024",
    summary:
      "A real-time dashboard that stays calm under load — streaming data, no layout thrash, honest empty states.",
    body: [
      "Server-sent events into a virtualized view, with careful attention to the moments most dashboards ignore: loading, empty, and error.",
      "Placeholder entry. Keep three to six projects here — enough to show range, few enough that each one earns its place.",
    ],
    tags: ["Next.js", "SSE", "Data Viz"],
    accent: "oklch(0.6 0.17 300)",
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
