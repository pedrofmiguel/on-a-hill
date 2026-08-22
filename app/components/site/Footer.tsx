import Reveal from "../reveal/Reveal";

const EMAIL = "hello@pedroferreira.dev";

const ELSEWHERE = [
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
];

// The last thing on every page is the one thing worth doing: writing to him.
// So the address is the largest type in the footer, and everything else is set
// small enough to stay out of its way.
export default function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-[1600px] px-6 pb-10 pt-[18vh] sm:px-10">
      <Reveal>
        <p className="label text-ink-3">Say hello</p>
        <a
          href={`mailto:${EMAIL}`}
          className="link-rule mt-5 inline-block text-[clamp(0.8rem,4vw,3.25rem)] font-normal leading-[1.25] tracking-[-0.03em] text-ink"
        >
          {EMAIL}
        </a>
      </Reveal>

      <div className="mt-[10vh] flex flex-col gap-6 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label text-ink-3">© 2026 — On a hill</p>

        <ul className="flex flex-wrap gap-2">
          {ELSEWHERE.map((l) => (
            <li key={l.label}>
              <a
                className="sticker"
                href={l.href}
                target="_blank"
                rel="noreferrer"
              >
                {l.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
