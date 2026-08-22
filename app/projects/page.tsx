import type { Metadata } from "next";
import ProjectCarousel from "../components/site/ProjectCarousel";
import Reveal from "../components/reveal/Reveal";
import { PROJECTS } from "../data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected projects by Pedro Ferreira — live client sites, product work, and side projects.",
};

export default function ProjectsPage() {
  return (
    <div className="pt-32 sm:pt-40">
      <header className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <Reveal>
          <p className="label text-ink-3">Projects</p>
        </Reveal>

        <Reveal delay={0.08} y={22} duration={1}>
          <h1 className="display mt-6 max-w-[18ch] text-[clamp(1.15rem,5.4vw,4.5rem)] leading-[1.08]">
            A drawer of things I&apos;ve made
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mono mt-8 max-w-[46ch] text-xs leading-[1.7] text-ink-2">
            Drag them around. Open one if you want the details.
          </p>
        </Reveal>
      </header>

      <Reveal delay={0.22} y={24} className="mt-[10vh]">
        <ProjectCarousel projects={PROJECTS} />
      </Reveal>
    </div>
  );
}
