"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Scene from "../Scene";
import { reveal } from "../reveal/store";
import { setScrollLocked } from "../site/SmoothScroll";

const KEY = "gate:entered";

type Phase = "grass" | "leaving" | "done";

const EASE = [0.16, 1, 0.3, 1] as const;

/* The arrival, which is a loading screen wearing ordinary clothes.

   The satellite and its orbit are up on the first frame — they are SVG and cost
   nothing. Everything else waits for the grass, because the grass is the part
   that takes time: a dynamic import, 15,000 instances to generate, and a shader
   that compiles during its first draw. Drawing the ridges before that landed
   meant the entrance played to an empty stage and the field then appeared, fully
   formed, halfway through the greeting.

   Two guards around the wait:

   `minHold` is a floor, not a delay for its own sake. On a warm cache the field
   is ready in well under 200ms, and without a floor the satellite would flash
   past for three frames — which reads as a glitch, not as a loading screen. A
   beat of the satellite alone is the whole idea.

   `maxWait` is the giving-up point. If WebGL is blocked, unavailable, or simply
   slow, `onGrassReady` never fires; without this the visitor would sit looking
   at a satellite forever. At 4s the rest of the drawing goes ahead regardless
   and the entrance plays without its field — degraded, but never stuck. */
const ENTRANCE = {
  minHold: 0.7,
  maxWait: 4,
};

/* The exit is one continuous move cut into overlapping beats. The timings (in
   seconds, from the click) live together here so the choreography can be read
   at a glance instead of reconstructed from delays scattered across the file.

     0.00  the copy fades and lifts away; the satellite climbs out of frame
     0.20  the field tears loose — strokes erode, tumble, blow off downwind
     1.00  the ridges begin withdrawing along their own length
     1.60  the field has finished leaving
     1.90  the last ridge is gone — bare paper
     1.90  the site begins arriving on that same paper
     2.05  the overlay is cut

   The night version of this screen needed a cloud cover: it had to hide an
   opaque dark world being removed, or the hand-off would have been a flash.
   A drawn world needs nothing of the kind. The gate and the site stand on the
   same paper, so once the drawing has gone there is nothing left to hide — the
   overlay is a blank sheet over an identical sheet, and cutting it is
   invisible. That is why `pageIn` and the last ridge land on the same beat and
   `total` follows a breath later: by then the only difference between the two
   layers is the site's own content fading up, and it is still near-zero. */
const EXIT = {
  copyOut: 0.55,
  grassAt: 0.2,
  ridgesAt: 1.0,
  pageIn: 1.9,
  total: 2.05,
};

/**
 * The entrance experience, shown once per browser session:
 *   a drawn hill under a satellite → Enter → the site.
 *
 * The scene is the opaque floor of the overlay and mounts immediately. Its
 * container paints `bg-paper` before anything else initializes, so there is
 * always one fully-opaque layer and the site behind is never visible until the
 * hand-off. The real page still renders underneath for SEO; a pre-paint script
 * hides this overlay for returning visitors, and the effect below unmounts it
 * so its WebGL never initializes.
 */
