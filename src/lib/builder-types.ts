import type { PublicMenu, PublicRestaurant } from "@/lib/menu-query";

/**
 * The builder's client-side state. It is a superset of the public shape: it
 * additionally carries the fields that decide *whether* something is public
 * (`active`, `visible`), so the preview can be derived locally and update the
 * instant the owner types — no server round trip, no drift between the two.
 */
export type BuilderItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  visible: boolean;
  available: boolean;
  featured: boolean;
  isExample: boolean;
  allergenCodes: string[];
  dietaryTagKeys: string[];
};

export type BuilderCategory = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  active: boolean;
  items: BuilderItem[];
};

export type BuilderData = {
  restaurant: PublicRestaurant;
  categories: BuilderCategory[];
  published: boolean;
  allergens: { code: string; name: string }[];
  dietaryTags: { key: string; name: string; icon: string; color: string }[];
};

/**
 * Projects builder state onto exactly what a guest would see. Same filtering
 * rules as the public query, applied client-side — this is what makes the
 * preview trustworthy rather than approximate.
 */
export function builderToPublic(data: BuilderData): PublicMenu {
  const tagByKey = new Map(data.dietaryTags.map((t) => [t.key, t]));

  const categories = data.categories
    .filter((category) => category.active)
    .map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon,
      items: category.items
        .filter((item) => item.visible)
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          oldPrice: item.oldPrice,
          image: item.image,
          available: item.available,
          featured: item.featured,
          allergenCodes: item.allergenCodes,
          dietaryTags: item.dietaryTagKeys
            .map((key) => tagByKey.get(key))
            .filter((t): t is NonNullable<typeof t> => Boolean(t)),
        })),
    }));

  const usedCodes = new Set(categories.flatMap((c) => c.items.flatMap((i) => i.allergenCodes)));

  return {
    restaurant: data.restaurant,
    categories,
    published: data.published,
    allergenLegend: data.allergens.filter((a) => usedCodes.has(a.code)),
  };
}
