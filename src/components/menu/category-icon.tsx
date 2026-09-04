import {
  Beef,
  Beer,
  CakeSlice,
  Coffee,
  Croissant,
  CupSoda,
  Egg,
  Fish,
  IceCreamCone,
  Martini,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  soup: Soup,
  salad: Salad,
  beef: Beef,
  pizza: Pizza,
  sandwich: Sandwich,
  fish: Fish,
  egg: Egg,
  croissant: Croissant,
  "cake-slice": CakeSlice,
  "ice-cream-cone": IceCreamCone,
  coffee: Coffee,
  "cup-soda": CupSoda,
  wine: Wine,
  beer: Beer,
  martini: Martini,
};

export function CategoryIcon({
  icon,
  size = 16,
  className,
}: {
  icon: string | null | undefined;
  size?: number;
  className?: string;
}) {
  if (!icon) return null;
  const Icon = ICONS[icon];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={1.75} aria-hidden className={className} />;
}
