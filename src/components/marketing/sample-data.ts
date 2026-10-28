/**
 * Beispieldaten — every invented name, price, time and count on the landing
 * page lives here and nowhere else, and every surface that shows them carries
 * the label "Beispieldaten". The dishes follow the seeded Café Milano card so the
 * pictures match the live demo one click away.
 */

export const SAMPLE_LABEL = "Beispieldaten";

export const DEMO_MENU = "/menu/cafe-milano";
export const CONTACT_URL = "https://scaleevo.at/kontakt/";

export const RESTAURANT = {
  name: "Café Milano",
  line: "Italienische Küche · heute bis 23:00",
  /** Shown without a domain: the QR code carries whatever host the app runs on. */
  path: "…/menu/cafe-milano",
};

export const GUEST_CATEGORIES = ["Vorspeisen", "Hauptgerichte", "Pizza", "Pasta"];

export type SampleDish = {
  name: string;
  text: string;
  price: string;
  codes: string[];
  featured?: boolean;
  out?: boolean;
};

/** Vongole sit second so the sold-out row stays visible on the cropped phone. */
export const STARTERS: SampleDish[] = [
  {
    name: "Bruschetta Classica",
    text: "Sauerteigbrot, Tomaten, Basilikum",
    price: "7,90 €",
    codes: ["A"],
  },
  {
    name: "Vongole in Weißwein",
    text: "Venusmuscheln, Knoblauch, Ciabatta",
    price: "13,90 €",
    codes: ["A", "R"],
    out: true,
  },
  {
    name: "Vitello Tonnato",
    text: "Kalbfleisch, Thunfisch-Kapern-Creme",
    price: "12,90 €",
    codes: ["C", "D"],
    featured: true,
  },
  {
    name: "Burrata Pugliese",
    text: "Ochsenherztomaten, Basilikumöl",
    price: "11,90 €",
    codes: ["G"],
  },
];

/** The two moments the hero tells: a price change at 17:58, a sold-out dish at 19:40. */
export const MOMENTS = {
  soldOut: { dish: "Vongole in Weißwein", time: "19:40", liveAt: "19:41" },
  price: { dish: "Burrata Pugliese", from: "11,50 €", to: "11,90 €", time: "17:58" },
};

export const EDITOR_CATEGORIES = [
  { name: "Vorspeisen", count: 4 },
  { name: "Hauptgerichte", count: 6 },
  { name: "Pizza", count: 8 },
  { name: "Pasta", count: 5 },
  { name: "Desserts", count: 4 },
  { name: "Getränke", count: 12 },
];

/** One dish in three of the ten looks, as the theme picker would render it. */
export const LOOKS = [
  {
    label: "Modern",
    paper: "#fbf9f6",
    ink: "#1a1614",
    muted: "#6b625c",
    accent: "#b91c1c",
    display: "var(--font-playfair), Georgia, serif",
    body: "var(--font-karla), ui-sans-serif, sans-serif",
    leader: false,
  },
  {
    label: "Klassisch",
    paper: "#f7f3e8",
    ink: "#2a2420",
    muted: "#6b625c",
    accent: "#1f5c46",
    display: "var(--font-eb-garamond), Georgia, serif",
    body: "var(--font-eb-garamond), Georgia, serif",
    leader: true,
  },
  {
    label: "Nacht",
    paper: "#16151a",
    ink: "#f4f1ea",
    muted: "#a59f97",
    accent: "#d6a24a",
    display: "var(--font-playfair), Georgia, serif",
    body: "var(--font-karla), ui-sans-serif, sans-serif",
    leader: false,
  },
];

/** Looks a dish up by name, so reordering STARTERS never swaps a picture. */
export function starter(name: string): SampleDish {
  const dish = STARTERS.find((d) => d.name === name);
  if (!dish) throw new Error(`Unknown sample dish: ${name}`);
  return dish;
}
