"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../data/projects";

/** px of movement before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 8;
/** How much of the remaining distance the rail closes per second. */
const FOLLOW = 0.0018;
/** Momentum decay, per 16ms frame. */
const FRICTION = 0.93;
/** Degrees. Capped low: past about 4 it stops reading as speed and starts
 *  reading as a broken layout. */
const MAX_SKEW = 3.5;

/**
 * The projects rail.
 *
 * Driven by a transform on an inner track rather than the viewport's
 * `scrollLeft`, and stepped by a rAF loop. Four things were making the old
 * version feel rough, and this addresses all of them:
 *
 *  - `scrollLeft` is integer-quantised, so every drag frame landed on a whole
 *    pixel and the motion stair-stepped. A transform is sub-pixel and composited
 *    on the GPU.
 *  - The pointer delta was written straight to the scroll position, so the rail
 *    tracked the cursor exactly and stopped dead on release. It now eases toward
 *    a target and carries momentum after you let go.
 *  - `snap-mandatory` yanked to the nearest card the moment the drag ended.
 *    Snapping cannot coexist with custom physics, so it is gone.
 *  - Wheel deltas were added raw, in notch-sized jumps.
 *
 * The track also skews slightly in proportion to its speed — the one flourish,
 * and the reason the movement reads as weight rather than as sliding.
 *
 * Everything per-frame is written to the DOM directly. Routing progress and the
 * active index through React state would re-render the whole rail sixty times a
 * second, which is exactly the jank being removed.
 */
