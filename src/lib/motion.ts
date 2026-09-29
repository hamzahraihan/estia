import { useLayoutEffect, useState, type DependencyList } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

/** Signature easing for anything the visitor is meant to notice. */
CustomEase.create("cine", "0.16, 1, 0.3, 1");
CustomEase.create("cineInOut", "0.83, 0, 0.17, 1");

export const ease = {
  out: "cine",
  io: "cineInOut",
} as const;

/**
 * MatchMedia conditions. Every animation in the site is registered against one
 * of these, so honouring `prefers-reduced-motion` is a matter of picking the
 * branch — never a scattering of guards.
 */
export const motion = {
  full: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
} as const;

/**
 * Tracks `prefers-reduced-motion` and mirrors it onto `<html data-motion>`.
 * CSS reads that attribute to unwrap the layouts which only exist because of
 * their animation — the pinned work gallery, the duplicated marquee — so that
 * content stays reachable when nothing is allowed to move.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useLayoutEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(query.matches);
      document.documentElement.dataset.motion = query.matches ? "reduce" : "full";
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return reduced;
}

/**
 * Runs a GSAP build once on mount and again on every `deps` change, inside a
 * `gsap.matchMedia()` so the whole thing — tweens, ScrollTriggers, SplitText
 * instances and listeners — reverts together on cleanup or on StrictMode's
 * double invocation.
 */
export function useGsap(
  setup: (mm: gsap.MatchMedia) => void,
  deps: DependencyList = [],
): void {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    setup(mm);
    return () => mm.revert();
    // The caller owns the dependency list; a static checker cannot see through
    // the `setup` closure that produced these animations.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Splits text into masked lines, re-splitting automatically on reflow. */
export function splitLines(el: Element) {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit: (self) => gsap.set(self.lines, { willChange: "transform" }),
  });
}

/** Splits text into masked words — used for scroll-scrubbed statements. */
export function splitWords(el: Element) {
  return SplitText.create(el, {
    type: "words",
    mask: "words",
    wordsClass: "split-word",
    autoSplit: true,
  });
}

/** Counts an element's text from zero up to `end`. */
export function counter(target: Element, end: number, duration = 1.6) {
  const state = { n: 0 };
  return gsap.to(state, {
    n: end,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      target.textContent = Math.round(state.n).toLocaleString("en-US");
    },
  });
}

/** Locks page scroll while an overlay owns the viewport. */
export function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle("is-locked", locked);
  ScrollSmoother.get()?.paused(locked);
}
