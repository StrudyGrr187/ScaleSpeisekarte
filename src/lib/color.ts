/**
 * Branding colours are owner-supplied, so nothing may depend on them being
 * readable. Foreground colours are always derived from luminance, never stored.
 */

export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    const [r, g, b] = value.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) return `#${value.toLowerCase()}`;
  return null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex) ?? "#000000";
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Picks a foreground for a background that is guaranteed to clear WCAG AA (4.5:1).
 *
 * The warm ink `#1a1614` is preferred because it looks better on the yellows and
 * beiges owners actually pick — but it is not black, and in the mid-luminance
 * band (around L = 0.179, e.g. `#706ce4`) neither it nor white reaches 4.5:1.
 * Pure black/white always does: the worst case sits at the crossover, where both
 * ratios equal sqrt(1.05 / 0.05) ≈ 4.58. So fall back to pure values whenever the
 * softer pair falls short.
 */
export type Foreground = "#ffffff" | "#1a1614" | "#000000";

export function readableForeground(background: string): Foreground {
  const soft: Foreground =
    contrastRatio(background, "#ffffff") >= contrastRatio(background, "#1a1614")
      ? "#ffffff"
      : "#1a1614";

  if (contrastRatio(background, soft) >= 4.5) return soft;

  return contrastRatio(background, "#ffffff") >= contrastRatio(background, "#000000")
    ? "#ffffff"
    : "#000000";
}

/** Mixes a colour towards white — used for tinted surfaces derived from the accent. */
export function tint(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Mixes a colour towards black — used for accent text on tinted surfaces. */
export function shade(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** The guest menu's paper background — see --color-guest-bg in design/theme.css. */
export const GUEST_SURFACE = "#fbf9f6";

/** Accent darkened just enough to hit 4.5:1 on a near-white surface. */
export function accentOnLight(hex: string, surface = "#ffffff"): string {
  let candidate = normalizeHex(hex) ?? "#000000";
  for (let step = 0; step < 20; step++) {
    if (contrastRatio(candidate, surface) >= 4.5) return candidate;
    candidate = shade(candidate, 0.1);
  }
  return "#1a1614";
}

export type AccentTokens = {
  /** The owner's colour, normalised. */
  accent: string;
  /** Foreground for text on the accent. Always >= 4.5:1 against it. */
  ink: Foreground;
  /** The accent darkened until it clears 4.5:1 as text on white. */
  text: string;
  /** 12% accent on white — tinted badge/pill surfaces. */
  soft: string;
  /** 26% accent on white — hairline borders. */
  border: string;
};

/**
 * Derives every colour the guest menu needs from the single colour the owner
 * picked. Computed on the server and injected as inline CSS variables, so the
 * page never flashes the default brand, and an unreadable choice is impossible.
 */
export function deriveAccentTokens(input: string | null | undefined): AccentTokens {
  const accent = normalizeHex(input ?? "") ?? "#b91c1c";
  const soft = tint(accent, 0.88);

  // `text` is used on two surfaces: the tinted `soft` badge and the paper
  // background. Both are darker than white, so deriving against white would
  // leave the real-world contrast short. Darken against whichever is darker.
  const surface =
    relativeLuminance(soft) < relativeLuminance(GUEST_SURFACE) ? soft : GUEST_SURFACE;

  return {
    accent,
    ink: readableForeground(accent),
    text: accentOnLight(accent, surface),
    soft,
    border: tint(accent, 0.74),
  };
}

/** CSS custom properties for a guest-theme wrapper element. */
export function accentStyle(input: string | null | undefined): Record<string, string> {
  const t = deriveAccentTokens(input);
  return {
    "--accent": t.accent,
    "--accent-ink": t.ink,
    "--accent-text": t.text,
    "--accent-soft": t.soft,
    "--accent-border": t.border,
  };
}
