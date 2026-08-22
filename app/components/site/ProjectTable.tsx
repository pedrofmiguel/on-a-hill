"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "../../data/projects";

/**
 * The index of work, as a table rather than a list of cards.
 *
 * The column widths are fixed (not `auto`) so every row's year lands on the
 * same right edge and the numbers form a clean column — the whole point of a
 * table. Years use tabular figures and carry no negative tracking, which is
 * what was clipping them before.
 */
export default function ProjectTable({ projects }: { projects: Project[] }) {
  // Hovering one row dims the others: the table answers the pointer instead of
  // just highlighting under it.
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <ul className="border-t border-rule" onMouseLeave={() => setHovered(null)}>
      {projects.map((project, i) => {
        const dimmed = hovered !== null && hovered !== project.slug;

        return (
          <li key={project.slug} className="border-b border-rule">
            <Link
              href={`/projects/${project.slug}`}
              onMouseEnter={() => setHovered(project.slug)}
              onFocus={() => setHovered(project.slug)}
              onBlur={() => setHovered(null)}
              className={`group grid grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-baseline gap-x-4 py-5 transition-opacity duration-500 sm:grid-cols-[3rem_minmax(0,1fr)_11rem_5rem] sm:gap-x-8 sm:py-7 ${
                dimmed ? "opacity-30" : "opacity-100"
              }`}
            >
              <span className="mono tnum text-[11px] text-ink-3">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="flex min-w-0 items-baseline gap-3">
                <span className="truncate text-base font-normal tracking-[-0.02em] text-ink sm:text-2xl">
                  {project.title}
                </span>
                {/* Slides out of the title on hover — the only moving part. */}
                <span
                  aria-hidden
                  className="hidden shrink-0 text-accent opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:opacity-100 sm:inline"
                >
                  ↗
                </span>
              </span>

              <span className="mono hidden text-xs text-ink-2 sm:block">
                {project.role}
              </span>

              <span className="mono tnum text-right text-xs text-ink-2">
                {project.year}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
