# Brief: Animated dithered gradient background

## Goal

Build a slowly moving, grainy "dithered" gradient background for a rounded
card. It should feel like soft, liquid color blobs drifting, seen through
heavy film grain / stipple noise. Background only: no text, buttons, or
other UI on top.

## Visual reference

- Palette: saturated blue (~~#2F86F6), warm yellow (~~#F9DE96), orange/amber
  (~~#F0B057), and off-white/cream (~~#FDF9EC) as the base.
- Shapes: large, smooth, organic, flowing bands and blobs (not geometric).
  Blue forms long curved ribbons and pools; yellow/orange fills the large
  areas; cream/white acts as soft highlights between them.
- Texture: transitions between colors are NOT smooth. They break up into
  fine, high-frequency stipple grain (like a risograph or noise dither), so
  edges look sandy and dissolve into each other. Grain is per-pixel, roughly
  1-2px, visible everywhere and densest at color boundaries.
- Container: square-ish card with large rounded corners (~28-32px radius),
  overflow hidden. The component should fill whatever container it is
  placed in (width/height 100%).

## Approach A (preferred): SVG + CSS

1. Base layer: cream background color.
2. Blob layer: 5-7 large blurred shapes (ellipses / curved paths) in blue,
   yellow and orange, blurred heavily (blur ~60-100px) and overlapping.
3. Motion: animate each blob's translate/rotate/scale with slow CSS keyframes
   or SMIL (each 20-40s, different durations and delays, ease-in-out,
   infinite alternate) so the combined motion never visibly repeats.
4. Grain/dither: overlay an SVG filter on top of the blob layer:
   - feTurbulence (type="fractalNoise", baseFrequency ~0.8-1.2,
     numOctaves 2-3)
   - feColorMatrix to convert the noise to high-contrast luminance
   - feComponentTransfer (discrete or steep linear table) to push the blob
     colors through a hard threshold against the noise, so color edges
     become stipple instead of smooth gradients
   - Optionally re-seed the turbulence at ~8-12 fps for a subtle shimmer
5. Keep the filter region limited to the card. Large animated filters are
   expensive, so render the blobs on their own composited layer
   (will-change: transform).

## Approach B (fallback): WebGL fragment shader

Use if approach A can't reach the grain quality or hits performance limits.

- Single full-size <canvas>, no libraries needed.
- Compute a scalar field per pixel from domain-warped fbm/simplex noise,
  scrolled slowly with time (~0.03-0.06 speed).
- Map the field through a 4-stop ramp (blue, cream, yellow, orange) with
  fairly hard stops.
- Dither: add per-pixel hash or blue-noise before the ramp
  (v + (n - 0.5) * 0.35), re-seeded ~10-15 fps, so boundaries turn into
  grain.

## Motion

- Slow, looping, organic drift. Nothing fast, no obvious repetition.
- Grain flickers gently; shapes complete a full cycle over ~20-40s.

## Performance and quality

- Cap devicePixelRatio at 2; lower the render resolution on weak devices.
- Pause the animation when offscreen (IntersectionObserver) or the tab is
  hidden.
- Respect prefers-reduced-motion: show a single static frame.
- Provide a static PNG fallback.
- Expose props for: colors, speed, grain amount, blur/warp strength, scale.

## Acceptance criteria

- Looks like sandy, stippled color fields with soft flowing blue ribbons
  over a warm yellow/orange/cream base.
- Smooth (60fps on a mid-range laptop) and calm.
- Delivered as a standalone background component with no content inside it.
