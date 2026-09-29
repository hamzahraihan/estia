/**
 * Photography manifest.
 *
 * Every image on the site is hot-linked from Unsplash so the layout can be
 * reviewed before real project photography lands. Swap the ids below for the
 * studio's own assets (drop files into /public and point `src` at them) once
 * the real portfolio replaces the placeholders.
 */

const CDN = "https://images.unsplash.com/photo-";

export type Shot = {
  /** Unsplash photo id, without the `photo-` prefix. */
  id: string;
  alt: string;
  /** Intrinsic crop ratio, width / height. */
  ratio: number;
};

export const shots = {
  hero: {
    id: "1700709677626-132ac9738ca4",
    alt: "Morning light raking across a plastered wall beside woven screens",
    ratio: 16 / 9,
  },

  // Room-scale cover replacements — the still-life and material shots below
  // stay in the galleries, where a detail reads as intent.

  verdant: {
    id: "1674542572845-7875fa71f1ca",
    alt: "Sunlit sitting room screened by oak slats and dried branches",
    ratio: 4 / 5,
  },
  verdantB: {
    id: "1753800558729-7929703f81de",
    alt: "Linen curtains diffusing afternoon light across a bare wall",
    ratio: 4 / 5,
  },
  verdantC: {
    id: "1678121039070-fedd1e9c2cf4",
    alt: "Dried branches in a ceramic vessel on a lime-washed table",
    ratio: 4 / 5,
  },
  verdantD: {
    id: "1700709677626-132ac9738ca4",
    alt: "Rattan screen casting woven shadows on a sunlit wall",
    ratio: 4 / 5,
  },

  kiln: {
    id: "1603621776288-a6a06af35675",
    alt: "Board-formed concrete hall lit by a single high window",
    ratio: 4 / 5,
  },
  kilnB: {
    id: "1444716640698-8b6f46b79cbe",
    alt: "Concrete corridor receding into shadow",
    ratio: 4 / 5,
  },
  kilnC: {
    id: "1569258592171-357ea26da4df",
    alt: "Deep concrete beams cut by hard daylight",
    ratio: 4 / 5,
  },
  kilnD: {
    id: "1616577711667-3da65b20c36a",
    alt: "Oak joinery meeting a polished concrete wall",
    ratio: 4 / 5,
  },

  nocturne: {
    id: "1563891925196-a3e34f6d869c",
    alt: "Concrete gallery opening onto a private garden",
    ratio: 4 / 5,
  },
  nocturneB: {
    id: "1586871608370-4adee64d1794",
    alt: "White plastered ramp turning through an empty room",
    ratio: 4 / 5,
  },
  nocturneC: {
    id: "1635074155443-6cbf74711dd2",
    alt: "Curved concrete soffit washed by a blade of sunlight",
    ratio: 4 / 5,
  },
  nocturneD: {
    id: "1565626424178-c699f6601afd",
    alt: "Cast concrete massing under an overcast sky",
    ratio: 4 / 5,
  },

  atelier: {
    id: "1620902740358-c07fe4916812",
    alt: "Colonnade of slim concrete fins casting striped shadow",
    ratio: 4 / 5,
  },
  atelierB: {
    id: "1641999164451-c001c719c04d",
    alt: "White stone stair turning around a light well",
    ratio: 4 / 5,
  },
  atelierC: {
    id: "1681400279564-729d7fde5f99",
    alt: "Pigmented concrete wall with visible pour lines",
    ratio: 4 / 5,
  },
  atelierD: {
    id: "1681400198417-69449c9a961b",
    alt: "Sculptural concrete ceiling over a sunken meeting room",
    ratio: 4 / 5,
  },

  ondine: {
    id: "1705268887866-e7344529b540",
    alt: "Arched Mediterranean loggia opening onto palms",
    ratio: 4 / 5,
  },
  ondineB: {
    id: "1700709678035-b6606373aa52",
    alt: "Amber glass vessel on a travertine plinth in raking sun",
    ratio: 4 / 5,
  },
  ondineC: {
    id: "1700709678005-96bf882a0d0a",
    alt: "Stacked clay forms on a sand-coloured plinth",
    ratio: 4 / 5,
  },
  ondineD: {
    id: "1700709678038-fcebeac42106",
    alt: "Found stone and driftwood arranged on a limestone shelf",
    ratio: 4 / 5,
  },

  marlow: {
    id: "1700474568247-2bf81611b293",
    alt: "Deep bouclé sectional beneath a low ceiling in north light",
    ratio: 4 / 5,
  },
  marlowB: {
    id: "1700709678022-8e0c4767434e",
    alt: "Balanced river stones on a lime-washed shelf",
    ratio: 4 / 5,
  },
  marlowC: {
    id: "1700709678013-37edebca9ffc",
    alt: "Heavy linen falling into a shallow ceramic bowl",
    ratio: 4 / 5,
  },
  marlowD: {
    id: "1677204708410-859656e196e1",
    alt: "Low bench in oiled oak beneath a deep wall recess",
    ratio: 4 / 5,
  },

  process: {
    id: "1700709678035-b6606373aa52",
    alt: "Material study: amber glass on travertine",
    ratio: 4 / 3,
  },
  studioA: {
    id: "1609104145561-febb1adb73d0",
    alt: "Concrete beams over the studio's material library",
    ratio: 4 / 5,
  },
  studioB: {
    id: "1625390711106-3728815ebcd9",
    alt: "Green marble and brass in the studio's material library",
    ratio: 4 / 5,
  },
} satisfies Record<string, Shot>;

export type ShotKey = keyof typeof shots;

/** Builds a pre-cropped CDN url so every slot reserves its space before load. */
export const image = (key: ShotKey, width: number): string => {
  const { id, ratio } = shots[key];
  return `${CDN}${id}?auto=format&fit=crop&crop=entropy&w=${width}&h=${Math.round(width / ratio)}&q=72`;
};

/** The overlay's full-bleed hero — the largest image slot on the site. */
export const HERO_WIDTH = 2000;

/**
 * Warms a project's hero ahead of the click. The overlay asks for a wider
 * crop than the work cards do, so without this the open transition is
 * animating a photo that is still downloading and decoding.
 */
export function preload(key: ShotKey) {
  const img = new Image();
  img.src = image(key, HERO_WIDTH);
}
