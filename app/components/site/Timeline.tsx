"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import ScrollReveal from "./ScrollReveal";
import ExperienceModal from "./ExperienceModal";
import { EXPERIENCE } from "../../data/experience";

/**
 * The work history as a timeline: one line per stop, and a short connector
 * drawn between consecutive stops.
 *
 * The connector sits *between* entries rather than running alongside them as a
 * continuous rail. A rail is a container — it says "these things are in a list".
 * A segment between two entries is a link, and says "this one followed that
 * one", which is the whole point of a career timeline.
 *
 * Each connector draws itself downward as it scrolls into view, so the line
 * appears to be travelling from one role to the next as you read.
 */
export default function Timeline() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  // Pointer position within the list, for the chip that follows it.
  const [chip, setChip] = useState({ x: 0, y: 0 });

  function onPointerMove(e: React.PointerEvent) {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    setChip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <>
      <div className="relative">
        <ol
          ref={listRef}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          {EXPERIENCE.map((job, i) => {
            const dimmed = hovered !== null && hovered !== i;
            const last = i === EXPERIENCE.length - 1;

            return (
              <li key={job.slug}>
                <ScrollReveal delay={Math.min(i, 4) * 0.03}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    onPointerEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    aria-haspopup="dialog"
                    className={`group block w-full cursor-pointer text-left transition-opacity duration-500 ${
                      dimmed ? "opacity-25" : "opacity-100"
                    }`}
                  >
                    {/* Company and years wrap independently, so long names drop
                        their dates to a second line on narrow screens rather
                        than overflowing. */}
                    <span className="display flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[clamp(0.95rem,3.1vw,2.1rem)] leading-[1.15]">
                      <span className="text-ink transition-opacity duration-300 group-hover:opacity-70">
                        {job.company}
                      </span>
                      <span className="tnum text-ink-3">— {job.years}</span>
                    </span>
                  </button>
                </ScrollReveal>

                {/* The link to the next stop. Drawn from the top down as it
                    enters view; `once` so it stays drawn. */}
                {!last && (
                  <motion.span
                    aria-hidden
                    className="my-3 ml-[1.15rem] block w-px origin-top bg-ink-3/45 sm:my-5 sm:ml-8"
                    style={{ height: "clamp(1.75rem, 4.5vw, 3.25rem)" }}
                    initial={reduced ? { opacity: 0 } : { scaleY: 0 }}
                    whileInView={reduced ? { opacity: 1 } : { scaleY: 1 }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    transition={{
                      duration: reduced ? 0.3 : 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* The follow chip. Never intercepts the pointer, and only for fine
            pointers — on touch there is no hover to describe and the tap does
            the job on its own. */}
        {!reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-20 hidden [@media(pointer:fine)]:block"
            animate={{
              x: chip.x + 20,
              y: chip.y - 12,
              opacity: hovered !== null ? 1 : 0,
              scale: hovered !== null ? 1 : 0.8,
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

      <ExperienceModal
        jobs={EXPERIENCE}
        index={openIndex}
        onIndex={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
