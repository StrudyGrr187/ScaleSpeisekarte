/**
 * Money is stored as integer minor units (cents) everywhere. Floats never touch
 * a price. These helpers are the only conversion boundary.
 */

/**
 * Parses whatever an owner types into cents: "8,5" · "8.50" · "8,50 €" · "8" · "€12".
 * Returns null when the input carries no usable number.
 */
export function parsePrice(input: string): number | null {
  if (typeof input !== "string") return null;

  // Currency symbols and stray letters are only meaningful at the edges
  // ("18,90 €", "€12"). One sitting between digits means a typo such as
  // "12€34", which must not silently become 1234,00.
  const cleaned = input
    .trim()
    .replace(/^[^\d,.-]+/, "")
    .replace(/[^\d,.-]+$/, "");

  if (!cleaned) return null;
  if (/[^\d,.-]/.test(cleaned)) return null;

  let normalised = cleaned;
  const lastComma = normalised.lastIndexOf(",");
  const lastDot = normalised.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: the rightmost one is the decimal separator ("1.234,50").
    const decimalSep = lastComma > lastDot ? "," : ".";
    const thousandsSep = decimalSep === "," ? "." : ",";
    normalised = normalised.split(thousandsSep).join("");
    normalised = normalised.replace(decimalSep, ".");
  } else if (lastComma !== -1) {
    // A comma with exactly 3 digits after it is a thousands separator ("1,500").
    const decimals = normalised.length - lastComma - 1;
    normalised = decimals === 3 ? normalised.split(",").join("") : normalised.replace(",", ".");
  }

  if (!/^-?\d*\.?\d*$/.test(normalised) || normalised === "." || normalised === "") {
    return null;
  }

  const value = Number(normalised);
  if (!Number.isFinite(value) || value < 0) return null;

  // Round half-up on the cent, guarding against binary float drift (8.345 * 100).
  return Math.round((value + Number.EPSILON) * 100);
}

/** Formats cents for display: 1890 → "18,90 €" (de-DE, EUR). */
export function formatPrice(cents: number, currency = "EUR", locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Formats cents for a text input the owner is about to edit: 1890 → "18,90". */
export function priceToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/**
 * Price without a currency symbol — the classic theme names the currency once
 * in the footer, the way a printed menu does. 1890 → "18,90".
 */
export function formatPriceDecimal(cents: number, locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
