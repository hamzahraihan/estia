import { useRef, useState } from "react";
import gsap from "gsap";
import { ease, motion, useGsap } from "../lib/motion";
import { services } from "../data/studio";
import { image, shots } from "../data/media";

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const head = gsap.from(".service-head", {
        scrollTrigger: { trigger: el, start: "top 72%" },
        y: 44,
        autoAlpha: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: ease.out,
      });

      const sticky = gsap.from(".service-media", {
        scrollTrigger: { trigger: el, start: "top 72%" },
        y: 70,
        autoAlpha: 0,
        duration: 1.3,
        ease: ease.out,
      });

      return () => {
        head.scrollTrigger?.kill();
        sticky.scrollTrigger?.kill();
        head.kill();
        sticky.kill();
      };
    });
  }, []);

  useGsap((mm) => {
    const el = root.current;
    if (!el) return;
    const panels = el.querySelectorAll<HTMLElement>(".service-panel");
    const frames = el.querySelectorAll<HTMLElement>(".service-shot");

    mm.add(motion.full, () => {
      const tl = gsap.timeline();
      panels.forEach((panel, i) => {
        if (i === open) {
          tl.fromTo(
            panel,
            { height: 0, autoAlpha: 0 },
            { height: "auto", autoAlpha: 1, duration: 0.85, ease: ease.io },
            0,
          );
        } else {
          tl.to(panel, { height: 0, autoAlpha: 0, duration: 0.55, ease: ease.io }, 0);
        }
      });
      tl.to(frames, { autoAlpha: 0, scale: 1.06, duration: 0.4, ease: ease.io }, 0)
        .fromTo(
          frames[open],
          { autoAlpha: 0, scale: 1.12 },
          { autoAlpha: 1, scale: 1, duration: 0.95, ease: ease.out },
          0.2,
        );
      return () => tl.kill();
    });

    mm.add(motion.reduce, () => {
      panels.forEach((panel, i) => {
        panel.style.height = i === open ? "auto" : "0px";
        panel.style.opacity = i === open ? "1" : "0";
      });
      frames.forEach((frame, i) => {
        frame.style.opacity = i === open ? "1" : "0";
      });
    });
  }, [open]);

  return (
    <section
      id="services"
      ref={root}
      className="shell relative py-[clamp(5rem,13vh,10rem)]"
    >
      <div className="service-head mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mono mb-5 flex items-center gap-3 text-ink-3">
            <span className="inline-block h-px w-8 bg-current" />
            03 — What we do
          </p>
          <h2 className="display max-w-[16ch] text-[length:var(--text-title)]">
            Six disciplines, one room
          </h2>
        </div>
        <p className="mono max-w-[38ch] leading-[1.8] text-ink-3 lg:text-right">
          We only take on work where all six are in play
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ul className="border-t border-ink/15">
            {services.map((service, i) => (
              <li key={service.index} className="border-b border-ink/15">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                  aria-controls={`service-${service.index}`}
                  className="flex w-full items-baseline gap-5 py-6 text-left"
                  data-cursor="Link"
                >
                  <span className="mono w-8 shrink-0 text-ink-3">{service.index}</span>
                  <span
                    className={`display flex-1 text-[clamp(1.5rem,3vw,2.4rem)] transition-colors duration-500 ${
                      open === i ? "text-clay" : "text-ink"
                    }`}
                  >
                    {service.title}
                  </span>
                  <span className="relative mt-1.5 block h-3 w-3 shrink-0">
                    <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-ink" />
                    <span
                      className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-ink transition-transform duration-500"
                      style={{ transform: `translateX(-50%) scaleY(${open === i ? 0 : 1})` }}
                    />
                  </span>
                </button>

                <div
                  id={`service-${service.index}`}
                  className="service-panel overflow-hidden"
                  aria-hidden={open !== i}
                >
                  <div className="pb-8 pl-13 sm:pl-13">
                    <p className="max-w-[54ch] text-[1.02rem] leading-[1.7] text-ink-2">
                      {service.body}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <li
                          key={tag}
                          className="mono rounded-full border border-ink/20 px-3 py-1.5 text-ink-2"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <div className="service-media sticky top-[calc(var(--header-h)+2.5rem)]">
            <div className="reveal-frame relative aspect-4/5">
              {services.map((service, i) => (
                <img
                  key={service.index}
                  src={image(service.shot, 900)}
                  alt={shots[service.shot].alt}
                  width={900}
                  height={1125}
                  loading="lazy"
                  decoding="async"
                  className="service-shot absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
