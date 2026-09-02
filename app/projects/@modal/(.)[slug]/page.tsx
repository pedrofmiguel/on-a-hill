import { redirect } from "next/navigation";
import Modal from "../../../components/site/Modal";
import ProjectDetail from "../../../components/site/ProjectDetail";
import { getProject } from "../../../data/projects";

// Intercepts /projects/[slug] when navigating from within /projects, showing
// the project in a modal over the carousel instead of a full page load.
export default async function InterceptedProject({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  // An unknown slug goes home, like every other unmatched URL.
  if (!project) redirect("/");

  return (
    <Modal>
      <ProjectDetail project={project} />
    </Modal>
  );
}
