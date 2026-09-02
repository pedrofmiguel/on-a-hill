"use client";

import Link from "next/link";
import { useReducedMotion } from "motion/react";
import type { Project } from "../../data/projects";

/**
 * The drawer. A row of hanging files, seen from the front.
 *
 * The page has been called "A drawer of things I've made" since it was a
 * horizontal rail, which is the mismatch this fixes. What makes it read as a
 * drawer is three things and no skeuomorphism at all: the rail across the top
 * with a clip at each end, the hairline rim every folder hangs from, and — the
 * one detail that does most of the work — tabs staggered across the row. Real
 * file tabs are staggered for exactly one reason, so that no tab hides the one
 * behind it, and borrowing that is what stops this reading as a plain list.
 *
 * Deliberately NOT overlapped. Overlapping the folder bodies is truer to the
 * photograph, but it forces a choice with no good answer: whichever folder
 * paints on top covers its neighbour's tab, so either the first project is
 * fully open and the rest are slivers, or the last one is. Every folder gets
 * its own row here, and the hover lift supplies the overlap instead.
 *
 * Hover / focus does three things at once, as one gesture — the folder lifts
 * out of the row, its tab fills with the project's colour, and the rim it hangs
 * from takes that colour too. That accent block is the only colour on the page,
 * which is the same rule the cards followed; it is just a smaller dose of it.
 *
 * Nothing here changes the layout on hover. The lift is a transform and the
 * colours are colours, so no folder can ever shove the ones below it down the
 * page while the pointer is crossing the row.
 *
 * On touch there is no hover, so that colour never arrived and the drawer was
 * a grey list of hairlines — the one dose of colour on the page, withheld from
 * the people most likely to see the page. Under `(hover: none)` the tab is
 * simply filled from the start. The query keys off the input device rather
 * than a width breakpoint on purpose: a narrow desktop window still has a
 * pointer and keeps the reveal, and a large tablet has no pointer and gets the
 * colour.
 */
export default function ProjectDrawer({ projects }: { projects: Project[] }) {
  return (
    <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
      {/* The rail the files hang from. The two squares are the end clips in the
          reference photo, and they are the whole of the drawer's hardware. */}
      <div aria-hidden className="relative h-px w-full bg-ink">
        <span className="absolute -top-[5px] left-0 block h-[11px] w-[11px] bg-ink" />
        <span className="absolute -top-[5px] right-0 block h-[11px] w-[11px] bg-ink" />
      </div>

      {/* The top padding is clearance, not rhythm: the first folder lifts 14px
          on hover and its tab would otherwise climb into the rail. */}
      <ul className="pt-7">
        {projects.map((project, i) => (
          <Folder key={project.slug} project={project} index={i} />
        ))}
      </ul>

      {/* The floor. Every folder draws the rim above it, so without this the
          last one ends in mid-air and the stack has no bottom. */}
      <div aria-hidden className="h-px w-full bg-rule" />
    </div>
  );
}

function Folder({ project, index }: { project: Project; index: number }) {
  const reduced = useReducedMotion();

  return (
    <li
      // The tab's horizontal offset. It cycles every four so that a fifth
      // project starts the stagger again at the left edge instead of walking
      // off the right one.
      style={{ "--i": index % 4, "--accent": project.accent } as React.CSSProperties}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group block outline-none"
      >
        <div
          className={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            reduced
              ? ""
              : "group-hover:-translate-y-[14px] group-focus-visible:-translate-y-[14px]"
          }`}
        >
          {/* The tab. Its bottom edge is missing on purpose — it is not a chip
              sitting above a line, it is continuous with the folder hanging
              below it. A 3px radius, where the rest of the site is square: a
              file tab is the one shape here that is rounded in life, and at
              3px it still cannot be mistaken for a rounded card. */}
          <div className="ml-[calc(var(--i)*7%)] w-max rounded-t-[3px] border border-b-0 border-rule bg-paper px-4 pb-2 pt-[0.6rem] transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--accent)] group-focus-visible:border-transparent group-focus-visible:bg-[var(--accent)] [@media(hover:none)]:border-transparent [@media(hover:none)]:bg-[var(--accent)] sm:ml-[calc(var(--i)*19%)] sm:px-5">
            <span className="block text-sm font-medium tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-white group-focus-visible:text-white [@media(hover:none)]:text-white sm:text-base">
              {project.title}
            </span>
          </div>

          {/* The rim, and the folder itself. */}
          <div className="border-t border-rule transition-colors duration-300 group-hover:border-[var(--accent)] group-focus-visible:border-[var(--accent)] [@media(hover:none)]:border-[var(--accent)]">
            <div className="grid gap-4 bg-paper py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-8 sm:py-7">
              <span className="mono tnum text-[11px] leading-none text-ink-3">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="mono max-w-[58ch] text-[11px] leading-[1.7] text-ink-2">
                {project.summary}
              </p>

              {/* `pr` is clearance for the arrow's own travel, not decoration. The
                  arrow slides 4px right on hover, and this column is flush with
                  the container's content edge — measured at every breakpoint,
                  the slack was exactly 0 — so the glyph crossed the edge on the
                  way out. Padding the whole column keeps the meta line and the
                  Open row aligned with each other while the arrow gains
                  somewhere to go. */}
              <div className="flex items-center justify-between gap-6 pr-1 sm:flex-col sm:items-end sm:gap-4 sm:pr-2">
                <span className="label whitespace-nowrap text-ink-3">
                  {project.role} · {project.year}
                </span>
                <span className="label inline-flex items-center gap-2 whitespace-nowrap text-ink">
                  Open
                  <span
                    aria-hidden
                    className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  >
                    ↗
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
