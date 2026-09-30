import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ease, motion, useGsap } from "../lib/motion";
import { testimonials } from "../data/studio";

/** How long a quote keeps the stage before the next one rises. */
const DWELL = 7000;

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  /** Reading one, or having picked a dot: the rotation waits. */
  const [held, setHeld] = useState(false);
  /** Whether the section has arrived on screen at all. */
  const [seen, setSeen] = useState(false);
  /** The first quote is already on stage; the ones after it rise into it. */
  const opened = useRef(false);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;
      return gsap.from(el.querySelector<HTMLElement>(".quote-stage")!, {
        scrollTrigger: { trigger: el, start: "top 82%" },
        y: 46,
        autoAlpha: 0,
        duration: 1.1,
        ease: ease.out,
      });
    });
  }, []);

  // Crossfade: the outgoing quote lifts, the incoming one rises.
  //
  // Deliberately not built through useGsap. That helper reverts its whole
  // matchMedia context whenever its dependencies change, and a context that
  // arrives every seven seconds to continue a crossfade undoes it instead — the
  // quotes snap back to whatever the last context had recorded, on a single
  // frame, with the change still in flight. These tweens are owned here and
  // killed by the next one, so a crossfade is only ever cut short by another
  // crossfade.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const quotes = gsap.utils.toArray<HTMLElement>(".quote-item", el);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The first quote is simply on stage when the section arrives. Animating it
    // in would spend the entrance off screen, where nobody is looking.
    if (still || !opened.current) {
      opened.current = true;
      gsap.set(quotes, { autoAlpha: 0, y: 0 });
      gsap.set(quotes[active], { autoAlpha: 1, y: 0 });
      return;
    }

    const tl = gsap
      .timeline()
      .fromTo(
        quotes[active],
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 1, ease: ease.out, overwrite: "auto" },
        0,
      )
      .to(
        quotes.filter((_, i) => i !== active),
        { autoAlpha: 0, y: -30, duration: 0.55, ease: ease.io, overwrite: "auto" },
        0,
      );

    return () => {
      tl.kill();
    };
  }, [active]);

  // The rotation waits for the section to arrive. Left running from mount it has
  // already turned the first quote over, several screens before anyone reaches it.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A dwell rather than a tick: re-armed after every change and after the pointer
  // is released, so each quote keeps its full time on stage and a visitor who
  // hovers to read one is never cut off part way through it.
  useEffect(() => {
    if (!seen || held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % testimonials.length),
      DWELL,
    );
    return () => window.clearTimeout(id);
  }, [seen, held, active]);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-bone-2 py-[clamp(5rem,13vh,10rem)]"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
    >
      <div className="shell">
        <div className="quote-stage">
          <div className="flex items-baseline justify-between gap-6 border-b border-ink/15 pb-5">
            <p className="mono flex items-center gap-3 text-ink-3">
              <span className="inline-block h-px w-8 bg-current" />
              06 — In their words
            </p>
            <p className="mono tabular-nums text-ink-3">
              {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </p>
          </div>

          {/* Every quote stacked into one grid cell rather than absolutely
              positioned over a fixed height. The cell is then exactly as tall
              as the longest of them, so the footer below can never be drawn
              across a short one — and the section does not resize as the
              rotation moves on. `opacity` is painted once and deliberately not
              tied to `active`: React rewriting it on every change would
              overwrite the very values the crossfade is tweening. GSAP owns it
              from here. */}
          <div className="grid py-[clamp(2.5rem,5vw,4rem)]">
            {testimonials.map((item, i) => (
              <blockquote
                key={item.author}
                className="quote-item display col-start-1 row-start-1 m-0 max-w-[32ch] text-[length:var(--text-quote)] leading-[1.15]"
                style={{ opacity: i === 0 ? 1 : 0 }}
                aria-hidden={i !== active}
              >
                “{item.quote}”
              </blockquote>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-t border-ink/15 pt-6">
            <p className="mono text-ink-3">
              {testimonials[active].author} — {testimonials[active].role}
            </p>

            <div className="flex w-full items-center gap-3 sm:w-auto sm:max-w-[15rem] sm:flex-1">
              {testimonials.map((item, i) => (
                <button
                  key={item.author}
                  type="button"
                  onClick={() => {
                    setHeld(true);
                    setActive(i);
                  }}
                  aria-label={`Show testimonial from ${item.author}`}
                  aria-current={i === active}
                  className="relative h-6 flex-1"
                  data-cursor="Link"
                >
                  <span className="absolute inset-0 flex items-center">
                    <span className="block h-px w-full bg-ink/20" />
                  </span>
                  <span
                    className="absolute inset-0 flex origin-left items-center transition-transform duration-500"
                    style={{ transform: `scaleX(${i === active ? 1 : 0})` }}
                  >
                    <span className="block h-px w-full bg-ink" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
