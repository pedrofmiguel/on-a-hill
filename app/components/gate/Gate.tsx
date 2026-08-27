"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Scene from "../Scene";
import Intro from "./Intro";
import { reveal } from "../reveal/store";
import { setScrollLocked } from "../site/SmoothScroll";

const KEY = "gate:entered";

type Phase = "intro" | "grass" | "leaving" | "done";

const EASE = [0.16, 1, 0.3, 1] as const;

/* The exit is one continuous move cut into overlapping beats. The timings (in
   seconds, from the click) live together here so the choreography can be read
   at a glance instead of reconstructed from delays scattered across the file.

     0.00  the copy fades and lifts away
     0.20  the field tears loose — blades erode, tumble, blow off downwind
     1.00  cloud cover rolls in, thickening over the emptying hill
     1.60  the field has finished leaving
     2.20  under full cover, the night is cut away in a single frame
     2.60  the site begins arriving beneath the cloud
     2.66  the cover starts thinning — the page shows through it
     4.20  the last cloud clears

   Two things the middle depends on. The clouds must *outlast* the cover, so the
   site is revealed through thinning cloud rather than behind a lifted curtain.
   And the cover must not close before the field has finished coming apart —
   the whole point of the dissolve is that it is watched. */
const EXIT = {
  copyOut: 0.65,
  grassAt: 0.2,
  cloudsAt: 1.0,
  cloudsDur: 3.2,
  /* The night is switched off, not faded. It happens while the wash sits at a
     measured opacity of 1.00 (see WASH_TIMES: the hold runs 1.79s–2.45s), so
     there is nothing to see through and a cut is invisible. Fading it instead
     would mean compositing an opacity animation across two WebGL canvases for
     no visual gain — and it lets the scene unmount, releasing both contexts. */
  sceneOutAt: 2.2,
  pageIn: 2.6,
  total: 4.3,
};

/* Keyframe positions within the cloud layer's own 0..1 life. The wash (the flat
   paper sheet that guarantees full coverage) clears earlier than the cloud
   shapes on top of it, which is what leaves cloud drifting over the live site.
   Its hold — 0.30 to 0.52, i.e. 1.96s–2.66s — is the window the night is cut
   away in, so `sceneOutAt` has to sit inside it. */
const WASH_TIMES = [0, 0.3, 0.52, 0.92, 1];

/* Per segment, so the cloud arrives and leaves on different curves: it builds
   with a slow start and a firm finish, holds, then drains off gently. One
   easing applied to every segment (the old arrangement) makes the whole life
   feel machine-timed. */
const CLOUD_EASE = [
  [0.33, 0, 0.25, 1] as const,
  "linear" as const,
  [0.35, 0, 0.55, 1] as const,
];

/**
 * The entrance experience, shown once per browser session:
 *   intro (white + clouds) → grass (starry night) → Enter → the site.
 *
 * The grass scene is the opaque floor of the overlay and mounts immediately
 * (warming up its WebGL under the intro). The white intro simply fades out on
 * top of it, so there is always one fully-opaque layer and the site behind is
 * never visible until the hand-off. The real page still renders underneath for
 * SEO; a pre-paint script hides this overlay for returning visitors, and the
 * effect below unmounts it so its WebGL never initializes.
 */
