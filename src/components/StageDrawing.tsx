import { useRef } from "react";
import gsap from "gsap";
import { motion, useGsap } from "../lib/motion";
import wire from "../assets/stage-listen-wireframe.webp";
import stripple from "../assets/stage-listen-stripple.webp";

export type StageDrawingProps = {
  className?: string;
};

/**
 * How far the card travels while it is pinned, in screens. Long enough that
 * the edge crosses the drawing at a pace you can read the drawing arriving,
 * short enough that four pinned cards do not turn the section into a corridor.
 */
const PIN = 0.7;

/**
 * The stage artwork: one axonometric of the flat in two states. A card opens
 * on the wireframe — everything surveyed, nothing decided — pins itself, and
 * hands the drawing over to the stipple behind a single straight edge that
 * travels down the card as the visitor scrolls. At the bottom of the pin the
 * edge is off the sheet, the card lets go, and the page carries on. Scroll back
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
export default function StageDrawing({ className = "" }: StageDrawingProps) {
  const root = useRef<HTMLDivElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "center center",
          end: () => `+=${Math.round(window.innerHeight * PIN)}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(
          el.querySelector<HTMLElement>(".stage-settled"),
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
          0,
        )
        .fromTo(
          el.querySelector<HTMLElement>(".stage-wire"),
          { clipPath: "inset(0% 0% 0% 0%)" },
          { clipPath: "inset(100% 0% 0% 0%)", ease: "none" },
          0,
        );

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    });
  }, []);

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
          className="stage-wire block w-full"
          style={{ clipPath: "inset(100% 0% 0% 0%)" }}
        />
        <img
          src={stripple}
          alt=""
          className="stage-settled absolute inset-0 size-full object-contain"
        />
      </div>
    </div>
  );
}
