import { useRef } from "react";
import gsap from "gsap";
import { counter, ease, motion, useGsap } from "../lib/motion";
import { awards, clientList, recognition, stats, studio } from "../data/studio";
import { image, shots } from "../data/media";

export default function Studio() {
  const root = useRef<HTMLElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 60%" },
      });
      tl.from(".studio-frame", {
        clipPath: "inset(12% 12% 12% 12%)",
        duration: 1.6,
        stagger: 0.12,
        ease: ease.io,
      })
        .from(
          ".studio-frame img",
          { scale: 1.25, duration: 1.9, stagger: 0.12, ease: ease.out },
          0,
        )
        .from(".studio-copy > *", { y: 44, autoAlpha: 0, duration: 1, stagger: 0.07, ease: ease.out }, 0.3);

      const figures = gsap.utils.toArray<HTMLElement>("[data-stat]", el).map((node) =>
        counter(node, Number(node.dataset.stat), 1.8),
      );

      const list = gsap.from(".award-row", {
        scrollTrigger: { trigger: ".awards", start: "top 80%" },
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.07,
        ease: ease.out,
      });

      const clients = gsap.from(".client-row", {
        scrollTrigger: { trigger: ".clients", start: "top 85%" },
        y: 26,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: ease.out,
      });

      return () => {
        [tl, list, clients].forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
        figures.forEach((t) => t.kill());
      };
    });
  }, []);

  return (
    <section id="studio" ref={root} className="shell relative py-[clamp(5rem,13vh,10rem)]">
      <div className="mb-16">
        <p className="mono mb-5 flex items-center gap-3 text-ink-3">
          <span className="inline-block h-px w-8 bg-current" />
          05 — The studio
        </p>
        <h2 className="display max-w-[20ch] text-[length:var(--text-title)]">
          Nine people, one room, a very large material library
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="studio-frame reveal-frame aspect-4/5 lg:col-span-5">
          <img
            src={image("studioA", 1000)}
            alt={shots.studioA.alt}
            width={1000}
            height={1250}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="studio-frame reveal-frame aspect-4/5 lg:col-span-4 lg:mt-24">
          <img
            src={image("studioB", 1000)}
            alt={shots.studioB.alt}
            width={1000}
            height={1250}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="studio-copy lg:col-span-3">
          <p className="text-[1.05rem] leading-[1.7] text-ink-2">
            Estia was founded in {studio.founded} above a bookbinder in Exarcheia, with one
            commission and a borrowed drawing board. Twelve years later the studio is nine
            people working out of a converted garage in Petralona.
          </p>
          <p className="mt-5 text-[1.05rem] leading-[1.7] text-ink-2">
            We take on roughly fourteen projects a year and turn down about half of what
            arrives. A studio this size has to be certain, and we would rather wait a year
            than build something we cannot defend.
          </p>
          <dl className="mt-8 border-t border-ink/15">
            {[
              ["Founded", String(studio.founded)],
              ["Studio", `${studio.city}, ${studio.country}`],
              ["Address", studio.address],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-ink/15 py-3">
                <dt className="mono mb-1.5 text-ink-3">{label}</dt>
                <dd className="text-[0.95rem] leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <dl className="mt-[clamp(4rem,10vh,7rem)] grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bone px-6 py-10">
            <dd className="display text-[clamp(2.75rem,6vw,5rem)]">
              <span data-stat={stat.value}>0</span>
              {stat.suffix}
            </dd>
            <dt className="mono mt-3 text-ink-3">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-[clamp(4rem,10vh,7rem)] grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="awards lg:col-span-7">
          <p className="mono mb-6 text-ink-3">Recognition</p>
          <ul className="border-t border-ink/15">
            {awards.map((award) => (
              <li
                key={`${award.year}-${award.name}`}
                className="award-row flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-ink/15 py-4"
              >
                <span className="mono w-12 shrink-0 text-ink-3">{award.year}</span>
                <span className="flex-1 text-[1.02rem] leading-snug">{award.name}</span>
                <span className="mono text-ink-3">{award.project}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-col gap-2">
            {recognition.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink-2">
                <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-clay" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="clients lg:col-span-4 lg:col-start-9">
          <p className="mono mb-6 text-ink-3">Selected clients</p>
          <ul className="border-t border-ink/15">
            {clientList.map((client) => (
              <li
                key={client}
                className="client-row border-b border-ink/15 py-4 text-[1.15rem] leading-snug"
              >
                {client}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
