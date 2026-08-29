import type { Metadata } from "next";
import Reveal from "../components/reveal/Reveal";
import ScrollReveal from "../components/site/ScrollReveal";
import Timeline from "../components/site/Timeline";
import BoulderPortrait from "../components/site/BoulderPortrait";
import CircleCursor from "../components/site/CircleCursor";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Pedro Ferreira — full-stack developer, mostly front-end, focused on interfaces that behave themselves.",
};

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

        <Reveal delay={0.24} y={26}>
          {/* No label and no link — the climber goes nowhere. The circle is
              here because the drawing is the one thing on the page worth
              putting a pointer on, and it matches the hero's gesture. */}
          <CircleCursor className="ml-auto aspect-[408/704] w-[44%] max-w-[190px] md:w-[17vw] md:max-w-[220px]">
            <BoulderPortrait className="h-full w-full" />
          </CircleCursor>
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
            I&apos;m Pedro, a full-stack developer — mostly front-end. I like
            minimal, simple layouts, carried by motion and small details.
          </p>
          <p>
            I&apos;ve built everything from marketing sites to real-time
            fintech platforms. When I&apos;m not writing code, you&apos;ll find
            me climbing rocks or lifting weights.
          </p>
        </Reveal>
      </div>

      {/* ------------------------------------------------------------------
          Experience, straight after the prose. The tools list that used to sit
          between them is gone: it was the same claim the capability field on
          the home page already makes, made smaller and without the evidence,
          and it pushed the one section a visitor came here to read below the
          fold. Experience carries the rule the tools list used to carry, so the
          page keeps its rhythm.
          ------------------------------------------------------------------ */}
      <section className="mt-[12vh] border-t border-rule pb-[6vh] pt-10">
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
