import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBuilderData } from "@/lib/builder-query";
import { requireDefaultMenu, requireTenant } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { PageHeader } from "@/components/admin/page-header";
import { DesignPanel } from "./design-panel";

export const metadata: Metadata = { title: "Design" };

export default async function DesignPage() {
  const { restaurant } = await requireTenant();
  const menu = await requireDefaultMenu(restaurant.id);
  const data = await getBuilderData(restaurant.id, menu.id);

  if (!data) notFound();

  return (
    <>
      <PageHeader
        title="Design"
        description="Wie deine Karte für Gäste aussieht. Änderungen siehst du sofort in der Vorschau — gespeichert wird erst, wenn du es sagst."
      />
      <DesignPanel data={data} aiReady={isAiConfigured()} />
    </>
  );
}
