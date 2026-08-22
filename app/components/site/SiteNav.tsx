"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRevealed } from "../reveal/store";
import { setScrollLocked } from "./SmoothScroll";

const LINKS = [
  { label: "Index", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
];

const EMAIL = "hello@pedroferreira.dev";

const META: { title: string; lines: { text: string; href?: string }[] }[] = [
  {
    title: "Commissions",
    lines: [
      { text: EMAIL, href: `mailto:${EMAIL}` },
      { text: "Open for 2026" },
    ],
  },
  {
    title: "Elsewhere",
    lines: [
      { text: "GitHub", href: "https://github.com/" },
      { text: "LinkedIn", href: "https://www.linkedin.com/" },
    ],
  },
];

/* One shared curve for the whole menu, so the panel and the type feel like the
   same gesture rather than two animations that happen to overlap. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const panel = {
  hidden: { opacity: 0 },
  open: {
    opacity: 1,
    transition: {
      duration: 0.55,
      ease: "easeOut" as const,
      // The sheet arrives first; the words start writing themselves onto it.
      delayChildren: 0.24,
      staggerChildren: 0.055,
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.45,
      ease: "easeIn" as const,
      // ...and on the way out the words leave first, then the sheet.
      delay: 0.38,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

/* Each line rides inside an overflow-hidden mask, so it is wiped in by its own
   edge rather than simply appearing. */
const line = {
  hidden: { y: "115%" },
  open: { y: "0%", transition: { duration: 0.9, ease: EASE_OUT } },
  closed: { y: "-115%", transition: { duration: 0.5, ease: "easeIn" as const } },
};

const fade = {
  hidden: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
  closed: { opacity: 0, transition: { duration: 0.3 } },
};

export default function SiteNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // The header lives above the entrance gate in the stacking order, so without
  // this it painted its wordmark, its burger and its paper scrim straight over
  // the intro and the grass. It waits for the same hand-off the page content
  // waits for, then arrives just behind it.
  const revealed = useRevealed();

  // "Open" is stored as *the route the menu was opened on*, rather than a
  // boolean. Any navigation — a link, or the browser's back button — therefore
  // closes the menu on its own, with no effect watching the pathname.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // The state setter, not the `setOpen` helper: this one is stable, so
        // the listener isn't torn down and rebuilt on every render.
        setOpenedAt(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setScrollLocked(true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      setScrollLocked(false);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* `mix-blend-difference` has to live on the header, not on the nav
          inside it: the header is `fixed` with a z-index, so it opens its own
          stacking context, and a blend mode applied within that composites
          against the header's own (empty) backdrop instead of the page. */}
      <header
        data-nav-shell
        aria-hidden={!revealed}
        className={`pointer-events-none fixed inset-x-0 top-0 z-[90] mix-blend-difference transition-opacity duration-700 ease-out ${
          revealed ? "opacity-100 delay-300" : "opacity-0"
        }`}
      >
        {/* The capability field's type is enormous and passes directly under
            this bar, which left ink-on-ink where they met. A paper scrim fixed
            that but showed as a pale band against the page's own backdrop, so
            the bar inverts instead: pure white through `difference` reads as
            near-black on paper and near-white over the ink menu sheet or a big
            black word, with nothing painted in the empty space between. */}
        <nav className="relative mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 text-white sm:px-10">
          <Link
            href="/"
            tabIndex={revealed ? undefined : -1}
            data-nav-item
            className={`label ${
              revealed ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            Pedro Ferreira
          </Link>

          <MenuButton
            ref={buttonRef}
            open={open}
            enabled={revealed}
            onClick={() => setOpen(!open)}
          />
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            id="site-menu"
            variants={reduced ? fade : panel}
            initial="hidden"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-[80] bg-ink text-paper"
          >
            <div className="mx-auto flex h-full max-w-[1600px] flex-col px-6 pb-10 pt-28 sm:px-10 sm:pb-14 sm:pt-32">
              {/* The links take the whole middle of the sheet and sit centred
                  in it, so three items don't leave a hole under the header. */}
              <ul className="flex flex-1 flex-col justify-center">
                {LINKS.map((l) => (
                  <li key={l.href} className="overflow-hidden py-[0.4vh]">
                    <motion.div variants={reduced ? fade : line}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-baseline gap-4 sm:gap-8"
                      >
                        <span
                          className={`display text-[11vw] leading-[1.12] transition-colors duration-300 sm:text-[8.5vw] lg:text-[7vw] ${
                            isActive(l.href)
                              ? "text-paper"
                              : "text-paper/45 group-hover:text-paper"
                          }`}
                        >
                          {l.label}
                        </span>
                        {isActive(l.href) && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
                        )}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex flex-col gap-8 border-t border-paper/15 pt-8 sm:flex-row sm:justify-between sm:gap-16">
                {META.map((group) => (
                  <div key={group.title} className="overflow-hidden">
                    <motion.div variants={reduced ? fade : line}>
                      <p className="label text-paper/40">{group.title}</p>
                      <ul className="mt-3 space-y-1">
                        {group.lines.map((entry) => (
                          <li key={entry.text} className="mono text-xs text-paper/85">
                            {entry.href ? (
                              <a
                                href={entry.href}
                                target={
                                  entry.href.startsWith("http")
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  entry.href.startsWith("http")
                                    ? "noreferrer"
                                    : undefined
                                }
                                className={`link-rule ${
                                  entry.text === EMAIL ? "text-accent" : ""
                                }`}
                              >
                                {entry.text}
                              </a>
                            ) : (
                              entry.text
                            )}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                ))}

                <div className="overflow-hidden sm:text-right">
                  <motion.div variants={reduced ? fade : line}>
                    <p className="label text-paper/40">Based in</p>
                    <p className="mono mt-3 text-xs text-paper/85">
                      Porto, Portugal — working anywhere
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Two bars that become a cross, with the word alongside — the label does the
   explaining so the icon does not have to. */
function MenuButton({
  open,
  onClick,
  enabled,
  ref,
}: {
  open: boolean;
  onClick: () => void;
  /** False while the entrance gate is still up, so the hidden bar can't be
      clicked or tabbed into. */
  enabled: boolean;
  ref: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      tabIndex={enabled ? undefined : -1}
      data-nav-item
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className={`group flex items-center gap-3 ${
        enabled ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <span className="label hidden sm:inline">{open ? "Close" : "Menu"}</span>
      <span className="relative block h-4 w-6">
        <span
          className={`absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[3px] rotate-0"
          }`}
        />
        <span
          className={`absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open
              ? "top-1/2 -translate-y-1/2 -rotate-45"
              : "top-[11px] rotate-0 group-hover:w-4"
          }`}
        />
      </span>
    </button>
  );
}
