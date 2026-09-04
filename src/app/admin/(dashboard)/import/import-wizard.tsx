"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Loader2,
  ScanText,
  Trash2,
  Upload,
} from "lucide-react";
import { analyzeMenuFileAction, commitImportAction } from "@/app/actions/ai";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import type { ImportResult } from "@/lib/ai-import";
import { parsePrice } from "@/lib/money";
import { cn } from "@/lib/utils";

type Draft = {
  name: string;
  items: {
    id: string;
    name: string;
    description: string | null;
    priceText: string;
    priceParsed: boolean;
    allergenCodes: string[];
  }[];
};

export function ImportWizard() {
  const router = useRouter();
  const toast = useToast();

  const [file, setFile] = React.useState<File | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [committing, setCommitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Draft[] | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const analyse = async (selected: File) => {
    setAnalyzing(true);
    setError(null);
    setDraft(null);

    const formData = new FormData();
    formData.set("file", selected);

    const result = await analyzeMenuFileAction(formData);
    setAnalyzing(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(toDraft(result.data));
  };

  const commit = async () => {
    if (!draft) return;
    setCommitting(true);

    const result = await commitImportAction({
      categories: draft.map((category) => ({
        name: category.name,
        items: category.items.map((item) => ({
          name: item.name,
          description: item.description,
          priceText: item.priceText,
          allergenCodes: item.allergenCodes,
        })),
      })),
    });

    setCommitting(false);

    if (result.ok) {
      toast(result.message ?? "Übernommen.");
      router.push("/admin/builder");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  };

  const totalItems = draft?.reduce((sum, c) => sum + c.items.length, 0) ?? 0;
  // A price the parser cannot read would be written as 0,00 €. Block the commit
  // until every one of them has been filled in by hand.
  const unparsed =
    draft?.reduce(
      (sum, c) => sum + c.items.filter((i) => parsePrice(i.priceText) === null).length,
      0
    ) ?? 0;

  /* ---------------- step 1: upload ---------------- */

  if (!draft) {
    return (
      <div className="max-w-[720px]">
        <FormError>{error}</FormError>

        <Card>
          <CardBody>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) {
                  setFile(selected);
                  void analyse(selected);
                }
              }}
            />

            <button
              type="button"
              disabled={analyzing}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-3 rounded-admin-lg border-2 border-dashed px-6 py-12 text-center",
                "transition-colors duration-[var(--dur-fast)]",
                analyzing
                  ? "cursor-wait border-admin-primary bg-admin-primary-soft"
                  : "border-admin-border-strong hover:border-admin-primary hover:bg-admin-primary-soft"
              )}
            >
              {analyzing ? (
                <>
                  <Loader2 size={26} className="animate-spin text-admin-primary" aria-hidden />
                  <span className="text-admin-base font-semibold text-admin-ink">
                    Karte wird gelesen…
                  </span>
                  <span className="max-w-[42ch] text-admin-sm text-admin-muted">
                    Das dauert je nach Umfang 15–45 Sekunden. Bitte das Fenster offen lassen.
                  </span>
                  {file ? (
                    <span className="mt-1 flex items-center gap-1.5 text-admin-sm text-admin-muted">
                      <FileText size={14} strokeWidth={1.75} aria-hidden />
                      {file.name}
                    </span>
                  ) : null}
                </>
              ) : (
                <>
                  <span
                    className="flex size-11 items-center justify-center rounded-full bg-admin-primary-soft text-admin-primary"
                    aria-hidden
                  >
                    <Upload size={20} strokeWidth={1.75} />
                  </span>
                  <span className="text-admin-base font-semibold text-admin-ink">
                    PDF oder Foto auswählen
                  </span>
                  <span className="max-w-[46ch] text-admin-sm text-admin-muted">
                    Am besten das Original-PDF. Ein Foto funktioniert auch — gerade halten, gutes
                    Licht, Text scharf. Maximal 12 MB.
                  </span>
                </>
              )}
            </button>

            <ul className="mt-5 space-y-2 text-admin-sm text-admin-muted">
              <li className="flex gap-2">
                <ScanText size={15} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
                Namen, Beschreibungen und Preise werden wörtlich übernommen — nichts wird
                umformuliert.
              </li>
              <li className="flex gap-2">
                <AlertTriangle size={15} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
                Allergene werden nur übernommen, wenn sie auf der Karte stehen. Geraten wird nie.
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    );
  }

  /* ---------------- step 2: review ---------------- */

  return (
    <div className="max-w-[860px]">
      <Card className="mb-4">
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-admin-base font-semibold text-admin-ink">
              {totalItems} {totalItems === 1 ? "Gericht" : "Gerichte"} in {draft.length}{" "}
              {draft.length === 1 ? "Kategorie" : "Kategorien"} erkannt
            </p>
            <p className="mt-1 text-admin-sm text-admin-muted">
              Prüfe die Daten und korrigiere, was nicht stimmt. Übernommene Gerichte sind zunächst
              ausgeblendet — Gäste sehen sie erst, wenn du sie freigibst.
            </p>
            {unparsed > 0 ? (
              <p className="mt-2 flex items-center gap-1.5 text-admin-sm text-admin-warning">
                <AlertTriangle size={14} strokeWidth={2} aria-hidden />
                {unparsed} {unparsed === 1 ? "Preis ist" : "Preise sind"} nicht lesbar — bitte
                nachtragen, sonst lässt sich der Import nicht übernehmen.
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(null);
                setFile(null);
              }}
              disabled={committing}
            >
              Andere Datei
            </Button>
            <Button onClick={commit} disabled={committing || totalItems === 0 || unparsed > 0}>
              {committing ? "Wird übernommen…" : "In die Karte übernehmen"}
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {draft.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <input
                value={category.name}
                aria-label={`Name der Kategorie ${category.name}`}
                onChange={(e) =>
                  setDraft((current) =>
                    current!.map((c, i) =>
                      i === categoryIndex ? { ...c, name: e.target.value } : c
                    )
                  )
                }
                className="w-full rounded-admin-sm border border-transparent bg-transparent px-2 py-1 text-admin-h2 font-semibold text-admin-ink outline-none hover:border-admin-border focus:border-admin-primary focus:shadow-admin-focus"
              />
              <CardTitle className="sr-only">{category.name}</CardTitle>
              <Button
                variant="dangerGhost"
                size="sm"
                onClick={() =>
                  setDraft((current) => current!.filter((_, i) => i !== categoryIndex))
                }
              >
                <Trash2 size={15} strokeWidth={1.75} aria-hidden />
                Kategorie verwerfen
              </Button>
            </CardHeader>
            <CardBody className="space-y-2 px-3 py-3">
              {category.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-start gap-2 rounded-admin border border-admin-border p-2.5 sm:flex-nowrap"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Input
                      value={item.name}
                      aria-label={`Name: ${item.name}`}
                      onChange={(e) =>
                        updateItem(setDraft, categoryIndex, itemIndex, { name: e.target.value })
                      }
                      className="h-9 font-medium"
                    />
                    <Input
                      value={item.description ?? ""}
                      aria-label={`Beschreibung: ${item.name}`}
                      placeholder="Beschreibung (optional)"
                      onChange={(e) =>
                        updateItem(setDraft, categoryIndex, itemIndex, {
                          description: e.target.value || null,
                        })
                      }
                      className="h-9 text-admin-base"
                    />
                  </div>

                  <div className="w-28 shrink-0">
                    <Input
                      value={item.priceText}
                      aria-label={`Preis: ${item.name}`}
                      inputMode="decimal"
                      placeholder="12,50"
                      invalid={parsePrice(item.priceText) === null}
                      onChange={(e) =>
                        updateItem(setDraft, categoryIndex, itemIndex, {
                          priceText: e.target.value,
                        })
                      }
                      className="h-9 text-right tabular-nums"
                    />
                    {item.allergenCodes.length > 0 ? (
                      <p className="mt-1 text-right font-mono text-admin-sm text-admin-muted">
                        {item.allergenCodes.join(" ")}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${item.name} verwerfen`}
                    onClick={() =>
                      setDraft((current) =>
                        current!.map((c, i) =>
                          i === categoryIndex
                            ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) }
                            : c
                        )
                      )
                    }
                  >
                    <Trash2 size={15} strokeWidth={1.75} aria-hidden />
                  </Button>
                </div>
              ))}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

function updateItem(
  setDraft: React.Dispatch<React.SetStateAction<Draft[] | null>>,
  categoryIndex: number,
  itemIndex: number,
  patch: Partial<Draft["items"][number]>
) {
  setDraft((current) =>
    current!.map((c, i) =>
      i === categoryIndex
        ? { ...c, items: c.items.map((item, j) => (j === itemIndex ? { ...item, ...patch } : item)) }
        : c
    )
  );
}

function toDraft(result: ImportResult): Draft[] {
  return result.categories.map((category) => ({
    name: category.name,
    items: category.items.map((item, index) => ({
      id: `${category.name}-${index}`,
      name: item.name,
      description: item.description,
      priceText: item.priceParsed ? item.priceText : "",
      priceParsed: item.priceParsed,
      allergenCodes: item.allergenCodes,
    })),
  }));
}
