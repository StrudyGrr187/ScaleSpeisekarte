import "server-only";

import { prisma } from "@/lib/db";
import { allergenName, dietaryName, guestStrings, type GuestStrings } from "@/lib/guest-i18n";
import {
  normalizeLanguages,
  resolveGuestLanguage,
  SOURCE_LANGUAGE,
  type LanguageCode,
} from "@/lib/languages";
import { isSuspended } from "@/lib/suspension";
import { localize } from "@/lib/translation";
import { resolveFontSize, type CustomTheme, type ThemeKey } from "@/lib/themes";

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
  googleReviewUrl: string | null;
  primaryColor: string;
  currency: string;
  locale: string;
  menuTheme: ThemeKey;
  fontPair: string;
  fontSize: "small" | "normal" | "large";
  customTheme: CustomTheme | null;
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
  /** The language everything above is already rendered in. */
  language: LanguageCode;
  /** What the guest can switch between, German first. One entry: no switcher. */
  languages: LanguageCode[];
  strings: GuestStrings;
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
  googleReviewUrl: true,
  primaryColor: true,
  currency: true,
  locale: true,
  menuTheme: true,
  fontPair: true,
  fontSize: true,
  customTheme: true,
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
      translations: true,
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
          translations: true,
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

/**
 * Builds the guest shape in one language. The raw `translations` JSON holds
 * every language and is dropped here — a guest page carries only its own.
 */
function toCategories(rows: RawCategories, lang: LanguageCode): PublicMenuCategory[] {
  return rows.map((category) => ({
    id: category.id,
    ...localize(category, lang),
    image: category.image,
    icon: category.icon,
    items: category.items.map((item) => ({
      id: item.id,
      ...localize(item, lang),
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
        .map(({ key, name, icon, color }) => ({
          key,
          name: dietaryName(key, lang, name),
          icon,
          color,
        })),
    })),
  }));
}

/** Only the allergens actually used on this menu — no wall of irrelevant codes. */
async function allergenLegendFor(categories: PublicMenuCategory[], lang: LanguageCode) {
  const used = new Set(categories.flatMap((c) => c.items.flatMap((i) => i.allergenCodes)));
  if (used.size === 0) return [];
  const rows = await prisma.allergen.findMany({
    where: { code: { in: [...used] } },
    orderBy: { sortOrder: "asc" },
    select: { code: true, name: true },
  });
  return rows.map((row) => ({ code: row.code, name: allergenName(row.code, lang, row.name) }));
}

export type PublicMenuResult =
  | { status: "ok"; menu: PublicMenu }
  /** Only the name: a suspended customer's menu, hours and contact stay hidden. */
  | { status: "suspended"; restaurantName: string }
  | { status: "not-found" };

/** How the guest asked for a language: `?lang=` and the browser's Accept-Language. */
export type LanguageRequest = { lang?: string; acceptLanguage: string | null };

/** Public menu by slug, in the language the guest asked for if the restaurant offers it. */
export async function getPublicMenuBySlug(
  slug: string,
  request: LanguageRequest = { acceptLanguage: null }
): Promise<PublicMenuResult> {
  const row = await prisma.restaurant.findUnique({
    where: { slug },
    // The suspension fields are read to decide, then stripped below — this
    // object is handed to a client component, and the operator's note must
    // never be serialised into a guest's page. It is deliberately not selected.
    // The same goes for the raw translations: they are applied, then dropped.
    select: {
      ...restaurantSelect,
      suspendedAt: true,
      suspendedUntil: true,
      languages: true,
      translations: true,
    },
  });
  if (!row) return { status: "not-found" };

  const { suspendedAt, suspendedUntil, languages: enabled, translations, ...stored } = row;
  if (isSuspended({ suspendedAt, suspendedUntil })) {
    return { status: "suspended", restaurantName: stored.name };
  }

  const languages: LanguageCode[] = [SOURCE_LANGUAGE, ...normalizeLanguages(enabled)];
  const language = resolveGuestLanguage(request.lang, request.acceptLanguage, languages);
  const restaurant = {
    ...stored,
    description: stored.description
      ? localize({ name: "", description: stored.description, translations }, language).description
      : null,
  };
  const i18n = { language, languages, strings: guestStrings(language) };

  const menu = await prisma.menu.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, published: true },
  });

  // No menu, or an unpublished one, resolves to an empty menu rather than
  // leaking a draft.
  if (!menu || !menu.published) {
    return {
      status: "ok",
      menu: {
        restaurant: {
          ...restaurant,
          fontSize: resolveFontSize(restaurant.fontSize),
          customTheme: restaurant.customTheme as CustomTheme | null,
        },
        categories: [],
        published: false,
        allergenLegend: [],
        ...i18n,
      },
    };
  }

  const categories = toCategories(await categoriesQuery(menu.id), language);

  return {
    status: "ok",
    menu: {
      restaurant: {
        ...restaurant,
        fontSize: resolveFontSize(restaurant.fontSize),
        customTheme: restaurant.customTheme as CustomTheme | null,
      },
      categories,
      published: true,
      allergenLegend: await allergenLegendFor(categories, language),
      ...i18n,
    },
  };
}
