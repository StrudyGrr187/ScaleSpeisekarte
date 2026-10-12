import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { requireManagerPage } from "@/lib/tenant";
import { isAiConfigured } from "@/lib/ai";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { ImportWizard } from "./import-wizard";

export const metadata: Metadata = { title: "Karte importieren" };

export default async function ImportPage() {
  await requireManagerPage();
  const aiReady = isAiConfigured();

  return (
    <>
      <PageHeader
        title="Karte importieren"
        description="PDF oder Foto der bestehenden Karte hochladen, Ergebnis prüfen, übernehmen."
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
                  Dafür fehlt <code className="font-mono text-admin-sm">ANTHROPIC_API_KEY</code> in
                  der <code className="font-mono text-admin-sm">.env</code>. Nach dem Eintragen den
                  Server neu starten.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}
