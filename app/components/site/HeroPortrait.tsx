import Image from "next/image";

/**
 * Pedro at a laptop.
 *
 * The head is the real avatar (a PNG); everything below it — shoulders, arms,
 * the machine, the desk — is drawn here in the same register: black strokes,
 * round joins, flat off-white fills. Compositing the authentic head onto simple
 * line art is the only way this stays recognisably *him* without my redrawing a
 * face by hand and getting it subtly wrong.
 *
 * The avatar file ships with a real alpha channel — its white background was
 * flood-filled out from the border, leaving the enclosed whites (the face, the
 * lenses) opaque. An earlier pass leaned on `mix-blend-multiply` to hide that
 * background instead, which silently did nothing: <main> is `z-10`, so the
 * blend composited against an empty backdrop rather than the page.
 */

/* Where the drawn head actually sits inside the 1200×1200 avatar file, which is
   mostly padding. These fractions place the *face*, not the image box. */
const HEAD_WIDTH_IN_FILE = 0.6;
const HEAD_CENTRE_X_IN_FILE = 0.5;
const HEAD_TOP_IN_FILE = 0.2;

const VIEW = { w: 520, h: 404 };
const HEAD = { cx: 260, top: 34, width: 160 };

const imageWidth = HEAD.width / HEAD_WIDTH_IN_FILE;
const imageLeft = HEAD.cx - imageWidth * HEAD_CENTRE_X_IN_FILE;
const imageTop = HEAD.top - imageWidth * HEAD_TOP_IN_FILE;

/* Matched to the avatar's own line rather than guessed. Its strokes are ~14px
   in a 1200px file, and that file is drawn here at `imageWidth` units wide — so
   one file pixel is imageWidth/1200 units, and the line is 14 of them. Getting
   this wrong is what made the first pass look like two different drawings. */
const STROKE = Math.round((14 * imageWidth) / 1200);

export default function HeroPortrait({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={className} aria-hidden>
      {/* One coordinate space shared by the drawing and the head, so the two
          scale together however large the container gets. The caller owns the
          size and must preserve the aspect ratio (`aspect-[520/404]`) — that
          lets the hero drive this from the *height* it has spare, which is what
          keeps it out of the headline on short, wide viewports. */}
      <div className="relative h-full w-full">
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          fill="none"
          className="absolute inset-0 h-full w-full"
        >
          <g
            stroke="var(--color-ink)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Neck, then torso.
                Two proportions carry this and both were wrong at first: the
                neck is ~0.2 of the head's height (it was three times that, and
                read as a periscope), and the machine's top edge sits just below
                the shoulder line — drop it and the exposed arc above it stops
                reading as a body and starts reading as a hill. */}
            <path d="M240 214 V254" />
            <path d="M280 214 V254" />
            <path
              d="M100 388 C106 336 148 268 210 256 C240 250 280 250 310 256 C372 268 414 336 420 388"
              fill="var(--color-paper)"
            />

            {/* Forearms, coming down outside the machine to the desk. */}
            <path d="M118 314 C102 342 106 366 126 378" />
            <path d="M402 314 C418 342 414 366 394 378" />

            {/* The machine. Filled, so it occludes the torso behind it. */}
            <rect
              x="142"
              y="266"
              width="236"
              height="96"
              rx="8"
              fill="var(--color-paper-2)"
            />
            <path
              d="M126 362 L394 362 L410 386 L110 386 Z"
              fill="var(--color-paper)"
            />

            {/* Desk. */}
            <path d="M40 386 H480" />
          </g>
        </svg>

        {/* The head, in the same coordinate space, sized in percentages so it
            tracks the drawing exactly. */}
        <Image
          src="/avatar.png"
          alt=""
          width={1200}
          height={1200}
          priority
          className="pointer-events-none absolute select-none"
          style={{
            left: `${(imageLeft / VIEW.w) * 100}%`,
            top: `${(imageTop / VIEW.h) * 100}%`,
            width: `${(imageWidth / VIEW.w) * 100}%`,
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}
