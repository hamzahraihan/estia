import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease, lockScroll, motion, useGsap } from "../lib/motion";
import { navLinks, studio } from "../data/studio";

type Props = {
  /** False while the preloader still owns the viewport. */
  ready: boolean;
  /** A project overlay is open — the header steps out of the way. */
  overlayOpen: boolean;
};

export default function Nav({ ready, overlayOpen }: Props) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Without motion the header is simply always on — nothing in this component
  // may leave the page without a way to navigate.
  useGsap((mm) => {
    mm.add(motion.reduce, () => {
      gsap.set(root.current, { yPercent: 0, autoAlpha: 1 });
    });
  }, []);

  // Chrome behaviour: hide on the way down, return on the way up, and pick up a
  // scrim once the hero is behind us.
  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      gsap.set(el, { yPercent: -130, autoAlpha: 0 });
      const trigger = ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        onUpdate: (self) => {
          if (self.scroll() < 120 || self.direction === -1) {
            gsap.to(el, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: ease.out });
          } else {
            gsap.to(el, { yPercent: -130, autoAlpha: 0, duration: 0.45, ease: ease.out });
          }
          gsap.to(".nav-bg", { opacity: self.scroll() > 40 ? 1 : 0, duration: 0.45 });
        },
      });
      return () => trigger.kill();
    });
  }, []);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      if (!ready || !root.current) return;
      gsap.set(".nav-link", { yPercent: 140 });
      gsap.set(".nav-mark span", { yPercent: 130 });
      const tl = gsap
        .timeline()
        .to(root.current, { yPercent: 0, autoAlpha: 1, duration: 1, ease: ease.out })
        .to(".nav-mark span", { yPercent: 0, duration: 0.9, ease: ease.out }, 0.1)
        .to(".nav-link", { yPercent: 0, duration: 0.85, stagger: 0.06, ease: ease.out }, 0.2);
      return () => tl.kill();
    });
  }, [ready]);

  // The overlay outranks the menu: deriving keeps a stale `open` from leaving
  // the page scroll-locked after the overlay hands it back.
  const shown = open && !overlayOpen;


  useEffect(() => {
    if (!shown) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [shown]);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      if (!shown) return;
      const tl = gsap
        .timeline()
        .set(".menu-panel", { yPercent: -101 })
        .to(".menu-panel", { yPercent: 0, duration: 0.8, ease: ease.io })
        .fromTo(
          ".menu-item span",
          { yPercent: 118 },
          { yPercent: 0, duration: 0.9, stagger: 0.07, ease: ease.out },
          "-=0.35",
        )
        .fromTo(
          ".menu-meta > *",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: ease.out },
          "-=0.5",
        );
      return () => tl.kill();
    });
  }, [shown]);

  return (
    <>
      <header
        ref={root}
        className="invisible fixed inset-x-0 top-0 z-80 text-bone"
      >
        <div className="nav-bg absolute inset-0 -z-10 border-b border-bone/12 bg-ink/28 opacity-0 backdrop-blur-md" />

        <div className="flex h-[var(--header-h)] items-center justify-between gap-6 [padding-inline:var(--shell-pad)]">
          <a
            href="#top"
            className="nav-mark display overflow-hidden text-[1.6rem] leading-none tracking-[0.02em]"
          >
            <span className="block">{studio.name}</span>
          </a>

          <nav className="hidden items-center gap-9 lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-link mono overflow-hidden">
                <span className="link-line block">{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#contact"
              className="pill hidden lg:inline-flex"
              data-cursor="Link"
            >
              <span className="pill__dot" />
              Start a project
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              aria-expanded={shown}
              aria-label={shown ? "Close menu" : "Open menu"}
            >
              <span className="relative block h-3 w-5">
                <span
                  className="absolute inset-x-0 top-1/2 h-px bg-bone"
                  style={{ transform: shown ? "translateY(-50%) rotate(45deg)" : "translateY(-50%)" }}
                />
                <span
                  className="absolute inset-x-0 top-1/2 h-px bg-bone"
                  style={{ transform: shown ? "translateY(-50%) rotate(-45deg)" : "translateY(2px)" }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {shown && (
        <div className="fixed inset-0 z-70 lg:hidden" role="dialog" aria-modal="true">
          <div className="menu-panel absolute inset-0 flex flex-col justify-between bg-char pt-[calc(var(--header-h)+2rem)] pb-[var(--shell-pad)] text-bone [padding-inline:var(--shell-pad)]">
            <ul>
              {navLinks.map((link, i) => (
                <li key={link.href} className="menu-item overflow-hidden border-b border-bone/12">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-4"
                    data-cursor="Link"
                  >
                    <span className="mono w-8 text-bone/45">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="display text-[clamp(2.6rem,12vw,4.5rem)]">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="menu-meta flex flex-col gap-1">
              <p className="mono text-bone/45">Studio</p>
              <p className="text-lg">{studio.address}</p>
              <p className="mono pt-4 text-bone/45">Enquiries</p>
              <a href={`mailto:${studio.email}`} className="link-line w-fit text-lg">
                {studio.email}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
