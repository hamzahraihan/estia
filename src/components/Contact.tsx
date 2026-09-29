import { useRef } from "react";
import gsap from "gsap";
import { ease, motion, splitLines, useGsap } from "../lib/motion";
import { studio } from "../data/studio";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const magnet = useRef<HTMLAnchorElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      const heading = splitLines(el.querySelector(".contact-heading")!);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 55%" },
      });
      tl.from(heading.lines, { yPercent: 120, duration: 1.3, stagger: 0.08, ease: ease.out })
        .from(el.querySelectorAll("[data-part]"), {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.07,
          ease: ease.out,
        }, 0.3);
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        heading.revert();
      };
    });
  }, []);

  // The primary action leans toward the pointer without ever leaving its slot.
  useGsap((mm) => {
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const el = root.current;
      const button = magnet.current;
      if (!el || !button) return;

      const x = gsap.quickTo(button, "x", { duration: 0.5, ease: "power3" });
      const y = gsap.quickTo(button, "y", { duration: 0.5, ease: "power3" });

      const onMove = (event: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x(((event.clientX - r.left) / r.width - 0.5) * 34);
        y(((event.clientY - r.top) / r.height - 0.5) * 26);
      };
      const onLeave = () => {
        x(0);
        y(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });
  }, []);

  return (
    <section
      id="contact"
      ref={root}
      className="relative overflow-hidden bg-char py-[clamp(6rem,16vh,12rem)] text-bone"
    >
      <div className="shell">
        <p className="mono mb-8 flex items-center gap-3 text-bone/45" data-part>
          <span className="inline-block h-px w-8 bg-current" />
          07 — Start something
        </p>

        <h2 className="contact-heading display max-w-[14ch] text-[clamp(2.75rem,10vw,10rem)]">
          Let us start with the light
        </h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-part>
            <p className="max-w-[36ch] text-[1.05rem] leading-[1.7] text-bone/70">
              Send us the plan, the survey, or just a photograph of the room and a sentence
              about what is wrong with it. We answer every enquiry within two working days,
              and the first conversation costs nothing.
            </p>
            <a
              ref={magnet}
              href={`mailto:${studio.email}`}
              className="pill mt-9 text-bone"
              data-cursor="Link"
            >
              <span className="pill__dot" />
              {studio.email}
            </a>
          </div>

          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7" data-part>
            {[
              ["Studio", studio.address],
              ["Telephone", studio.phone],
              ["Hours", studio.hours],
              [
                "Elsewhere",
                studio.socials.map((s) => s.label).join(" · "),
              ],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-bone/15 pt-4">
                <dt className="mono mb-2.5 text-bone/45">{label}</dt>
                <dd className="text-[0.98rem] leading-relaxed text-bone/80">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
