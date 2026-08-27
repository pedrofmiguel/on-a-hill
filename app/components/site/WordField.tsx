"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

type Word = { t: string; bright?: boolean };

/**
 * The capability field: the tools and disciplines, set large and mostly dimmed,
 * with a few pulled up to full ink so the eye has somewhere to land.
 *
 * There are ~38 entries here rather than the dozen this started with, so the
 * words are smaller and the rows more numerous — it reads as a dense field of
 * texture rather than a handful of poster words. Bright entries are placed
 * early in their row on purpose: rows deliberately run off the right edge, and
 * a highlight that lands in the cropped tail is a highlight nobody sees.
 *
 * Two knobs per row:
 *   `indent` — a resting offset in vw, so the rows don't stack on one hard left
 *              edge and the block reads as a composition, not a list.
 *   `drift`  — how far right of that resting place the row starts, in px. It
 *              is always positive and always settles back to the indent, so the
 *              rows only ever run off the *right* edge. Drifting left would
 *              chop the first word in half, which reads as a bug rather than as
 *              a crop.
 *
 * The magnitudes differ enough that the rows still shear past one another.
 */
const ROWS: { indent: number; drift: number; words: Word[] }[] = [
  {
    indent: 0,
    drift: 70,
    words: [{ t: "JavaScript" }, { t: "·" }, { t: "TypeScript", bright: true }, { t: "·" }, { t: "React" }],
  },
  {
    indent: 3,
    drift: 40,
    words: [{ t: "Vue" }, { t: "·" }, { t: "Angular" }, { t: "·" }, { t: "Interface Design", bright: true }],
  },
  {
    indent: 0,
    drift: 90,
    words: [{ t: "HTML" }, { t: "·" }, { t: "CSS" }, { t: "·" }, { t: "Sass" }, { t: "·" }, { t: "Styled Components" }],
  },
  {
    indent: 2,
    drift: 55,
    words: [{ t: "Node.js", bright: true }, { t: "·" }, { t: "NestJS" }, { t: "·" }, { t: "PHP" }, { t: "·" }, { t: "Ruby on Rails" }],
  },
  {
    indent: 0,
    drift: 80,
    words: [{ t: "Design Systems", bright: true }, { t: "·" }, { t: "Micro-interactions" }],
  },
  {
    indent: 4,
    drift: 35,
    words: [{ t: "MySQL" }, { t: "·" }, { t: "MongoDB" }, { t: "·" }, { t: "Redux" }, { t: "·" }, { t: "Jest" }],
  },
  {
    indent: 1,
    drift: 65,
    words: [{ t: "Docker" }, { t: "·" }, { t: "AWS", bright: true }, { t: "·" }, { t: "Terraform" }, { t: "·" }, { t: "Jenkins" }],
  },
  {
    indent: 0,
    drift: 95,
    words: [{ t: "Git" }, { t: "·" }, { t: "GitHub Actions" }, { t: "·" }, { t: "Webpack" }, { t: "·" }, { t: "WordPress" }],
  },
  {
    indent: 3,
    drift: 45,
    words: [{ t: "Figma" }, { t: "·" }, { t: "Prototyping" }, { t: "·" }, { t: "Motion", bright: true }, { t: "·" }, { t: "WebGL" }, { t: "·" }, { t: "3D" }],
  },
  {
    indent: 0,
    drift: 75,
    words: [{ t: "Accessibility", bright: true }, { t: "·" }, { t: "Agile" }, { t: "·" }, { t: "Jira" }, { t: "·" }, { t: "E-Commerce" }, { t: "·" }, { t: "Creative Development" }],
  },
];

/* Two short statements dropped into the gaps in the type. They are the only
   fully-black, small, tightly-set text in the section, so they read as asides
   scribbled over the poster rather than as part of the list. */
const NOTES = [
  {
    className: "right-6 top-[8%] text-right sm:right-10",
    lines: ["Same tools as everyone.", "Different decisions."],
  },
  {
    className:
      "left-1/2 bottom-[10%] -translate-x-1/2 text-center sm:left-[42%]",
    lines: ["Made slowly, on purpose.", "Shipped anyway."],
  },
];

export default function WordField() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Measured across the section's full pass through the viewport, so the drift
  // is tied to reading position rather than to absolute page offset.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={ref}
      aria-labelledby="capabilities-heading"
      className="relative overflow-hidden border-y border-rule py-[12vh]"
    >
      <h2 id="capabilities-heading" className="label px-6 text-ink-3 sm:px-10">
        What I actually do
      </h2>

      <div className="mt-[6vh] flex flex-col gap-[0.5vh]">
        {ROWS.map((row, i) => (
          <Row
            key={i}
            row={row}
            index={i}
            progress={scrollYProgress}
            reduced={!!reduced}
          />
        ))}
      </div>

      {NOTES.map((note, i) => (
        <p
          key={i}
          className={`pointer-events-none absolute z-10 max-w-[15rem] text-[11px] font-medium leading-[1.5] tracking-[-0.01em] text-ink sm:text-xs ${note.className}`}
        >
          {note.lines.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </p>
      ))}

      {/* A whisper, for anyone who leans in. Parked in the clear space below the
          rows: at its old mid-field position it landed on top of a word once the
          field grew from five rows to ten, and read as a mistake. */}
      <p className="mono pointer-events-none absolute bottom-[6%] right-[8%] z-10 hidden max-w-[9rem] text-right text-[9px] leading-[1.4] text-ink-3 md:block">
        a dot lived here once
      </p>
    </section>
  );
}

function Row({
  row,
  index,
  progress,
  reduced,
}: {
  row: { indent: number; drift: number; words: Word[] };
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduced: boolean;
}) {
  const x = useTransform(progress, [0, 1], [row.drift, 0]);

  return (
    <motion.div
      style={
        reduced
          ? { paddingLeft: `${row.indent}vw` }
          : { x, paddingLeft: `${row.indent}vw` }
      }
      // w-max + the section's overflow-hidden lets the long rows run off the
      // right edge, so the field feels like a crop of something larger.
      className="flex w-max items-baseline gap-[0.3em] whitespace-nowrap px-6 sm:px-10"
    >
      {row.words.map((w, j) => (
        <span
          key={`${w.t}-${j}`}
          className={
            reduced
              ? "display-word"
              : "display-word word-float"
          }
          style={
            reduced
              ? undefined
              : ({
                  // Deterministic per-word so server and client agree, but
                  // irregular enough that no two neighbours bob together.
                  "--float-dur": `${11 + ((index * 3 + j * 5) % 7)}s`,
                  "--float-delay": `${((index * 2 + j * 3) % 9) * 0.4}s`,
                } as React.CSSProperties)
          }
        >
          <span className={w.bright ? "text-ink" : "text-dim"}>{w.t}</span>
        </span>
      ))}
    </motion.div>
  );
}
