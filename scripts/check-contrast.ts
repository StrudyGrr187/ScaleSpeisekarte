/**
 * The contrast guarantee, checked rather than asserted.
 *
 * Two things can silently break it:
 *   1. a theme's CSS palette drifting out of step with src/lib/themes.ts, which
 *      is what the accent maths derives against;
 *   2. an owner-picked accent that no amount of darkening rescues on some
 *      theme's surfaces.
 *
 * Both are checked here. Run with `npm run check:contrast`.
 */
import { readFileSync } from "node:fs";
import { contrastRatio, deriveAccentTokens, normalizeHex } from "@/lib/color";
import { MENU_THEMES } from "@/lib/themes";

const AA = 4.5;

const css = readFileSync("design/theme.css", "utf8");

/**
 * Every token a theme ends up with. A theme can be addressed by more than one
 * rule — the print archetype shares one block and each print theme overrides its
 * colours in a second — so merge them in document order, the way the cascade
 * does for equal specificity. Taking only the first match reads the shared base
 * and misses the override.
 */
function themeBlock(attr: string): Record<string, string> {
  const out: Record<string, string> = {};
  const blocks = css.matchAll(/([^{}]+)\{([^}]*)\}/g);

  for (const [, selector, body] of blocks) {
    if (!selector.includes(`[data-guest-theme="${attr}"]`)) continue;
    for (const line of body.split("\n")) {
      const decl = line.match(/(--[\w-]+)\s*:\s*([^;]+);/);
      if (decl) out[decl[1]] = decl[2].trim();
    }
  }
  return out;
}

/** :root defaults, for the theme that overrides nothing. */
const rootBlock = (() => {
  const out: Record<string, string> = {};
  for (const line of css.split("\n")) {
    const decl = line.match(/(--color-guest-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/);
    if (decl && !(decl[1] in out)) out[decl[1]] = decl[2];
  }
  return out;
})();

const problems: string[] = [];

// ---------------------------------------------------------------- 1) drift
for (const theme of MENU_THEMES) {
  const block = themeBlock(theme.key.toLowerCase());
  const paper = block["--color-guest-bg"] ?? rootBlock["--color-guest-bg"];
  const card = block["--color-guest-surface"] ?? rootBlock["--color-guest-surface"];

  if (normalizeHex(paper) !== normalizeHex(theme.paper)) {
    problems.push(`${theme.key}: paper ist ${theme.paper} in themes.ts, ${paper} im CSS`);
  }
  if (normalizeHex(card) !== normalizeHex(theme.card)) {
    problems.push(`${theme.key}: card ist ${theme.card} in themes.ts, ${card} im CSS`);
  }

  // ------------------------------------------------------- 2) theme's own ink
  for (const token of ["--color-guest-ink", "--color-guest-ink-2", "--color-guest-muted"]) {
    const value = block[token] ?? rootBlock[token];
    if (!value?.startsWith("#")) continue;
    for (const [name, surface] of [["bg", paper], ["surface", card]] as const) {
      const ratio = contrastRatio(value, surface);
      if (ratio < AA) {
        problems.push(
          `${theme.key}: ${token} (${value}) auf ${name} (${surface}) nur ${ratio.toFixed(2)}:1`
        );
      }
    }
  }
}

// ------------------------------------------------- 3) every owner accent
const hex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;

let checked = 0;
console.log("Theme     Modus  accent-text min      accent-ink min");
for (const theme of MENU_THEMES) {
  let worstText = Infinity;
  let worstTextAt = "";
  let worstInk = Infinity;
  let worstInkAt = "";

  for (let r = 0; r < 256; r += 5)
    for (let g = 0; g < 256; g += 5)
      for (let b = 0; b < 256; b += 5) {
        const input = hex(r, g, b);
        const t = deriveAccentTokens(input, theme.key);
        checked++;

        // accent text lands on the paper, the raised card and the tinted chip
        const worst = Math.min(
          contrastRatio(t.text, theme.paper),
          contrastRatio(t.text, theme.card),
          contrastRatio(t.text, t.soft)
        );
        if (worst < worstText) {
          worstText = worst;
          worstTextAt = input;
        }
        if (worst < AA) problems.push(`${theme.key}: accent-text ${input} → ${worst.toFixed(2)}:1`);

        const ink = contrastRatio(t.ink, t.accent);
        if (ink < worstInk) {
          worstInk = ink;
          worstInkAt = input;
        }
        if (ink < AA) problems.push(`${theme.key}: accent-ink ${input} → ${ink.toFixed(2)}:1`);
      }

  console.log(
    `${theme.key.padEnd(9)} ${theme.mode.padEnd(6)} ${worstText.toFixed(2)} (${worstTextAt})      ${worstInk.toFixed(2)} (${worstInkAt})`
  );
}

console.log(`\n${checked.toLocaleString("de-DE")} Akzentfarben geprüft, ${MENU_THEMES.length} Themes`);

if (problems.length > 0) {
  // Repeated accent failures collapse into thousands of near-identical lines.
  const unique = [...new Set(problems.map((p) => p.replace(/#[0-9a-f]{6} → .*/, "…")))];
  console.error(`\n${problems.length} Verstöße gegen ${AA}:1`);
  for (const line of unique.slice(0, 20)) console.error(`  ${line}`);
  process.exit(1);
}

console.log(`Keine Verstöße gegen ${AA}:1.`);
