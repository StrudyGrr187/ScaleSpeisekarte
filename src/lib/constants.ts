/**
 * Reference data. Allergens and dietary tags live in the database (see
 * prisma/schema.prisma) so they stay structured and queryable; these arrays are
 * the seed source of truth and the fallback for rendering.
 */

export const EU_ALLERGENS = [
  { code: "A", name: "Glutenhaltiges Getreide" },
  { code: "B", name: "Krebstiere" },
  { code: "C", name: "Eier" },
  { code: "D", name: "Fisch" },
  { code: "E", name: "Erdnüsse" },
  { code: "F", name: "Soja" },
  { code: "G", name: "Milch/Laktose" },
  { code: "H", name: "Schalenfrüchte" },
  { code: "L", name: "Sellerie" },
  { code: "M", name: "Senf" },
  { code: "N", name: "Sesam" },
  { code: "O", name: "Sulfite" },
  { code: "P", name: "Lupinen" },
  { code: "R", name: "Weichtiere" },
] as const;

/** `icon` values are lucide-react keys — resolved to SVG, never rendered as emoji. */
export const DIETARY_TAGS = [
  { key: "vegan", name: "Vegan", icon: "sprout", color: "#15803D" },
  { key: "vegetarian", name: "Vegetarisch", icon: "leaf", color: "#4D7C0F" },
  { key: "gluten-free", name: "Glutenfrei", icon: "wheat-off", color: "#A16207" },
  { key: "lactose-free", name: "Laktosefrei", icon: "milk-off", color: "#0369A1" },
  { key: "spicy", name: "Scharf", icon: "flame", color: "#C2410C" },
] as const;

export const WEEKDAYS = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;

export const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export const CURRENCIES = [
  { code: "EUR", label: "Euro (€)" },
  { code: "CHF", label: "Schweizer Franken (CHF)" },
  { code: "GBP", label: "Britisches Pfund (£)" },
  { code: "USD", label: "US-Dollar ($)" },
] as const;

/** Lucide icon keys offered for categories. Keep in sync with CategoryIcon. */
export const CATEGORY_ICONS = [
  "utensils",
  "soup",
  "salad",
  "beef",
  "pizza",
  "sandwich",
  "fish",
  "egg",
  "croissant",
  "cake-slice",
  "ice-cream-cone",
  "coffee",
  "cup-soda",
  "wine",
  "beer",
  "martini",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICONS)[number];
