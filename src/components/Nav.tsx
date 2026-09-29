import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocation } from "react-router";
import { ease, lockScroll, motion, useGsap } from "../lib/motion";
import { navLinks, studio } from "../data/studio";
import { SCROLL_SETTLED } from "../lib/scrollMemory";

type Props = {
  /** False while the preloader still owns the viewport. */
  ready: boolean;
};

export default function Nav({ ready }: Props) {
  const root = useRef<HTMLElement>(null);
  // The whole header leaves together — bar and links as one piece. Parking
  // only the links and leaving the frosted bar behind reads as a broken
  // half-state rather than as a header getting out of the way.
  const away = useRef(true);
  // Held on refs rather than in the effect, so the settle listener below can
  // re-read them without having to be inside the animation context.
  const last = useRef(0);
  const acc = useRef(0);
  // The menu belongs to the route it was opened on. Deriving it that way means
  // a page change puts it away by itself, instead of relying on an effect to
  // remember to close it — and a menu can never outlive its own navigation.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const { pathname } = useLocation();
  const open = openAt === pathname;

  // Without motion the header is simply always on — nothing in this component
  // may leave the page without a way to navigate.
  useGsap((mm) => {
    mm.add(motion.reduce, () => {
      gsap.set(root.current, { yPercent: 0, autoAlpha: 1 });
      away.current = false;
    });
  }, []);

  // Chrome behaviour: hide on the way down, return on the way up, and pick up a
  // scrim once the hero is behind us.
  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      const scrim = el?.querySelector<HTMLElement>(".nav-bg");
      if (!el || !scrim) return;

      gsap.set(el, { yPercent: -130, autoAlpha: 0 });

      // A wheel emits dozens of scroll events a second. Starting a fresh tween
      // on each one leaves several of them fighting over the same transform,
      // which is what makes a header judder on its way out — so the target
      // only changes when the visitor's direction actually changes, and the
      // tween that does run takes the property over from any predecessor.
      const slide = (hide: boolean) => {
        away.current = hide;
        gsap.to(el, {
          yPercent: hide ? -130 : 0,
          autoAlpha: hide ? 0 : 1,
          duration: hide ? 0.45 : 0.55,
          ease: ease.out,
          overwrite: "auto",
        });
      };

      let scrimmed = false;

      const trigger = ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        // A refresh re-measures scroll, so the running total has to start over
        // from the new position or the next update reads it as a huge flick.
        onRefresh: (self) => {
          last.current = self.scroll();
        },
        onUpdate: (self) => {
          const y = self.scroll();
          acc.current += y - last.current;
          last.current = y;

          // A trackpad's rebound and a wheel's detents are a few pixels each.
          // Reacting to those strobes the header in and out mid-read, and the
          // small nudges never even add up to a return — so commit to a
          // direction only once the movement is unmistakably one way.
          if (Math.abs(acc.current) > 8) {
            const next = acc.current > 0 && y > 120;
            acc.current = 0;
            if (next !== away.current) slide(next);
          }

          const lit = y > 40;
          if (lit !== scrimmed) {
            scrimmed = lit;
            gsap.to(scrim, { opacity: lit ? 1 : 0, duration: 0.45, overwrite: "auto" });
          }
        },
      });
      return () => trigger.kill();
    });
  }, []);

  // A page change puts the visitor back where they were, and that movement is
  // the site repositioning itself, not them reading downwards. Left alone it
  // reads as one enormous downward scroll and the header hides itself on
  // arrival — leaving a page whose navigation is gone with no way to scroll it
  // back. Re-read the position instead, and meet them with the header showing.
  useEffect(() => {
    const onSettled = () => {
      last.current = window.scrollY;
      acc.current = 0;
      if (!root.current) return;
      away.current = false;
      gsap.to(root.current, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.55,
        ease: ease.out,
        overwrite: "auto",
      });
    };
    window.addEventListener(SCROLL_SETTLED, onSettled);
    return () => window.removeEventListener(SCROLL_SETTLED, onSettled);
  }, []);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      if (!ready || !root.current) return;
      gsap.set(".nav-link", { yPercent: 140 });
      gsap.set(".nav-mark span", { yPercent: 130 });
      const tl = gsap
        .timeline()
        .set(root.current, { autoAlpha: 1 })
        .to(root.current, { yPercent: 0, autoAlpha: 1, duration: 1, ease: ease.out, onStart: () => (away.current = false) })
        .to(".nav-mark span", { yPercent: 0, duration: 0.9, ease: ease.out }, 0.1)
        .to(".nav-link", { yPercent: 0, duration: 0.85, stagger: 0.06, ease: ease.out }, 0.2);
      return () => tl.kill();
    });
  }, [ready]);


  const shown = open;

  useEffect(() => {
    if (!shown) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
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
              onClick={() => setOpenAt(shown ? null : pathname)}
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
                    onClick={() => setOpenAt(null)}
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
