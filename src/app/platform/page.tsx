import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus, Store } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/tenant";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Kunden" };

export default async function PlatformPage() {
  await requirePlatformAdmin();

  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      users: { select: { email: true }, orderBy: { createdAt: "asc" }, take: 1 },
      menus: { select: { published: true }, orderBy: { createdAt: "asc" }, take: 1 },
      _count: { select: { users: true } },
    },
  });

  // One grouped query instead of one per restaurant: the list must not get
  // slower with every customer added.
  const itemCounts = await prisma.menuItem.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
  });
  const categories = await prisma.category.findMany({
    select: { id: true, menu: { select: { restaurantId: true } } },
  });
  const itemsPerRestaurant = new Map<string, number>();
  for (const category of categories) {
    const count = itemCounts.find((c) => c.categoryId === category.id)?._count._all ?? 0;
    const key = category.menu.restaurantId;
    itemsPerRestaurant.set(key, (itemsPerRestaurant.get(key) ?? 0) + count);
  }

  return (
    <>
      <PageHeader
        title="Kunden"
        description={`${restaurants.length} ${restaurants.length === 1 ? "Restaurant" : "Restaurants"} auf der Plattform.`}
        actions={
          <Link href="/platform/new" className={buttonClasses("primary", "md")}>
            <Plus size={16} strokeWidth={2} aria-hidden />
            Kunde anlegen
          </Link>
        }
      />

      {restaurants.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Noch keine Kunden"
          description="Lege das erste Restaurant an. Du bekommst danach Zugangsdaten, die du weitergeben kannst."
          action={
            <Link href="/platform/new" className={buttonClasses("primary", "md")}>
              <Plus size={16} strokeWidth={2} aria-hidden />
              Kunde anlegen
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {restaurants.map((restaurant) => {
            const published = restaurant.menus[0]?.published ?? false;
            return (
              <Card key={restaurant.id}>
                <CardBody className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-admin-base font-semibold text-admin-ink">
                        {restaurant.name}
                      </p>
                      {published ? (
                        <Badge variant="success">Veröffentlicht</Badge>
                      ) : (
                        <Badge variant="warning">Entwurf</Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-admin-sm text-admin-muted">
                      /menu/{restaurant.slug}
                    </p>
                    <p className="mt-0.5 truncate text-admin-sm text-admin-muted">
                      {restaurant.users[0]?.email ?? "kein Zugang"}
                      {restaurant._count.users > 1 ? ` +${restaurant._count.users - 1}` : ""}
                      {" · "}
                      {itemsPerRestaurant.get(restaurant.id) ?? 0} Gerichte
                    </p>
                  </div>

                  <Link
                    href={`/platform/${restaurant.id}`}
                    className={buttonClasses("secondary", "md")}
                  >
                    Verwalten
                    <ArrowRight size={16} strokeWidth={2} aria-hidden />
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
