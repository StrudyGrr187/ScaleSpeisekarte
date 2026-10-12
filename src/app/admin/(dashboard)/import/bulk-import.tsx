"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { ArrowRight, Check, Copy, FileSpreadsheet, Loader2, Trash2, Upload } from "lucide-react";
import { commitImportAction } from "@/app/actions/ai";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { parsePrice } from "@/lib/money";

type BulkRow = {
  id: string;
  category: string;
  name: string;
  description: string;
  priceText: string;
  allergenCodes: string;
};

const MAX_BYTES = 12 * 1024 * 1024;
const MAX_ROWS = 2000;

export const CHATGPT_CSV_PROMPT = `Analysiere das angehängte Foto meiner Speisekarte und erstelle daraus ausschließlich eine CSV-Datei.

Verwende exakt diese Spalten in der ersten Zeile:
Kategorie;Gericht;Beschreibung;Preis;Allergene

Regeln:
- Eine Zeile pro Gericht. Bei mehreren Größen oder Preisen jeweils eine eigene Zeile; die Größe in den Gericht-Namen aufnehmen.
- Kategorie, Gericht und Beschreibung wörtlich aus der Speisekarte übernehmen. Nichts erfinden und nichts umformulieren.
- Preise als Zahl mit Komma ausgeben, ohne Währungszeichen, zum Beispiel 12,50.
- Allergene nur übernehmen, wenn sie auf der Speisekarte ausdrücklich beim Gericht stehen. Mehrere Allergene mit Leerzeichen trennen, zum Beispiel A G. Niemals Allergene aus Zutaten ableiten.
- Gerichte ohne erkennbare Kategorie in die Kategorie Weitere einordnen.
- Keine Markdown-Tabelle, keinen Codeblock und keinen zusätzlichen Text ausgeben.
- Trennzeichen ist das Semikolon (;). Inhalte mit Semikolons in doppelte Anführungszeichen setzen.

Gib jetzt nur die fertige CSV zurück.`;

