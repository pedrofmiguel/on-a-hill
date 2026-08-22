"use client";

import { useRef } from "react";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../data/projects";

const DRAG_THRESHOLD = 8; // px moved before a press counts as a drag, not a click

/**
 * A horizontally scrollable, snap-aligned rail of project cards.
 *
 * - Touch / trackpad: native horizontal scroll (with snap).
 * - Mouse: click-and-drag to pan, and vertical wheel maps to horizontal.
 * - A drag is prevented from also firing the card's navigation click.
 */
export default function ProjectCarousel({
  projects,
}: {
  projects: Project[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  function onPointerDown(e: React.PointerEvent) {
    // Only hijack precise pointers (mouse); leave touch to native scrolling.
    if (e.pointerType === "touch") return;
    const rail = railRef.current;
    if (!rail) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: rail.scrollLeft,
      moved: 0,
    };
    rail.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    rail.scrollLeft = drag.current.startScroll - dx;
  }

  function endDrag(e: React.PointerEvent) {
    const rail = railRef.current;
    if (rail?.hasPointerCapture(e.pointerId)) {
      rail.releasePointerCapture(e.pointerId);
    }
    drag.current.active = false;
  }

  // If the press turned into a drag, swallow the click so we don't navigate.
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  }

  function onWheel(e: React.WheelEvent) {
    const rail = railRef.current;
    if (!rail) return;
    // Convert a dominant vertical wheel into horizontal movement.
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      rail.scrollLeft += e.deltaY;
    }
  }

  return (
    <div
      ref={railRef}
      // Without this, a wheel over the rail scrolls the page vertically (Lenis)
      // and the rail horizontally at the same time.
      data-lenis-prevent
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onWheel={onWheel}
      className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:scroll-px-10 sm:px-10 [&::-webkit-scrollbar]:hidden"
      style={{ cursor: "grab", touchAction: "pan-x" }}
    >
      {projects.map((p) => (
        <ProjectCard key={p.slug} project={p} />
      ))}
      {/* Trailing spacer so the last card can snap fully into view. */}
      <div aria-hidden className="shrink-0 basis-2 sm:basis-4" />
    </div>
  );
}
