export type Job = {
  slug: string;
  role: string;
  company: string;
  /** Short label for the timeline rail — the long form lives in `period`. */
  years: string;
  period: string;
  length: string;
  location?: string;
  /** Every line here is Pedro's own copy, taken from his CV verbatim. */
  body: string[];
  /** Only technologies actually named in the copy above. Nothing inferred. */
  stack: string[];
};

/**
 * Newest first — the timeline reads downward into the past, which is the order
 * a reader expects and the order the data arrives in.
 */
export const EXPERIENCE: Job[] = [
  {
    slug: "blip",
    role: "Front-end Developer",
    company: "Blip.pt",
    years: "2025 — Now",
    period: "Nov 2025 — Present",
    length: "10 months",
    location: "Porto, Portugal · Hybrid",
    body: [
      "Building and maintaining a high-traffic prediction markets platform using React, Tailwind CSS, React Router, and React Query, focused on performance at scale to support thousands of concurrent users.",
      "Implementing polling-based real-time data updates and covering the codebase with unit, regression, visual, and end-to-end tests using Jest, Playwright, and Storybook.",
      "Contributing to a companion configuration app built on the same React stack.",
    ],
    stack: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "React Router",
      "React Query",
      "Jest",
      "Playwright",
      "Storybook",
    ],
  },
  {
    slug: "critical-techworks",
    role: "Fullstack Developer",
    company: "Critical TechWorks",
    years: "2023 — 2025",
    period: "May 2023 — Nov 2025",
    length: "2 years 7 months",
    body: [
      "Built and maintained a full stack application for standardizing data from multiple sources, featuring complex Angular components (supported by RxJS), dynamic tables, and full CRUD operations; contributed to backend development with NestJS, SQL, and AWS, while also working on data pipelines and sync jobs; ensured code quality through Cypress and Karma tests.",
      "Developed reusable front-end components for a shared design system and integrated them with an existing backend provided by another team, consuming live data and ensuring seamless UI functionality.",
    ],
    stack: [
      "Angular",
      "RxJS",
      "NestJS",
      "SQL",
      "AWS",
      "Cypress",
      "Karma",
      "HTML5",
      "CSS",
    ],
  },
  {
    slug: "devexperts",
    role: "Frontend Developer",
    company: "Devexperts",
    years: "2022 — 2023",
    period: "Oct 2022 — Apr 2023",
    length: "7 months",
    body: [
      "Contributed to a fintech streaming platform built with React and RxJS, focusing on managing complex asynchronous behaviors for real-time data interactions and smooth user experiences.",
    ],
    stack: ["React", "RxJS", "TypeScript", "HTML5"],
  },
  {
    slug: "quickops",
    role: "Frontend Developer",
    company: "QuickOps Consulting",
    years: "2022",
    period: "Apr 2022 — Sep 2022",
    length: "6 months",
    body: [
      "Helped build and maintain a lighting management platform using React and SCSS, based on a custom design system which I also co-developed; contributed to CI/CD pipelines to version and distribute the design system across multiple products.",
    ],
    stack: ["React", "SCSS", "CI/CD", "HTML5", "SQL"],
  },
  {
    slug: "pixelmatters",
    role: "Creative Developer",
    company: "Pixelmatters",
    years: "2021 — 2022",
    period: "Apr 2021 — Apr 2022",
    length: "1 year 1 month",
    body: [
      "Built a marketing website using Gatsby (React static site generator) integrated with WordPress REST API and ACF (Advanced Custom Fields); developed custom React components with a focus on UI quality, accessibility, and smooth animations.",
      "Embedded a live demo of the company's low-code app builder and later evolved the website components into a reusable internal component library; actively contributed to design decisions to ensure a visually engaging and accessible user experience.",
    ],
    stack: [
      "Gatsby",
      "React",
      "WordPress",
      "TypeScript",
      "Accessibility",
      "HTML5",
    ],
  },
  {
    slug: "zalox",
    role: "Frontend Developer",
    company: "Zalox",
    years: "2019 — 2021",
    period: "Aug 2019 — Apr 2021",
    length: "1 year 9 months",
    body: [
      "Developed multiple marketing websites using custom WordPress themes built from scratch with HTML, CSS, and JavaScript; implemented smooth transitions with Barba.js and engaging animations using SVGs.",
      "Contributed to a Vue.js-based backoffice application for a major energy sector company, supporting internal operations with scalable front-end components.",
    ],
    stack: ["WordPress", "JavaScript", "Barba.js", "SVG", "Vue", "HTML5"],
  },
  {
    slug: "xing",
    role: "Internship",
    company: "XING",
    years: "2019",
    period: "Mar 2019 — Jul 2019",
    length: "5 months",
    // No description on the CV, and none invented here.
    body: [],
    stack: ["HTML5", "Ruby"],
  },
];

export function getJob(slug: string) {
  return EXPERIENCE.find((j) => j.slug === slug);
}
