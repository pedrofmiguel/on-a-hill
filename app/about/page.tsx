import type { Metadata } from "next";
import Reveal from "../components/reveal/Reveal";

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
      <Reveal>
        <p className="label text-ink-3">About</p>
      </Reveal>

      <Reveal delay={0.08} y={22} duration={1}>
        <h1 className="display mt-6 max-w-[20ch] text-[clamp(1.15rem,5.4vw,4.5rem)] leading-[1.08]">
          Drawn to the quiet details
        </h1>
      </Reveal>

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
    </div>
  );
}
