import type { ShotKey } from "./media";

export type Project = {
  slug: string;
  title: string;
  place: string;
  country: string;
  year: number;
  category: string;
  cover: ShotKey;
  cardRatio: number;
  summary: string;
  body: string[];
  facts: { label: string; value: string }[];
  gallery: { key: ShotKey; caption: string }[];
};

/** A project plus the thumbnail the overlay's image grows out of, if any. */
export type ProjectEntry = { project: Project; source: HTMLElement | null };

export const projects: Project[] = [
  {
    slug: "casa-verdant",
    title: "Casa Verdant",
    place: "Antiparos",
    country: "Greece",
    year: 2025,
    category: "Residential",
    cover: "verdant",
    cardRatio: 4 / 5,
    summary:
      "A low, white house on a Cycladic shelf, drawn around the path the sun takes across the courtyard.",
    body: [
      "The clients asked for a house that would not compete with the island. We set the plan low against the hill, cut one long wall along the prevailing wind, and let the courtyard do the rest of the talking.",
      "Lime plaster carries the light the whole day long. There is no paint scheme, no cornice, no skirting — the shell is the finish. Furniture arrives in ones and twos, each piece bought for a single room and never moved again.",
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Area", value: "240 m²" },
      { label: "Status", value: "Completed 2025" },
      { label: "Scope", value: "Interior architecture, furniture" },
    ],
    gallery: [
      { key: "verdantB", caption: "West room, 17:40" },
      { key: "verdantC", caption: "Dried stems from the courtyard" },
      { key: "verdantD", caption: "Courtyard screen" },
    ],
  },
  {
    slug: "the-kiln-house",
    title: "The Kiln House",
    place: "Copenhagen",
    country: "Denmark",
    year: 2024,
    category: "Residential",
    cover: "kiln",
    cardRatio: 4 / 5,
    summary:
      "A brick workshop converted into a family home, keeping every scar the last ninety years left behind.",
    body: [
      "The building was a ceramics workshop. We stripped it to the brick, sealed the soot marks rather than painting them out, and threaded a new stair through the rooflight so the whole floor reads as one room.",
      "Oak is used untreated and will darken. Concrete is left as the slab came off the truck. The only thing that is new is the light, and we spent a third of the budget on it.",
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Area", value: "310 m²" },
      { label: "Status", value: "Completed 2024" },
      { label: "Scope", value: "Adaptive reuse, interior architecture" },
    ],
    gallery: [
      { key: "kilnB", caption: "The spine, looking north" },
      { key: "kilnC", caption: "Rooflight, midday" },
      { key: "kilnD", caption: "Kitchen joinery" },
    ],
  },
  {
    slug: "nocturne",
    title: "Nocturne",
    place: "Koukaki",
    country: "Greece",
    year: 2023,
    category: "Residential",
    cover: "nocturne",
    cardRatio: 4 / 5,
    summary:
      "A 1930s apartment stripped back to its shell, then rebuilt around a single curve of polished concrete.",
    body: [
      "We removed forty years of partitions and found a plan worth keeping. The new intervention is a single freestanding concrete form that holds the kitchen, the storage and the stairs, and that everything else arranges itself around.",
      "At night the whole apartment is lit from inside that form. It reads as a lamp in the middle of the house.",
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Area", value: "185 m²" },
      { label: "Status", value: "Completed 2023" },
      { label: "Scope", value: "Interior architecture, lighting" },
    ],
    gallery: [
      { key: "nocturneB", caption: "The turning stair" },
      { key: "nocturneC", caption: "Soffit detail" },
      { key: "nocturneD", caption: "Roof terrace" },
    ],
  },
  {
    slug: "atelier-estia",
    title: "Atelier Estia",
    place: "Petralona",
    country: "Greece",
    year: 2024,
    category: "Workplace",
    cover: "atelier",
    cardRatio: 4 / 5,
    summary:
      "Our own studio: a 1930s garage reopened as a material library, workshop and drawing floor.",
    body: [
      "We built the studio we wanted to work in. A double-height room with a north-light roof, a long communal table in cast concrete, and a wall of samples that anyone can pull out and touch.",
      "The fins along the west elevation are not decoration. They cut the low afternoon sun into something you can sit next to.",
    ],
    facts: [
      { label: "Client", value: "Estia" },
      { label: "Area", value: "420 m²" },
      { label: "Status", value: "Completed 2024" },
      { label: "Scope", value: "Interior architecture, joinery" },
    ],
    gallery: [
      { key: "atelierB", caption: "Stair to the library" },
      { key: "atelierC", caption: "Sample wall" },
      { key: "atelierD", caption: "Drawing floor" },
    ],
  },
  {
    slug: "villa-ondine",
    title: "Villa Ondine",
    place: "Ostuni",
    country: "Italy",
    year: 2022,
    category: "Hospitality",
    cover: "ondine",
    cardRatio: 4 / 5,
    summary:
      "Nine rooms in a masseria outside Ostuni, furnished almost entirely with what the site had already produced.",
    body: [
      "The owner gave us one rule: nothing in the rooms that was not already on the property. We followed it. The stone is from the collapsed north wall, the timber is from the old equipment shed, the vessels were thrown on site.",
      "It took a year longer and it is the reason the place feels the way it does.",
    ],
    facts: [
      { label: "Client", value: "Masseria Ondine" },
      { label: "Area", value: "1,150 m²" },
      { label: "Status", value: "Completed 2022" },
      { label: "Scope", value: "Interior architecture, FF&E, art direction" },
    ],
    gallery: [
      { key: "ondineB", caption: "Guest bathroom, room four" },
      { key: "ondineC", caption: "Studio pottery" },
      { key: "ondineD", caption: "Stone from the north wall" },
    ],
  },
  {
    slug: "marlow-house",
    title: "Marlow House",
    place: "Fulham",
    country: "United Kingdom",
    year: 2025,
    category: "Residential",
    cover: "marlow",
    cardRatio: 4 / 5,
    summary:
      "A narrow Victorian terrace returned to its original proportions, with a service wing rebuilt in pale brick.",
    body: [
      "Three floors and a rear extension. We removed a 1970s infill that had halved every room, then rebuilt the back of the house in pale handmade brick so it would hold light through the long north-facing garden.",
      "Inside, the palette is deliberately narrow: lime, oak, brass, linen. The client owns two paintings and neither of them is allowed to be the loudest thing in the room.",
    ],
    facts: [
      { label: "Client", value: "Private" },
      { label: "Area", value: "265 m²" },
      { label: "Status", value: "Completed 2025" },
      { label: "Scope", value: "Interior architecture, FF&E" },
    ],
    gallery: [
      { key: "marlowB", caption: "Hall console" },
      { key: "marlowC", caption: "Linen, stoneware" },
      { key: "marlowD", caption: "Garden room" },
    ],
  },
];
