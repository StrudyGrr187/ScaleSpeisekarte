import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/tenant";
import { getMenuUrl } from "@/lib/public-url";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { formatDateInZone, isSuspended, nextDay, todayInZone } from "@/lib/suspension";
import { SuspensionCard } from "./suspension-card";
import { TenantActions } from "./tenant-actions";

export const metadata: Metadata = { title: "Kunde" };

export default async function TenantPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      onboardedAt: true,
      menuTheme: true,
      suspendedAt: true,
      suspendedUntil: true,
      suspensionReason: true,
      users: {
        where: { role: { not: "PLATFORM_ADMIN" } },
        select: { id: true, email: true, name: true, role: true },
        orderBy: { createdAt: "asc" },
      },
      menus: { select: { id: true, published: true }, orderBy: { createdAt: "asc" }, take: 1 },
    },
  });

  if (!restaurant) notFound();

  const menu = restaurant.menus[0];
  const [categoryCount, itemCount, menuUrl] = await Promise.all([
    menu ? prisma.category.count({ where: { menuId: menu.id } }) : 0,
    menu ? prisma.menuItem.count({ where: { category: { menuId: menu.id } } }) : 0,
    getMenuUrl(restaurant.slug),
  ]);

  const owner = restaurant.users[0] ?? null;
  const suspended = isSuspended(restaurant);

  const minDate = nextDay(todayInZone());

  return (
    <>
      <Link
        href="/platform"
        className="mb-4 inline-flex items-center gap-1.5 text-admin-sm font-medium text-admin-muted hover:text-admin-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
        Alle Kunden
      </Link>

      <PageHeader
        title={restaurant.name}
        description={`Angelegt am ${formatDateInZone(restaurant.createdAt)}${
          restaurant.onboardedAt ? "" : " · Einrichtung noch nicht abgeschlossen"
        }`}
        actions={
          suspended ? (
            <Badge variant="danger">Gesperrt</Badge>
          ) : menu?.published ? (
            <Badge variant="success">Veröffentlicht</Badge>
          ) : (
            <Badge variant="warning">Entwurf</Badge>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Karte</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
                  Kategorien
                </dt>
                <dd className="mt-1 text-[22px] leading-none font-semibold tabular-nums text-admin-ink">
                  {categoryCount}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
                  Gerichte
                </dt>
                <dd className="mt-1 text-[22px] leading-none font-semibold tabular-nums text-admin-ink">
                  {itemCount}
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-admin border border-admin-border bg-admin-bg px-3.5 py-3 font-mono text-admin-sm break-all text-admin-ink-2">
              {menuUrl}
            </p>
            <a
              href={`/menu/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("ghost", "sm", "mt-2")}
            >
              <ExternalLink size={15} strokeWidth={1.75} aria-hidden />
              Gastansicht öffnen
            </a>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zugang</CardTitle>
          </CardHeader>
          <CardBody>
            {owner ? (
              <>
                <p className="font-mono text-admin-sm break-all text-admin-ink-2">{owner.email}</p>
                {owner.name ? (
                  <p className="mt-0.5 text-admin-sm text-admin-muted">{owner.name}</p>
                ) : null}
                {restaurant.users.length > 1 ? (
                  <p className="mt-2 text-admin-sm text-admin-muted">
                    Weitere Konten: {restaurant.users.slice(1).map((u) => u.email).join(", ")}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-admin-base text-admin-muted">
                Dieses Restaurant hat kein Login-Konto. Ohne Konto kann niemand die Karte pflegen.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <SuspensionCard
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        suspended={suspended}
        since={suspended && restaurant.suspendedAt ? formatDateInZone(restaurant.suspendedAt) : null}
        until={suspended && restaurant.suspendedUntil ? formatDateInZone(restaurant.suspendedUntil) : null}
        reason={suspended ? restaurant.suspensionReason : null}
        minDate={minDate}
      />

      <TenantActions
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        ownerId={owner?.id ?? null}
        ownerEmail={owner?.email ?? null}
      />
    </>
  );
}