export function BulkImport() {
  const toast = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [rows, setRows] = React.useState<BulkRow[] | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [reading, setReading] = React.useState(false);
  const [committing, setCommitting] = React.useState(false);

  const readFile = async (file: File) => {
    setError(null);
    setRows(null);
    setFileName(file.name);
    if (file.size === 0) return setError("Die Datei ist leer.");
    if (file.size > MAX_BYTES) return setError("Die Datei ist zu groß (maximal 12 MB).");

    setReading(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("Kein Tabellenblatt gefunden.");
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (raw.length === 0) throw new Error("Die Tabelle enthält keine Daten.");
      if (raw.length > MAX_ROWS) throw new Error(`Maximal ${MAX_ROWS} Gerichte pro Import.`);

      const rows = raw.map((row, index) => {
        const values = new Map(Object.entries(row).map(([key, value]) => [normaliseHeader(key), value]));
        const category = value(values, ["kategorie", "category", "gruppe", "bereich"]) || "Weitere";
        const name = value(values, ["gericht", "name", "speise", "artikel", "item"]);
        if (!name) throw new Error(`Zeile ${index + 2}: Spalte „Gericht“ fehlt.`);
        return {
          id: `${index}-${name}`,
          category,
          name,
          description: value(values, ["beschreibung", "description", "zutaten"]),
          priceText: value(values, ["preis", "price", "betrag"]),
          allergenCodes: value(values, ["allergene", "allergen", "allergenecodes", "kennzeichen"]),
        };
      });
      setRows(rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Tabelle konnte nicht gelesen werden.");
    } finally {
      setReading(false);
    }
  };

  const commit = async () => {
    if (!rows?.length) return;
    const unparsed = rows.filter((row) => parsePrice(row.priceText) === null).length;
    if (unparsed > 0) {
      setError(`${unparsed} Preise sind leer oder ungültig. Bitte korrigiere sie vor dem Import.`);
      return;
    }
    setCommitting(true);
    const grouped = new Map<string, BulkRow[]>();
    for (const row of rows) grouped.set(row.category || "Weitere", [...(grouped.get(row.category || "Weitere") ?? []), row]);
    const result = await commitImportAction({
      categories: [...grouped.entries()].map(([name, items]) => ({
        name,
        items: items.map((item) => ({
          name: item.name,
          description: item.description || null,
          priceText: item.priceText,
          allergenCodes: item.allergenCodes.split(/[\s,;/]+/).filter(Boolean),
        })),
      })),
    });
    setCommitting(false);
    if (result.ok) {
      toast(result.message ?? "Übernommen.");
      window.location.href = "/admin/builder";
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <Card className="mt-5 max-w-[860px]">
        <CardHeader>
          <div>
            <CardTitle>Viele Gerichte per Excel oder CSV importieren</CardTitle>
            <p className="mt-1 text-admin-sm text-admin-muted">
              Lade eine Tabelle hoch. Unterstützte Spalten: Kategorie, Gericht, Beschreibung, Preis und Allergene.
            </p>
          </div>
        </CardHeader>
        <CardBody>
        <FormError>{error}</FormError>
        {!rows ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void readFile(file);
              }}
            />
            <button
              type="button"
              disabled={reading}
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-admin-lg border-2 border-dashed border-admin-border-strong px-6 py-8 text-center hover:border-admin-primary hover:bg-admin-primary-soft"
            >
              {reading ? <Loader2 size={23} className="animate-spin text-admin-primary" /> : <Upload size={23} className="text-admin-primary" />}
              <span className="text-admin-base font-semibold text-admin-ink">
                {reading ? "Tabelle wird gelesen…" : "Excel- oder CSV-Datei auswählen"}
              </span>
              <span className="text-admin-sm text-admin-muted">.xlsx, .xls oder .csv · maximal 12 MB</span>
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-admin-sm text-admin-muted">
                <FileSpreadsheet size={16} aria-hidden /> {fileName} · {rows.length} Gerichte
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setRows(null); setFileName(null); setError(null); }} disabled={committing}>Andere Datei</Button>
                <Button onClick={() => void commit()} disabled={committing || rows.length === 0}>
                  {committing ? "Wird übernommen…" : "Alle Gerichte übernehmen"}
                  <ArrowRight size={16} aria-hidden />
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-admin border border-admin-border">
              <table className="w-full min-w-[720px] text-left text-admin-sm">
                <thead className="bg-admin-surface-muted text-admin-muted"><tr><th className="p-2">Kategorie</th><th className="p-2">Gericht</th><th className="p-2">Beschreibung</th><th className="p-2">Preis</th><th className="p-2">Allergene</th><th /></tr></thead>
                <tbody>
                  {rows.map((row, index) => <tr key={row.id} className="border-t border-admin-border align-top">
                    {(["category", "name", "description", "priceText", "allergenCodes"] as const).map((field) => <td key={field} className="p-1.5"><Input value={row[field]} invalid={field === "priceText" && parsePrice(row.priceText) === null} onChange={(event) => setRows((current) => current?.map((item, i) => i === index ? { ...item, [field]: event.target.value } : item) ?? null)} className="h-8 min-w-24" aria-label={field} /></td>)}
                    <td className="p-1.5"><Button variant="ghost" size="icon" aria-label={`${row.name} entfernen`} onClick={() => setRows((current) => current?.filter((_, i) => i !== index) ?? null)}><Trash2 size={15} aria-hidden /></Button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-admin-sm text-admin-muted">Alle importierten Gerichte werden zunächst ausgeblendet. Prüfe sie anschließend im Karten-Builder und veröffentliche sie erst danach.</p>
          </>
        )}
        </CardBody>
      </Card>
      <ChatGPTPrompt />
    </>
  );
}

function ChatGPTPrompt() {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(CHATGPT_CSV_PROMPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card className="mt-5 max-w-[860px]">
      <CardHeader>
        <div>
          <CardTitle>Prompt für ChatGPT</CardTitle>
          <p className="mt-1 text-admin-sm text-admin-muted">
            Foto deiner Speisekarte bei ChatGPT hochladen, diesen Prompt einfügen und die CSV danach hier importieren.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void copy()}>
          {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
          {copied ? "Kopiert" : "Prompt kopieren"}
        </Button>
      </CardHeader>
      <CardBody>
        <textarea
          readOnly
          value={CHATGPT_CSV_PROMPT}
          className="min-h-72 w-full resize-y rounded-admin border border-admin-border bg-admin-surface-muted p-3 font-mono text-admin-sm leading-relaxed text-admin-ink outline-none focus:border-admin-primary focus:shadow-admin-focus"
          aria-label="Prompt für ChatGPT"
        />
      </CardBody>
    </Card>
  );
}

function normaliseHeader(header: string) {
  return header.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[._\-\s]+/g, "");
}

function value(values: Map<string, unknown>, headers: string[]) {
  for (const header of headers) {
    const found = values.get(normaliseHeader(header));
    if (found !== undefined && found !== null && String(found).trim()) return String(found).trim();
  }
  return "";
}
