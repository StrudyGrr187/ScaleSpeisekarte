"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Sparkles, Undo2 } from "lucide-react";
import { suggestThemeAction } from "@/app/actions/ai";
import { applyLookAction } from "@/app/actions/restaurant";
import { PhonePreview } from "@/components/builder/phone-preview";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { builderToPublic, type BuilderData } from "@/lib/builder-types";
import { contrastRatio, deriveAccentTokens, normalizeHex } from "@/lib/color";
import { FONT_PAIRS, type FontPairKey } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ThemeCard } from "./theme-card";

const PRESET_COLORS = [
  "#b4472a",
  "#b91c1c",
  "#a16207",
  "#15803d",
  "#0f766e",
  "#1e3a8a",
  "#6d28d9",
  "#1c1917",
];

type Look = {
  menuTheme: "MODERN" | "CLASSIC";
  fontPair: FontPairKey;
  primaryColor: string;
};

export function DesignPanel({ data, aiReady }: { data: BuilderData; aiReady: boolean }) {
  const router = useRouter();
  const toast = useToast();

  const saved: Look = React.useMemo(
    () => ({
      menuTheme: data.restaurant.menuTheme,
      fontPair: (data.restaurant.fontPair as FontPairKey) ?? "playfair-karla",
      primaryColor: data.restaurant.primaryColor,
    }),
    [data.restaurant]
  );

  const [look, setLook] = React.useState<Look>(saved);
  React.useEffect(() => setLook(saved), [saved]);

  const [prompt, setPrompt] = React.useState("");
  const [suggesting, setSuggesting] = React.useState(false);
  const [rationale, setRationale] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const dirty =
    look.menuTheme !== saved.menuTheme ||
    look.fontPair !== saved.fontPair ||
    look.primaryColor.toLowerCase() !== saved.primaryColor.toLowerCase();

  // The preview renders the guest menu through the same components as the
  // public route, with the *pending* look applied — nothing is saved yet.
  const preview = React.useMemo(() => {
    const base = builderToPublic(data);
    return {
      ...base,
      restaurant: {
        ...base.restaurant,
        primaryColor: look.primaryColor,
        menuTheme: look.menuTheme,
        fontPair: look.fontPair,
      },
    };
  }, [data, look]);

  const normalized = normalizeHex(look.primaryColor);
  const weakAccent = normalized ? contrastRatio(normalized, "#ffffff") < 3 : false;
  const tokens = deriveAccentTokens(normalized ?? saved.primaryColor);

  const suggest = async () => {
    setSuggesting(true);
    setRationale(null);
    const result = await suggestThemeAction(prompt);
    setSuggesting(false);

    if (!result.ok) {
      toast(result.error, "error");
      return;
    }

    setLook({
      menuTheme: result.data.menuTheme,
      fontPair: result.data.fontPair,
      primaryColor: result.data.accentColor,
    });
    setRationale(result.data.rationale);
    if (result.data.colorAdjusted) {
      toast("Die vorgeschlagene Farbe war unbrauchbar und wurde ersetzt.", "info");
    }
  };

  const save = async () => {
    setSaving(true);
    const result = await applyLookAction(look);
    setSaving(false);
    if (result.ok) {
      toast(result.message ?? "Gespeichert.");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0 space-y-5">
        {aiReady ? (
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Sparkles size={17} strokeWidth={1.75} aria-hidden className="text-admin-primary" />
                  Look von der KI vorschlagen lassen
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <p className="mb-3 text-admin-base text-admin-muted">
                Beschreibe dein Lokal in einem Satz. Die KI schlägt Farbe, Schrift und Theme vor —
                übernommen wird nichts, bis du speicherst.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="z. B. gemütliche Weinbar mit offener Küche, warm und unaufgeregt"
                  maxLength={500}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && prompt.trim() && !suggesting) {
                      e.preventDefault();
                      void suggest();
                    }
                  }}
                />
                <Button
                  onClick={suggest}
                  disabled={suggesting || prompt.trim().length < 3}
                  className="shrink-0"
                >
                  {suggesting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      Denkt nach…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} strokeWidth={2} aria-hidden />
                      Vorschlag
                    </>
                  )}
                </Button>
              </div>

              {rationale ? (
                <p className="mt-3 rounded-admin border border-admin-primary-border bg-admin-primary-soft px-3.5 py-3 text-admin-base text-[#3730a3]">
                  {rationale}
                </p>
              ) : null}
            </CardBody>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Darstellung</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["MODERN", "CLASSIC"] as const).map((theme) => (
                <ThemeCard
                  key={theme}
                  theme={theme}
                  active={look.menuTheme === theme}
                  accent={tokens.accent}
                  onSelect={() => setLook((l) => ({ ...l, menuTheme: theme }))}
                />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schrift</CardTitle>
          </CardHeader>
          <CardBody>
            {look.menuTheme === "CLASSIC" ? (
              <p className="mb-4 rounded-admin border border-admin-border bg-admin-bg px-3.5 py-3 text-admin-base text-admin-muted">
                „Klassisch" setzt Name, Beschreibung und Preis bewusst in einer einzigen
                Buchschrift (EB Garamond) — so wie eine gedruckte Karte. Die Auswahl unten wirkt
                nur im Theme „Modern".
              </p>
            ) : null}
            <ul
              className={cn(
                "grid gap-2 sm:grid-cols-2",
                look.menuTheme === "CLASSIC" && "opacity-55"
              )}
            >
              {FONT_PAIRS.map((pair) => {
                const active = look.fontPair === pair.key;
                return (
                  <li key={pair.key}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setLook((l) => ({ ...l, fontPair: pair.key }))}
                      className={cn(
                        "w-full rounded-admin border p-3 text-left transition-colors duration-[var(--dur-fast)]",
                        active
                          ? "border-admin-primary bg-admin-primary-soft"
                          : "border-admin-border-strong bg-white hover:bg-[#f9fafb]"
                      )}
                    >
                      <span
                        className="block text-[20px] leading-tight text-admin-ink"
                        style={{ fontFamily: `var(${pair.displayVar}), Georgia, serif` }}
                      >
                        Speisekarte
                      </span>
                      <span
                        className="mt-0.5 block text-admin-base text-admin-ink-2"
                        style={{ fontFamily: `var(${pair.bodyVar}), system-ui, sans-serif` }}
                      >
                        Wiener Schnitzel · 18,90 €
                      </span>
                      <span className="mt-1.5 block text-admin-sm text-admin-muted">
                        {pair.mood}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Akzentfarbe</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={normalized ?? "#b4472a"}
                aria-label="Akzentfarbe als Farbwähler"
                onChange={(e) => setLook((l) => ({ ...l, primaryColor: e.target.value }))}
                className="size-10 shrink-0 cursor-pointer rounded-admin border border-admin-border-strong bg-white p-1"
              />
              <input
                value={look.primaryColor}
                aria-label="Akzentfarbe als Hex-Wert"
                spellCheck={false}
                onChange={(e) => setLook((l) => ({ ...l, primaryColor: e.target.value }))}
                className="h-10 w-32 rounded-admin border border-admin-border-strong bg-white px-3 font-mono text-[16px] uppercase outline-none focus:border-admin-primary focus:shadow-admin-focus"
              />
              <span className="flex items-center gap-1.5" aria-hidden>
                <span
                  className="flex h-7 items-center rounded-full px-3 text-[12px] font-bold tracking-[0.06em] uppercase"
                  style={{ backgroundColor: tokens.accent, color: tokens.ink }}
                >
                  Chip
                </span>
                <span
                  className="flex h-7 items-center rounded-full px-3 text-[12px] font-bold tracking-[0.06em] uppercase"
                  style={{ backgroundColor: tokens.soft, color: tokens.text }}
                >
                  Badge
                </span>
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={`Farbe ${preset}`}
                  onClick={() => setLook((l) => ({ ...l, primaryColor: preset }))}
                  className={cn(
                    "size-7 rounded-full border-2",
                    normalized === preset ? "border-admin-ink" : "border-transparent"
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>

            {!normalized ? (
              <p className="mt-2 text-admin-sm text-admin-danger">
                Ungültiger Farbwert. Bitte im Format #B4472A angeben.
              </p>
            ) : weakAccent ? (
              <p className="mt-2 flex items-start gap-1.5 text-admin-sm text-admin-warning">
                <AlertTriangle size={14} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
                Sehr helle Farbe. Texte werden automatisch abgedunkelt, als Akzent wirkt sie aber
                schwach.
              </p>
            ) : null}
          </CardBody>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-admin-sm text-admin-muted">
            {dirty ? "Noch nicht gespeichert." : "Alles gespeichert."}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setLook(saved)} disabled={!dirty || saving}>
              <Undo2 size={16} strokeWidth={1.75} aria-hidden />
              Verwerfen
            </Button>
            <Button onClick={save} disabled={!dirty || saving || !normalized}>
              {saving ? "Wird gespeichert…" : "Look speichern"}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden xl:block">
        <PhonePreview menu={preview} focusedItemId={null} />
      </div>
    </div>
  );
}
