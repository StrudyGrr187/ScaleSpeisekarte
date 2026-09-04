import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  FolderTree,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { getMenuUrl } from "@/lib/public-url";
import { qrDataUrl } from "@/lib/qr";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/admin/copy-button";
import { PageHeader } from "@/components/admin/page-header";
import { PublishToggle } from "@/components/admin/publish-toggle";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { restaurant } = await requireTenant();
  const menu = await requireDefaultMenu(restaurant.id);

  const [categoryCount, itemCount, hiddenCount, soldOutCount, menuUrl] = await Promise.all([
    prisma.category.count({ where: { menuId: menu.id } }),
    prisma.menuItem.count({ where: { category: { menuId: menu.id } } }),
    prisma.menuItem.count({ where: { category: { menuId: menu.id }, visible: false } }),
    prisma.menuItem.count({ where: { category: { menuId: menu.id }, available: false } }),
    getMenuUrl(restaurant.slug),
  ]);

  const qr = await qrDataUrl(menuUrl, 320);

  const stats = [
    { label: "Kategorien", value: categoryCount, icon: FolderTree },
    { label: "Gerichte", value: itemCount, icon: UtensilsCrossed },
    { label: "Ausgeblendet", value: hiddenCount, icon: Store },
    { label: "Heute aus", value: soldOutCount, icon: Store },
  ];

  return (
    <>
      <PageHeader
        title={restaurant.name}
        description="Übersicht über deine digitale Speisekarte."
        actions={
          <>
            <PublishToggle published={menu.published} />
            <Link href="/admin/builder" className={buttonClasses("primary", "md")}>
              Speisekarte bearbeiten
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              {menu.published ? (
                <Badge variant="success">Veröffentlicht</Badge>
              ) : (
                <Badge variant="warning">Entwurf</Badge>
              )}
            </CardHeader>
            <CardBody>
              <p className="text-admin-base text-admin-muted">
                {menu.published
                  ? "Deine Karte ist öffentlich erreichbar. Änderungen im Builder sind sofort für Gäste sichtbar — du musst nicht erneut veröffentlichen."
                  : "Deine Karte ist noch nicht öffentlich. Gäste sehen unter deiner Adresse einen Hinweis, dass die Karte in Arbeit ist."}
              </p>

              <div className="mt-4 rounded-admin border border-admin-border bg-admin-bg p-3">
                <p className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
                  Öffentliche Adresse
                </p>
                <p className="mt-1.5 font-mono text-admin-sm break-all text-admin-ink-2">
                  {menuUrl}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton value={menuUrl} size="sm" />
                  <a
                    href={`/menu/${restaurant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("ghost", "sm")}
                  >
                    <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
                    Öffnen
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardBody className="px-4 py-4">
                  <p className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-[28px] leading-none font-semibold tabular-nums text-admin-ink">
                    {stat.value}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>QR-Code</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex justify-center rounded-admin border border-admin-border bg-white p-4">
              <Image
                src={qr}
                alt={`QR-Code zur Speisekarte von ${restaurant.name}`}
                width={220}
                height={220}
                unoptimized
                className="size-[220px]"
              />
            </div>
            <p className="mt-3 text-admin-sm text-admin-muted">
              Zeigt dauerhaft auf dieselbe Adresse — auch wenn du die Karte änderst.
            </p>
            <Link href="/admin/qr" className={buttonClasses("secondary", "md", "mt-4 w-full")}>
              QR-Code &amp; NFC
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
