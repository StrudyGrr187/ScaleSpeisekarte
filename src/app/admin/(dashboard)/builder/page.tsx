import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuilderData } from "@/lib/builder-query";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { MenuBuilder } from "@/components/builder/menu-builder";
import { PageHeader } from "@/components/admin/page-header";
import { PublishStatus } from "@/components/admin/publish-status";

export const metadata: Metadata = { title: "Speisekarte" };

export default async function BuilderPage() {
  const { restaurant, canManage } = await requireTenant();
  const menu = await requireDefaultMenu(restaurant.id);
  const data = await getBuilderData(restaurant.id, menu.id);

  if (!data) notFound();

  return (
    <>
      <PageHeader
        title="Speisekarte"
        description={
          canManage
            ? "Namen und Preise direkt in der Zeile ändern, Reihenfolge per Ziehen."
            : "Namen und Preise direkt in der Zeile ändern. Fotos und Details über das Stift-Symbol."
        }
        actions={<PublishStatus published={data.published} canManage={canManage} />}
      />
      <MenuBuilder initial={data} canManage={canManage} />
    </>
  );
}
