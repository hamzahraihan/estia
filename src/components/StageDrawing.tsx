import { useRef } from "react";
import listenWire from "../assets/stage-listen-wireframe.webp";
import listenStripple from "../assets/stage-listen-stripple.webp";
import drawWire from "../assets/stage-draw-wireframe.webp";
import drawStripple from "../assets/stage-draw-stripple.webp";
import sourceWire from "../assets/stage-source-wireframe.webp";
import sourceStripple from "../assets/stage-source-stripple.webp";
import buildWire from "../assets/stage-build-wireframe.webp";
import buildStripple from "../assets/stage-build-stripple.webp";

/** The four stages, in the order the process runs. */
export type Stage = "listen" | "draw" | "source" | "build";

/**
 * Which drawing belongs to which stage, in process order. The Build pair is
 * cropped square from a taller sheet — the card it lands in is square, so a
 * full-bleed portrait would lose its top and bottom to the card's own crop.
 */
const ARTWORK: Record<Stage, { wire: string; stripple: string }> = {
  listen: { wire: listenWire, stripple: listenStripple },
  draw: { wire: drawWire, stripple: drawStripple },
  source: { wire: sourceWire, stripple: sourceStripple },
  build: { wire: buildWire, stripple: buildStripple },
};

export type StageDrawingProps = {
  stage: Stage;
  className?: string;
};

/**
 * The stage artwork: one axonometric of the flat in two states. A card opens
 * on the wireframe — everything surveyed, nothing decided — and while its row
 * is pinned, hands the drawing over to the stipple behind a single straight edge that
 * travels down the card as the visitor scrolls. At the bottom of the pin the
 * edge is off the sheet, the row lets go, and the page carries on. Scroll back
 * up and the edge comes back with it.
 *
 * The edge is one line doing two jobs. The stipple is clipped to below it and
 * the survey to above it, so the finished drawing is never laid over the
 * wireframe it replaced — there is no frame, however brief, where both are
 * showing and the survey ghosts up through the paper.
 *
 * Both layers ship matted: the white they were drawn on is real transparency,
 * so the card's own surface comes through them. That is a second copy of each
 * file on disk and it is worth it. Multiplying the white out instead needs
 * nothing extra and is a level off the card no matter what colour the card is —
 * and the eye finds a straight edge across a flat field at one level without
 * being told to.
 *
 * The markup holds the *finished* state, and the animation rewinds it. With
 * `prefers-reduced-motion` the tween never runs, so the card arrives already
 * drawn rather than stuck on the survey with nothing to reveal it.
 *
 * Decorative: the stage copy beside the card says all of this, so neither layer
 * carries alt text of its own.
 */
export default function StageDrawing({ stage, className = "" }: StageDrawingProps) {
  const root = useRef<HTMLDivElement>(null);
  const { wire, stripple } = ARTWORK[stage];

  return (
    <div
      ref={root}
      className={`relative isolate overflow-hidden border border-bone-2 bg-linen ${className}`}
    >
      {/* One box, sized by the survey, with the stipple lying over it in exactly
          the same one — nothing here has to stay in step with the file's own
          proportions. */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <img
          src={wire}
          alt=""
          loading="lazy"
          decoding="async"
          className="stage-wire block w-full h-full"
          style={{ clipPath: "inset(100% 0% 0% 0%)" }}
        />
        <img
          src={stripple}
          alt=""
          loading="lazy"
          decoding="async"
          className="stage-settled absolute inset-0 size-full object-contain"
        />
      </div>
    </div>
  );
}
