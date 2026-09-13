import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus, SearchX, Store } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/tenant";
import {
  formatDateInZone,
  isSuspended,
  notSuspendedWhere,
  suspendedWhere,
} from "@/lib/suspension";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { CustomerFilters } from "./customer-filters";
import { parseCustomerQuery, type CustomerStatus } from "./customer-query";

export const metadata: Metadata = { title: "Kunden" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// German order: "Ärztehaus" next to "Apotheke", not after "Zander"; case ignored.
const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });

export default async function PlatformPage({ searchParams }: Props) {
  await requirePlatformAdmin();
  const { query, status, sort } = parseCustomerQuery(await searchParams);

  // One timestamp for the whole render, so a suspension that lapses mid-request
  // cannot be counted as suspended in one query and as active in the next.
  const now = new Date();

  const search: Prisma.RestaurantWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { users: { some: { email: { contains: query, mode: "insensitive" } } } },
        ],
      }
    : {};

  // The statuses are exclusive: a suspended menu is offline for guests whatever
  // its published flag says, so it counts as "Gesperrt" and nowhere else.
  const statusWhere: Record<CustomerStatus, Prisma.RestaurantWhereInput> = {
    alle: {},
    veroeffentlicht: {
      AND: [notSuspendedWhere(now), { menus: { some: { published: true } } }],
    },
    entwurf: {
      AND: [notSuspendedWhere(now), { menus: { none: { published: true } } }],
    },
    gesperrt: suspendedWhere(now),
  };

  const [restaurants, totalCount, ...statusCounts] = await Promise.all([
    prisma.restaurant.findMany({
      where: { AND: [search, statusWhere[status]] },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        suspendedAt: true,
        suspendedUntil: true,
        users: {
          where: { role: { not: "PLATFORM_ADMIN" } },
          select: { email: true },
          orderBy: { createdAt: "asc" },
        },
        menus: { select: { published: true }, orderBy: { createdAt: "asc" }, take: 1 },
      },
    }),
    prisma.restaurant.count(),
    // Counts follow the search but not the status filter — they answer "how
    // many would I see if I switched to this tab".
    ...(["alle", "veroeffentlicht", "entwurf", "gesperrt"] as const).map((key) =>
      prisma.restaurant.count({ where: { AND: [search, statusWhere[key]] } })
    ),
  ]);

  const counts: Record<CustomerStatus, number> = {
    alle: statusCounts[0],
    veroeffentlicht: statusCounts[1],
    entwurf: statusCounts[2],
    gesperrt: statusCounts[3],
  };

  restaurants.sort((a, b) => {
    switch (sort) {
      case "alt":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "name":
        return collator.compare(a.name, b.name);
      case "name-desc":
        return collator.compare(b.name, a.name);
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  // Dish counts for the listed restaurants only, in one grouped query.
  const listedIds = restaurants.map((r) => r.id);
  const categories = listedIds.length
    ? await prisma.category.findMany({
        where: { menu: { restaurantId: { in: listedIds } } },
        select: { id: true, menu: { select: { restaurantId: true } } },
      })
    : [];
  const itemCounts = categories.length
    ? await prisma.menuItem.groupBy({
        by: ["categoryId"],
        where: { categoryId: { in: categories.map((c) => c.id) } },
        _count: { _all: true },
      })
    : [];
  const perCategory = new Map(itemCounts.map((c) => [c.categoryId, c._count._all]));
  const itemsPerRestaurant = new Map<string, number>();
  for (const category of categories) {
    const key = category.menu.restaurantId;
    itemsPerRestaurant.set(key, (itemsPerRestaurant.get(key) ?? 0) + (perCategory.get(category.id) ?? 0));
  }

  const filtered = query !== "" || status !== "alle";

  return (
    <>
      <PageHeader
        title="Kunden"
        description={
          filtered
            ? `${restaurants.length} von ${totalCount} ${totalCount === 1 ? "Restaurant" : "Restaurants"}`
            : `${totalCount} ${totalCount === 1 ? "Restaurant" : "Restaurants"} auf der Plattform.`
        }
        actions={
          <Link href="/platform/new" className={buttonClasses("primary", "md")}>
            <Plus size={16} strokeWidth={2} aria-hidden />
            Kunde anlegen
          </Link>
        }
      />

      {totalCount === 0 ? (
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
        <>
          <CustomerFilters query={query} status={status} sort={sort} counts={counts} />

          {restaurants.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="Keine Kunden gefunden"
                description={
                  query
                    ? `Nichts passt zu „${query}"${status !== "alle" ? " in diesem Status" : ""}. Suche nach Name, Adresse der Karte oder E-Mail des Zugangs.`
                    : "In diesem Status gibt es gerade keine Kunden."
                }
                action={
                  <Link href="/platform" className={buttonClasses("secondary", "md")}>
                    Filter zurücksetzen
                  </Link>
                }
              />
            </Card>
          ) : (
            <ul className="space-y-3">
              {restaurants.map((restaurant) => {
                const suspended = isSuspended(restaurant, now);
                const published = restaurant.menus[0]?.published ?? false;
                const [owner, ...others] = restaurant.users;
                return (
                  <li key={restaurant.id}>
                    <Card>
                      <CardBody className="flex flex-wrap items-center gap-4 px-5 py-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-admin-base font-semibold text-admin-ink">
                              {restaurant.name}
                            </p>
                            {suspended ? (
                              <Badge variant="danger">
                                Gesperrt
                                {restaurant.suspendedUntil
                                  ? ` bis ${formatDateInZone(restaurant.suspendedUntil)}`
                                  : ""}
                              </Badge>
                            ) : published ? (
                              <Badge variant="success">Veröffentlicht</Badge>
                            ) : (
                              <Badge variant="warning">Entwurf</Badge>
                            )}
                          </div>
                          <p className="mt-1 truncate font-mono text-admin-sm text-admin-muted">
                            /menu/{restaurant.slug}
                          </p>
                          <p className="mt-0.5 truncate text-admin-sm text-admin-muted">
                            {owner?.email ?? "kein Zugang"}
                            {others.length > 0 ? ` +${others.length}` : ""}
                            {" · "}
                            {itemsPerRestaurant.get(restaurant.id) ?? 0} Gerichte
                            {" · seit "}
                            {formatDateInZone(restaurant.createdAt)}
                          </p>
                        </div>

                        <Link
                          href={`/platform/${restaurant.id}`}
                          className={buttonClasses("secondary", "md")}
                          aria-label={`${restaurant.name} verwalten`}
                        >
                          Verwalten
                          <ArrowRight size={16} strokeWidth={2} aria-hidden />
                        </Link>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