export default function Gate() {
  const pathname = usePathname();
  // Only when the visitor *arrives* on the homepage. Captured once at mount so
  // later client navigations to "/" (e.g. clicking the logo) don't replay it.
  const [isHome] = useState(() => pathname === "/");

  // Deterministic initial state so SSR and first client render match; the
  // effect immediately corrects it for returning visitors.
  const [phase, setPhase] = useState<Phase>("intro");
  const [mounted, setMounted] = useState(true);
  // Separate from `phase` because the field starts coming apart a beat *after*
  // the click, once the copy is already on its way out.
  const [fieldBreaking, setFieldBreaking] = useState(false);
  // Unmounts the whole night world (and both its WebGL contexts) mid-exit,
  // hidden behind the cloud cover at its thickest.
  const [nightGone, setNightGone] = useState(false);
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
    const t = setTimeout(() => setPhase("grass"), reduced ? 1400 : 4000);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      setScrollLocked(false);
    };
  }, [isHome, reduced]);

  // Hand the page back the moment the exit begins, so it can be scrolled while
  // the cloud is still clearing. Releasing the lock is a consequence of the
  // phase change rather than part of the click itself, which keeps the DOM
  // write out of the event handler.
  useEffect(() => {
    if (phase !== "leaving") return;
    document.body.style.overflow = "";
    setScrollLocked(false);
  }, [phase]);

  // The exit timers are started by a user gesture rather than a state change,
  // so they are owned by a ref — but they still have to be cleared if the
  // component goes away mid-exit.
  useEffect(() => {
    const timers = exitTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  function enter() {
    if (phase === "leaving" || phase === "done") return;

    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      // Private mode / storage disabled — the gate just replays next load.
    }
    setPhase("leaving");

    if (reduced) {
      // Same shape, no weather: the cover holds, the night is cut, the page
      // arrives from behind it.
      exitTimers.current.push(setTimeout(() => setNightGone(true), 600));
      exitTimers.current.push(setTimeout(reveal, 650));
      exitTimers.current.push(setTimeout(finish, 1700));
      return;
    }

    const at = (seconds: number, fn: () => void) =>
      exitTimers.current.push(setTimeout(fn, seconds * 1000));

    at(EXIT.grassAt, () => setFieldBreaking(true));
    at(EXIT.sceneOutAt, () => setNightGone(true));
    // The page begins its own entrance under the cloud, so by the time the
    // cover thins there is already something there to be revealed.
    at(EXIT.pageIn, reveal);
    at(EXIT.total, finish);
  }

  /* Ends the entrance.
     `data-gate="done"` must be set HERE and not when Enter is pressed. The CSS
     rule it drives is `display: none !important` on the overlay — it exists so
     a returning visitor never sees a frame of the gate before hydration. Set on
     click, it deletes the overlay instantly and the whole exit plays inside an
     invisible element: from the visitor's side the grass just snaps to a white
     page. */
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
          /* No background of its own any more. The night lives on the layer
             below, so it can be removed under the cloud while this shell stays
             mounted and transparent for the final clearing. */
          className={`fixed inset-0 z-[60] isolate overflow-hidden ${
            leaving ? "pointer-events-none" : ""
          }`}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* The night world. Opaque, and the floor of the overlay until the
              cloud cover is thick enough to take it away unseen. */}
          {!nightGone && (
            <div className="absolute inset-0">
              <Scene dissolving={fieldBreaking} />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[3]"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 42%, oklch(0.14 0.045 264 / 0.6) 100%)",
                }}
              />
            </div>
          )}

          <GrassCopy
            active={phase === "grass"}
            leaving={leaving}
            reduced={!!reduced}
            onEnter={enter}
          />

          {/* Cloud cover: rolls in over the emptying hill, holds long enough to
              hide the night leaving, then thins out over the live site. */}
          <CloudCover active={leaving} reduced={!!reduced} />

          {/* White greeting, on top, fades away to reveal the grass beneath. */}
          <AnimatePresence>
            {phase === "intro" && (
              <motion.div
                key="intro"
                className="absolute inset-0 z-20"
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <Intro />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Individual clouds. `rise` and `sideways` are where each one drifts as it
   breaks up, in vh/vw — they pull apart in different directions so the cover
   tears rather than dilating uniformly. Sizes overlap generously; the wash
   underneath is what actually guarantees full coverage at the peak. */
/* `hold` pushes back the moment this particular cloud starts to thin, as a
   fraction of the layer's life. Without it every cloud began draining on the
   same frame, which made the cover come off like a single sheet. */
const CLOUDS = [
  { x: "20%", y: "30%", size: "96vmax", rise: -16, sideways: -9, lead: 0, hold: 0.1 },
  { x: "80%", y: "22%", size: "88vmax", rise: -12, sideways: 11, lead: 0.05, hold: 0 },
  { x: "50%", y: "78%", size: "108vmax", rise: -20, sideways: 4, lead: 0.02, hold: 0.15 },
  { x: "6%", y: "72%", size: "84vmax", rise: -14, sideways: -13, lead: 0.08, hold: 0.05 },
  { x: "94%", y: "66%", size: "80vmax", rise: -18, sideways: 14, lead: 0.11, hold: 0.12 },
];

/* Brighter and warmer than the page, so once the wash has cleared the cloud
   shapes are still legible drifting across the site rather than blending into
   it. Opacity does the rest of the work. */
const CLOUD_FILL =
  "radial-gradient(circle at 50% 50%, #fffdf8 0%, #fffdf8 38%, rgba(255,253,248,0.55) 58%, transparent 74%)";

function CloudCover({ active, reduced }: { active: boolean; reduced: boolean }) {
  // Reduced motion gets the same beats without the weather: a plain hold and
  // clear, so the page still arrives from *behind* something.
  if (reduced) {
    return (
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[30] bg-paper"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1.6, times: [0, 0.3, 0.55, 1] }}
      />
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[30]">
      {/* The wash. Flat paper, so at the peak there is genuinely nothing to see
          through — that is the window in which the night is removed. It clears
          before the clouds do. */}
      <motion.div
        className="absolute inset-0 bg-paper"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: [0, 1, 1, 0, 0] } : { opacity: 0 }}
        transition={{
          duration: EXIT.cloudsDur,
          delay: active ? EXIT.cloudsAt : 0,
          times: WASH_TIMES,
          ease: "easeInOut",
        }}
      />

      {CLOUDS.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: c.x,
            top: c.y,
            width: c.size,
            height: c.size,
            background: CLOUD_FILL,
            // The radial fill already falls off softly, so the blur is only
            // knocking the last edge off it. Measured: at 30px, five of these
            // scaling past 1.8x dropped ~7 frames during the clear.
            filter: "blur(18px)",
          }}
          initial={{ opacity: 0, scale: 0.62, x: "-50%", y: "-50%" }}
          animate={
            active
              ? {
                  opacity: [0, 1, 1, 0],
                  scale: [0.62, 1.06, 1.2, 1.6],
                  // Percentages are of the element's own box, so the centring
                  // offset has to be carried through every keyframe.
                  x: ["-50%", "-50%", "-50%", `calc(-50% + ${c.sideways}vw)`],
                  y: ["-50%", "-50%", "-50%", `calc(-50% + ${c.rise}vh)`],
                }
              : { opacity: 0, scale: 0.62, x: "-50%", y: "-50%" }
          }
          transition={{
            duration: EXIT.cloudsDur,
            delay: active ? EXIT.cloudsAt - c.lead : 0,
            times: [0, 0.36, 0.5 + c.hold, 1],
            ease: CLOUD_EASE,
          }}
        />
      ))}
    </div>
  );
}

