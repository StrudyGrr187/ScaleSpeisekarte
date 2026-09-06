"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, RefreshCw } from "lucide-react";
import { createTenantAction } from "@/app/actions/platform";
import { FormError } from "@/components/admin/form-error";
import { CopyButton } from "@/components/admin/copy-button";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

/** Readable, unambiguous, and long enough to be worth handing over as-is. */
function generatePassword(): string {
  // No l/I/1/0/O — these get misread when the password is dictated or written down.
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function CreateTenantForm() {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(createTenantAction, null);
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Generated on the client after mount: doing it during render would make the
  // server and client markup disagree.
  React.useEffect(() => setPassword(generatePassword()), []);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok) {
    return (
      <Card className="max-w-[560px]">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Check size={17} strokeWidth={2} aria-hidden className="text-admin-success" />
              Kunde angelegt
            </span>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-admin-base text-admin-muted">
            Diese Zugangsdaten werden nur jetzt angezeigt — das Passwort ist ab sofort nur noch
            als Hash gespeichert und lässt sich nicht wieder auslesen, nur neu setzen.
          </p>

          <dl className="mt-4 space-y-2">
            <div className="rounded-admin border border-admin-border bg-admin-bg px-3.5 py-3">
              <dt className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
                E-Mail
              </dt>
              <dd className="mt-1 font-mono text-admin-sm break-all text-admin-ink-2">{email}</dd>
            </div>
            <div className="rounded-admin border border-admin-border bg-admin-bg px-3.5 py-3">
              <dt className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
                Passwort
              </dt>
              <dd className="mt-1 font-mono text-admin-sm break-all text-admin-ink-2">
                {password}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value={`${email}\n${password}`} label="Zugangsdaten kopieren" />
            <Link href="/platform" className={buttonClasses("secondary", "md")}>
              Zur Kundenliste
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <form
      action={(formData) => {
        setEmail(String(formData.get("email") ?? "").toLowerCase());
        formAction(formData);
        router.refresh();
      }}
      noValidate
      className="max-w-[560px]"
    >
      <Card>
        <CardHeader>
          <CardTitle>Restaurant und Zugang</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <FormError>{state && !state.ok && !state.fieldErrors ? state.error : null}</FormError>

          <Field
            label="Name des Restaurants"
            htmlFor="restaurantName"
            hint="Die öffentliche Adresse wird daraus abgeleitet"
            error={fieldErrors?.restaurantName}
          >
            <Input
              id="restaurantName"
              name="restaurantName"
              required
              maxLength={80}
              autoComplete="off"
              invalid={Boolean(fieldErrors?.restaurantName)}
            />
          </Field>

          <Field label="Ansprechpartner" htmlFor="name" hint="optional" error={fieldErrors?.name}>
            <Input id="name" name="name" maxLength={80} autoComplete="off" />
          </Field>

          <Field label="E-Mail für den Login" htmlFor="email" error={fieldErrors?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              invalid={Boolean(fieldErrors?.email)}
            />
          </Field>

          <Field
            label="Passwort"
            htmlFor="password"
            hint="mind. 8 Zeichen — vorgeschlagen und sofort brauchbar"
            error={fieldErrors?.password}
          >
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
                invalid={Boolean(fieldErrors?.password)}
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

          <div className="flex justify-end gap-2">
            <Link href="/platform" className={buttonClasses("ghost", "md")}>
              Abbrechen
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? "Wird angelegt…" : "Kunde anlegen"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
