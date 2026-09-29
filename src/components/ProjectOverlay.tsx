import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease, lockScroll, motion, splitLines, useGsap } from "../lib/motion";
import { image, shots } from "../data/media";
import { studio } from "../data/studio";
import type { Project, ProjectEntry } from "../data/projects";

type Props = {
  entry: ProjectEntry | null;
  projects: Project[];
  onClose: () => void;
  onNext: (project: Project) => void;
};

const PANELS = 5;

/**
 * Curtain state. A panel is parked above the fold and slides down to cover the
 * viewport, then continues on to park below it — so "cover" and "reveal" are
 * the same gesture read in opposite directions.
 */
const PARKED_ABOVE = { yPercent: -101, transformOrigin: "center bottom" };
const PARKED_BELOW = { yPercent: 101, transformOrigin: "center top" };
const STAGGER = { each: 0.05, from: "center" as const };

/** A card's rectangle expressed as the transforms that map the hero onto it. */
function boxOf(el: HTMLElement) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2 - vw / 2,
    y: r.top + r.height / 2 - vh / 2,
    sx: r.width / vw,
    sy: r.height / vh,
    onScreen: r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw,
  };
}

export default function ProjectOverlay({ entry, projects, onClose, onNext }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const running = useRef(false);
  const opener = useRef<HTMLElement | null>(null);

  const project = entry?.project ?? null;
  const index = project ? projects.findIndex((p) => p.slug === project.slug) : -1;
  const next = index >= 0 ? projects[(index + 1) % projects.length] : null;

  const close = useCallback(() => {
    const el = root.current;
    const source = entry?.source ?? null;
    if (!el || running.current) return;
    running.current = true;

    const mm = gsap.matchMedia();
    mm.add(motion.full, () => {
      const media = el.querySelector<HTMLElement>(".ov-media")!;
      const img = el.querySelector<HTMLElement>(".ov-media img")!;
      const panels = el.querySelectorAll<HTMLElement>(".ov-panel");
      const box = source ? boxOf(source) : null;
      const tl = gsap.timeline({
        onComplete: () => {
          mm.revert();
          lockScroll(false);
          opener.current?.focus({ preventScroll: true });
          onClose();
        },
      });

      // 1 — everything but the hero photo drops away, the curtain drops in.
      tl.to(".ov-chrome, .ov-fade", { autoAlpha: 0, duration: 0.45, ease: ease.io }, 0)
        .set(panels, PARKED_ABOVE, 0)
        .to(panels, { yPercent: 0, duration: 0.6, ease: ease.io, stagger: STAGGER }, 0);

      if (box?.onScreen) {
        // 2 — the photo unrolls back into the card it came out of, and the
        // curtain parts around it.
        tl.set(
          media,
          { x: box.x, y: box.y, scaleX: box.sx, scaleY: box.sy, transformOrigin: "center center" },
          0.42,
        )
          .set(img, { scaleX: 1 / box.sx, scaleY: 1 / box.sy }, 0.42)
          .to(media, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.95, ease: ease.io }, 0.58)
          .to(img, { scaleX: 1, scaleY: 1, duration: 0.95, ease: ease.io }, 0.58)
          .to(panels, { ...PARKED_BELOW, duration: 0.8, ease: ease.io, stagger: STAGGER }, 0.68);
      } else {
        tl.to(el, { autoAlpha: 0, duration: 0.55, ease: ease.io }, 0.45).to(
          panels,
          { ...PARKED_BELOW, duration: 0.7, ease: ease.io, stagger: STAGGER },
          0.55,
        );
      }

      return () => tl.kill();
    });
  }, [entry, onClose]);

  // Opening choreography: the card's rectangle unrolls into the full-bleed hero
  // while the curtain drops in over it and parts again.
  useGsap((mm) => {
    if (!entry) return;
    const el = root.current;
    const scrollTo = scroller.current;
    if (!el || !scrollTo) return;

    opener.current = document.activeElement as HTMLElement | null;
    lockScroll(true);
    scrollTo.scrollTo(0, 0);
    closeBtn.current?.focus({ preventScroll: true });

    mm.add(motion.reduce, () => {
      gsap.set(el, { autoAlpha: 1 });
      return () => gsap.set(el, { autoAlpha: 0 });
    });

    mm.add(motion.full, () => {
      const media = el.querySelector<HTMLElement>(".ov-media")!;
      const img = el.querySelector<HTMLElement>(".ov-media img")!;
      const scrim = el.querySelector<HTMLElement>(".ov-scrim")!;
      const panels = el.querySelectorAll<HTMLElement>(".ov-panel");
      const title = splitLines(el.querySelector(".ov-title")!);
      const rise = el.querySelectorAll<HTMLElement>("[data-rise]");

      gsap.set(el, { autoAlpha: 1 });
      gsap.set(panels, PARKED_ABOVE);
      gsap.set(".ov-chrome, .ov-fade", { autoAlpha: 1 });
      gsap.set(rise, { yPercent: 120, autoAlpha: 0 });
      gsap.set(title.lines, { yPercent: 120 });
      gsap.set(scrim, { opacity: 0 });

      const box = entry.source ? boxOf(entry.source) : null;
      if (box?.onScreen) {
        gsap.set(media, {
          x: box.x,
          y: box.y,
          scaleX: box.sx,
          scaleY: box.sy,
          transformOrigin: "center center",
        });
        gsap.set(img, { scaleX: 1 / box.sx, scaleY: 1 / box.sy });
      } else {
        gsap.set(media, { scaleX: 1.12, scaleY: 1.12, transformOrigin: "center center" });
        gsap.set(img, { scaleX: 1 / 1.12, scaleY: 1 / 1.12 });
      }

      const tl = gsap
        .timeline()
        .to(panels, { yPercent: 0, duration: 0.55, ease: ease.io, stagger: STAGGER }, 0)
        .to(media, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 1.15, ease: ease.io }, 0.42)
        .to(img, { scaleX: 1, scaleY: 1, duration: 1.15, ease: ease.io }, 0.42)
        .to(panels, { ...PARKED_BELOW, duration: 0.85, ease: ease.io, stagger: STAGGER }, 0.62)
        .to(scrim, { opacity: 1, duration: 1, ease: ease.out }, 0.5)
        .to(title.lines, { yPercent: 0, duration: 1.2, stagger: 0.06, ease: ease.out }, 0.95)
        .to(rise, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.07, ease: ease.out }, 1.15)
        .set(panels, { pointerEvents: "none" })
        .call(() => {
          running.current = false;
        });

      // Everything under the fold rises as the overlay's own scroller reaches it.
      const triggers = gsap.utils.toArray<HTMLElement>(".ov-fade .ov-reveal", el).map((node) => {
        gsap.set(node, { y: 48, autoAlpha: 0 });
        return ScrollTrigger.create({
          scroller: scrollTo,
          trigger: node,
          start: "top 92%",
          once: true,
          onEnter: () => gsap.to(node, { y: 0, autoAlpha: 1, duration: 1.15, ease: ease.out }),
        });
      });
      gsap.utils.toArray<HTMLElement>(".ov-fade .ov-reveal img", el).forEach((node) => {
        gsap.set(node, { scale: 1.18 });
        triggers.push(
          ScrollTrigger.create({
            scroller: scrollTo,
            trigger: node,
            start: "top 94%",
            once: true,
            onEnter: () => gsap.to(node, { scale: 1, duration: 1.6, ease: ease.out }),
          }),
        );
      });
      ScrollTrigger.refresh();

      return () => {
        tl.kill();
        title.revert();
        triggers.forEach((t) => t.kill());
      };
    });

    return () => lockScroll(false);
  }, [entry]);

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, close]);

  if (!entry || !project) return null;

  return (
    <div
      ref={root}
      className="invisible fixed inset-0 z-100 bg-char text-bone"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — ${project.category}`}
    >
      <div ref={scroller} className="h-full w-full overflow-y-auto overscroll-contain">
        {/* Keyed so stepping to the next project replaces the article outright:
            SplitText still holds a reference to the outgoing heading, and its
            revert would otherwise write the previous title back into the new one. */}
        <article key={project.slug} className="pb-40">
          <header className="relative h-[100svh] w-full overflow-hidden">
            <div className="ov-media absolute inset-0">
              <img
                src={image(project.cover, 2000)}
                alt={shots[project.cover].alt}
                width={1500}
                height={2000}
                className="h-full w-full object-cover"
                decoding="async"
              />
            </div>
            <div className="ov-scrim absolute inset-0 bg-linear-to-t from-ink/95 via-ink/40 to-ink/70" />

            <div className="ov-chrome relative z-10 flex h-full flex-col justify-end pb-[calc(var(--shell-pad)*1.4)] [padding-inline:var(--shell-pad)]">
              <p className="mono mb-6 overflow-hidden text-bone/75" data-rise>
                <span className="block">
                  {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                  {" — "}
                  {project.category}
                </span>
              </p>
              <h2 className="ov-title display max-w-[16ch] text-[length:var(--text-hero)]">
                {project.title}
              </h2>
              <p className="mono mt-6 overflow-hidden text-bone/70" data-rise>
                <span className="block">
                  {project.place}, {project.country} — {project.year}
                </span>
              </p>
            </div>
          </header>

          <div className="ov-fade">
            <div className="shell grid gap-14 pt-24 lg:grid-cols-12 lg:gap-8 lg:pt-36">
              <p className="ov-reveal text-[length:var(--text-lead)] leading-[1.28] lg:col-span-7">
                {project.summary}
              </p>

              <dl className="ov-reveal border-t border-bone/15 lg:col-span-4 lg:col-start-9">
                {project.facts.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-baseline justify-between gap-6 border-b border-bone/15 py-3.5"
                  >
                    <dt className="mono text-bone/45">{f.label}</dt>
                    <dd className="text-right text-[0.95rem] text-bone/85">{f.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="ov-reveal space-y-6 text-[1.05rem] leading-[1.7] text-bone/70 lg:col-span-5">
                {project.body.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </div>
            </div>

            <div className="shell mt-24 grid gap-5 sm:grid-cols-2 lg:mt-36 lg:grid-cols-3">
              {project.gallery.map((item) => (
                <figure key={item.key} className="ov-reveal">
                  <div className="reveal-frame aspect-4/5">
                    <img
                      src={image(item.key, 1000)}
                      alt={shots[item.key].alt}
                      width={800}
                      height={1000}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mono mt-3 text-bone/45">{item.caption}</figcaption>
                </figure>
              ))}
            </div>

            <div className="shell mt-32 lg:mt-48">
              <p className="mono mb-6 text-bone/45">Next project</p>
              {next && (
                <button
                  type="button"
                  onClick={() => onNext(next)}
                  className="group flex w-full items-baseline justify-between gap-6 border-t border-bone/15 pt-6 text-left"
                  data-cursor="Next"
                >
                  <span className="display text-[clamp(2.2rem,7vw,6rem)]">{next.title}</span>
                  <span className="mono shrink-0 text-bone/50 transition-transform duration-500 group-hover:translate-x-2">
                    {next.place} →
                  </span>
                </button>
              )}
              <p className="mono mt-20 text-bone/40">
                {studio.name} — {studio.discipline}, {studio.city}
              </p>
            </div>
          </div>
        </article>
      </div>

      <button
        ref={closeBtn}
        type="button"
        onClick={close}
        className="fixed right-[var(--shell-pad)] top-7 z-30 flex items-center gap-3 rounded-full border border-bone/25 bg-ink/25 px-4 py-2.5 text-bone/85 backdrop-blur-md"
        aria-label={`Close ${project.title}`}
        data-cursor="Link"
      >
        <span className="mono">Close</span>
        <span className="relative block h-3.5 w-3.5">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rotate-45 bg-current" />
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 -rotate-45 bg-current" />
        </span>
      </button>

      <div className="fixed inset-0 z-20" aria-hidden="true">
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            className="ov-panel absolute inset-y-0 w-1/5 bg-char"
            style={{ left: `${(i / PANELS) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
