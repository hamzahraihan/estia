import { useRef } from "react";
import gsap from "gsap";
import { ease, motion, useGsap } from "../lib/motion";
import { process } from "../data/studio";

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const spine = gsap.fromTo(
        ".process-spine span",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: ".process-list",
            start: "top 68%",
            end: "bottom 78%",
            scrub: 0.6,
          },
        },
      );

      const rows = gsap.utils.toArray<HTMLElement>(".process-row", el).map((row) => {
        const tween = gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 86%" },
        });
        tween
          .from(row.querySelectorAll("[data-part]"), {
            y: 50,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.08,
            ease: ease.out,
          })
          .fromTo(
            row.querySelector(".process-row-line")!,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: ease.out },
            0,
          );
        return tween;
      });

      return () => {
        spine.scrollTrigger?.kill();
        spine.kill();
        rows.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      };
    });
  }, []);

  return (
    <section
      id="process"
      ref={root}
      className="relative overflow-hidden bg-char py-[clamp(5rem,13vh,10rem)] text-bone"
    >
      <div className="shell">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mono mb-5 flex items-center gap-3 text-bone/45">
              <span className="inline-block h-px w-8 bg-current" />
              04 — How a project runs
            </p>
            <h2 className="display max-w-[18ch] text-[length:var(--text-title)]">
              Four stages, no surprises
            </h2>
          </div>
          <p className="mono max-w-[38ch] leading-[1.8] text-bone/45 lg:text-right">
            Typical residential programme, first meeting to handover
          </p>
        </div>

        <ol className="process-list relative grid gap-10 lg:grid-cols-4 lg:gap-8">
          <div className="process-spine absolute top-0 bottom-0 left-0 hidden w-px bg-bone/12 lg:block">
            <span className="block h-full w-full bg-bone/55" />
          </div>

          {process.map((step) => (
            <li
              key={step.index}
              className="process-row relative grid gap-4 pt-7 lg:pl-9"
            >
              <span className="process-row-line absolute top-0 left-0 block h-px w-full origin-left bg-bone/20" />
              <div className="flex items-baseline justify-between gap-4">
                <span className="mono text-bone/45" data-part>
                  {step.index}
                </span>
                <span className="mono text-bone/45" data-part>
                  {step.duration}
                </span>
              </div>
              <h3 className="display text-[clamp(1.75rem,3vw,2.6rem)]" data-part>
                {step.title}
              </h3>
              <p className="max-w-[38ch] text-[0.98rem] leading-[1.7] text-bone/65" data-part>
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
