import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease, motion, useGsap } from "../lib/motion";
import { studio } from "../data/studio";

type Props = {
  /** Fired as the curtain starts to lift — the hero plays its entrance here. */
  onReveal: () => void;
  /** Fired once the viewport is fully handed back to the page. */
  onDone: () => void;
};

const PANELS = 5;

export default function Preloader({ onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGsap((mm) => {
    const el = root.current;
    if (!el) return;

    const panels = el.querySelectorAll<HTMLElement>(".preloader-panel");
    // The masks stay put; only the type inside them travels. Animating the
    // mask would carry the text out of the layout unclipped, which is what
    // made the type blink away instead of sliding out of its slot.
    const texts = el.querySelectorAll<HTMLElement>(".preloader-text");
    const rule = el.querySelector<HTMLElement>(".preloader-rule")!;

    // Hinged along the top edge, so the curtain lifts downward and uncovers the
    // top of the hero first. Hinged at the centre it swept upward from the
    // bottom instead, exposing the darkest end of the scrim while the bright
    // image stayed hidden — the black gap that read as a blink.
    gsap.set(panels, { yPercent: 0, transformOrigin: "center top" });
    gsap.set(texts, { yPercent: 120 });
    gsap.set(bar.current, { scaleX: 0 });
    gsap.set(el, { autoAlpha: 1 });

    const build = () => {
      const state = { n: 0 };
      const tl = gsap.timeline({ onComplete: onDone });

      tl.to(
        state,
        {
          n: 100,
          duration: 1.85,
          ease: "power2.inOut",
          onUpdate: () => {
            if (count.current) {
              count.current.textContent = String(Math.round(state.n)).padStart(3, "0");
            }
          },
        },
      )
        .to(bar.current, { scaleX: 1, duration: 1.85, ease: "power2.inOut" }, 0)
        .to(texts, { yPercent: 0, duration: 1, stagger: 0.09, ease: ease.out }, 0.15)
        // Type clears upward inside its masks, then the rule drains behind it.
        .to(texts, { yPercent: -115, duration: 0.7, stagger: 0.05, ease: ease.io }, 1.55)
        .to(
          bar.current,
          { scaleX: 0, transformOrigin: "right center", duration: 0.6, ease: ease.io },
          1.7,
        )
        // The rule goes with the fill; otherwise its track is left floating over
        // the hero as the curtain uncovers it.
        .to(rule, { autoAlpha: 0, duration: 0.5, ease: ease.io }, 1.75)
        // The hand-over is one continuous gesture: the hero's entrance is
        // cued to the same instant the curtain starts to part, so the visitor
        // watches the page assemble through the opening rather than finding it
        // already finished on the other side.
        .call(onReveal, [], 1.9)
        .to(
          panels,
          // Dead straight. The ease is flat at its start, so even a small
          // per-panel offset reads as a large step in the leading edge.
          { yPercent: 101, duration: 1.2, ease: ease.io },
          1.95,
        );

      return () => {
        tl.kill();
      };
    };

    mm.add(motion.full, () => {
      let cleanup: (() => void) | undefined;
      let cancelled = false;
      cleanup = build(); // start the count NOW, don't wait for fonts
      // Re-measure SplitText layouts once the display face arrives —
      // the curtain no longer waits for it.
      document.fonts?.ready.catch(() => undefined).then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
      return () => { cancelled = true; cleanup?.(); };
    });

    mm.add(motion.reduce, () => {
      onReveal();
      onDone();
    });
  }, []);

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-100 text-bone"
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            className="curtain preloader-panel"
            style={{ left: `${(i / PANELS) * 100}%` }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col justify-between py-[calc(var(--shell-pad)*0.9)] [padding-inline:var(--shell-pad)]">
        <p className="overflow-hidden">
          <span className="preloader-text block mono">
            {studio.name} — {studio.discipline}
          </span>
        </p>

        <div className="flex items-end justify-between gap-6">
          <p className="overflow-hidden">
            <span className="preloader-text block mono">
              {studio.city}, {studio.country} — Est. {studio.founded}
            </span>
          </p>
          <div className="display overflow-hidden text-[clamp(4.5rem,17vw,15rem)] leading-[0.82]">
            <span ref={count} className="preloader-text block tabular-nums">
              000
            </span>
          </div>
        </div>

        <div className="preloader-rule h-px w-full bg-bone/25">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-bone" />
        </div>
      </div>
    </div>
  );
}
