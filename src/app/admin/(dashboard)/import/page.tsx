import type { Metadata } from "next";
import { requireManagerPage } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { PageHeader } from "@/components/admin/page-header";
import { ImportWizard } from "./import-wizard";

export const metadata: Metadata = { title: "Karte importieren" };

export default async function ImportPage() {
  await requireManagerPage();
  const aiReady = isAiConfigured();

  return (
    <>
      <PageHeader
        title="Karte importieren"
        description="Importiere eine Speisekarte als PDF, Foto, Excel- oder CSV-Datei. Du prüfst alles, bevor etwas übernommen wird."
      />
      <ImportWizard aiReady={aiReady} />
    </>
  );
}
