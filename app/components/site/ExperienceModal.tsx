"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { setScrollLocked } from "./SmoothScroll";
import type { Job } from "../../data/experience";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The write-up for one job.
 *
 * Paper panel, black text, hairline rules — the same surface as the rest of the
 * site rather than a dialog with its own visual language. The only ornament is
 * the close cross, drawn as two strokes.
 */
export default function ExperienceModal({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreTo = useRef<Element | null>(null);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!job) return;

    restoreTo.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setScrollLocked(true);
    // Move focus into the dialog so Escape and Tab belong to it.
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      setScrollLocked(false);
      // Hand focus back to the row that opened it.
      (restoreTo.current as HTMLElement | null)?.focus?.();
    };
  }, [job, close]);

  return (
    <AnimatePresence>
      {job && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            aria-hidden
            onClick={close}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <div
            data-lenis-prevent
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            <div className="flex min-h-full items-start justify-center px-4 py-10 sm:py-[12vh]">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="job-title"
                initial={
                  reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }
                }
                transition={{ duration: 0.4, ease: EASE }}
                className="relative w-full max-w-2xl border border-rule bg-paper p-6 shadow-[0_24px_80px_-32px_oklch(0_0_0/0.4)] sm:p-12"
              >
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute right-5 top-5 text-ink transition-opacity hover:opacity-55"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M3 3l12 12M15 3L3 15"
                      stroke="currentColor"
                      strokeWidth="1.25"
                    />
                  </svg>
                </button>

                <p className="label tnum text-ink-3">{job.period}</p>

                <h2
                  id="job-title"
                  className="display mt-4 pr-10 text-[clamp(1.1rem,3.4vw,2rem)] leading-[1.1]"
                >
                  {job.role}
                </h2>

                <p className="mono mt-3 text-sm text-ink">{job.company}</p>

                <p className="mono mt-1 text-xs text-ink-2">
                  {job.length}
                  {job.location ? ` · ${job.location}` : ""}
                </p>

                {job.body.length > 0 && (
                  <div className="mono mt-8 space-y-4 border-t border-rule pt-6 text-xs leading-[1.8] text-ink-2">
                    {job.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}

                <div className="mt-8 border-t border-rule pt-6">
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
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
