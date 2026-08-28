import type { Metadata } from "next";
import Reveal from "../components/reveal/Reveal";
import ScrollReveal from "../components/site/ScrollReveal";
import Timeline from "../components/site/Timeline";
import HeroPortrait from "../components/site/HeroPortrait";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Pedro Ferreira — frontend developer and designer, focused on interfaces that behave themselves.",
};

const STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Motion",
  "Three.js / GLSL",
  "Tailwind CSS",
  "Node",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 pt-32 sm:px-10 sm:pt-40">
      {/* Title and drawing share a row, as on the home page. A grid rather than
          absolute positioning: the headline column is bounded, so the two can
          never grow into each other whatever the viewport. */}
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
        <div>
          <Reveal>
            <p className="label text-ink-3">About</p>
          </Reveal>

          <Reveal delay={0.08} y={22} duration={1}>
            <h1 className="display mt-6 max-w-[20ch] text-[clamp(1.15rem,5.4vw,4.5rem)] leading-[1.08]">
              Drawn to the quiet details
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.24} y={26} className="md:justify-self-end">
          <HeroPortrait className="aspect-[827/578] w-[68%] max-w-[420px] md:w-[30vw] md:max-w-[400px]" />
        </Reveal>
      </div>

      {/* Prose sits in a narrow measure against the wide headline above it —
          the contrast in column width is doing as much work as the type size. */}
      <div className="mt-[10vh] grid gap-12 border-t border-rule pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] md:gap-20">
        <Reveal delay={0.14}>
          <p className="max-w-[28ch] text-base font-normal leading-[1.45] tracking-[-0.02em] text-ink sm:text-lg">
            I care about how an interface feels, not only how it looks.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="space-y-5 text-base leading-[1.5] text-ink-2">
          <p>
            I&apos;m Pedro — a frontend developer and designer. I like restraint,
            considered motion, and the small moments most people never notice but
            everyone feels.
          </p>
          <p>
            I work across the part of the stack that touches the browser: design
            systems, product UI, marketing sites, and the occasional WebGL
            experiment when a project can carry one. Lately that has meant
            Next.js, React, and a great deal of time getting animation timing to
            sit right.
          </p>
          <p>
            If you want a site that feels crafted rather than assembled, I&apos;d
            like to hear from you.
          </p>
        </Reveal>
      </div>

      <div className="mt-[12vh] border-t border-rule pt-10">
        <Reveal>
          <h2 className="label text-ink-3">Tools I reach for</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <ul className="mt-6 flex flex-wrap gap-2">
            {STACK.map((tool) => (
              <li key={tool} className="sticker">
                {tool}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* ------------------------------------------------------------------
          Experience. Rows arrive on scroll rather than all at once, and each
          opens its own write-up.
          ------------------------------------------------------------------ */}
      <section className="mt-[16vh] pb-[6vh]">
        <ScrollReveal>
          <div className="mb-8 flex items-baseline justify-between gap-6">
            <h2 className="label text-ink-3">Experience</h2>
            <p className="mono text-[11px] text-ink-3">Open one for the detail</p>
          </div>
        </ScrollReveal>

        <Timeline />
      </section>
    </div>
  );
}
