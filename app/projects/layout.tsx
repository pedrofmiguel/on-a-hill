// The `@modal` slot renders alongside the page. When a card links to
// /projects/[slug], the intercepting route fills this slot with a modal;
// on a direct visit or refresh, the slot falls back to default.tsx (null)
// and the full [slug] page renders instead.
export default function ProjectsLayout(props: LayoutProps<"/projects">) {
  return (
    <>
      {props.children}
      {props.modal}
    </>
  );
}
