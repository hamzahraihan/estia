import type { ShotKey } from "./media";

export const studio = {
  name: "Estia",
  discipline: "Interior Architecture",
  city: "Athens",
  country: "Greece",
  founded: 2014,
  address: "14 Ipokratus, 105 51 Athens",
  email: "studio@estia-interiors.com",
  phone: "+30 210 331 0142",
  hours: "Mon – Fri, 10:00 – 19:00 EET",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
} as const;

export const hero = {
  eyebrow: "Interior Architecture — Athens",
  wordmark: "Estia",
  lede: "We compose rooms in light, material and time.",
  footnote: "Named for Hestia, keeper of the hearth — the oldest room in any house.",
  meta: [
    { label: "Founded", value: "2014" },
    { label: "Studio", value: "Athens, GR" },
    { label: "Work", value: "Residential · Hospitality · Cultural" },
  ],
} as const;

export const manifesto = {
  label: "Position",
  lines: [
    "A room is not a container. It is a measure of time you can walk through — morning on one wall, evening on the other.",
    "We design for the hour a space is actually used, not the hour it is photographed. Everything else follows from that.",
  ],
} as const;

export const disciplines = [
  "Interior Architecture",
  "Spatial Planning",
  "Furniture Design",
  "Lighting Design",
  "Art Direction",
  "Material Research",
] as const;

export type Service = {
  index: string;
  title: string;
  body: string;
  tags: string[];
  shot: ShotKey;
};

export const services: Service[] = [
  {
    index: "01",
    title: "Interior Architecture",
    body: "The full envelope: plan, section, light and finish. We stay on the project from first sketch through the last site meeting, because decisions made in month two are the ones that cost money in month twenty.",
    tags: ["Plan & section", "Light wells", "Joinery", "Site supervision"],
    shot: "kiln",
  },
  {
    index: "02",
    title: "Spatial Planning",
    body: "Before anything is beautiful it has to work. We test circulation, sightlines and acoustics against real briefs and real numbers, then draw the layout that survives both.",
    tags: ["Brief audit", "Circulation", "Acoustics", "Programmes"],
    shot: "nocturne",
  },
  {
    index: "03",
    title: "Furniture Design",
    body: "Pieces drawn for the room they were invented in. Most of what we make never leaves the project — a bench sized to a wall, a table with a cut-out for a specific sill.",
    tags: ["Bespoke", "Prototyping", "Timber", "Stone"],
    shot: "marlowB",
  },
  {
    index: "04",
    title: "Lighting Design",
    body: "Lighting is the only finish a client touches every day. We model the daylight, then layer three temperatures on top of it so the room still behaves at eleven at night.",
    tags: ["Daylight modelling", "Circadian layering", "Control", "Specification"],
    shot: "marlow",
  },
  {
    index: "05",
    title: "Art Direction",
    body: "Curation, placement and the long argument with the client about which wall is empty on purpose. We work with galleries directly and we photograph every scheme before it is signed off.",
    tags: ["Curation", "Placement", "Gallery liaison", "Styling"],
    shot: "ondineB",
  },
  {
    index: "06",
    title: "Material Research",
    body: "We keep a library of four hundred samples and travel for the rest. Nothing is specified until we have held it, and every finish is tested on site against the light the room actually has.",
    tags: ["Sample library", "Site trials", "Sourcing", "Finishes"],
    shot: "ondineC",
  },
];

export type Step = { index: string; title: string; body: string; duration: string };

export const process: Step[] = [
  {
    index: "01",
    title: "Listen",
    body: "Two weeks in the existing space, a full survey of the light, and a long conversation about how the day is actually spent. No drawings yet.",
    duration: "2 weeks",
  },
  {
    index: "02",
    title: "Draw",
    body: "Plan and section, then three material directions at full size. You stand in a mock-up of the floor finish before it is ordered.",
    duration: "6 weeks",
  },
  {
    index: "03",
    title: "Source",
    body: "We build the palette in our own material library and travel for the pieces that cannot be substituted. Every sample is signed off by you, in daylight.",
    duration: "8 weeks",
  },
  {
    index: "04",
    title: "Build",
    body: "Weekly site presence, photographic records of every closed wall, and a handover list written before the last box leaves.",
    duration: "14–36 weeks",
  },
];

export const stats = [
  { value: 140, suffix: "+", label: "Projects delivered" },
  { value: 11, suffix: "", label: "Countries" },
  { value: 12, suffix: "", label: "Years in practice" },
  { value: 34, suffix: "", label: "Awards & mentions" },
];

export const awards = [
  { year: "2025", name: "Dezeen Awards — Interior of the Year, shortlist", project: "Casa Verdant" },
  { year: "2024", name: "Wallpaper* Design Awards — Best Small Hotel", project: "Villa Ondine" },
  { year: "2024", name: "Greek Architecture Awards — Interior, Gold", project: "Atelier Estia" },
  { year: "2023", name: "FRAME Awards — Interior Space, nominated", project: "Nocturne" },
  { year: "2022", name: "Dezeen Awards — Adaptive Reuse, longlist", project: "Villa Ondine" },
];

export const recognition = [
  "Architectural Digest AD100 — Greece, 2024 & 2025",
  "The World of Interiors — Studio of the Year, shortlist 2025",
  "Elle Decoration — Top 100 Interior Designers",
];

export const testimonials = [
  {
    quote:
      "We had been told the house was too old to keep. Estia spent a year proving otherwise and then made the proof look effortless. We moved in and nothing has needed explaining since.",
    author: "M. Karali",
    role: "Private client, Casa Verdant",
  },
  {
    quote:
      "They are the only studio we have worked with that answers a question on the same day it is asked. The drawings arrive earlier than promised and the site never runs behind.",
    author: "S. Adeyemi",
    role: "Director, Masseria Ondine",
  },
  {
    quote:
      "What stayed with me was the restraint. They took away more than they added, and the rooms ended up enormous. I still do not fully understand how that works.",
    author: "J. Petrov",
    role: "Private client, Marlow House",
  },
];

export const clientList = [
  "Masseria Ondine",
  "Northbound Hotels",
  "The Kallithea Trust",
  "Aegean Ferries",
  "Kline & Roth",
  "Villa Perrotta",
];

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];
