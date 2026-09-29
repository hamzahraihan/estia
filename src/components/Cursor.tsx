import { useRef } from "react";
import gsap from "gsap";
import { ease, useGsap } from "../lib/motion";

/** Ring diameter multiplier, by the value of a target's `data-cursor` attribute. */
const SCALE: Record<string, number> = {
  View: 3.6,
  Open: 3.6,
  Next: 3,
  Drag: 2.4,
  Link: 1.7,
};

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useGsap((mm) => {
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const el = root.current;
      if (!el) return;

      gsap.set(el, { autoAlpha: 0 });

      const ring = el.querySelector<HTMLElement>(".cursor__ring")!;
      const dot = el.querySelector<HTMLElement>(".cursor__dot")!;
      const label = el.querySelector<HTMLElement>(".cursor__label")!;

      const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
      const dotX = gsap.quickTo(dot, "x", { duration: 0.09, ease: "power3" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.09, ease: "power3" });

      let current: HTMLElement | null = null;
      let shown = false;

      // The native cursor is suppressed only for as long as this one is on
      // screen, so any path that hides the custom cursor hands the pointer
      // straight back — the page can never be left unclickable.
      const setShown = (next: boolean, duration: number) => {
        if (shown === next) return;
        shown = next;
        document.documentElement.classList.toggle("has-custom-cursor", next);
        gsap.to(el, { autoAlpha: next ? 1 : 0, duration });
      };

      const onMove = (event: PointerEvent) => {
        ringX(event.clientX);
        ringY(event.clientY);
        dotX(event.clientX);
        dotY(event.clientY);
        setShown(true, 0.4);
      };

      const onLeave = () => setShown(false, 0.25);

      const onOver = (event: PointerEvent) => {
        const target =
          (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]") ?? null;
        if (target === current) return;
        current = target;
        if (!target) {
          gsap.to(ring, { scale: 1, duration: 0.45, ease: ease.out });
          gsap.to(label, { autoAlpha: 0, duration: 0.3 });
          return;
        }
        const name = target.dataset.cursor ?? "Link";
        label.textContent = name;
        gsap.to(ring, { scale: SCALE[name] ?? 1.7, duration: 0.5, ease: ease.out });
        gsap.to(label, { autoAlpha: SCALE[name] ? 1 : 0, duration: 0.3 });
      };

      // Re-entry does not always deliver a `pointermove` before the first paint,
      // and alt-tabbing away fires neither event reliably — so re-arm from
      // `pointerenter` and from the window losing focus.
      const onEnter = () => setShown(true, 0.25);
      const onBlur = () => setShown(false, 0.2);

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("blur", onBlur);
      document.addEventListener("pointerleave", onLeave);
      document.addEventListener("pointerenter", onEnter);

      return () => {
        document.documentElement.classList.remove("has-custom-cursor");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        window.removeEventListener("blur", onBlur);
        document.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("pointerenter", onEnter);
      };
    });
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <div className="cursor__ring">
        <span className="cursor__label" />
      </div>
      <div className="cursor__dot" />
    </div>
  );
}