function GrassCopy({
  active,
  leaving,
  reduced,
  onEnter,
}: {
  active: boolean;
  leaving: boolean;
  reduced: boolean;
  onEnter: () => void;
}) {
  // Three states, not two: waiting below, present, and gone *upward*. Letting
  // the copy leave the way it arrived would rewind the entrance instead of
  // continuing it — beat 1 has to feel like departure.
  const state = (base: number) =>
    leaving
      ? { opacity: 0, y: reduced ? 0 : -18 }
      : active
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: base };

  return (
    /* Anchored into the sky rather than centred on the screen. The horizon sits
       around 40% down, so the copy lives above it and the grass below stays
       clear — centring put the type across the hills, where it had to fight the
       busiest part of the picture. */
    <div className="absolute inset-x-0 top-[11%] z-10 flex flex-col items-center px-6 text-center sm:top-[9%]">
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={state(18)}
        transition={{
          duration: leaving ? EXIT.copyOut : 1.1,
          ease: leaving ? "easeIn" : EASE,
          delay: leaving ? 0 : active && !reduced ? 0.4 : 0,
        }}
        /* 5.2vw is measured, not chosen: the longest line is 19 characters and
           Martian Mono runs ~0.86em per character, so anything wider overflows
           a 390px screen. */
        className="display text-[clamp(0.9rem,5.2vw,5rem)] text-paper"
      >
        take a breath,
        <br />
        and touch the grass
      </motion.h2>

      <motion.button
        type="button"
        onClick={onEnter}
        initial={{ opacity: 0, y: 12 }}
        animate={state(12)}
        transition={{
          duration: leaving ? EXIT.copyOut * 0.8 : 0.9,
          ease: leaving ? "easeIn" : EASE,
          delay: leaving ? 0 : active && !reduced ? 1.3 : 0,
        }}
        whileHover={leaving ? undefined : { y: -2 }}
        whileTap={leaving ? undefined : { y: 0 }}
        /* The site's own sticker, inverted for the night. The blurred glass pill
           this replaces belonged to no other part of the design. */
        className="sticker sticker-solid sticker-lg mt-[6vh]"
      >
        Enter ↓
      </motion.button>
    </div>
  );
}
