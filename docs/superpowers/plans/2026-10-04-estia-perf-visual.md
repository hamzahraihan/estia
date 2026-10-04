# Estia Performance + Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the measured mobile LCP failure (3496 ms), stop 2.3 MB of below-fold artwork from loading on first paint, and fix the Process section pin bug where stage copy sits below the fold for the entire pin.

**Architecture:** No new subsystems. Six surgical fixes in existing components: lazy-load what is below the fold, pin the row instead of the card, register the two artwork layers to the same box, decouple the preloader curtain from the font gate, and split the project route out of the landing chunk.

**Tech Stack:** React 19 + React Router 8, GSAP 3 (ScrollTrigger, ScrollSmoother, SplitText, CustomEase), Tailwind CSS v4, Vite 8, TypeScript.

**Spec:** No separate spec doc — this plan implements the spike probe findings from 2026-10-04 (Performance + visual scope: mobile LCP 3496 ms, 8 eager webps at ~1721 ms, 1505 ms long task, 479 kB single JS chunk, Process pin/copy misalignment, artwork layer misregistration). The probe report in conversation is the spec; executors read this plan plus the cited source files.

## Global Constraints

- ScrollSmoother owns scroll — never use bare `window.scrollTo`; use `scrollTo()` from `src/lib/motion.ts:168-172`.
- Every animation registers against `motion.full` / `motion.reduce` via `useGsap` + `mm.add` (`src/lib/motion.ts:24-29`) — never a scattering of guards.
- Reduced-motion must keep content reachable: pinned/duplicated layouts unwrap under `html[data-motion="reduce"]` (`src/index.css:413-438`); StageDrawing markup holds the finished state so a never-run tween still shows the drawing (`src/components/StageDrawing.tsx:60-62`).
- Custom cursor: suppress native cursor only while custom cursor is shown (`src/components/Cursor.tsx:40-44`).
- Preloader owns the viewport until handover; `SmoothScroll paused={loading}` (`src/App.tsx:35`).
- Copy tone: studio voice in `src/data/studio.ts`; no lorem, no placeholder copy.
- Build must stay green: `bun run build` (tsc -b + vite build).

## Review Focus

- Visitor on `prefers-reduced-motion: reduce` scrolling Process expects all four stage cards fully drawn with copy beside them and zero pin-spacer dead space.
- Visitor on 390px mobile scrolling Process expects copy above card, no horizontal overflow, no text sitting on the card below (the 24px-gap constraint in `Process.tsx:21-23`).
- Visitor on Slow 4G loading `/` expects hero image + headline without waiting for all eight stage webps.
- Visitor clicking a project card then pressing back expects scroll restored where they left it (`useScrollMemory`) and no second `ScrollTrigger.refresh()` clobbering it (`SmoothScroll.tsx:40-44`).
- Visitor with fonts blocked expects the preloader curtain to lift on the deadline path, never strand on black.

---

## File Structure

- Modify `src/components/StageDrawing.tsx:109-131` — add `loading="lazy"` + `decoding="async"` to both `<img>`, reconcile the inner-box sizing so wire + stipple share one box.
- Modify `src/components/Process.tsx:1-105` — move the pin from the card to the row (or equivalent row-level pin), remove stray blank line at line 41.
- Delete `src/assets/stage-draw-stripple.avif`, `src/assets/stages-draw-wireframe.avif` — imported nowhere, absent from `dist/`.
- Modify `src/components/Preloader.tsx:87-110` — decouple curtain lift from the `document.fonts.ready` gate.
- Modify `index.html:14-20` — font loading strategy + hero preload.
- Modify `src/App.tsx:1-52` — `React.lazy` the `/work/:slug` route.
- Modify `vite.config.ts:1-9` — only if bundle audit shows vendor split is needed; otherwise leave alone.

Each task below produces a self-contained, independently verifiable change. Task order is cheapest-verifiable-first, except the pin fix (Task 3) which is the only visitor-visible bug and may be taken first without blocking anything else.

---

### Task 1: Lazy-load the Process artwork

**Files:**
- Modify: `src/components/StageDrawing.tsx:118-128`
- Test: browser network panel on `http://localhost:4173/` (production preview) + `bun run build`

