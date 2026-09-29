/** A rectangle expressed as the transforms that map the viewport onto it. */
export type Box = {
  x: number;
  y: number;
  sx: number;
  sy: number;
};

/**
 * The card's rectangle, in the transforms that grow a full-bleed hero out of
 * it. Measured as plain numbers on the page that has the card: history state
 * goes through `pushState`, which cannot carry a live element across.
 */
export function cardBox(el: Element): Box {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2 - window.innerWidth / 2,
    y: r.top + r.height / 2 - window.innerHeight / 2,
    sx: r.width / window.innerWidth,
    sy: r.height / window.innerHeight,
  };
}
