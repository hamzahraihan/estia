import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocation, useNavigate } from "react-router";
import { ease, lockScroll, scrollTo, useGsap, usePrefersReducedMotion } from "../lib/motion";
import {
  announceScrollSettled,
  recallScroll,
  resumeScrollMemory,
  suspendScrollMemory,
} from "../lib/scrollMemory";
import { RouteTransitionContext, type RouteTransitionApi } from "../lib/routeTransition";

const PANELS = 5;

/**
 * Curtain state. A panel is parked above the fold and slides down to cover the
 * viewport, then continues on to park below it — so "cover" and "reveal" are
 * the same gesture read in opposite directions.
 */
const PARKED_ABOVE = { yPercent: -101, transformOrigin: "center bottom" };
const PARKED_BELOW = { yPercent: 101, transformOrigin: "center top" };
const STAGGER = { each: 0.05, from: "center" as const };

/**
 * The curtain that stands between two pages.
 *
 * Pages only ever ask to leave. `go` covers, swaps the route, and the incoming
 * page is uncovered once React has committed it. A page that wants to animate
 * itself out first — the project hero unrolling back into its card — takes
 * `cover`, plays alongside it, and then navigates itself.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const curtain = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const armed = useRef(false);
  const covering = useRef<Promise<void>>(Promise.resolve());
  const [busy, setBusy] = useState(false);

  const panels = useCallback(
    () => Array.from(curtain.current?.children ?? []) as HTMLElement[],
    [],
  );

  const cover = useCallback(() => {
    if (armed.current) return covering.current;
    armed.current = true;
    setBusy(true);
    lockScroll(true);
    // From here until the new page has been repositioned, whatever scroll the
    // browser settles on belongs to neither page. Recording it would replace
    // the position this navigation is about to restore with the one it is
    // inheriting — and the browser gets there before any effect can react.
    suspendScrollMemory();

    // With motion off there is nothing to watch, but the page still has to be
    // swapped and the scroll still has to be handed back.
    if (reduced) return Promise.resolve();

    const els = panels();
    covering.current = new Promise<void>((resolve) => {
      if (!els.length) return resolve();
      gsap.set(els, PARKED_ABOVE);
      gsap.to(els, {
        yPercent: 0,
        duration: 0.55,
        ease: ease.io,
        stagger: STAGGER,
        onComplete: () => resolve(),
      });
    });
    return covering.current;
  }, [panels, reduced]);

  const part = useCallback(() => {
    if (!armed.current) return;
    const release = () => {
      armed.current = false;
      setBusy(false);
      lockScroll(false);
      announceScrollSettled();
    };
    if (reduced) return release();
    const els = panels();
    gsap.to(els, {
      ...PARKED_BELOW,
      duration: 0.85,
      ease: ease.io,
      stagger: STAGGER,
      onComplete: release,
    });
  }, [panels, reduced]);

  const go = useCallback(
    (to: string, state?: unknown) => {
      if (armed.current) return;
      void cover().then(() => navigate(to, { state }));
    },
    [cover, navigate],
  );

  // Every page change lands here, whether it came from a link, from `go`, or
  // from the back button — a click has already covered by then, and history has
  // not, so the effect covers for itself. It cannot be done from a popstate
  // listener: the router's own handler wins that race, and the route is already
  // committed before such a listener would get to run.
  const settled = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname === settled.current) return;
    settled.current = location.pathname;

    // Read where this page was left before anything can overwrite it. History
    // navigation has no click to hang the transition on, so the popstate
    // below is where that one has to start.
    const target = recallScroll(location.pathname) ?? 0;

    // The re-measure against the new height happens behind an opaque screen,
    // which is the one place it is allowed to be expensive.
    const pending = armed.current ? covering.current : cover();
    void pending
      .then(() => {
        ScrollTrigger.refresh();
        scrollTo(target);
        part();
      })
      .finally(resumeScrollMemory);
  }, [location.pathname, cover, part]);

  // Stops the scroll recorder the instant the history turns, which is before
  // the router has committed anything and long before the browser has settled
  // the new page's scroll.
  useEffect(() => {
    const onPop = () => suspendScrollMemory();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useGsap(() => {
    // The curtain lives parked out of sight and only enters on a page change.
    // Without this it would be sitting over the site on the very first paint.
    gsap.set(panels(), PARKED_ABOVE);
  }, [panels]);

  const api = useMemo<RouteTransitionApi>(
    () => ({ cover, part, go, busy }),
    [cover, part, go, busy],
  );

  return (
    <RouteTransitionContext.Provider value={api}>
      {children}
      <div ref={curtain} className="pointer-events-none fixed inset-0 z-100" aria-hidden="true">
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            className="absolute inset-y-0 w-1/5 bg-char"
            style={{ left: `${(i / PANELS) * 100}%` }}
          />
        ))}
      </div>
    </RouteTransitionContext.Provider>
  );
}
