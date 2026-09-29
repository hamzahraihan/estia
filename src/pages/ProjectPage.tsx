import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ease, motion, splitLines, useGsap } from "../lib/motion";
import { HERO_WIDTH, image, shots } from "../data/media";
import { projects } from "../data/projects";
import { studio } from "../data/studio";
import { useRouteTransition } from "../lib/routeTransition";
import type { Box } from "../lib/frame";

export default function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cover } = useRouteTransition();

  const index = projects.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? projects[index] : null;
  const next = index >= 0 ? projects[(index + 1) % projects.length] : null;

  const media = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const origin = useRef<Box | null>(null);

  // Only history state carries the rectangle the hero grew out of, so a shared
  // link or a refresh arrives with nothing to grow from and settles for the
  // zoom instead.
  useLayoutEffect(() => {
    origin.current = (location.state as { box?: Box } | null)?.box ?? null;
  }, [location.state]);

  /**
   * Leaving. The hero unrolls back into the card it came from while the curtain
   * drops over the top, so the page is gone by the time the curtain lifts.
   */
  const leave = useCallback(
    (to: string, state?: unknown) => {
      const hero = media.current;
      const pic = img.current;
      const box = origin.current;

      const unroll = () => {
        if (!hero || !pic || !box) {
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          gsap
            .timeline({ onComplete: () => resolve() })
            .to(hero, { x: box.x, y: box.y, scaleX: box.sx, scaleY: box.sy, duration: 0.7, ease: ease.out }, 0.62)
            .to(pic, { scaleX: 1 / box.sx, scaleY: 1 / box.sy, duration: 0.7, ease: ease.out }, 0.62);
        });
      };

      void Promise.all([unroll(), cover()]).then(() => navigate(to, { state }));
    },
    [cover, navigate],
  );

  // Entrance: the hero unrolls out of wherever it came from, and the copy under
  // the fold rises as the page is scrolled.
  useGsap((mm) => {
    if (!project) return;

    mm.add(motion.reduce, () => {
      gsap.set(".ov-scrim", { opacity: 1 });
      gsap.set(".ov-title, [data-rise]", { clearProps: "all" });
    });

    mm.add(motion.full, () => {
      const hero = media.current;
      const pic = img.current;
      if (!hero || !pic) return;

      const header = hero.closest("header");
      const scrim = header?.querySelector<HTMLElement>(".ov-scrim") ?? null;
      if (!scrim) return;
      const title = splitLines(header!.querySelector(".ov-title")!);
      const rise = header!.querySelectorAll<HTMLElement>("[data-rise]");

      const box = origin.current;
      if (box) {
        gsap.set(hero, { x: box.x, y: box.y, scaleX: box.sx, scaleY: box.sy, transformOrigin: "center center" });
        gsap.set(pic, { scaleX: 1 / box.sx, scaleY: 1 / box.sy });
      } else {
        gsap.set(hero, { scaleX: 1.12, scaleY: 1.12, transformOrigin: "center center" });
        gsap.set(pic, { scaleX: 1 / 1.12, scaleY: 1 / 1.12 });
      }
      gsap.set(scrim, { opacity: 0 });
      gsap.set(rise, { yPercent: 120, autoAlpha: 0 });
      gsap.set(title.lines, { yPercent: 120 });

      gsap
        .timeline()
        .to(hero, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 1.15, ease: ease.io }, 0)
        .to(pic, { scaleX: 1, scaleY: 1, duration: 1.15, ease: ease.io }, 0)
        .to(scrim, { opacity: 1, duration: 1, ease: ease.out }, 0.1)
        .to(title.lines, { yPercent: 0, duration: 1.2, stagger: 0.06, ease: ease.out }, 0.35)
        .to(rise, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.07, ease: ease.out }, 0.55);


      const reveals = gsap.utils.toArray<HTMLElement>(".ov-reveal").map((node) => {
        gsap.set(node, { y: 48, autoAlpha: 0 });
        return ScrollTrigger.create({
          trigger: node,
          start: "top 92%",
          once: true,
          onEnter: () => gsap.to(node, { y: 0, autoAlpha: 1, duration: 1.15, ease: ease.out }),
        });
      });
      gsap.utils.toArray<HTMLElement>(".ov-reveal img").forEach((node) => {
        gsap.set(node, { scale: 1.18 });
        reveals.push(
          ScrollTrigger.create({
            trigger: node,
            start: "top 94%",
            once: true,
            onEnter: () => gsap.to(node, { scale: 1, duration: 1.6, ease: ease.out }),
          }),
        );
      });
      document.fonts.ready.then(() => reveals.forEach((t) => t.refresh()));

      return () => reveals.forEach((t) => t.kill());
    });
  }, [project?.slug]);

  if (!project) return <NotFound />;

  return (
    <main className="bg-char text-bone">
      {/* Keyed so stepping to the next project replaces the article outright:
          SplitText still holds a reference to the outgoing heading, and its
          revert would otherwise write the previous title back into the new
          one. React Router reuses the component across a param change, so
          without this the page would keep showing the project it came from. */}
      <article key={project.slug} className="pb-40">
        <header className="relative h-[100svh] w-full overflow-hidden">
          <div ref={media} className="ov-media absolute inset-0">
            <img
              ref={img}
              src={image(project.cover, HERO_WIDTH)}
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
            <h1 className="ov-title display max-w-[16ch] text-[length:var(--text-hero)]">
              {project.title}
            </h1>
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
                onClick={() => leave(`/work/${next.slug}`)}
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

      <div className="fixed right-[var(--shell-pad)] top-7 z-30">
        <button
          type="button"
          onClick={() => leave("/")}
          className="flex items-center gap-3 rounded-full border border-bone/25 bg-ink/25 px-4 py-2.5 text-bone/85 backdrop-blur-md"
          aria-label={`Close ${project.title}`}
          data-cursor="Link"
        >
          <span className="mono">Close project</span>
          <span className="relative block h-3.5 w-3.5">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rotate-45 bg-current" />
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 -rotate-45 bg-current" />
          </span>
        </button>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-8 bg-char px-[var(--shell-pad)] text-bone">
      <p className="mono text-bone/50">404 — no such project</p>
      <h1 className="display text-center text-[length:var(--text-hero)]">Nothing here</h1>
      <Link to="/" className="pill" data-cursor="Link">
        <span className="pill__dot" />
        Back to the studio
      </Link>
    </main>
  );
}