export default function ProjectCarousel({
  projects,
}: {
  projects: Project[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Hover and drag change rarely, so they can afford to be state.
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  /* On a wide enough viewport every card fits and there is nothing to drag.
     Advertising a grab cursor, a drag chip and a position indicator for a rail
     that cannot move is a promise the interface can't keep. */
  const [scrollable, setScrollable] = useState(true);

  const s = useRef({
    target: 0,
    current: 0,
    vel: 0,
    max: 0,
    railW: 0,
    thumbW: 0,
    centres: [] as number[],
    step: 0,
    down: false,
    startX: 0,
    startTarget: 0,
    lastX: 0,
    moved: 0,
    captured: false,
    index: -1,
    lastT: 0,
  });

  const clamp = (v: number) => Math.max(0, Math.min(s.current.max, v));

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!viewport || !track) return;

    const st = s.current;
    const viewW = viewport.clientWidth;
    const trackW = track.scrollWidth;
    st.max = Math.max(0, trackW - viewW);

    const cards = Array.from(track.children).filter(
      (c) => (c as HTMLElement).dataset.card !== undefined,
    ) as HTMLElement[];
    st.centres = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
    st.step = cards[0] ? cards[0].offsetWidth + 20 : viewW * 0.8;

    // Thumb width mirrors the visible fraction, so the rail doubles as an
    // honest indicator of how much there is.
    if (thumb) {
      const frac = trackW > 0 ? Math.min(1, viewW / trackW) : 1;
      st.railW = thumb.parentElement?.clientWidth ?? 0;
      st.thumbW = Math.max(28, st.railW * frac);
      thumb.style.width = `${st.thumbW}px`;
    }

    st.target = clamp(st.target);
    setScrollable(st.max > 1);
  }, []);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // The loop. Owns every per-frame write.
  useEffect(() => {
    let raf = 0;

    const frame = (now: number) => {
      const st = s.current;
      const dt = st.lastT ? Math.min(now - st.lastT, 50) : 16;
      st.lastT = now;

      if (!st.down) {
        st.target += st.vel * (dt / 16);
        st.vel *= Math.pow(FRICTION, dt / 16);
        if (Math.abs(st.vel) < 0.02) st.vel = 0;
      }
      st.target = Math.max(0, Math.min(st.max, st.target));

      // Frame-rate independent easing, so it settles at the same speed on a
      // 60Hz panel and a 144Hz one.
      const k = reduced ? 1 : 1 - Math.pow(FOLLOW, dt / 1000);
      const before = st.current;
      st.current += (st.target - st.current) * k;
      if (Math.abs(st.target - st.current) < 0.05) st.current = st.target;

      const speed = st.current - before;
      const skew = reduced
        ? 0
        : Math.max(-MAX_SKEW, Math.min(MAX_SKEW, -speed * 0.14));

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-st.current}px, 0, 0) skewX(${skew}deg)`;
      }

      const p = st.max > 0 ? st.current / st.max : 0;
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateX(${p * (st.railW - st.thumbW)}px)`;
      }

      if (st.centres.length && viewportRef.current) {
        const centre = st.current + viewportRef.current.clientWidth / 2;
        let idx = 0;
        let best = Infinity;
        for (let i = 0; i < st.centres.length; i++) {
          const d = Math.abs(st.centres[i] - centre);
          if (d < best) {
            best = d;
            idx = i;
          }
        }
        if (idx !== st.index) {
          st.index = idx;
          if (counterRef.current) {
            counterRef.current.textContent = String(idx + 1).padStart(2, "0");
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Wheel. Horizontal deltas always belong to the rail; a vertical wheel is
  // borrowed only while there is travel left in that direction, so reaching
  // either end hands the page back and the rail never traps the scroll.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const st = s.current;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const d = horizontal ? e.deltaX : e.deltaY;
      if (!horizontal) {
        if (d > 0 && st.target >= st.max - 0.5) return;
        if (d < 0 && st.target <= 0.5) return;
      }
      e.preventDefault();
      st.target = Math.max(0, Math.min(st.max, st.target + d));
      st.vel = 0;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function moveChip(e: React.PointerEvent) {
    const rect = viewportRef.current?.getBoundingClientRect();
    const chip = chipRef.current;
    if (!rect || !chip) return;
    chip.style.transform = `translate3d(${e.clientX - rect.left + 18}px, ${
      e.clientY - rect.top - 14
    }px, 0)`;
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const st = s.current;
    st.down = true;
    st.captured = false;
    st.startX = e.clientX;
    st.lastX = e.clientX;
    st.startTarget = st.target;
    st.moved = 0;
    st.vel = 0;
    // Deliberately no setPointerCapture yet — see onPointerMove.
  }

  function onPointerMove(e: React.PointerEvent) {
    moveChip(e);
    const st = s.current;
    if (!st.down) return;
    const dx = e.clientX - st.startX;
    st.moved = Math.max(st.moved, Math.abs(dx));

    /* Capture only once this is unmistakably a drag.
       Capturing on pointerdown retargets the subsequent click to the element
       holding the capture, so a plain click on a card fired on the rail rather
       than on the card's link and never navigated. Waiting for the threshold
       leaves an ordinary click's targeting alone, and by the time the pointer
       has travelled 8px there is a real drag to keep hold of. */
    if (!st.captured && st.moved > DRAG_THRESHOLD) {
      viewportRef.current?.setPointerCapture(e.pointerId);
      st.captured = true;
      setDragging(true);
    }

    st.target = st.startTarget - dx;
    // Velocity from the last move, which is what the momentum phase inherits.
    st.vel = -(e.clientX - st.lastX) * 0.85;
    st.lastX = e.clientX;
  }

  function endDrag(e: React.PointerEvent) {
    const st = s.current;
    if (st.captured && viewportRef.current?.hasPointerCapture(e.pointerId)) {
      viewportRef.current.releasePointerCapture(e.pointerId);
    }
    st.down = false;
    st.captured = false;
    setDragging(false);
  }

  // A press that turned into a drag must not also open the card.
  function onClickCapture(e: React.MouseEvent) {
    if (s.current.moved > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
      s.current.moved = 0;
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const st = s.current;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      st.target = Math.min(st.max, st.target + st.step);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      st.target = Math.max(0, st.target - st.step);
    }
  }

  // The track is transformed, not scrolled, so the browser cannot bring a
  // focused card into view by itself.
  function onFocusCapture(e: React.FocusEvent) {
    const st = s.current;
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    const viewport = viewportRef.current;
    if (!card || !viewport) return;
    const left = card.offsetLeft;
    const right = left + card.offsetWidth;
    const viewW = viewport.clientWidth;
    if (left < st.target) st.target = Math.max(0, left - 24);
    else if (right > st.target + viewW) {
      st.target = Math.min(st.max, right - viewW + 24);
    }
  }

  return (
    <div>
      <div
        ref={viewportRef}
        role="region"
        aria-label="Projects — drag, scroll or use the arrow keys"
        tabIndex={0}
        // Lenis has to keep its hands off, or a wheel here would move the page
        // and the rail at once.
        data-lenis-prevent
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => {
          setHovering(false);
          setDragging(false);
        }}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        onFocusCapture={onFocusCapture}
        className={`relative overflow-hidden outline-none ${
          !scrollable
            ? "cursor-default"
            : dragging
              ? "cursor-grabbing select-none"
              : "cursor-grab"
        }`}
        // Vertical page scrolling stays native on touch; the horizontal axis is
        // ours.
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-5 px-6 pb-6 will-change-transform sm:px-10"
        >
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        {/* Same chip language as the experience timeline. */}
        <div
          ref={chipRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 hidden will-change-transform [@media(pointer:fine)]:block"
        >
          <span
            className={`sticker sticker-solid border border-ink transition-opacity duration-200 ${
              hovering && scrollable ? "opacity-100" : "opacity-0"
            }`}
          >
            {dragging ? "↔ Dragging" : "Drag ↔"}
          </span>
        </div>
      </div>

      {/* Position indicator. Doubles as an honest measure of how much rail is
          left, since the thumb is as wide as the visible fraction — and it is
          absent entirely when there is no rail to indicate. */}
      <div
        className={`mx-auto mt-4 flex max-w-[1600px] items-center gap-5 px-6 transition-opacity duration-300 sm:px-10 ${
          scrollable ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!scrollable}
      >
        <span className="relative h-px flex-1 bg-rule">
          <span
            ref={thumbRef}
            aria-hidden
            className="absolute left-0 top-[-1px] block h-[3px] bg-ink will-change-transform"
          />
        </span>
        <span className="mono tnum text-[10px] text-ink-3">
          <span ref={counterRef}>01</span> / {String(projects.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
