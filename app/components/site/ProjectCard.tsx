"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "../../data/projects";

/**
 * A card in the projects rail.
 *
 * Colour lives here and almost nowhere else on the site: each project owns one
 * flat, saturated block, and the monochrome page around it is what makes that
 * block land. Corners are square on purpose — the soft-rounded card is the
 * single most template-looking shape on the web.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="w-[80vw] max-w-[440px] shrink-0 snap-center sm:w-[440px]"
    >
      <Link
        href={`/projects/${project.slug}`}
        draggable={false}
        className="group block border border-rule bg-paper"
      >
        {/* The project's one flat colour. */}
        <div
          className="relative flex aspect-[4/3] w-full items-end p-5"
          style={{ background: project.accent }}
        >
          <span className="label text-white/85">{project.role}</span>
          <span className="tnum label absolute right-5 top-5 text-white/85">
            {project.year}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="text-base font-medium tracking-[-0.02em] text-ink sm:text-lg">
            {project.title}
          </h3>
          <p className="mono mt-3 line-clamp-3 text-[11px] leading-[1.6] text-ink-2">
            {project.summary}
          </p>
          <span className="label mt-6 inline-flex items-center gap-2 text-ink">
            View project
            <span
              aria-hidden
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
            >
              ↗
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
