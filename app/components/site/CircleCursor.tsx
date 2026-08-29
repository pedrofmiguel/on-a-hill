"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Wraps a drawing so that, while the pointer is over it, the arrow is replaced
 * by a circle that trails the cursor — with an optional label set inside it.
 *
 * This is not the site-wide custom cursor that was built and cut earlier. That
 * one replaced the pointer everywhere, including over text and links, which is
 * where a custom cursor stops being a flourish and starts being an obstacle.
 * This one exists inside two elements and nowhere else: `cursor-none` is scoped
 * to the wrapper, so the moment you leave the drawing you have your own pointer
 * back.
 *
 * Why a rAF lerp rather than writing the pointer position straight to a
 * transform: the first version of the hero hover did exactly that, and a chip
 * welded to the cursor with no lag of its own is what made it feel wrong —
 * there was no object there, just a label teleporting. Easing toward the
 * pointer gives it mass, and it is the same trick the projects rail uses.
 *
 * Fine pointers only. On touch there is no hover to express, so the wrapper
 * renders as plain markup and the circle never mounts.
 */
export default function CircleCursor({
  children,
  className = "",
  label,
  href,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  /** Set inside the circle. Omit for a plain circle with nothing to say. */
  label?: string;
  /** Present only when the drawing actually goes somewhere. */
  href?: string;
  ariaLabel?: string;
}) {
  const hostRef = useRef<HTMLElement | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();

  // Everything per-frame lives here. Routing pointer position through state
  // would re-render the drawing sixty times a second.
  const p = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const frame = () => {
      const s = p.current;
      // Snap for reduced motion: the trail *is* the motion, so there is
      // nothing to soften, only to remove.
      const k = reduced ? 1 : 0.18;
      s.x += (s.tx - s.x) * k;
      s.y += (s.ty - s.y) * k;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  function onEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    // Place it *at* the pointer before it becomes visible, or it flies in from
    // the corner of the drawing on the first frame.
    const r = hostRef.current?.getBoundingClientRect();
    if (r) {
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      p.current = { x, y, tx: x, ty: y };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    }
    setActive(true);
  }

  function onMove(e: React.PointerEvent) {
    const r = hostRef.current?.getBoundingClientRect();
    if (!r) return;
    p.current.tx = e.clientX - r.left;
    p.current.ty = e.clientY - r.top;
  }

  const size = label ? 136 : 56;

  const inner = (
    <span className="relative block h-full w-full">
      {children}

      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 hidden will-change-transform [@media(pointer:fine)]:block"
      >
        {/* Two nested transforms on purpose: the outer div is written to every
            frame by the loop, this one owns the enter/leave animation. Sharing
            one element would mean the rAF write clobbered the CSS transition. */}
        <div
          className="flex items-center justify-center rounded-full bg-ink text-center transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            opacity: active ? 1 : 0,
            transform: active ? "scale(1)" : "scale(0.4)",
            // A paper ring, not decoration: both drawings are ink line art on
            // paper, so an ink circle crossing the hair or a shoe dissolves
            // into it. Against the page itself the ring is the page colour and
            // cannot be seen at all.
            boxShadow: "0 0 0 3px var(--color-paper)",
          }}
        >
          {label && (
            <span className="label max-w-[80%] leading-[1.5] text-paper">
              {label}
            </span>
          )}
        </div>
      </div>
    </span>
  );

  // A ref callback rather than a ref object handed to both branches: the
  // element is an <a> or a <div> depending on `href`, and this keeps one ref
  // without casting between the two element types.
  const setHost = (el: HTMLElement | null) => {
    hostRef.current = el;
  };

  const handlers = {
    onPointerEnter: onEnter,
    onPointerMove: onMove,
    onPointerLeave: () => setActive(false),
  };

  const base = `block [@media(pointer:fine)]:cursor-none ${className}`;

  // The drawing is only a link when there is somewhere to go. On touch the
  // anchor keeps its pointer events off, so a large decorative illustration
  // never opens an external site because a thumb brushed it; `pointer-events`
  // does not affect focus, so the keyboard path survives.
  if (href) {
    return (
      <a
        ref={setHost}
        {...handlers}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={ariaLabel}
        className={`${base} pointer-events-none [@media(pointer:fine)]:pointer-events-auto`}
      >
        {inner}
      </a>
    );
  }

  return (
    <div ref={setHost} {...handlers} aria-hidden className={base}>
      {inner}
    </div>
  );
}
