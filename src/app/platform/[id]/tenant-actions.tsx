"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogIn, RefreshCw, Trash2 } from "lucide-react";
import {
  deleteTenantAction,
  impersonateAction,
  setTenantPasswordAction,
} from "@/app/actions/platform";
import { FormError } from "@/components/admin/form-error";
import { CopyButton } from "@/components/admin/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

function generatePassword(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function TenantActions({
  restaurantId,
  restaurantName,
  ownerId,
  ownerEmail,
}: {
  restaurantId: string;
  restaurantName: string;
  ownerId: string | null;
  ownerEmail: string | null;
}) {
  const router = useRouter();
  const toast = useToast();

  const [password, setPassword] = React.useState("");
  const [issued, setIssued] = React.useState<string | null>(null);
  const [pwState, pwAction, pwPending] = React.useActionState(setTenantPasswordAction, null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmName, setConfirmName] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => setPassword(generatePassword()), []);

  React.useEffect(() => {
    if (pwState?.ok) {
      // Show it once — it is unreadable from the database from here on.
      setIssued(password);
      toast(pwState.message ?? "Neues Passwort gesetzt.");
    }
  }, [pwState, password, toast]);

  return (
    <>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Im Konto arbeiten</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-admin-base text-admin-muted">
              Öffnet die Speisekarte dieses Kunden in der normalen Verwaltung — dieselben Werkzeuge,
              die der Kunde selbst hat. Ein Banner erinnert dich daran, in wessen Konto du bist.
            </p>
            <form action={() => impersonateAction(restaurantId)} className="mt-4">
              <Button type="submit">
                <LogIn size={16} strokeWidth={1.75} aria-hidden />
                Karte von {restaurantName} bearbeiten
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passwort neu setzen</CardTitle>
          </CardHeader>
          <CardBody>
            {ownerId === null ? (
              <p className="text-admin-base text-admin-muted">
                Kein Login-Konto vorhanden — es gibt nichts zurückzusetzen.
              </p>
            ) : issued ? (
              <>
                <p className="text-admin-base text-admin-muted">
                  Neues Passwort für <span className="font-mono">{ownerEmail}</span>. Es wird nur
                  jetzt angezeigt.
                </p>
                <p className="mt-3 rounded-admin border border-admin-border bg-admin-bg px-3.5 py-3 font-mono text-admin-sm break-all text-admin-ink-2">
                  {issued}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton
                    value={`${ownerEmail}\n${issued}`}
                    label="Zugangsdaten kopieren"
                    size="sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIssued(null);
                      setPassword(generatePassword());
                    }}
                  >
                    Fertig
                  </Button>
                </div>
              </>
            ) : (
              <form action={pwAction} className="space-y-3" noValidate>
                <input type="hidden" name="userId" value={ownerId} />
                <FormError>{pwState && !pwState.ok ? pwState.error : null}</FormError>
                <Field label="Neues Passwort" htmlFor="password" hint="mind. 8 Zeichen">
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="off"
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setPassword(generatePassword())}
                      aria-label="Neues Passwort vorschlagen"
                      className="shrink-0"
                    >
                      <RefreshCw size={16} strokeWidth={1.75} aria-hidden />
                    </Button>
                  </div>
                </Field>
                <Button type="submit" disabled={pwPending}>
                  {pwPending ? "Wird gesetzt…" : "Passwort setzen"}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5 border-admin-danger/25">
        <CardHeader>
          <CardTitle>Kunde löschen</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-admin-base text-admin-muted">
            Löscht das Restaurant mit Karte, Gerichten und allen Zugängen. Gedruckte QR-Codes
            zeigen danach ins Leere. Das lässt sich nicht rückgängig machen.
          </p>
          <Button variant="danger" className="mt-4" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={16} strokeWidth={1.75} aria-hidden />
            Kunde löschen
          </Button>
        </CardBody>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`${restaurantName} löschen?`}
      >
        <p className="text-admin-base text-admin-muted">
          Tippe zur Bestätigung den Namen des Restaurants ein. Karte, Gerichte, Bilder und Zugänge
          werden entfernt.
        </p>
        <FormError>{deleteError}</FormError>
        <Field label="Name des Restaurants" htmlFor="confirmName" className="mt-4">
          <Input
            id="confirmName"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            autoComplete="off"
            placeholder={restaurantName}
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            disabled={confirmName.trim() !== restaurantName || deleting}
            onClick={async () => {
              setDeleting(true);
              setDeleteError(null);
              const result = await deleteTenantAction(restaurantId);
              if (result.ok) {
                router.push("/platform");
                router.refresh();
              } else {
                setDeleteError(result.error);
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Wird gelöscht…" : "Endgültig löschen"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
