import "server-only";

import { prisma } from "@/lib/db";
import type { BuilderData } from "@/lib/builder-types";

/** Loads everything the builder needs in one round trip, scoped to the tenant. */
export async function getBuilderData(
  restaurantId: string,
  menuId: string
): Promise<BuilderData | null> {
  const [restaurant, menu, allergens, dietaryTags] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
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
      },
    }),
    prisma.menu.findFirst({
      where: { id: menuId, restaurantId },
      select: {
        id: true,
        published: true,
        categories: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            icon: true,
            active: true,
            items: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                oldPrice: true,
                image: true,
                visible: true,
                available: true,
                featured: true,
                isExample: true,
                allergens: { select: { allergen: { select: { code: true, sortOrder: true } } } },
                dietaryTags: { select: { dietaryTag: { select: { key: true, sortOrder: true } } } },
              },
            },
          },
        },
      },
    }),
    prisma.allergen.findMany({ orderBy: { sortOrder: "asc" }, select: { code: true, name: true } }),
    prisma.dietaryTag.findMany({
      orderBy: { sortOrder: "asc" },
      select: { key: true, name: true, icon: true, color: true },
    }),
  ]);

  if (!restaurant || !menu) return null;

  return {
    restaurant,
    published: menu.published,
    allergens,
    dietaryTags,
    categories: menu.categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon,
      active: category.active,
      items: category.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        oldPrice: item.oldPrice,
        image: item.image,
        visible: item.visible,
        available: item.available,
        featured: item.featured,
        isExample: item.isExample,
        allergenCodes: item.allergens
          .map((l) => l.allergen)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((a) => a.code),
        dietaryTagKeys: item.dietaryTags
          .map((l) => l.dietaryTag)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((t) => t.key),
      })),
    })),
  };
}
