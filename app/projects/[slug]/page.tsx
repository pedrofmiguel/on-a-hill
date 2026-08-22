import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectDetail from "../../components/site/ProjectDetail";
import Reveal from "../../components/reveal/Reveal";
import { PROJECTS, getProject } from "../../data/projects";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 sm:px-10 sm:pt-40">
      <Reveal>
        <Link href="/projects" className="label link-rule text-ink-2">
          ← All projects
        </Link>
      </Reveal>
      <Reveal delay={0.08} y={22} className="mt-10">
        <ProjectDetail project={project} />
      </Reveal>
    </div>
  );
}
