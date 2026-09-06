import "server-only";

import { prisma } from "@/lib/db";
import type { ThemeKey } from "@/lib/themes";

/**
 * The single view model behind both the public menu and the admin phone
 * preview. Both render the exact same components from this shape, which is what
 * makes "Preview" trustworthy rather than an approximation.
 */
export type PublicMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  available: boolean;
  featured: boolean;
  allergenCodes: string[];
  dietaryTags: { key: string; name: string; icon: string; color: string }[];
};

export type PublicMenuCategory = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  items: PublicMenuItem[];
};

export type PublicRestaurant = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  primaryColor: string;
  currency: string;
  locale: string;
  menuTheme: ThemeKey;
  fontPair: string;
  openingHours: {
    dayOfWeek: number;
    closed: boolean;
    opensAt: string | null;
    closesAt: string | null;
  }[];
};

export type PublicMenu = {
  restaurant: PublicRestaurant;
  categories: PublicMenuCategory[];
  published: boolean;
  allergenLegend: { code: string; name: string }[];
};

const restaurantSelect = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  coverImage: true,
  description: true,
  address: true,
  phone: true,
  website: true,
  primaryColor: true,
  currency: true,
  locale: true,
  menuTheme: true,
  fontPair: true,
  openingHours: {
    orderBy: { dayOfWeek: "asc" },
    select: { dayOfWeek: true, closed: true, opensAt: true, closesAt: true },
  },
} as const;

/** Only what a guest may see: active categories, visible items. */
function categoriesQuery(menuId: string) {
  return prisma.category.findMany({
    where: { menuId, active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      icon: true,
      items: {
        where: { visible: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          oldPrice: true,
          image: true,
          available: true,
          featured: true,
          allergens: { select: { allergen: { select: { code: true, sortOrder: true } } } },
          dietaryTags: {
            select: {
              dietaryTag: { select: { key: true, name: true, icon: true, color: true, sortOrder: true } },
            },
          },
        },
      },
    },
  });
}

type RawCategories = Awaited<ReturnType<typeof categoriesQuery>>;

function toCategories(rows: RawCategories): PublicMenuCategory[] {
  return rows.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    image: category.image,
    icon: category.icon,
    items: category.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      oldPrice: item.oldPrice,
      image: item.image,
      available: item.available,
      featured: item.featured,
      allergenCodes: item.allergens
        .map((link) => link.allergen)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((a) => a.code),
      dietaryTags: item.dietaryTags
        .map((link) => link.dietaryTag)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ key, name, icon, color }) => ({ key, name, icon, color })),
    })),
  }));
}

/** Only the allergens actually used on this menu — no wall of irrelevant codes. */
async function allergenLegendFor(categories: PublicMenuCategory[]) {
  const used = new Set(categories.flatMap((c) => c.items.flatMap((i) => i.allergenCodes)));
  if (used.size === 0) return [];
  const rows = await prisma.allergen.findMany({
    where: { code: { in: [...used] } },
    orderBy: { sortOrder: "asc" },
    select: { code: true, name: true },
  });
  return rows;
}

/** Public menu by slug. Returns null when the slug is unknown. */
export async function getPublicMenuBySlug(slug: string): Promise<PublicMenu | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: restaurantSelect,
  });
  if (!restaurant) return null;

  const menu = await prisma.menu.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, published: true },
  });

  if (!menu) {
    return { restaurant, categories: [], published: false, allergenLegend: [] };
  }

  // An unpublished menu resolves to an empty menu rather than leaking a draft.
  if (!menu.published) {
    return { restaurant, categories: [], published: false, allergenLegend: [] };
  }

  const categories = toCategories(await categoriesQuery(menu.id));

  return {
    restaurant,
    categories,
    published: true,
    allergenLegend: await allergenLegendFor(categories),
  };
}
