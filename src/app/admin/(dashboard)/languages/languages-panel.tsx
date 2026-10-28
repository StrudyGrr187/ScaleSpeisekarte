"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { setMenuLanguagesAction, translateMenuAction } from "@/app/actions/languages";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { TARGET_LANGUAGES, type TargetLanguage } from "@/lib/languages";
import type { TranslationOverview } from "@/lib/translation";

export function LanguagesPanel({
  enabled: savedEnabled,
  overview,
  slug,
  aiReady,
}: {
  enabled: TargetLanguage[];
  overview: TranslationOverview;
  slug: string;
  aiReady: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  const [enabled, setEnabled] = React.useState(savedEnabled);
  const [saving, setSaving] = React.useState(false);
  const [translating, setTranslating] = React.useState(false);
  React.useEffect(() => setEnabled(savedEnabled), [savedEnabled]);

  const doneByCode = new Map(overview.languages.map((l) => [l.code, l.done]));
  const missing = overview.languages.reduce((sum, l) => sum + (overview.total - l.done), 0);

  const translate = async () => {
    setTranslating(true);
    const result = await translateMenuAction();
    setTranslating(false);
    if (result.ok) {
      toast(result.message ?? "Übersetzt.", result.data.failed > 0 ? "info" : "success");
    } else {
      toast(result.error, "error");
    }
    router.refresh();
  };

  const toggle = async (code: TargetLanguage, on: boolean) => {
    const previous = enabled;
    const next = on ? [...enabled, code] : enabled.filter((c) => c !== code);
    setEnabled(next);
    setSaving(true);
    const result = await setMenuLanguagesAction(next);
    setSaving(false);

    if (!result.ok) {
      setEnabled(previous);
      toast(result.error, "error");
      return;
    }
    router.refresh();
    // A language that is switched on should not sit there half-German.
    if (on && aiReady) void translate();
  };

  return (
    <div className="grid max-w-[900px] gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Sprachen der Gästekarte</CardTitle>
          <Badge variant="adminNeutral">{enabled.length + 1} aktiv</Badge>
        </CardHeader>
        <CardBody className="py-2">
          <ul className="divide-y divide-admin-border">
            <li className="flex min-h-14 items-center justify-between gap-4 py-2.5">
              <div>
                <p className="text-admin-base font-medium text-admin-ink">Deutsch</p>
                <p className="text-admin-sm text-admin-muted">Hier schreibst du die Karte</p>
              </div>
              <Badge variant="adminNeutral">Original</Badge>
            </li>

            {TARGET_LANGUAGES.map((language) => {
              const on = enabled.includes(language.code);
              const done = doneByCode.get(language.code);
              return (
                <li
                  key={language.code}
                  className="flex min-h-14 items-center justify-between gap-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-admin-base font-medium text-admin-ink">
                      {language.germanLabel}
                      <span className="ml-2 font-normal text-admin-muted" lang={language.htmlLang}>
                        {language.label}
                      </span>
                    </p>
                    {on && done !== undefined && overview.total > 0 ? (
                      done >= overview.total ? (
                        <p className="flex items-center gap-1 text-admin-sm text-admin-success">
                          <Check size={14} strokeWidth={2} aria-hidden />
                          Übersetzt
                        </p>
                      ) : (
                        <p className="text-admin-sm text-admin-warning">
                          {done} von {overview.total} Texten übersetzt
                        </p>
                      )
                    ) : null}
                  </div>
                  <Switch
                    checked={on}
                    onCheckedChange={(next) => toggle(language.code, next)}
                    disabled={saving}
                    label={`${language.germanLabel} anbieten`}
                  />
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Übersetzung</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {!aiReady ? (
              <p className="flex gap-2 rounded-admin border border-admin-warning/25 bg-admin-warning-soft px-3.5 py-3 text-admin-base text-admin-warning">
                <AlertTriangle size={18} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
                Die KI ist auf diesem Server nicht eingerichtet. Gerichte bleiben deshalb auf
                Deutsch, nur feste Texte wie „Allergene“ erscheinen übersetzt.
              </p>
            ) : enabled.length === 0 ? (
              <p className="text-admin-base text-admin-muted">
                Schalte links eine Sprache ein. Die Karte wird dann sofort übersetzt.
              </p>
            ) : (
              <>
                <p className="text-admin-base text-admin-ink">
                  {translating
                    ? "Wird übersetzt …"
                    : missing === 0
                      ? "Alle Texte sind übersetzt."
                      : `${missing} Übersetzungen fehlen oder sind veraltet.`}
                </p>
                <Button
                  variant="secondary"
                  onClick={translate}
                  disabled={translating || missing === 0}
                >
                  {translating ? (
                    <Loader2 size={16} strokeWidth={1.75} aria-hidden className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} strokeWidth={1.75} aria-hidden />
                  )}
                  Jetzt übersetzen
                </Button>
              </>
            )}

            <p className="text-admin-sm text-admin-muted">
              Geänderte Gerichte werden nach dem Speichern automatisch neu übersetzt. Bis dahin
              sehen Gäste an dieser Stelle den deutschen Text — nie eine veraltete Übersetzung.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <p className="text-admin-base font-semibold text-admin-ink">So sehen es Gäste</p>
            <p className="text-admin-sm text-admin-muted">
              Die Karte öffnet sich in der Sprache des Handys, sonst auf Deutsch. Oben rechts
              kann jeder Gast wechseln. Übersetzte Karten tragen den Hinweis, bei Allergien das
              Personal zu fragen.
            </p>
            {enabled.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {enabled.map((code) => (
                  <a
                    key={code}
                    href={`/menu/${slug}?lang=${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("ghost", "sm", "font-mono uppercase")}
                  >
                    {code}
                    <ExternalLink size={13} strokeWidth={1.75} aria-hidden />
                  </a>
                ))}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
