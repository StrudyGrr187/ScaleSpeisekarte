/**
 * The looks a guest menu can wear.
 *
 * Two things vary, and only two:
 *
 *   archetype — which layout the components render. "list" is the scrolling
 *               digital menu with dish photos; "print" is the typographic
 *               column of a printed card. Adding a theme never adds a branch.
 *   tokens    — a block of CSS custom properties in design/theme.css, keyed by
 *               [data-guest-theme="…"]. Everything else (spacing utilities,
 *               component classes) reads those tokens and needs no change.
 *
 * `paper` and `card` are duplicated here as hex because the accent maths runs on
 * the server, before any CSS exists: they are the surfaces the derived accent
 * text has to stay readable on. They must match the CSS block — the theme test
 * in this file's sibling script checks exactly that.
 */

export type ThemeKey =
  | "CUSTOM"
  | "MODERN"
  | "CLASSIC"
  | "MINIMAL"
  | "WARM"
  | "NIGHT"
  | "BISTRO"
  | "BOLD"
  | "LINEN"
  | "SLATE"
  | "GARDEN";

export type Archetype = "list" | "print";
export type ThemeMode = "light" | "dark";
export type GuestFontSize = "small" | "normal" | "large";

export type CustomTheme = {
  name: string;
  mood: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  muted: string;
  border: string;
  borderStrong: string;
  radius: number;
  density: Density;
};

export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  name: "Eigener Look",
  mood: "Individuell gestaltet",
  background: "#fbf9f6",
  surface: "#ffffff",
  surfaceAlt: "#f4f1ec",
  ink: "#1a1614",
  muted: "#6b625c",
  border: "#e8e2da",
  borderStrong: "#d6cfc6",
  radius: 14,
  density: "normal",
};

export function resolveFontSize(value: string | null | undefined): GuestFontSize {
  return value === "small" || value === "large" ? value : "normal";
}
/** How much air the theme puts between rows — mirrors its spacing tokens. */
export type Density = "tight" | "normal" | "airy";

export type MenuThemeDef = {
  key: ThemeKey;
  label: string;
  mood: string;
  archetype: Archetype;
  mode: ThemeMode;
  /** Page background — see --color-guest-bg in the matching CSS block. */
  paper: string;
  /** Raised surface (cards, sheets) — see --color-guest-surface. */
  card: string;
  /**
   * Not read by the guest menu — the CSS spacing tokens do that job. It exists
   * so the picker's miniature can show the difference between three themes that
   * share a palette and differ only in rhythm.
   */
  density: Density;
};

export const MENU_THEMES: MenuThemeDef[] = [
  {
    key: "MODERN",
    label: "Modern",
    mood: "Warmes Papier, klare Karten — passt fast überall",
    archetype: "list",
    mode: "light",
    paper: "#fbf9f6",
    card: "#ffffff",
    density: "normal",
  },
  {
    key: "CLASSIC",
    label: "Klassisch",
    mood: "Wie eine gedruckte Karte — Linien statt Bilder",
    archetype: "print",
    mode: "light",
    paper: "#fbf9f6",
    card: "#fbf9f6",
    density: "normal",
  },
  {
    key: "MINIMAL",
    label: "Minimal",
    mood: "Kühles Weiß, viel Luft — Specialty Coffee, Bowls",
    archetype: "list",
    mode: "light",
    paper: "#ffffff",
    card: "#ffffff",
    density: "airy",
  },
  {
    key: "WARM",
    label: "Warm",
    mood: "Sandton und weiche Kanten — Trattoria, Bistro",
    archetype: "list",
    mode: "light",
    paper: "#faf4ea",
    card: "#fffdf9",
    density: "normal",
  },
  {
    key: "NIGHT",
    label: "Nacht",
    mood: "Dunkel und ruhig — Cocktailbar, Abendkarte",
    archetype: "list",
    mode: "dark",
    paper: "#16151a",
    card: "#1f1e25",
    density: "normal",
  },
  {
    key: "BISTRO",
    label: "Bistro",
    mood: "Creme, Doppellinien, enge Spalte — französische Karte",
    archetype: "print",
    mode: "light",
    paper: "#f7f3e8",
    card: "#f7f3e8",
    density: "tight",
  },
  {
    key: "BOLD",
    label: "Kräftig",
    mood: "Hoher Kontrast, kantig — Burger, Streetfood",
    archetype: "list",
    mode: "light",
    paper: "#f4f4f2",
    card: "#ffffff",
    density: "normal",
  },
  {
    key: "LINEN",
    label: "Leinen",
    mood: "Ruhige Flächen, weite Zeilen — Fine Dining",
    archetype: "print",
    mode: "light",
    paper: "#f4f1ea",
    card: "#f4f1ea",
    density: "airy",
  },
  {
    key: "SLATE",
    label: "Schiefer",
    mood: "Kühles Dunkelblau — Weinbar, Craft Beer",
    archetype: "list",
    mode: "dark",
    paper: "#14181f",
    card: "#1d232c",
    density: "normal",
  },
  {
    key: "GARDEN",
    label: "Garten",
    mood: "Sehr hell und luftig — vegetarisch, Café",
    archetype: "list",
    mode: "light",
    paper: "#f7faf6",
    card: "#ffffff",
    density: "airy",
  },
];

export const THEME_KEYS = MENU_THEMES.map((t) => t.key);

export const DEFAULT_THEME: ThemeKey = "MODERN";

export function resolveTheme(key: string | null | undefined): MenuThemeDef {
  if (key === "CUSTOM") {
    return {
      key: "CUSTOM",
      label: "Eigener Look",
      mood: "Individuell gestaltet",
      archetype: "list",
      mode: "light",
      paper: DEFAULT_CUSTOM_THEME.background,
      card: DEFAULT_CUSTOM_THEME.surface,
      density: DEFAULT_CUSTOM_THEME.density,
    };
  }
  return MENU_THEMES.find((t) => t.key === key) ?? MENU_THEMES[0];
}

/** The value that goes on the wrapper as data-guest-theme. */
export function themeAttribute(key: string | null | undefined): string {
  return resolveTheme(key).key.toLowerCase();
}

export function customThemeStyle(theme: CustomTheme | null | undefined): Record<string, string> {
  const value = theme ?? DEFAULT_CUSTOM_THEME;
  const radius = `${value.radius}px`;
  const density = { tight: "1rem", normal: "1.375rem", airy: "1.75rem" }[value.density];
  const section = { tight: "2.5rem", normal: "3rem", airy: "3.75rem" }[value.density];
  return {
    "--color-guest-bg": value.background,
    "--color-guest-surface": value.surface,
    "--color-guest-surface-2": value.surfaceAlt,
    "--color-guest-ink": value.ink,
    "--color-guest-ink-2": value.muted,
    "--color-guest-muted": value.muted,
    "--color-guest-faint": value.borderStrong,
    "--color-guest-border": value.border,
    "--color-guest-border-strong": value.borderStrong,
    "--radius-guest-sm": `${Math.max(2, Math.round(value.radius * 0.55))}px`,
    "--radius-guest": radius,
    "--radius-guest-lg": `${Math.round(value.radius * 1.35)}px`,
    "--radius-guest-sheet": `${Math.round(value.radius * 1.6)}px`,
    "--spacing-row": density,
    "--spacing-section": section,
  };
}
