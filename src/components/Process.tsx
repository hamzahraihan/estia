import { useRef } from "react";
import gsap from "gsap";
import { ease, motion, useGsap } from "../lib/motion";
import { process } from "../data/studio";
import StageDrawing, { type Stage } from "./StageDrawing";

/** Which drawing each stage shows. Same order as `process`. */
const STAGES: Stage[] = ["listen", "draw", "source", "build"];

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const rows = gsap.utils.toArray<HTMLElement>(".process-row", el).map((row) =>
        gsap.timeline({ scrollTrigger: { trigger: row, start: "top 86%" } }).from(
          row.querySelectorAll("[data-part]"),
          {
            y: 50,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.08,
            ease: ease.out,
          },
        ),
      );

      return () => {
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

        {/* Feature rows: half text, half card, swapping sides each time. The
            `order` pair does the alternation rather than duplicating markup,
            so the row stays one column on small screens and only splits once
            there is room for two equal halves. */}
        <ol className="process-list relative flex flex-col gap-16 lg:gap-28">
          {process.map((step, i) => (
            <li
              key={step.index}
              className="process-row grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-16"
            >
              <div className={i % 2 ? "lg:order-2" : undefined}>
                <div className="flex items-baseline justify-between gap-4" data-part>
                  <span className="mono text-bone/45">{step.index}</span>
                  <span className="mono text-bone/45">{step.duration}</span>
                </div>
                <h3
                  className="display mt-4 text-[clamp(2rem,4vw,3.4rem)]"
                  data-part
                >
                  {step.title}
                </h3>
                <p
                  className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.75] text-bone/65"
                  data-part
                >
                  {step.body}
                </p>
              </div>

              <StageDrawing
                stage={STAGES[i]}
                className={`aspect-square w-full rounded-[30px] ${i % 2 ? "lg:order-1" : ""}`}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
