import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ease, motion, useGsap } from "../lib/motion";
import { testimonials } from "../data/studio";

const DWELL = 7000;

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const held = useRef(false);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;
      return gsap.from(".quote-stage", {
        scrollTrigger: { trigger: el, start: "top 82%" },
        y: 46,
        autoAlpha: 0,
        duration: 1.1,
        ease: ease.out,
      });
    });
  }, []);

  // Crossfade: the outgoing quote lifts, the incoming one rises. Driven purely
  // by the shared index, so the reveal above and the rotation never fight.
  useGsap((mm) => {
    const el = root.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".quote-item");

    mm.add(motion.full, () => {
      const tl = gsap.timeline();
      items.forEach((item, i) => {
        if (i === active) {
          tl.fromTo(
            item,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 1, ease: ease.out },
            0,
          );
        } else {
          tl.to(item, { autoAlpha: 0, y: -30, duration: 0.55, ease: ease.io }, 0);
        }
      });
      return () => tl.kill();
    });

    mm.add(motion.reduce, () => {
      items.forEach((item, i) => {
        item.style.opacity = i === active ? "1" : "0";
        item.style.transform = "none";
      });
    });
  }, [active]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!held.current) setActive((i) => (i + 1) % testimonials.length);
    }, DWELL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-bone-2 py-[clamp(5rem,13vh,10rem)]"
      onPointerEnter={() => {
        held.current = true;
      }}
      onPointerLeave={() => {
        held.current = false;
      }}
    >
      <div className="shell grid gap-10 lg:grid-cols-12">
        <p className="mono flex items-center gap-3 text-ink-3 lg:col-span-3">
          <span className="inline-block h-px w-8 bg-current" />
          06 — In their words
        </p>

        <div className="quote-stage lg:col-span-9">
          <div className="relative min-h-[15rem] sm:min-h-[12rem]">
            {testimonials.map((item, i) => (
              <figure
                key={item.author}
                className="quote-item absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0 }}
                aria-hidden={i !== active}
              >
                <blockquote className="display max-w-[26ch] text-[clamp(1.6rem,3.6vw,3.1rem)] leading-[1.15]">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mono mt-7 text-ink-3">
                  {item.author} — {item.role}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            {testimonials.map((item, i) => (
              <button
                key={item.author}
                type="button"
                onClick={() => {
                  held.current = true;
                  setActive(i);
                }}
                aria-label={`Show testimonial from ${item.author}`}
                aria-current={i === active}
                className="h-px flex-1 bg-ink/20"
                data-cursor="Link"
              >
                <span
                  className="block h-px origin-left bg-ink transition-transform duration-500"
                  style={{ transform: `scaleX(${i === active ? 1 : 0})` }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
