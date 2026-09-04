import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuilderData } from "@/lib/builder-query";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { MenuBuilder } from "@/components/builder/menu-builder";
import { PageHeader } from "@/components/admin/page-header";
import { PublishToggle } from "@/components/admin/publish-toggle";

export const metadata: Metadata = { title: "Speisekarte" };

export default async function BuilderPage() {
  const { restaurant } = await requireTenant();
  const menu = await requireDefaultMenu(restaurant.id);
  const data = await getBuilderData(restaurant.id, menu.id);

  if (!data) notFound();

  return (
    <>
      <PageHeader
        title="Speisekarte"
        description="Kategorien und Gerichte per Drag & Drop ordnen. Namen und Preise lassen sich direkt in der Zeile ändern."
        actions={<PublishToggle published={data.published} />}
      />
      <MenuBuilder initial={data} />
    </>
  );
}
