import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * ScrollSmoother owns the scroll position, so the browser's own history
 * restoration never runs and the router has to be told where to put it back.
 * Kept in session storage rather than memory so a refresh lands in the same
 * place the back button would have.
 */
const key = (path: string) => `estia:scroll:${path}`;

export function rememberScroll(path: string, y: number) {
  try {
    sessionStorage.setItem(key(path), String(Math.round(y)));
  } catch {
    // Storage can be refused outright; losing the memory is survivable,
    // throwing out of a scroll handler is not.
  }
}

/**
 * Broadcast once a page has been put back where it was left. A restored
 * position is not the visitor reading downwards, and anything that watches
 * scroll direction has to be told to re-read it rather than act on it.
 */
export const SCROLL_SETTLED = "estia:scroll-settled";

export function announceScrollSettled() {
  window.dispatchEvent(new CustomEvent(SCROLL_SETTLED));
}

export function recallScroll(path: string): number | null {
  try {
    const raw = sessionStorage.getItem(key(path));
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

/**
 * Recording is suspended across a page change. A new page inherits the old
 * page's scroll for the moment it takes to be repositioned, and without this
 * that borrowed position is written over the very value the page is about to
 * be restored to.
 */
let recording = true;

export function suspendScrollMemory() {
  recording = false;
}

export function resumeScrollMemory() {
  recording = true;
}

/**
 * Records where the visitor is, for whenever this page is left.
 *
 * One listener for the life of the app rather than one per route: a listener
 * re-registered on every path change is still attached for the commit after
 * the route turns over, and the new page's inherited scroll position lands in
 * the old page's slot before it can be detached.
 */
export function useScrollMemory() {
  const { pathname } = useLocation();
  const path = useRef(pathname);
  // A layout effect so the path is current before the browser can dispatch the
  // scroll event that a page change provokes.
  useLayoutEffect(() => {
    path.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (!recording) return;
      cancelAnimationFrame(frame);
      // Re-checked when the frame runs: a transition can end inside the gap,
      // and the position it settled on is the one worth keeping.
      frame = requestAnimationFrame(() => {
        if (!recording) return;
        rememberScroll(path.current, window.scrollY);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}
