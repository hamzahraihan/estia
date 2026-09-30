import { useEffect } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";

/**
 * In-page links are the browser's job right up until ScrollSmoother exists.
 *
 * The smoother renders the page inside a `position: fixed` wrapper and drives it
 * from that wrapper's own scrollTop, which makes the wrapper a scroll container
 * — and a scroll container is what the browser resolves a fragment against. A
 * plain `href="#contact"` therefore scrolls the wrapper and leaves the window
 * exactly where it was: the section arrives while the window still reports the
 * top of the page, and from there the two disagree by the size of the jump. The
 * document goes on advertising its full height, the pinned gallery's spacer
 * included, so scrolling on moves the content the wrong way and opens a blank
 * field below the footer.
 *
 * So the click is answered by the smoother instead, which jumps the window and
 * lets the wrapper follow it as one movement. The hrefs are left as they are:
 * they remain real links for a middle-click or a new tab.
 */
export function useAnchorScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // A modified click is the visitor asking the browser for another page.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      const hash = link?.hash;
      if (!hash || hash === "#") return;

      // With no smoother there is no fixed wrapper in the way, and the browser's
      // own fragment navigation — reduced motion included — is already right.
      const smoother = ScrollSmoother.get();
      if (!smoother) return;

      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();

      // ScrollSmoother measures the destination through a throwaway
      // ScrollTrigger, so the section's top is found even where a pin has moved
      // it, and the window is jumped with the wrapper following it.
      smoother.scrollTo(target, true, "top top");
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