**Interfaces:**
- Consumes: existing `ARTWORK` record (`StageDrawing.tsx:21-26`) — no signature change.
- Produces: same `StageDrawing({ stage, className })` props; only `<img>` attributes change, so no downstream consumer changes.

- [ ] **Step 1: Confirm the failing behavior — all 8 webps request at first paint**

Run against the production preview (`bun run preview --port 4173`):

```js
// In chrome-devtools evaluate_script on page 2 after load:
() => performance.getEntriesByType("resource")
  .filter(r => r.name.includes("stage-"))
  .map(r => ({ n: r.name.split("/").pop(), start: Math.round(r.startTime) }))
```

Run: `bun run preview --port 4173`, load `/`, run the snippet.
Expected: FAIL state — 8 `stage-*.webp` entries all with `start` ≈ 1721–1725 ms (before any scroll).

- [ ] **Step 2: Add lazy loading to both artwork layers**

```tsx
<img
  src={wire}
  alt=""
  loading="lazy"
  decoding="async"
  className="stage-wire block w-full h-full"
  style={{ clipPath: "inset(100% 0% 0% 0%)" }}
/>
<img
  src={stripple}
  alt=""
  loading="lazy"
  decoding="async"
  className="stage-settled absolute inset-0 size-full object-contain"
/>
```

Apply to `src/components/StageDrawing.tsx:118-128`. Match the existing pattern in `Studio.tsx:82-83` (`loading="lazy" decoding="async"`). Keep `alt=""` (decorative — copy beside the card says it all).

- [ ] **Step 3: Verify stage images no longer load on first paint**

Run: same snippet as Step 1 on a fresh navigation to `/`.
Expected: PASS — zero `stage-*.webp` entries at first paint; they appear only after scrolling toward `#process`.

- [ ] **Step 4: Verify build is green**

Run: `bun run build`
Expected: PASS — `tsc -b && vite build` completes, `dist/` still contains the 8 hashed webps (they ship, just deferred).

- [ ] **Step 5: Commit**

```bash
git add src/components/StageDrawing.tsx
git commit -m "perf(process): lazy-load stage artwork below the fold"
```

---

### Task 2: Remove dead artwork binaries

**Files:**
- Delete: `src/assets/stage-draw-stripple.avif` (254 KB)
- Delete: `src/assets/stages-draw-wireframe.avif` (128 KB)
- Test: `bun run build` + `grep` for references

**Interfaces:**
- Consumes: nothing (both files are unimported).
- Produces: ~383 KB less source weight; no code change.

- [ ] **Step 1: Prove both files are unreferenced**

Run: `grep -rn "stage-draw-stripple.avif\|stages-draw-wireframe.avif" src/ index.html`
Expected: FAIL state confirmed — zero hits (that is why deletion is safe).

- [ ] **Step 2: Delete the two files**

```bash
git rm src/assets/stage-draw-stripple.avif src/assets/stages-draw-wireframe.avif
```

- [ ] **Step 3: Verify build + no stragglers**

Run: `bun run build && grep -rn "\.avif" src/`
Expected: PASS — build green; remaining `.avif` references: none in `src/` (only the data-URI grain in `index.css`, which is not a file import).

