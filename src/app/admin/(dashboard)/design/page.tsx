import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuilderData } from "@/lib/builder-query";
import { builderToPublic } from "@/lib/builder-types";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { resolveTheme } from "@/lib/themes";
import { resolveFontPair } from "@/lib/fonts";
import { PageHeader } from "@/components/admin/page-header";
import { AdminOnlyNote } from "@/components/admin/admin-only-note";
import { PhonePreview } from "@/components/builder/phone-preview";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { DesignPanel } from "./design-panel";

export const metadata: Metadata = { title: "Design" };

export default async function DesignPage() {
  const { restaurant, canManage } = await requireTenant();
  const menu = await requireDefaultMenu(restaurant.id);
  const data = await getBuilderData(restaurant.id, menu.id);

  if (!data) notFound();

  if (canManage) {
    return (
      <>
        <PageHeader
          title="Design"
          description="Stil, Schrift und Farbe der Gastansicht. Gespeichert wird erst mit „Look speichern“."
        />
        <DesignPanel data={data} aiReady={isAiConfigured()} />
      </>
    );
  }

  const theme = resolveTheme(data.restaurant.menuTheme);
  const fonts = resolveFontPair(data.restaurant.fontPair);
  const rows = [
    { label: "Stil", value: theme.label, detail: theme.mood },
    { label: "Schrift", value: fonts.label, detail: fonts.mood },
  ];

  return (
    <>
      <PageHeader title="Design" description="Stil, Schrift und Farbe der Gastansicht." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
        <Card className="h-fit max-w-[560px]">
          <CardHeader>
            <CardTitle>Aktueller Look</CardTitle>
            <AdminOnlyNote />
          </CardHeader>
          <CardBody>
            <dl className="divide-y divide-admin-border">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[120px_1fr]"
                >
                  <dt className="text-admin-base text-admin-muted">{row.label}</dt>
                  <dd>
                    <p className="text-admin-base font-medium text-admin-ink">{row.value}</p>
                    <p className="text-admin-sm text-admin-muted">{row.detail}</p>
                  </dd>
                </div>
              ))}
              <div className="grid gap-1 py-3 last:pb-0 sm:grid-cols-[120px_1fr]">
                <dt className="text-admin-base text-admin-muted">Farbe</dt>
                <dd className="flex items-center gap-2.5">
                  <span
                    className="size-6 rounded-full border border-admin-border"
                    style={{ backgroundColor: data.restaurant.primaryColor }}
                    aria-hidden
                  />
                  <span className="font-mono text-admin-sm uppercase text-admin-ink">
                    {data.restaurant.primaryColor}
                  </span>
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>
        <PhonePreview menu={builderToPublic(data)} focusedItemId={null} />
      </div>
    </>
  );
}
