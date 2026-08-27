import Link from "next/link";
import { PROJECTS } from "./data/projects";
import Reveal from "./components/reveal/Reveal";
import { CONTACT_EMAIL } from "./site";
import WordField from "./components/site/WordField";
import CloudField from "./components/site/CloudField";
import HeroPortrait from "./components/site/HeroPortrait";
import ProjectTable from "./components/site/ProjectTable";

/* The headline is broken by hand, not by the browser. Line breaks are part of
   the composition here, so they are data rather than markup accidents. */
const HEADLINE = ["I build", "websites", "that behave", "themselves"];

export default function Home() {
  const selected = PROJECTS.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* ------------------------------------------------------------------
          Hero. A poster: one enormous statement, with the useful links pushed
          out to the corners so the middle of the page can stay empty.
          ------------------------------------------------------------------ */}
      <section className="relative flex min-h-[92svh] flex-col overflow-hidden px-6 pb-12 pt-28 sm:px-10 sm:pt-32">
        {/* The same weather as the entrance screen, turned down so type can
            sit on it. */}
        <CloudField intensity={0.55} />


        {/* Taken out of the flow so the headline gets the full measure — with
            "Say hi" as a flex sibling the last line wrapped on mid-size
            screens, which broke the hand-set four-line composition. */}
        <Reveal delay={0.5} className="absolute right-6 top-28 z-10 hidden sm:block sm:right-10 sm:top-32">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="label link-rule text-ink"
          >
            Say hello ↗
          </a>
        </Reveal>

        {/* Sized against viewport *height* as well as width. Width alone let
            the headline grow until the supporting row underneath was pushed
            off a 900px-tall screen — the poster only works if the whole thing
            is one view. The floor keeps the longest line unbroken at 360px. */}
        <h1 className="display relative z-10 text-[clamp(1.25rem,min(10.4vw,10.5svh),8rem)] leading-[1.04]">
          {HEADLINE.map((line, i) => (
            <Reveal
              key={line}
              as="span"
              className="block"
              delay={0.08 * i}
              y={lineLift(i)}
              duration={1}
            >
              {line}
            </Reveal>
          ))}
        </h1>

        {/* The drawing gets the leftover vertical space and nothing else, so it
            can never reach the headline above or the row below it. Sizing it
            from that gap's height (rather than from viewport width) is what
            fixes short, wide screens, where a width-based portrait grew into
            the type. */}
        <div className="relative min-h-[13svh] flex-1 sm:min-h-[17svh]">
          <HeroPortrait className="pointer-events-none absolute bottom-0 right-[-3%] aspect-[827/578] h-full w-auto max-w-[64%] sm:right-[1%] sm:max-w-[46%] lg:h-[calc(100%+20vh)] lg:max-w-[34%]" />
        </div>

        <div className="relative z-10 mt-[min(4rem,6vh)] grid gap-8 sm:grid-cols-[minmax(0,22rem)_1fr_auto] sm:items-end sm:gap-12">
          <Reveal delay={0.55}>
            <p className="mono text-xs leading-[1.7] text-ink-2">
              Frontend developer and designer. I do the part you can see, and
              most of the part you can&apos;t. Occasionally something with no
              reason to exist.
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <Link
              href="/about"
              className="mono link-rule text-xs font-medium uppercase leading-[1.1] sm:text-sm"
            >
              More about me
            </Link>
          </Reveal>

          <Reveal delay={0.72} className="sm:text-right">
            <Link
              href="/projects"
              className="mono link-rule text-xs font-medium uppercase leading-[1.1] sm:text-sm"
            >
              See the work
            </Link>
          </Reveal>
        </div>
      </section>

      {/* The capability field — big, dim, drifting. */}
      <Reveal delay={0.05} y={24}>
        <WordField />
      </Reveal>

      {/* ------------------------------------------------------------------
          Selected work, as an index.
          ------------------------------------------------------------------ */}
      <section className="px-6 pt-[14vh] sm:px-10">
        <Reveal>
          <div className="mb-8 flex items-baseline justify-between gap-6">
            <h2 className="label text-ink-3">Selected work</h2>
            <Link href="/projects" className="label link-rule text-ink">
              All projects ↗
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08} y={20}>
          <ProjectTable projects={selected} />
        </Reveal>
      </section>
    </div>
  );
}

/* The headline lines rise from slightly different depths so the block assembles
   itself instead of sliding up as one rigid slab. */
function lineLift(index: number) {
  return 22 + index * 4;
}
