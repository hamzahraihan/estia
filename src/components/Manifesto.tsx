import { useRef } from "react";
import gsap from "gsap";
import { ease, motion, splitWords, useGsap } from "../lib/motion";
import { disciplines, manifesto } from "../data/studio";

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const statements = gsap.utils.toArray<HTMLElement>(".statement", el).map((node) => {
        const statement = splitWords(node);
        gsap.set(statement.words, { opacity: 0.14, yPercent: 24 });

        return {
          statement,
          tween: gsap.to(statement.words, {
            opacity: 1,
            yPercent: 0,
            ease: "none",
            stagger: 0.35,
            scrollTrigger: {
              trigger: node,
              start: "top 78%",
              end: "bottom 62%",
              scrub: 0.8,
            },
          }),
        };
      });

      const rise = gsap.utils.toArray<HTMLElement>("[data-card]", el).map((node) =>
        gsap.from(node, {
          y: 60,
          autoAlpha: 0,
          duration: 1.1,
          ease: ease.out,
          scrollTrigger: { trigger: node, start: "top 88%" },
        }),
      );

      return () => {
        statements.forEach(({ statement, tween }) => {
          tween.scrollTrigger?.kill();
          tween.kill();
          statement.revert();
        });
        rise.forEach((t) => t.kill());
      };
    });
  }, []);

  return (
    <section ref={root} className="shell relative py-[clamp(6rem,14vh,11rem)]">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <p className="mono sticky top-[calc(var(--header-h)+2.5rem)] flex items-center gap-3 text-ink-3">
            <span className="inline-block h-px w-8 bg-current" />
            01 — {manifesto.label}
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-9">
          {manifesto.lines.map((line) => (
            <p key={line.slice(0, 18)} className="statement display text-[length:var(--text-title)]">
              {line}
            </p>
          ))}
        </div>
      </div>

      <ul className="mt-[clamp(4rem,10vh,8rem)] grid gap-px border-t border-ink/12 bg-ink/12 sm:grid-cols-2 lg:grid-cols-3">
        {disciplines.map((item, i) => (
          <li
            key={item}
            data-card
            className="group flex items-baseline justify-between gap-4 bg-bone px-6 py-9 transition-colors duration-500 hover:bg-linen"
          >
            <span className="display text-[clamp(1.35rem,2.2vw,2rem)]">{item}</span>
            <span className="mono text-ink-3">
              {String(i + 1).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
