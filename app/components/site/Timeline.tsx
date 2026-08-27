"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import ScrollReveal from "./ScrollReveal";
import ExperienceModal from "./ExperienceModal";
import { EXPERIENCE, type Job } from "../../data/experience";

/**
 * The work history, as a timeline that arrives one row at a time on scroll.
 *
 * Each row is a button rather than a link: the detail is a dialog, not a page,
 * so there is no URL to navigate to and nothing to open in a new tab.
 *
 * Hovering a row raises a small chip that follows the pointer inside the list.
 * That is deliberately scoped to this component — a site-wide custom cursor was
 * built earlier and rejected, and this needs to signal "clickable" without
 * bringing that back. The native pointer stays visible underneath.
 */
export default function Timeline() {
  const [open, setOpen] = useState<Job | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  // Pointer position within the list, for the follow chip.
  const [chip, setChip] = useState({ x: 0, y: 0 });

  function onPointerMove(e: React.PointerEvent) {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    setChip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <>
      <div className="relative">
        <ul
          ref={listRef}
          className="relative border-t border-rule"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          {EXPERIENCE.map((job, i) => {
            const dimmed = hovered !== null && hovered !== job.slug;

            return (
              <li key={job.slug} className="border-b border-rule">
                <ScrollReveal delay={Math.min(i, 4) * 0.05}>
                  <button
                    type="button"
                    onClick={() => setOpen(job)}
                    onPointerEnter={() => setHovered(job.slug)}
                    onFocus={() => setHovered(job.slug)}
                    onBlur={() => setHovered(null)}
                    aria-haspopup="dialog"
                    className={`group grid w-full cursor-pointer grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-4 py-6 text-left transition-opacity duration-500 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:gap-x-10 sm:py-8 ${
                      dimmed ? "opacity-30" : "opacity-100"
                    }`}
                  >
                    <span className="mono tnum text-[11px] text-ink-3 sm:text-xs">
                      {job.years}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-base tracking-[-0.02em] text-ink sm:text-2xl">
                        {job.role}
                      </span>
                      <span className="mono mt-1.5 block text-[11px] text-ink-2 sm:text-xs">
                        {job.company}
                      </span>
                    </span>

                    <span className="mono hidden text-xs text-ink-3 sm:block">
                      {job.length}
                    </span>
                  </button>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>

        {/* The follow chip. Sits above the rows, never intercepts the pointer,
            and only exists for fine pointers — on touch there is no hover state
            to describe and the tap does the job. */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-20 hidden [@media(pointer:fine)]:block"
            animate={{
              x: chip.x + 18,
              y: chip.y - 14,
              opacity: hovered ? 1 : 0,
              scale: hovered ? 1 : 0.8,
            }}
            transition={{
              x: { type: "spring", stiffness: 700, damping: 42, mass: 0.4 },
              y: { type: "spring", stiffness: 700, damping: 42, mass: 0.4 },
              opacity: { duration: 0.18 },
              scale: { duration: 0.18 },
            }}
          >
            <span className="sticker sticker-solid border border-ink">
              Open ↗
            </span>
          </motion.div>
        )}
      </div>

      <ExperienceModal job={open} onClose={() => setOpen(null)} />
    </>
  );
}