- [ ] **Step 4: Commit (folded into Step 2's `git rm` + build check)**

```bash
git commit -m "chore(assets): remove unreferenced stage avif binaries"
```

Note: if `git rm` already committed in Step 2, skip this step rather than creating an empty commit.

---

### Task 3: Fix the Process pin — copy must stay with its card

**Files:**
- Modify: `src/components/Process.tsx:13-42` (row entrance timelines + new row pin)
- Modify: `src/components/StageDrawing.tsx:71-107` (remove per-card `pin: true`, keep the scrubbed clip-path tween driven by the row's trigger)
- Modify: `src/components/Process.tsx:41` (remove stray blank line)
- Test: desktop 1512×950 walk-through + reduced-motion + 390px mobile

**Interfaces:**
- Consumes: `StageDrawing({ stage, className })` — the card keeps its props; its internal ScrollTrigger is removed and the clip-path tween is driven by a trigger owned by the row. Exact handoff: the row creates one `ScrollTrigger` per row (`trigger: row`, `start: "center center"`, `end: "+=<0.7*vh>"`, `pin: <pinned element>`, `scrub: 0.4`) and the card's timeline attaches its two `fromTo` clip-path tweens to that trigger's progress instead of creating its own.
- Produces: `.process-row` remains the grid (`grid-cols-1 lg:grid-cols-2`); while pinned, card top and copy top are both within the viewport (acceptance: copy `getBoundingClientRect().top < innerHeight` and card `top >= 0` at pin midpoint).

- [ ] **Step 1: Reproduce the bug with numbers**

```js
// On desktop 1512x950, scrolled so row 2's card is pinned (scrollY ≈ 6648):
() => [...document.querySelectorAll(".process-row")].map(row => {
  const d = row.querySelector("div.relative.isolate").getBoundingClientRect();
  const col = row.children[0].getBoundingClientRect();
  return { cardTop: Math.round(d.top), textTop: Math.round(col.top),
           textVisible: col.bottom > 0 && col.top < innerHeight };
})
```

Expected: FAIL state — pinned row reports `cardTop: 396` with `textVisible: false` (copy top ≈ 982, below the 950px fold). Screenshot shows pinned card with empty dark column beside it.

- [ ] **Step 2: Move the pin from the card to the row**

The root cause: `pin: true` on the card (`StageDrawing.tsx:79`) makes GSAP wrap the *card* in a 1324px pin-spacer that becomes a grid item; `items-center` (`Process.tsx:74`) then centers the *text column* on the 1324px spacer while the card pins to the spacer's top — copy ends 586px below the card, off-screen.

Minimal fix: pin the row, not the card.

```tsx
// Process.tsx — one timeline per row driving both entrance and pin:
mm.add(motion.full, () => {
  const el = root.current;
  if (!el) return;
  const rows = gsap.utils.toArray<HTMLElement>(".process-row", el).map((row) => {
    const card = row.querySelector<HTMLElement>("div.relative.isolate");
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: row,
        start: "center center",
        end: () => `+=${Math.round(window.innerHeight * 0.7)}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(
      card?.querySelector(".stage-settled"),
      { clipPath: "inset(0% 0% 100% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
      0,
    ).fromTo(
      card?.querySelector(".stage-wire"),
      { clipPath: "inset(0% 0% 0% 0%)" },
      { clipPath: "inset(100% 0% 0% 0%)", ease: "none" },
      0,
    );
    return tl;
  });
  // Keep the existing [data-part] entrance as a separate non-scrubbed
  // trigger per row ("top 86%"), unchanged.
  return () => { rows.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); };
});
```

```tsx
// StageDrawing.tsx — delete the useGsap pin block (lines 71-107),
// leaving a pure presentational component (ARTWORK + markup only).
```

Keep `PIN = 0.7` semantics (move the constant to `Process.tsx` or import it — do not duplicate the literal). Also delete the stray blank line at `Process.tsx:41`.

- [ ] **Step 3: Verify copy and card pin together on desktop**

Run: same snippet as Step 1 at the pin midpoint of each of the 4 rows.
Expected: PASS — every row reports card top within viewport AND `textVisible: true`. Screenshot shows copy beside the pinned card, not an empty dark column.

- [ ] **Step 4: Verify reduced-motion + mobile**

Run 1 (reduced-motion): emulate `prefers-reduced-motion: reduce`, load `/`, scroll through `#process`.
Expected: PASS — no pin-spacers, all four cards fully drawn (finished-state markup), all copy readable, no dead whitespace.

Run 2 (390px mobile): scroll through `#process`.
Expected: PASS — copy stacks above card, no horizontal overflow, no copy sitting on the card below (24px-gap constraint holds).

- [ ] **Step 5: Commit**

```bash
git add src/components/Process.tsx src/components/StageDrawing.tsx
git commit -m "fix(process): pin the row so stage copy stays with its card"
```

---

### Task 4: Register artwork layers + clear the fixed header

