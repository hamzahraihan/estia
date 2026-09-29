import { useRef } from "react";
import gsap from "gsap";
import { motion, useGsap } from "../lib/motion";
import { image, shots } from "../data/media";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";

type Props = {
  onOpen: (project: Project, source: HTMLElement | null) => void;
};

export default function Projects({ onOpen }: Props) {
  const root = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const track = el.querySelector<HTMLElement>(".work-track")!;
      const pad = parseFloat(getComputedStyle(el).getPropertyValue("--shell-pad")) || 24;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + pad);

      const drift = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(
              projects.length - 1,
              Math.round(self.progress * (projects.length - 1)),
            );
            if (counter.current) counter.current.textContent = String(i + 1).padStart(2, "0");
            gsap.set(progress.current, { scaleX: self.progress });
          },
        },
      });

      // Each frame eases against the gallery so the row reads as film.
      const inner = gsap
        .utils.toArray<HTMLElement>(".work-card", el)
        .map((card) =>
          gsap.fromTo(
            card.querySelector("img")!,
            { scale: 1.18 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: drift,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          ),
        );

      return () => {
        drift.scrollTrigger?.kill();
        drift.kill();
        inner.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      };
    });
  }, []);

  return (
    <section
      id="work"
      ref={root}
      className="relative flex h-[100svh] flex-col overflow-hidden bg-char text-bone"
    >
      <div className="flex shrink-0 items-end justify-between gap-8 pt-[clamp(4rem,11vh,8rem)] pb-7 [padding-inline:var(--shell-pad)]">
        <div>
          <p className="mono mb-4 flex items-center gap-3 text-bone/45">
            <span className="inline-block h-px w-8 bg-current" />
            02 — Selected work
          </p>
          <h2 className="display text-[clamp(2rem,4.4vw,4rem)] leading-[0.95]">
            Rooms we have finished building
          </h2>
        </div>
        <p className="mono hidden shrink-0 pb-1 text-bone/45 lg:block">
          {String(projects.length).padStart(2, "0")} projects — 2022 / 2025
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="work-track flex h-full w-max items-center gap-4 pl-[var(--shell-pad)] lg:gap-6">
          {projects.map((project, i) => (
            <button
              key={project.slug}
              type="button"
              data-cursor="View"
              onClick={(e) =>
                onOpen(project, e.currentTarget.querySelector<HTMLElement>(".work-media"))
              }
              className="work-card group flex h-full w-[length:var(--card-w)] shrink-0 flex-col justify-center text-left"
            >
              <div className="work-media reveal-frame relative shrink-0 bg-ink" style={{ aspectRatio: "3 / 4" }}>
                <img
                  src={image(project.cover, 900)}
                  alt={shots[project.cover].alt}
                  width={675}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="mono pointer-events-none absolute right-4 bottom-4 rounded-full border border-bone/30 bg-ink/25 px-3 py-1.5 text-bone/80 opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover:opacity-100">
                  View project
                </span>
              </div>

              <div className="mt-4 shrink-0 border-t border-bone/15 pt-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="display min-w-0 text-[clamp(1.2rem,1.8vw,1.9rem)] leading-[1.05] transition-colors duration-500 group-hover:text-clay">
                    {project.title}
                  </h3>
                  <span className="mono shrink-0 text-bone/45">
                    {String(i + 1).padStart(2, "0")} / {project.year}
                  </span>
                </div>
                <p className="mono mt-2 text-bone/45">
                  {project.place}, {project.country} — {project.category}
                </p>
              </div>
            </button>
          ))}

          <div className="flex h-full shrink-0 items-center pl-4">
            <a href="#contact" className="pill shrink-0 whitespace-nowrap" data-cursor="Link">
              <span className="pill__dot" />
              Commission a project
            </a>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-6 py-7 [padding-inline:var(--shell-pad)]">
        <span ref={counter} className="mono text-bone/70">
          01
        </span>
        <div className="h-px flex-1 bg-bone/15">
          <div ref={progress} className="h-full origin-left scale-x-0 bg-bone/70" />
        </div>
        <span className="mono text-bone/45">{String(projects.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
