import type { Metadata } from "next";
import { isAiConfigured } from "@/lib/ai";
import { normalizeLanguages } from "@/lib/languages";
import { requireManagerPage } from "@/lib/tenant";
import { getTranslationOverview } from "@/lib/translation";
import { PageHeader } from "@/components/admin/page-header";
import { LanguagesPanel } from "./languages-panel";

export const metadata: Metadata = { title: "Sprachen" };

// "Jetzt übersetzen" waits for the model. A long menu in several languages is
// many requests, and the action inherits this page's time limit.
export const maxDuration = 300;

export default async function LanguagesPage() {
  const { restaurant } = await requireManagerPage();
  const overview = await getTranslationOverview(restaurant.id);

  return (
    <>
      <PageHeader
        title="Sprachen"
        description="Du schreibst die Karte auf Deutsch, Gäste lesen sie in ihrer Sprache. Übersetzt wird automatisch."
      />
      <LanguagesPanel
        enabled={normalizeLanguages(restaurant.languages)}
        overview={overview}
        slug={restaurant.slug}
        aiReady={isAiConfigured()}
      />
    </>
  );
}
