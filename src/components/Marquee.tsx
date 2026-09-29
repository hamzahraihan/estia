import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useGsap, usePrefersReducedMotion } from "../lib/motion";
import { disciplines } from "../data/studio";

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const track = el.querySelector<HTMLElement>(".marquee")!;
      const loop = gsap.to(track, {
        x: () => -track.scrollWidth / 2,
        duration: () => track.scrollWidth / 2 / 55,
        ease: "none",
        repeat: -1,
      });

      // The band leans into the scroll, then settles — the standard tell that
      // the page is under a hand.
      const skew = gsap.quickTo(track, "skewX", { duration: 0.6, ease: "power3" });
      const velocity = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => skew(gsap.utils.clamp(-11, 11, self.getVelocity() / -260)),
      });

      return () => {
        loop.kill();
        velocity.kill();
      };
    });
  }, []);

  // The loop needs a second copy; a static strip does not.
  const run = reduced ? [...disciplines] : [...disciplines, ...disciplines];

  return (
    <div
      ref={root}
      className="overflow-hidden border-y border-ink/12 bg-linen py-5 text-ink"
      aria-label="Disciplines"
    >
      <div className="marquee">
        {run.map((item, i) => (
          <span key={`${item}-${i}`} className="flex shrink-0 items-center">
            <span className="display px-7 text-[clamp(1.4rem,2.6vw,2.4rem)] whitespace-nowrap">
              {item}
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0 opacity-45">
              <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="1" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
