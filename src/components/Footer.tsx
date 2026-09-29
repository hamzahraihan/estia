import { useRef } from "react";
import gsap from "gsap";
import { ease, motion, useGsap } from "../lib/motion";
import { navLinks, studio } from "../data/studio";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const el = root.current;
      if (!el) return;

      // The wordmark fills the page as the last of the document scrolls away.
      const grow = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.8 },
      });
      grow
        .fromTo(
          ".footer-mark",
          { scaleX: 0.55, opacity: 0.35 },
          { scaleX: 1, opacity: 1, ease: "none" },
          0,
        )
        .fromTo(".footer-mark", { yPercent: 0 }, { yPercent: -6, ease: "none" }, 0);

      // The page bottoms out with the footer still on screen, so "top 85%" can
      // never be reached — key the reveal off its top edge entering view.
      const rise = gsap.from(el.querySelectorAll("[data-part]"), {
        scrollTrigger: { trigger: el, start: "top bottom" },
        y: 36,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.06,
        ease: ease.out,
      });

      return () => {
        grow.scrollTrigger?.kill();
        grow.kill();
        rise.scrollTrigger?.kill();
        rise.kill();
      };
    });
  }, []);

  const toTop = () => {
    const top = document.querySelector<HTMLElement>("#smooth-content");
    if (top) top.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer ref={root} className="relative overflow-hidden bg-char pt-[clamp(3rem,7vh,5rem)] text-bone">
      <div className="shell">
        <div className="grid gap-10 border-t border-bone/15 pt-10 lg:grid-cols-12">
          <div className="lg:col-span-4" data-part>
            <p className="display text-[clamp(1.75rem,3vw,2.5rem)]">
              {studio.name} — {studio.discipline}
            </p>
            <p className="mt-4 max-w-[30ch] text-[0.98rem] leading-[1.7] text-bone/60">
              {studio.address}. {studio.hours}.
            </p>
          </div>

          <nav className="lg:col-span-3" data-part>
            <p className="mono mb-5 text-bone/40">Index</p>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="link-line text-[1.02rem] text-bone/80" data-cursor="Link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3" data-part>
            <p className="mono mb-5 text-bone/40">Enquiries</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href={`mailto:${studio.email}`}
                  className="link-line text-[1.02rem] text-bone/80"
                  data-cursor="Link"
                >
                  {studio.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${studio.phone.replace(/\s/g, "")}`}
                  className="link-line text-[1.02rem] text-bone/80"
                  data-cursor="Link"
                >
                  {studio.phone}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2" data-part>
            <p className="mono mb-5 text-bone/40">Follow</p>
            <ul className="flex flex-col gap-2.5">
              {studio.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-line text-[1.02rem] text-bone/80"
                    data-cursor="Link"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 pb-8">
          <p className="mono text-bone/40">
            © {studio.founded}–2026 {studio.name} — All rooms reserved
          </p>
          <button
            type="button"
            onClick={toTop}
            className="mono flex items-center gap-2 text-bone/70 transition-colors duration-500 hover:text-bone"
            data-cursor="Link"
          >
            Back to top
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M5 10V0M0 5l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="pointer-events-none flex justify-center overflow-hidden px-[var(--shell-pad)]">
        <span
          className="footer-mark display block origin-bottom text-center text-[clamp(5rem,25vw,26rem)] leading-[0.72] text-bone/90 select-none"
          aria-hidden="true"
        >
          {studio.name}
        </span>
      </div>
    </footer>
  );
}
