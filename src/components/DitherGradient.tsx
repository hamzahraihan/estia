import { useEffect, useId, useRef, useState } from "react";

export type DitherColors = {
  /** Long ribbons and pools. */
  blue: string;
  /** Soft highlights between the bands. */
  cream: string;
  /** The large field. */
  yellow: string;
  /** Warmer accent inside the field. */
  amber: string;
};

type Ribbon = {
  color: keyof DitherColors;
  /**
   * A closed band, not a disc. `d` is authored on a 0–100 box and the shapes
   * overrun it on every side, so the card can be any shape and still be full.
   */
  d: string;
  /** Travel of this band along its own length, and across it. */
  dx: number;
  dy: number;
  s1: number;
  s2: number;
  dur: number;
  delay: number;
};

/**
 * Curved bands rather than discs. A blurred circle has no direction to read —
 * it always resolves to a cloud — so the wave has to live in the geometry: each
 * shape is a long S-curve, and drifting them along their own length is what
 * makes the field look like it is moving water.
 *
 * Two blues because the brief wants ribbons *and* pools; the pool is the one
 * closed curl at the bottom. The cream band sits between amber and blue as the
 * highlight the other two would otherwise swallow.
 *
 * Travel is deliberately generous and the cycles short. An earlier pass used
 * ~65px of drift spread across a 68-second there-and-back, which measured at
 * about one pixel per two seconds — technically animating, visually frozen.
 */
const RIBBONS: Ribbon[] = [
  {
    color: "amber",
    d: "M-8 28C18 18 34 37 56 29 70 24 84 31 108 20L108 45 84 56 70 49 56 54 34 64 18 45-8 55Z",
    dx: 26,
    dy: 9,
    s1: 1.14,
    s2: 0.92,
    dur: 17,
    delay: 0,
  },
  {
    color: "cream",
    d: "M-8 47C18 38 34 53 56 46 70 41 84 49 108 38L108 49 84 60 70 53 56 58 34 66 18 50-8 59Z",
    dx: -22,
    dy: -8,
    s1: 1.05,
    s2: 1.24,
    dur: 14,
    delay: -5,
  },
  {
    color: "blue",
    d: "M-8 60C16 42 30 74 52 59 68 48 82 67 108 51L108 68 82 84 68 65 52 76 30 91 16 58-8 76Z",
    dx: 32,
    dy: -11,
    s1: 1.18,
    s2: 0.9,
    dur: 19,
    delay: -9,
  },
  {
    color: "yellow",
    d: "M-8 76C20 63 40 86 64 75 78 69 90 78 108 71L108 112-8 112Z",
    dx: 18,
    dy: 12,
    s1: 1.2,
    s2: 0.94,
    dur: 15,
    delay: -2,
  },
  {
    color: "blue",
    d: "M-8 88C6 72 26 74 38 86 49 97 40 112 20 110 4 108-8 98-8 88Z",
    dx: -24,
    dy: 10,
    s1: 0.88,
    s2: 1.26,
    dur: 16,
    delay: -12,
  },
];

/**
 * Seconds for the whole field to lean and recover. Slow enough to read as
 * drift underneath the bands rather than a second motion competing with them,
 * and far enough from their cycles that the set never visibly repeats.
 */
const FIELD_DRIFT = 61;

export type DitherGradientProps = {
  /** Ramp colours. Blue ribbons, cream highlights, yellow field, amber accent. */
  colors?: Partial<DitherColors>;
  /** Multiplies every cycle length. Higher is slower drift. */
  speed?: number;
  /** How hard the stipple bites, 0–1. */
  grain?: number;
  /**
   * Blur across the bands, as a fraction of the card's short side. Kept
   * relative so the effect holds at any container size — a fixed 72px melts a
   * small card and barely touches a large one. Kept deliberately light: blur
   * past this point and the bands resolve back into clouds.
   */
  blur?: number;
  /** Base scale of the whole field. */
  scale?: number;
  /**
   * Where the field opens, as a percentage of the card. The bands are drawn
   * wider than the card, so there is slack to spend here: enough that two
   * instances never open on the same composition, and the scale is widened to
   * match so none of the shift walks the artwork off its own edge.
   */
  offset?: { x: number; y: number };
  /** Seconds of drift to start already in, so two cards never march in step. */
  phase?: number;
  className?: string;
};

const DEFAULTS: Required<DitherColors> = {
  blue: "#2F86F6",
  cream: "#FDF9EC",
  yellow: "#F9DE96",
  amber: "#F0B057",
};

/**
 * A dithered gradient field: wavy bands of colour drifting behind heavy
 * stipple grain.
 *
 * Two stacked filters, and the order is the whole trick. The bands are blurred
 * first, on their own layer, so they merge into one liquid body; the dither sits
 * *above* that. The same high-frequency noise both displaces the artwork — which
 * is why only the colour boundaries get chewed up — and then punches a hard
 * stipple through what survives. Run the other way round and the blur smears
 * the grain away to nothing.
 *
 * Motion runs at two speeds at once: each band travels on its own 14–19s cycle
 * while the whole field leans underneath on a much longer one. A single
 * frequency reads as a pendulum; two never settle into anything.
 *
 * Background only: it renders no content of its own and fills whatever
 * container it is given.
 */
