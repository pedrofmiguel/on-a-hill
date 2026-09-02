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
    // Slug kept as "on-a-hill" even though the title now reads plainly: the
    // URL has been shared, and the file header asks for slugs to stay put.
    slug: "on-a-hill",
    title: "Personal Website",
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
    url: "https://github.com/pedrofmiguel/on-a-hill",
    accent: "oklch(0.66 0.2 34)",
  },
  {
    slug: "digi",
    title: "digi",
    role: "Code",
    year: "2026",
    summary:
      "The digidestined, put to work. A crew of named agents living inside Claude Code, each summoned by a slash command, each owning one job.",
    body: [
      "A personal agent system: Joe searches the Obsidian vault, Matt researches the web, Tai reviews code, Sora argues about design, Izzy keeps projects moving. Digi coordinates the rest.",
      "The cast is the Digimon one, and that is doing more work than a joke. Names you already know carry a temperament with them, so knowing which agent to reach for costs nothing — where a single general-purpose assistant makes you re-explain the job every time.",
      "Shell installers for macOS and Windows, wired into Obsidian, Slack, and Atlassian so the agents work against real day-to-day tools rather than a sandbox.",
    ],
    tags: ["Claude Code", "Agents", "Obsidian", "Slack", "Shell"],
    url: "https://github.com/pedroferreira4/digi",
    accent: "oklch(0.6 0.17 300)",
  },
  {
    slug: "skills-bag",
    title: "Skills Bag",
    role: "Design + Code",
    year: "2026",
    summary:
      "A native desktop app for the folder of Claude skills you would otherwise be editing by hand.",
    body: [
      "Browse, search, create, and edit the skills in ~/.claude/skills without opening a file manager. Disabling a skill moves it aside rather than deleting it, so turning something off is never a decision you have to be sure about.",
      "Skills can be imported from anywhere on disk as symlinks, and deletion is symlink-aware — it removes the link and leaves the source where it is.",
      "React 19 and Tailwind v4 over a Rust backend, packaged with Tauri. macOS installs in one command; Windows builds the installer.",
    ],
    tags: ["Tauri", "Rust", "React", "TypeScript", "Tailwind"],
    url: "https://github.com/pedrofmiguel/skills-bag",
    accent: "oklch(0.55 0.13 75)",
  },
  {
    slug: "diff-erent",
    title: "diff-erent",
    role: "Code",
    year: "2026",
    summary:
      "A git diff view built for reviewing rather than reading — hunks that summarise themselves, and a rail showing what each change puts at risk.",
    body: [
      "An extension for VS Code and Cursor that replaces the side-by-side diff for review work. Every hunk carries a summary of what it actually changed — behaviour, imports, exports, styles — so a long diff can be triaged before it is read line by line.",
      "Token-level inline diffing for word changes, filtering by file name or status, and an impact rail built from the static import graph that flags which files a change reaches into.",
      "The analysis engine is deliberately separate from the extension layer: the core modules run under plain Node, with no editor attached.",
    ],
    tags: ["TypeScript", "VS Code", "Node.js", "Git"],
    url: "https://github.com/pedrofmiguel/diff-erent",
    accent: "oklch(0.55 0.12 240)",
  },
  {
    slug: "rocksteady-barbershop",
    title: "Rocksteady Barbearia",
    role: "Design + Code",
    year: "2026",
    summary:
      "A barbershop on Av. Vasco da Gama, and the booking system it runs on. One deep green, one enormous word, and a chair you can actually reserve.",
    body: [
      "The shop needed bookings more than it needed a brochure, so the whole site is built around one path: pick your barber, pick your slot, done. Vitinho or Marcondes, chosen by face rather than from a dropdown — in a barbershop you are booking a person, not a service.",
      "The homepage spends everything on one gesture. ROCKSTEADY set at the full width of the screen in white on #015136, with a dotted halftone drifting underneath the type, and a single button below it. There is no scrolling tour of the premises and no stock photography of scissors.",
      "WordPress underneath, with PHP and hand-written CSS over the top rather than a page builder — the shop can change its own hours and prices without calling me, which is the only reason to be on WordPress at all.",
    ],
    tags: ["WordPress", "PHP", "HTML", "CSS", "Booking System"],
    url: "https://www.rocksteady-barbearia.com/",
    /* Sampled from the live stylesheet, not matched by eye: #015136. */
    accent: "oklch(0.385 0.083 162)",
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
