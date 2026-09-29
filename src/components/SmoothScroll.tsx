import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { motion, useGsap } from "../lib/motion";

type Props = {
  /** The preloader owns the viewport until it hands over. */
  paused: boolean;
  children: ReactNode;
};

export default function SmoothScroll({ paused, children }: Props) {
  const content = useRef<HTMLDivElement>(null);

  useGsap((mm) => {
    mm.add(motion.full, () => {
      const smoother = ScrollSmoother.create({
        content: "#smooth-content",
        smooth: 0.85,
        smoothTouch: 0.2,
        effects: true,
        ignoreMobileResize: true,
      });
      return () => smoother.kill();
    });

    // Pinned sections derive their scroll length from measured layout, and that
    // layout keeps moving: display fonts swap, images decode, the preloader
    // hands the viewport back. Re-measure whenever the content's own box
    // actually changes size, so pins never end up a few hundred pixels short.
    const node = content.current;
    let last = "";
    let timer = 0;
    const observer = new ResizeObserver(([entry]) => {
      const key = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
      if (key === last) return;
      last = key;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        // A page change refreshes on its own schedule. Refreshing again here
        // would land just after it and re-clamp the scroll position it has
        // only just put back where the visitor left it.
        if (!document.documentElement.classList.contains("is-locked")) ScrollTrigger.refresh();
      }, 180);
    });
    if (node) observer.observe(node);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    ScrollSmoother.get()?.paused(paused);
  }, [paused]);

  return (
    <div id="smooth-content" ref={content}>
      {children}
    </div>
  );
}
