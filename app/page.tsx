import Link from "next/link";
import Reveal from "./components/reveal/Reveal";
import CloudField from "./components/site/CloudField";
import SoundtrackPortrait from "./components/site/SoundtrackPortrait";

/* The headline is broken by hand, not by the browser. Line breaks are part of
   the composition here, so they are data rather than markup accidents. */
const HEADLINE = ["I build", "websites", "that behave", "themselves"];

export default function Home() {
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


        {/* Sized against viewport *height* as well as width. Width alone let
            the headline grow until the supporting row underneath was pushed
            off a 900px-tall screen — the poster only works if the whole thing
            is one view. The floor keeps the longest line unbroken at 360px. */}
        {/* `pointer-events-none` is load-bearing, not tidying. Each line is a
            block-level span, so its box runs the full width of the section even
            where the type does not — and at z-10 those empty boxes sat on top of
            the drawing's whole upper half. The soundtrack hover simply did not
            exist over the head, the headphones or the face. Nothing in a poster
            headline is clickable, so it has no business hit-testing. */}
        {/* `select-none` alongside the existing `pointer-events-none`: the
            headline is a poster, not copy. It is still read out by a screen
            reader and still indexed — user-select only governs the drag. */}
        <h1 className="display pointer-events-none relative z-10 select-none text-[clamp(1.25rem,min(10.4vw,10.5svh),8rem)] leading-[1.04]">
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
          <SoundtrackPortrait className="absolute bottom-0 right-[-3%] aspect-[827/578] h-full w-auto max-w-[64%] sm:right-[1%] sm:max-w-[46%] lg:h-[calc(100%+20vh)] lg:max-w-[34%]" />
        </div>

        <div className="relative z-10 mt-[min(4rem,6vh)] grid gap-8 sm:grid-cols-[minmax(0,22rem)_1fr_auto] sm:items-end sm:gap-12">
          <Reveal delay={0.55}>
            <p className="mono text-xs leading-[1.7] text-ink-2">
              Fullstack developer and builder. I have a passion for building
              tools for my day-to-day, and products with real purpose.
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
    </div>
  );
}

/* The headline lines rise from slightly different depths so the block assembles
   itself instead of sliding up as one rigid slab. */
function lineLift(index: number) {
  return 22 + index * 4;
}
