import { Flame, Leaf, MilkOff, Sprout, WheatOff, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  sprout: Sprout,
  leaf: Leaf,
  "wheat-off": WheatOff,
  "milk-off": MilkOff,
  flame: Flame,
};

/** Resolves a stored icon key to an SVG. Never an emoji. */
export function DietaryIcon({ icon, size = 12 }: { icon: string; size?: number }) {
  const Icon = ICONS[icon] ?? Leaf;
  return <Icon size={size} strokeWidth={2} aria-hidden className="shrink-0" />;
}
