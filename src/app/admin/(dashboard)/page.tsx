import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, QrCode } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { PublishStatus } from "@/components/admin/publish-status";

export const metadata: Metadata = { title: "Übersicht" };

export default async function DashboardPage() {
  const { restaurant, canManage } = await requireTenant();
  const menu = await requireDefaultMenu(restaurant.id);

  const [categoryCount, itemCount, hiddenCount, soldOutCount] = await Promise.all([
    prisma.category.count({ where: { menuId: menu.id } }),
    prisma.menuItem.count({ where: { category: { menuId: menu.id } } }),
    prisma.menuItem.count({ where: { category: { menuId: menu.id }, visible: false } }),
    prisma.menuItem.count({ where: { category: { menuId: menu.id }, available: false } }),
  ]);

  const stats = [
    { label: "Kategorien", value: categoryCount },
    { label: "Gerichte", value: itemCount },
    { label: "Ausgeblendet", value: hiddenCount },
    { label: "Heute aus", value: soldOutCount },
  ];

  return (
    <>
      <PageHeader
        title={restaurant.name}
        description={
          menu.published
            ? `Deine Karte ist online unter /menu/${restaurant.slug}.`
            : "Deine Karte ist noch nicht online."
        }
        actions={
          <>
            <PublishStatus published={menu.published} canManage={canManage} />
            <Link href="/admin/builder" className={buttonClasses("primary", "md")}>
              Speisekarte bearbeiten
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
          </>
        }
      />

      <div className="space-y-5">
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

        <Card>
          <CardHeader>
            <CardTitle>Für Gäste</CardTitle>
            {menu.published ? (
              <Badge variant="success">Online</Badge>
            ) : (
              <Badge variant="warning">Entwurf</Badge>
            )}
          </CardHeader>
          <CardBody>
            <p className="text-admin-base text-admin-muted">
              {menu.published
                ? "Was du speicherst, sehen Gäste beim nächsten Scan."
                : "Wer den QR-Code scannt, sieht im Moment den Hinweis „Karte in Arbeit“."}
            </p>

            {/* Address and QR code live on one page only, so there is a single
                place to look for the thing that gets printed. */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/admin/qr" className={buttonClasses("secondary", "md")}>
                <QrCode size={16} strokeWidth={1.75} aria-hidden />
                QR-Code &amp; NFC
              </Link>
              <a
                href={`/menu/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("ghost", "md")}
              >
                <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
                Gastansicht öffnen
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
