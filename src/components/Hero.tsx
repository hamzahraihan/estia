import { useRef } from "react";
import gsap from "gsap";
import { ease, motion, splitLines, useGsap } from "../lib/motion";
import { hero, studio } from "../data/studio";
import { image, shots } from "../data/media";

type Props = {
  /** Starts the entrance — fired as the preloader curtain begins to lift. */
  play: boolean;
};

export default function Hero({ play }: Props) {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);

  // Entrance: the frame opens from the top, the type rises out of its mask.
  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      const frame = media.current;
      if (!el || !frame || !play) return;

      const shot = frame.querySelector("img")!;
      const word = splitLines(el.querySelector(".hero-word")!);
      const rise = el.querySelectorAll<HTMLElement>("[data-rise]");

      gsap.set(frame, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(shot, { scale: 1.16 });
      gsap.set(rise, { yPercent: 120, autoAlpha: 0 });
      // Without this the word's tween animates from 0 to 0: the wordmark sat
      // fully visible behind the curtain and popped into place instead of
      // rising out of its mask.
      gsap.set(word.lines, { yPercent: 120 });
      // Timed to finish inside the preloader's parting curtain rather than
      // before it: the visitor should watch the page assemble through the
      // opening, not find it already built on the far side.
      const tl = gsap
        .timeline()
        .to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.95, ease: ease.io })
        .to(shot, { scale: 1, duration: 1.9, ease: ease.out }, 0)
        .to(word.lines, { yPercent: 0, duration: 1.05, stagger: 0.04, ease: ease.out }, 0.3)
        .to(rise, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.06, ease: ease.out }, 0.7)
        .fromTo(".hero-cue", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 1.05);

      return () => {
        tl.kill();
        word.revert();
      };
    });
  }, [play]);

  // Scroll-out: the image drifts and grows away from the type sitting on it.
  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      tl.to(".hero-media", { yPercent: 16, scale: 1.1, ease: "none" }, 0)
        .to(".hero-inner", { yPercent: -26, autoAlpha: 0, ease: "none" }, 0);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });
  }, []);

  return (
    <section
      id="top"
      ref={root}
      className="relative h-[100svh] w-full overflow-hidden bg-char text-bone"
    >
      <div ref={media} className="hero-media absolute inset-0">
        <img
          src={image("hero", 2000)}
          alt={shots.hero.alt}
          width={2000}
          height={1125}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-ink/35 via-ink/18 via-55% to-ink/88" />
      </div>

      <div className="hero-inner relative z-10 mx-auto flex h-full w-full flex-col [padding-inline:var(--shell-pad)] pt-[calc(var(--header-h)+2.5rem)] pb-[calc(var(--shell-pad)*1.2)]">
        <div className="flex-1" />

        <p className="mono mb-5 overflow-hidden text-bone/85" data-rise>
          <span className="block">{hero.eyebrow}</span>
        </p>

        <h1 className="hero-word display text-[length:var(--text-display)] text-bone">
          {hero.wordmark}
        </h1>

        <div className="mt-9 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="max-w-[20ch] text-[length:var(--text-lead)] leading-[1.22] text-bone/90"
            data-rise
          >
            {hero.lede}
          </p>

          <dl className="grid grid-cols-2 gap-x-12 gap-y-5 sm:grid-cols-3">
            {hero.meta.map((item) => (
              <div key={item.label} className="overflow-hidden" data-rise>
                <dt className="mono mb-2 text-bone/45">{item.label}</dt>
                <dd className="text-[0.95rem] leading-snug text-bone/85">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-cue mt-10 flex items-end justify-between gap-8 border-t border-bone/20 pt-4 text-bone/55">
          <p className="mono max-w-[42ch] leading-[1.7] normal-case tracking-[0.04em]">
            {hero.footnote}
          </p>
          <p className="mono shrink-0">
            {studio.city} — {studio.country}
          </p>
        </div>
      </div>
    </section>
  );
}