export default function DitherGradient({
  colors,
  speed = 1,
  grain = 0.55,
  blur = 0.05,
  scale = 1,
  offset = { x: 0, y: 0 },
  phase = 0,
  className = "",
}: DitherGradientProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const host = useRef<HTMLDivElement>(null);
  const [short, setShort] = useState(0);

  // Still water when the visitor asked for still water, and no reason to
  // animate a card nobody is looking at, or one in a tab they walked away from.
  const [live, setLive] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabOpen, setTabOpen] = useState(true);
  const active = live && onScreen && tabOpen;

  const ramp = { ...DEFAULTS, ...colors };
  const filterId = `dg-${uid}`;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setLive(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: "80px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setTabOpen(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Blur and the chew distance are both fractions of the card, so the effect
  // reads the same in a thumbnail and in a full-width panel.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setShort(Math.round(Math.min(box.width, box.height)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const blurPx = Math.round(short * blur);
  const chew = Math.max(1.2, short * 0.02);

  // A card that opens off-centre is scaled to match, or the shift would walk
  // the artwork off its own edge. Whole percent, so the transform below is a
  // clean number rather than float noise.
  const bleed = Math.round(Math.max(Math.abs(offset.x), Math.abs(offset.y))) / 100;

  // Threshold depth: how far the stipple bites toward punching through to the
  // cream base. Past roughly a third the card washes out and the colour is
  // gone, so the ramp stays shallow and mostly opaque.
  const hole = grain * 0.32;
  const biteTable = [0, hole * 0.35, hole, 1 - (1 - grain) * 0.45, 1, 1, 1, 1, 1]
    .map((v) => v.toFixed(3))
    .join(" ");

  return (
    <div
      ref={host}
      className={`relative isolate overflow-hidden ${className}`}
      style={{
        // The gradient is the floor under everything: if the filter is refused
        // outright, the card still reads as a colour field rather than a
        // blank panel.
        background: `radial-gradient(120% 90% at 22% 26%, ${ramp.yellow} 0%, transparent 62%),
                     radial-gradient(90% 80% at 82% 58%, ${ramp.amber} 0%, transparent 58%),
                     radial-gradient(80% 70% at 10% 78%, ${ramp.blue} 0%, transparent 55%),
                     ${ramp.cream}`,
        backgroundColor: ramp.cream,
      }}
      aria-hidden="true"
    >
      <svg className="absolute size-0" focusable="false">
        <defs>
          <filter
            id={filterId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              // One octave, not two. The filter re-runs every frame because the
              // bands move, and the second octave roughly doubled that cost —
              // measured at ~5% of frames missing a vsync against ~0.5% here.
              // The coarser grain is closer to riso stipple anyway.
              numOctaves={1}
              seed="7"
              result="noise"
            >
              {/* Re-seeded about once a second: the grain shimmers while the
                  shapes underneath move. Only mounted while the card is on
                  screen, so a hidden card costs nothing. */}
              {active && (
                <animate
                  attributeName="seed"
                  values="7;19;3;23;11;29;5;17"
                  dur="0.9s"
                  calcMode="discrete"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>

            {/* Chew the edges. Displacement moves the artwork by the noise, so
                flat interior survives and only boundaries go ragged. */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={chew.toFixed(2)}
              xChannelSelector="R"
              yChannelSelector="G"
              result="chewed"
            />

            {/* Same noise lifted into alpha, stretched and thresholded hard, so
                what is left is stipple rather than a gradient. The alpha row is
                scaled as well as offset: raw fractal noise clusters around 0.5,
                and thresholding that lands nearly every pixel in one bucket,
                which is why an unstretched version reads as a flat wash. */}
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 -0.8"
              result="noiseA"
            />
            <feComponentTransfer in="noiseA" result="stipple">
              <feFuncA type="table" tableValues={biteTable} />
            </feComponentTransfer>
            <feComposite in="chewed" in2="stipple" operator="in" />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
        <div
          className="absolute inset-0"
          style={{
            filter: blurPx ? `blur(${blurPx}px)` : undefined,
            // The field leans on its own long cycle underneath the bands.
            animation: active
              ? `dg-field ${FIELD_DRIFT * speed}s ease-in-out ${phase * 3}s infinite alternate`
              : "none",
            // Its own surface, so a band travelling composites instead of
            // repainting the whole card every frame.
            willChange: "transform",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            aria-hidden="true"
            // Where this field opens. Applied here, on the artwork rather than
            // the field around it, so the long lean underneath keeps its own
            // rhythm and only the bands start from a different place.
            style={{
              transform: `translate(${offset.x}%, ${offset.y}%) scale(${scale + bleed})`,
            }}
          >
            {RIBBONS.map((r, i) => (
              <path
                key={i}
                d={r.d}
                fill={ramp[r.color]}
                className="dg-band"
                style={
                  {
                    // One keyframe, three variables: each band travels on its
                    // own cycle without needing a rule of its own.
                    "--dx": `${r.dx}%`,
                    "--dy": `${r.dy}%`,
                    "--s1": r.s1,
                    "--s2": r.s2,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animation: active
                      ? `dg-swell ${r.dur * speed}s ease-in-out ${r.delay + phase}s infinite alternate`
                      : "none",
                  } as React.CSSProperties
                }
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
