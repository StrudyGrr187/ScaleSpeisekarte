import "server-only";

import { redirect } from "next/navigation";
import { AppError } from "@/lib/action-result";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Server Components: redirect to login when there is no valid session. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Server Components under /platform: only the platform operator may enter. */
export async function requirePlatformAdmin() {
  const user = await requireUser();
  if (user.role !== "PLATFORM_ADMIN") redirect("/admin");
  return user;
}

/**
 * The single tenant boundary for the admin surface. Everything the dashboard
 * reads or writes must be reached through the restaurantId returned here —
 * never through an id taken from client input.
 *
 * A platform admin has no tenant of its own; it borrows one by impersonating,
 * which is why the acting id wins here. `impersonating` lets the UI say so.
 */
export async function requireTenant() {
  const user = await requireUser();

  const restaurantId = user.actingRestaurantId ?? user.restaurantId;
  // A platform admin that has not picked a customer belongs in the customer list.
  if (!restaurantId) redirect("/platform");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      openingHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!restaurant) redirect(user.role === "PLATFORM_ADMIN" ? "/platform" : "/admin/login");

  return { user, restaurant, impersonating: user.actingRestaurantId !== null };
}

/** Returns the restaurant's default menu, creating it lazily if it is missing. */
export async function requireDefaultMenu(restaurantId: string) {
  const existing = await prisma.menu.findFirst({
    where: { restaurantId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return prisma.menu.create({
    data: { restaurantId, name: "Speisekarte", isDefault: true },
  });
}

/**
 * Verifies that a category belongs to the calling tenant.
 * Every mutation that receives a categoryId from the client goes through this.
 */
export async function assertCategoryInTenant(categoryId: string, restaurantId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, menu: { restaurantId } },
    select: { id: true, menuId: true },
  });
  if (!category) throw new AppError("Kategorie nicht gefunden.");
  return category;
}

/** Verifies that a menu item belongs to the calling tenant. */
export async function assertItemInTenant(itemId: string, restaurantId: string) {
  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, category: { menu: { restaurantId } } },
    select: { id: true, categoryId: true },
  });
  if (!item) throw new AppError("Gericht nicht gefunden.");
  return item;
}