export default function Gate() {
  const pathname = usePathname();
  // Only when the visitor *arrives* on the homepage. Captured once at mount so
  // later client navigations to "/" (e.g. clicking the logo) don't replay it.
  const [isHome] = useState(() => pathname === "/");

  // Deterministic initial state so SSR and first client render match; the
  // effect immediately corrects it for returning visitors.
  const [phase, setPhase] = useState<Phase>("grass");
  const [mounted, setMounted] = useState(true);
  // Separate from `phase` because the field starts coming apart a beat *after*
  // the click, once the copy is already on its way out.
  const [fieldBreaking, setFieldBreaking] = useState(false);
  // The field has painted (or we have stopped waiting for it): the rest of the
  // drawing may begin.
  const [drawn, setDrawn] = useState(false);
  // Stamped in an effect rather than at `useRef(Date.now())`: reading the clock
  // during render is impure, and a re-render would move the start of the hold.
  const openedAt = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Later again: the ridges hold while the field is still visibly leaving, so
  // the two do not read as one event.
  const [ridgesOut, setRidgesOut] = useState(false);
  const reduced = useReducedMotion();
  const exitTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // No gate on inner pages, and none for anyone who has already been through
    // it this session — in both cases the page may show itself straight away.
    if (!isHome) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(false);
      reveal();
      return;
    }

    // `?gate` in the URL forces the entrance to replay, ignoring the session
    // flag — useful for demos and for testing the intro repeatedly.
    const force = /[?&]gate(=|&|$)/.test(window.location.search);
    const entered = !force && sessionStorage.getItem(KEY) === "1";
    if (entered) {
      setMounted(false);
      reveal();
      return;
    }

    document.body.style.overflow = "hidden";
    setScrollLocked(true);
    return () => {
      document.body.style.overflow = "";
      setScrollLocked(false);
    };
  }, [isHome]);

  // Hand the page back the moment the exit begins, so it can be scrolled while
  // the drawing is still leaving. Releasing the lock is a consequence of the
  // phase change rather than part of the click itself, which keeps the DOM
  // write out of the event handler.
  useEffect(() => {
    if (phase !== "leaving") return;
    document.body.style.overflow = "";
    setScrollLocked(false);
  }, [phase]);

  // Never wait forever on a GPU. Also clears the hold timer, so a slow field
  // that lands mid-unmount cannot set state on a gone component.
  useEffect(() => {
    openedAt.current = Date.now();
    const giveUp = setTimeout(() => setDrawn(true), ENTRANCE.maxWait * 1000);
    return () => {
      clearTimeout(giveUp);
      clearTimeout(holdTimer.current);
    };
  }, []);

  // The exit timers are started by a user gesture rather than a state change,
  // so they are owned by a ref — but they still have to be cleared if the
  // component goes away mid-exit.
  useEffect(() => {
    const timers = exitTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  /* Raised on the field's second frame. Holds the signal back if it arrived
     sooner than `minHold`, so a fast machine still gets a loading screen rather
     than a flicker. Guarded because it costs nothing to be sure this runs once
     — the give-up timer may have fired first. */
  function handleGrassReady() {
    if (drawn) return;
    const elapsed = (Date.now() - openedAt.current) / 1000;
    const remaining = Math.max(0, ENTRANCE.minHold - elapsed);
    holdTimer.current = setTimeout(() => setDrawn(true), remaining * 1000);
  }

  function enter() {
    // Nothing to enter until there is something to leave.
    if (!drawn || phase === "leaving" || phase === "done") return;

    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      // Private mode / storage disabled — the gate just replays next load.
    }
    setPhase("leaving");

    if (reduced) {
      // Same shape, no travel: the drawing is taken off the paper at once and
      // the page arrives on it.
      exitTimers.current.push(setTimeout(() => setRidgesOut(true), 120));
      exitTimers.current.push(setTimeout(reveal, 450));
      exitTimers.current.push(setTimeout(finish, 700));
      return;
    }

    const at = (seconds: number, fn: () => void) =>
      exitTimers.current.push(setTimeout(fn, seconds * 1000));

    at(EXIT.grassAt, () => setFieldBreaking(true));
    at(EXIT.ridgesAt, () => setRidgesOut(true));
    at(EXIT.pageIn, reveal);
    at(EXIT.total, finish);
  }

  /* Ends the entrance.
     `data-gate="done"` must be set HERE and not when Enter is pressed. The CSS
     rule it drives is `display: none !important` on the overlay — it exists so
     a returning visitor never sees a frame of the gate before hydration. Set on
     click, it deletes the overlay instantly and the whole exit plays inside an
     invisible element: from the visitor's side the drawing just snaps away. */
  function finish() {
    document.documentElement.setAttribute("data-gate", "done");
    setPhase("done");
  }

  if (!isHome || !mounted) return null;

  const leaving = phase === "leaving";

  return (
    <AnimatePresence onExitComplete={() => setMounted(false)}>
      {phase !== "done" && (
        <motion.div
          key="gate"
          data-gate-overlay
          className={`fixed inset-0 z-[60] isolate overflow-hidden ${
            leaving ? "pointer-events-none" : ""
          }`}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Scene
            drawn={drawn}
            leaving={leaving}
            ridgesOut={ridgesOut}
            dissolving={fieldBreaking}
            reduced={!!reduced}
            onGrassReady={handleGrassReady}
          />

          <GrassCopy
            drawn={drawn}
            leaving={leaving}
            reduced={!!reduced}
            onEnter={enter}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GrassCopy({
  drawn,
  leaving,
  reduced,
  onEnter,
}: {
  drawn: boolean;
  leaving: boolean;
  reduced: boolean;
  onEnter: () => void;
}) {
  /* Three states now, not two: waiting, present, and gone *upward*. Letting the
     copy leave the way it arrived would rewind the entrance instead of
     continuing it — the exit's first beat has to feel like departure.

     While waiting it holds its initial pose exactly, so the delays below are
     measured from the moment the field lands rather than from mount. Greeting
     someone over a blank sheet is the thing this avoids. */
  const state = leaving
    ? { opacity: 0, y: reduced ? 0 : -18 }
    : drawn
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 18 };

  return (
    /* Centred on the screen. Worth knowing what that costs: the type crosses
       the ridges rather than sitting in clear sky above them, which is why the
       block carries its own soft scrim below. */
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
      {/* Paper, not ink, now that the world beneath it is light — it lifts the
          type off the ridges by clearing a space rather than by darkening one.
          It leaves with the copy it backs: as a plain div it outlived the rest
          of the exit and sat over the revealed hero as a visible smudge. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[46vh] -translate-y-1/2"
        style={{
          background:
            "radial-gradient(58% 50% at 50% 50%, var(--color-paper) 0%, var(--color-paper) 34%, transparent 74%)",
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: EXIT.copyOut, ease: "easeIn" }}
      />

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={state}
        transition={{
          duration: leaving ? EXIT.copyOut : 1.1,
          ease: leaving ? "easeIn" : EASE,
          delay: leaving ? 0 : reduced ? 0 : 0.7,
        }}
        /* 5.2vw is measured, not chosen: the longest line is 20 characters and
           Martian Mono runs ~0.86em per character, so anything wider overflows
           a 390px screen. The line break is hand-placed for the same reason —
           set as one 33-character line it would have to drop to ~3.5vw and stop
           reading as a greeting. */
        className="display relative text-[clamp(0.9rem,5.2vw,5rem)] text-ink"
      >
        thank you for coming
        <br />
        all this way
      </motion.h2>

      <motion.button
        type="button"
        onClick={onEnter}
        initial={{ opacity: 0, y: 12 }}
        animate={state}
        transition={{
          duration: leaving ? EXIT.copyOut * 0.8 : 0.9,
          ease: leaving ? "easeIn" : EASE,
          delay: leaving ? 0 : reduced ? 0 : 1.6,
        }}
        whileHover={leaving ? undefined : { y: -2 }}
        whileTap={leaving ? undefined : { y: 0 }}
        /* Drawn, like everything else on this screen: an ink rule around paper,
           filling with ink when pressed. The night version was a solid paper
           chip, which on paper would be invisible. */
        className="sticker sticker-outline sticker-lg relative mt-[5vh]"
      >
        Enter ↓
      </motion.button>
    </div>
  );
}
