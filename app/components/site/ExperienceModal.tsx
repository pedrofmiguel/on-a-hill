"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { setScrollLocked } from "./SmoothScroll";
import type { Job } from "../../data/experience";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The write-up for one role.
 *
 * Centred rather than top-anchored: it is a short, self-contained card, and
 * pinning it to the top of a tall viewport left it stranded with a field of
 * empty paper beneath. `items-center` with `min-h-full` centres it when it fits
 * and lets it scroll from the top when it doesn't, which is the behaviour a
 * dialog needs at both extremes.
 *
 * The timeline only shows a company and a span of years, so everything else —
 * the role, the length, the location, the write-up, the stack — has to be here.
 * Stepping between roles is part of that: having opened one, the natural next
 * move is the one before it, and closing the dialog to click the next row is a
 * step nobody wants to repeat seven times.
 */
export default function ExperienceModal({
  jobs,
  index,
  onIndex,
  onClose,
}: {
  jobs: Job[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<Element | null>(null);

  /* Rendered into <body> rather than in place.
     The dialog lives inside <main>, which is `relative z-10` — its own stacking
     context. Any z-index set inside it is therefore scoped to that context, so
     z-100 here still lost to the site header at z-90 and the wordmark painted
     straight across the top of the panel. A portal lifts it out to the root
     context, where its z-index means what it says. */
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const job = index === null ? null : jobs[index];
  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < jobs.length - 1;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      const next = index + delta;
      if (next >= 0 && next < jobs.length) onIndex(next);
    },
    [index, jobs.length, onIndex],
  );

  const isOpen = index !== null;

  /* Two effects, deliberately.
     Locking the page and moving focus must happen once, on open — rerunning
     them per step would yank focus back to the close button on every arrow
     press. The key handler is the opposite: it has to see the *current* index.
     Folding both into one effect and silencing exhaustive-deps (the first
     version of this) captured a stale `go`, so every arrow press stepped from
     whichever row the dialog was opened at rather than the one on screen. */
  useEffect(() => {
    if (!isOpen) return;

    restoreTo.current = document.activeElement;
    document.body.style.overflow = "hidden";
    setScrollLocked(true);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      setScrollLocked(false);
      (restoreTo.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Arrow keys walk the timeline without reaching for the pointer.
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, go, onClose]);

  const content = (
    <AnimatePresence>
      {job && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <div
            data-lenis-prevent
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="job-title"
                initial={
                  reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }
                }
                transition={{ duration: 0.38, ease: EASE }}
                className="relative w-full max-w-xl border border-rule bg-paper shadow-[0_30px_90px_-40px_oklch(0_0_0/0.45)]"
              >
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 p-2 text-ink transition-opacity hover:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" stroke="currentColor" strokeWidth="1.25" />
                  </svg>
                </button>

                {/* Re-keyed on the role, so stepping between them reads as the
                    content changing rather than the panel twitching. */}
                <motion.div
                  key={job.slug}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="px-6 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-10"
                >
                  <p className="label tnum text-ink-3">{job.period}</p>

                  <h2
                    id="job-title"
                    className="display mt-4 pr-10 text-[clamp(1.05rem,3.2vw,1.9rem)] leading-[1.12]"
                  >
                    {job.role}
                  </h2>

                  <p className="mono mt-3 text-sm text-ink">{job.company}</p>

                  <p className="mono mt-1.5 text-[11px] text-ink-3">
                    {job.length}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>

                  {job.body.length > 0 && (
                    <div className="mono mt-7 space-y-4 border-t border-rule pt-6 text-xs leading-[1.85] text-ink-2">
                      {job.body.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  )}

                  <div className="mt-7 border-t border-rule pt-6">
                    <p className="label text-ink-3">Worked with</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {job.stack.map((tool) => (
                        <li key={tool} className="sticker">
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Stepper. Sits on its own bar so the panel always ends the
                    same way, whatever the length of the write-up above it. */}
                <div className="flex items-center justify-between border-t border-rule px-6 py-4 sm:px-10">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    disabled={!hasPrev}
                    className="label text-ink transition-opacity enabled:hover:opacity-55 disabled:opacity-25"
                  >
                    ← Newer
                  </button>

                  <span className="mono tnum text-[10px] text-ink-3">
                    {String((index ?? 0) + 1).padStart(2, "0")} / {String(jobs.length).padStart(2, "0")}
                  </span>

                  <button
                    type="button"
                    onClick={() => go(1)}
                    disabled={!hasNext}
                    className="label text-ink transition-opacity enabled:hover:opacity-55 disabled:opacity-25"
                  >
                    Older →
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(content, document.body) : null;
}