**Files:**
- Modify: `src/components/StageDrawing.tsx:109-131` (inner-box sizing)
- Modify: pin `start` in `src/components/Process.tsx` (from Task 3)
- Test: desktop screenshot at pin midpoint + header overlap check

**Interfaces:**
- Consumes: the row pin from Task 3 (this task is stacked on it — do not start it on a tree without Task 3).
- Produces: wire and stipple boxes with identical `getBoundingClientRect()` (±1px); pinned card top edge ≥ 72px header height.

- [ ] **Step 1: Confirm the misregistration**

```js
() => {
  const d = document.querySelector(".process-row div.relative.isolate");
  const r = d.getBoundingClientRect();
  const img = d.querySelector("img").getBoundingClientRect();
  return JSON.stringify({ card: [Math.round(r.width), Math.round(r.height)],
                          box: [Math.round(img.width), Math.round(img.height)] });
}
```

Expected: FAIL state — card `659×659`, inner box `657×571` (inherits the 1280×1112 wireframe ratio); ~44px bare linen bands above/below the drawing.

- [ ] **Step 2: Give both layers the same box**

```tsx
<div className="absolute inset-0">
  <img
    src={wire}
    alt=""
    loading="lazy"
    decoding="async"
    className="stage-wire absolute inset-0 size-full object-cover"
    style={{ clipPath: "inset(100% 0% 0% 0%)" }}
  />
  <img
    src={stripple}
    alt=""
    loading="lazy"
    decoding="async"
    className="stage-settled absolute inset-0 size-full object-cover"
  />
</div>
```

Replace the `top-1/2 -translate-y-1/2` wrapper + `object-contain` with a full-bleed `inset-0` box and `object-cover` on *both* layers. The clip-path edge then travels across two identically-sized layers. (The `build` pair is already cropped square; `object-cover` crops the other three identically at render time — no re-export needed.)

- [ ] **Step 3: Offset the pin start below the fixed header**

```ts
start: "top center+=36", // half the 72px fixed header: card top clears the nav
```

Apply to the row ScrollTrigger from Task 3. Verify: at pin start, card top edge ≥ 72px from viewport top (no slide-under-nav).

- [ ] **Step 4: Verify registration + header clearance**

Run: Step 1 snippet + screenshot at pin midpoint.
Expected: PASS — wire and stipple boxes identical (±1px), no linen bands, single clip edge reads as one line; card clears the nav.

- [ ] **Step 5: Commit**

```bash
git add src/components/StageDrawing.tsx src/components/Process.tsx
git commit -m "fix(process): register artwork layers and clear the fixed header"
```

---

### Task 5: Decouple the preloader from the font gate (LCP)

**Files:**
- Modify: `src/components/Preloader.tsx:87-110`
- Modify: `index.html:14-20`
- Test: mobile Slow-4G PerformanceObserver probe (LCP target < 2500 ms)

**Interfaces:**
- Consumes: `onReveal` / `onDone` props — signatures unchanged; only *when* they fire changes.
- Produces: curtain lifts on content-ready (hero image decode or short deadline), never gated on all three font faces.

- [ ] **Step 1: Reproduce the LCP floor**

```js
// Mobile 390x844, Slow 4G, 4x CPU, fresh navigation:
() => JSON.stringify({ lcp: Math.round(window.__v.lcp),
                        fcp: performance.getEntriesByType("paint").find(p => p.name === "first-contentful-paint")?.startTime })
```

(with the `__v` PerformanceObserver instrumentation from the probe).
Expected: FAIL state — FCP ≈ LCP ≈ 3496 ms; first paint is the curtain (1680 ms), nothing real until curtain + 1.85 s count + 1.2 s lift complete (~3.1 s floor).

- [ ] **Step 2: Race fonts per-face with a shorter deadline, start counting immediately**

```tsx
mm.add(motion.full, () => {
  let cleanup: (() => void) | undefined;
  let cancelled = false;
  cleanup = build(); // start the count NOW, don't wait for fonts
  // Re-measure SplitText layouts once the display face arrives —
  // the curtain no longer waits for it.
  document.fonts?.ready.catch(() => undefined).then(() => {
    if (!cancelled) ScrollTrigger.refresh();
  });
  return () => { cancelled = true; cleanup?.(); };
});
```

