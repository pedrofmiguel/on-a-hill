import type { Project } from "../../data/projects";

// The full write-up for a single project. Rendered both as a standalone page
// (/projects/[slug]) and inside the intercepted modal, so it stays a plain,
// server-friendly component with no layout assumptions of its own.
export default function ProjectDetail({ project }: { project: Project }) {
  return (
    <article>
      <p className="label tnum text-ink-3">
        {project.role} · {project.year}
      </p>

      <h1 className="display mt-5 text-[clamp(1.15rem,5vw,3.75rem)] leading-[1.08]">
        {project.title}
      </h1>

      <p className="mt-7 max-w-[46ch] text-sm font-normal leading-[1.6] tracking-[-0.02em] text-ink sm:text-base">
        {project.summary}
      </p>

      {/* Standing in for a hero shot: the project's flat colour, full width. */}
      <div
        className="mt-10 aspect-[16/10] w-full border border-rule"
        style={{ background: project.accent }}
      />

      <div className="mt-10 max-w-[62ch] space-y-5 text-base leading-[1.55] text-ink-2">
        {project.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <dl className="mt-12 border-t border-rule pt-6">
        <dt className="label text-ink-3">Built with</dt>
        <dd className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="sticker">
              {tag}
            </span>
          ))}
        </dd>
      </dl>

      {project.url && (
        <div className="mt-8">
          <a
            className="link-accent link-rule text-sm font-normal tracking-[-0.02em]"
            href={project.url}
            target="_blank"
            rel="noreferrer"
          >
            {project.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
          </a>
        </div>
      )}
    </article>
  );
}
