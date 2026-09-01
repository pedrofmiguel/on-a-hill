"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { setScrollLocked } from "./SmoothScroll";

/**
 * The overlay shell for an intercepted route (a project opened from the
 * carousel). Closing plays an exit animation and *then* navigates back, so the
 * URL, the browser back button, and deep links all behave correctly.
 */
export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(true);

  /* Portalled to <body> for the same reason as the experience dialog: this
     renders inside <main>, which is `relative z-10` and therefore its own
     stacking context, so a z-index set here could never rise above the site
     header at z-90 and the wordmark painted across the panel. */
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setScrollLocked(true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      setScrollLocked(false);
    };
  }, [close]);

  const content = (
    <AnimatePresence onExitComplete={() => router.back()}>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            aria-hidden
            onClick={close}
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <div
            data-lenis-prevent
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            <div className="flex min-h-full items-start justify-center px-4 py-10 sm:py-16">
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-3xl border border-rule bg-paper p-6 shadow-[0_24px_80px_-24px_oklch(0_0_0/0.35)] sm:p-12"
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-rule bg-paper text-ink-2 transition-colors hover:bg-ink hover:text-paper"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {children}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(content, document.body) : null;
}