Replace the `Promise.race([faces, 1200ms deadline])` gate (`Preloader.tsx:95-98`). Keep the `motion.reduce` branch untouched. Rationale: `display=swap` already renders fallback type; SplitText re-splitting on `fonts.ready` + `ScrollTrigger.refresh()` corrects measurement without holding the curtain.

- [ ] **Step 3: Preload the hero image, trim the font request**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
<link
  rel="preload"
  as="image"
  href="https://images.unsplash.com/photo-1700709677626-132ac9738ca4?auto=format&fit=crop&crop=entropy&w=2000&h=1125&q=72"
/>
```

Add the hero preload to `index.html` (URL must byte-match `image("hero", 2000)` from `src/data/media.ts:176-179`). Keep the Unsplash `preconnect` that is already there. Do NOT self-host fonts in this task (deferred — needs a licensing/woff2 pipeline decision).

- [ ] **Step 4: Verify LCP improvement + font-blocked fallback**

Run 1: Step 1 probe again.
Expected: PASS — LCP < 2500 ms on the same Slow-4G/4×CPU profile; FCP < LCP (curtain no longer the LCP element).

Run 2: block `fonts.g*` requests, load `/`.
Expected: PASS — curtain lifts on the content path, hero assembles in fallback type, no black-screen strand (Review Focus line 5).

- [ ] **Step 5: Commit**

```bash
git add src/components/Preloader.tsx index.html
git commit -m "perf(preloader): lift the curtain on content-ready, not fonts-ready"
```

---

### Task 6: Split the project route out of the landing chunk

**Files:**
- Modify: `src/App.tsx:10,38` (`React.lazy` + `Suspense`)
- Modify: `vite.config.ts:1-9` — only if needed (see Step 2)
- Test: `bun run build` chunk listing + route navigation

**Interfaces:**
- Consumes: `ProjectPage` default export — unchanged; only import mechanism changes.
- Produces: `dist/assets` contains a second JS chunk loaded only on `/work/:slug`.

- [ ] **Step 1: Confirm the single-chunk baseline**

Run: `bun run build`
Expected: FAIL state — one `dist/assets/index-*.js` (~479 kB, ~161 kB gzip); `ProjectPage` ships on `/`.

- [ ] **Step 2: Lazy-load the project route**

```tsx
import { Suspense, lazy, useState } from "react";
// ...
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
```

```tsx
<Route
  path="/work/:slug"
  element={
    <Suspense fallback={null}>
      <ProjectPage />
    </Suspense>
  }
/>
```

`fallback={null}`: the route transition already covers the swap; no spinner UI. Check `ProjectPage.tsx` for named-vs-default export first and match it.

- [ ] **Step 3: Verify the split + navigation still works**

Run: `bun run build`
Expected: PASS — two JS chunks in `dist/assets`; landing chunk smaller than 479 kB. Then: preview, open `/`, click a project card (overlay opens, hero pre-warmed via `preload()` in `media.ts:189-191`), navigate back — scroll restored, no console errors.

Run: `bun run build` chunk audit for `vite.config.ts`.
Expected: only touch `vite.config.ts` if the landing chunk is still > 400 kB after the split — then add a `manualChunks` vendor split for `gsap`. Otherwise leave it alone (YAGNI).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx vite.config.ts
git commit -m "perf(routes): code-split the project overlay route"
```

---

## Deferred (out of scope for this plan)

- **Code-structure axis** (duplicated scroll/animation logic across Hero/Process/Studio/Testimonials, `lib/` cohesion) — deferred per the probe scoping decision; needs its own classification pass.
- **Font self-hosting** (woff2 in `/public`, drop Google Fonts request chain) — needs a licensing check on Instrument Serif / Inter Tight / JetBrains Mono web use.
- **Stage webp recompression** (1280px → ~700px display width, quality pass) — binary asset work; do after Task 1 proves the lazy path.
- **Unsplash → owned photography** — already documented in `src/data/media.ts:1-8`; placeholder by design.
- **1505 ms mount long-task** (defer SplitText off-screen sections) — revisit if Task 5 lands LCP but TBT still blocks interaction.
