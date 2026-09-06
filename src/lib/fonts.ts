/**
 * Curated font pairings the owner (or the AI designer) can choose from.
 *
 * A closed registry rather than free text: every pair is loaded and self-hosted
 * by next/font at build time, so a value from here can never trigger a runtime
 * download from Google, and the AI cannot invent a font that does not exist.
 *
 * Display faces may be as characterful as they like — they set two or three
 * words at a time. Body faces are chosen for 15–17px on a phone in restaurant
 * light: generous x-height, open apertures, real numerals. That rules out the
 * fashionable geometric sans with tiny x-heights, however good they look big.
 */

export type FontPairKey =
  | "playfair-karla"
  | "cormorant-lato"
  | "fraunces-worksans"
  | "dmserif-dmsans"
  | "outfit-worksans"
  | "oswald-inter"
  | "librebodoni-publicsans"
  | "cinzel-lato"
  | "spacegrotesk-inter"
  | "varelaround-nunitosans";

export type FontPair = {
  key: FontPairKey;
  label: string;
  mood: string;
  /** CSS variables produced by next/font in app/layout.tsx. */
  displayVar: string;
  bodyVar: string;
};

export const FONT_PAIRS: FontPair[] = [
  {
    key: "playfair-karla",
    label: "Playfair & Karla",
    mood: "Elegant und vielseitig — passt fast überall",
    displayVar: "--font-playfair",
    bodyVar: "--font-karla",
  },
  {
    key: "cormorant-lato",
    label: "Cormorant & Lato",
    mood: "Fein und gehoben — Fine Dining, Weinlokal",
    displayVar: "--font-cormorant",
    bodyVar: "--font-lato",
  },
  {
    key: "fraunces-worksans",
    label: "Fraunces & Work Sans",
    mood: "Warm und handwerklich — Bäckerei, Bistro, Brunch",
    displayVar: "--font-fraunces",
    bodyVar: "--font-worksans",
  },
  {
    key: "dmserif-dmsans",
    label: "DM Serif & DM Sans",
    mood: "Klar und modern — Café, Bar, Streetfood",
    displayVar: "--font-dmserif",
    bodyVar: "--font-dmsans",
  },
  {
    key: "outfit-worksans",
    label: "Outfit & Work Sans",
    mood: "Geometrisch und ruhig — Bowls, Poke, Coffeeshop",
    displayVar: "--font-outfit",
    bodyVar: "--font-worksans",
  },
  {
    key: "oswald-inter",
    label: "Oswald & Inter",
    mood: "Schmal und laut — Burger, BBQ, Bierhalle",
    displayVar: "--font-oswald",
    bodyVar: "--font-inter",
  },
  {
    key: "librebodoni-publicsans",
    label: "Libre Bodoni & Public Sans",
    mood: "Wie ein Magazin — Chef's Table, Tasting",
    displayVar: "--font-librebodoni",
    bodyVar: "--font-publicsans",
  },
  {
    key: "cinzel-lato",
    label: "Cinzel & Lato",
    mood: "Klassisch und würdig — Steakhaus, Weinstube",
    displayVar: "--font-cinzel",
    bodyVar: "--font-lato",
  },
  {
    key: "spacegrotesk-inter",
    label: "Space Grotesk & Inter",
    mood: "Technisch und nüchtern — Specialty Coffee, Craft Beer",
    displayVar: "--font-spacegrotesk",
    bodyVar: "--font-inter",
  },
  {
    key: "varelaround-nunitosans",
    label: "Varela Round & Nunito Sans",
    mood: "Rund und freundlich — Familienlokal, Eisdiele",
    displayVar: "--font-varelaround",
    bodyVar: "--font-nunitosans",
  },
];

export const FONT_PAIR_KEYS = FONT_PAIRS.map((p) => p.key);

export const DEFAULT_FONT_PAIR: FontPairKey = "playfair-karla";

export function resolveFontPair(key: string | null | undefined): FontPair {
  return FONT_PAIRS.find((p) => p.key === key) ?? FONT_PAIRS[0];
}

/**
 * Inline CSS variables pointing the guest theme's font tokens at the chosen pair.
 * Applied on the same wrapper as the accent colours.
 *
 * The print archetype deliberately ignores the pairing for its display face: it
 * sets name, description and price in one book serif, and a Didone like Playfair
 * or Libre Bodoni is a legibility mistake at body size on a phone. Setting it
 * here rather than in CSS matters — an inline style would otherwise outrank the
 * theme's own rule.
 */
export function fontStyle(
  key: string | null | undefined,
  archetype: "list" | "print" = "list"
): Record<string, string> {
  const pair = resolveFontPair(key);

  if (archetype === "print") {
    return {
      "--font-display-active": "var(--font-eb-garamond), Georgia, serif",
      "--font-sans-active": `var(${pair.bodyVar}), ui-sans-serif, system-ui, sans-serif`,
    };
  }

  return {
    "--font-display-active": `var(${pair.displayVar}), Georgia, serif`,
    "--font-sans-active": `var(${pair.bodyVar}), ui-sans-serif, system-ui, sans-serif`,
  };
}
