import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { requireTenant } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { ImportWizard } from "./import-wizard";

export const metadata: Metadata = { title: "Karte importieren" };

export default async function ImportPage() {
  await requireTenant();
  const aiReady = isAiConfigured();

  return (
    <>
      <PageHeader
        title="Karte importieren"
        description="Lade deine bestehende Speisekarte als PDF oder Foto hoch. Die KI liest Kategorien, Gerichte und Preise aus — du prüfst alles, bevor etwas übernommen wird."
      />

      {aiReady ? (
        <ImportWizard />
      ) : (
        <Card className="max-w-[720px]">
          <CardBody>
            <div className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-admin-warning" aria-hidden>
                <AlertCircle size={18} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-admin-base font-semibold text-admin-ink">
                  KI-Funktionen sind nicht eingerichtet
                </p>
                <p className="mt-1 text-admin-base text-admin-muted">
                  Auf diesem Server ist kein KI-Zugang hinterlegt. Trage einen Anthropic-API-Key
                  als <code className="font-mono text-admin-sm">ANTHROPIC_API_KEY</code> in die
                  Datei <code className="font-mono text-admin-sm">.env</code> ein und starte den
                  Server neu. Alle anderen Funktionen arbeiten unverändert weiter.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}
