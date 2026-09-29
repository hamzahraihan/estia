# Estia — Interior Architecture

Company profile site for Estia, an interior architecture studio in Athens.
React 19 + TypeScript + Vite + Tailwind v4, with the whole motion layer built on
GSAP 3.15 (ScrollSmoother, ScrollTrigger, SplitText, CustomEase).

## Commands

```bash
bun install
bun dev        # vite dev server
bun run build  # tsc -b && vite build
bun run preview
bun run lint   # oxlint
```

## The motion layer

All animation is registered against `gsap.matchMedia()` conditions defined in
`src/lib/motion.ts`, so honouring `prefers-reduced-motion` is a matter of
choosing a branch rather than scattering guards:

| Condition | Where it is used |
| --- | --- |
| `motion.full` | Every entrance, scroll-linked tween and reveal |
| `motion.reduce` | Static final states — panel heights, crossfades, the header |
| `motion.desktop` / `motion.mobile` | Reserved for layout-dependent timelines |

`usePrefersReducedMotion()` mirrors the preference onto `<html data-motion>`.
The unlayered rules at the bottom of `src/index.css` read that attribute to
unwrap the two layouts that exist only because of their animation — the pinned
work gallery and the duplicated marquee — so no content becomes unreachable
when nothing is allowed to move. They are deliberately outside
`@layer components`, because Tailwind's utilities layer outranks it.

`SmoothScroll` re-measures `ScrollTrigger` whenever the smoothed content's box
changes size. Pinned sections derive their scroll length from measured layout,
and that layout keeps moving as display fonts swap and images decode; without
the observer, pins end up a few hundred pixels short of the track.

## The project transition

`src/components/ProjectOverlay.tsx` holds the site's signature move.

1. Five curtain panels sit parked above the fold. On open they slide down to
   cover the viewport, staggered from the centre.
2. At the same time the clicked card's rectangle is measured and expressed as
   the transforms that map the full-bleed hero onto it (`boxOf`). The hero image
   is counter-scaled by the inverse, so the frame that expands is the exact
   crop the visitor was just looking at.
3. The panels continue on to park below the fold, the scrim fades in, the title
   rises out of its mask.
4. Closing runs the same gestures in reverse: the curtain drops, the image
   unrolls back into the card, and the panels part around it. If the source card
   has scrolled out of view the flip is skipped rather than flying off-screen.

The article is keyed on `project.slug`. SplitText holds a reference to the
outgoing heading, and its `revert()` would otherwise write the previous
project's title into the new one when stepping to the next project.

## Content and imagery

All copy lives in `src/data/` — `studio.ts` for the practice, `projects.ts` for
the work, `media.ts` for the photography manifest.

Every image is hot-linked from Unsplash so the layout can be reviewed before
real project photography lands. `image(key, width)` builds a pre-cropped URL so
every slot reserves its space before the image lands. Replace the ids in
`src/data/media.ts` with the studio's own assets when they are ready.
