"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, Unlock } from "lucide-react";
import { liftSuspensionAction, suspendTenantAction } from "@/app/actions/platform";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

type Props = {
  restaurantId: string;
  restaurantName: string;
  /** Resolved on the server with the end date already taken into account. */
  suspended: boolean;
  /** Pre-formatted in the platform's zone, so client and server cannot disagree. */
  since: string | null;
  until: string | null;
  reason: string | null;
  /** Earliest selectable end date (YYYY-MM-DD), i.e. tomorrow in the platform's zone. */
  minDate: string;
};

export function SuspensionCard(props: Props) {
  return props.suspended ? <ActiveSuspension {...props} /> : <SuspendForm {...props} />;
}

function ActiveSuspension({ restaurantId, since, until, reason }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [lifting, setLifting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <Card className="mt-5 border-admin-danger/30">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Ban size={17} strokeWidth={1.75} aria-hidden className="text-admin-danger" />
            Kunde ist gesperrt
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
              Seit
            </dt>
            <dd className="mt-1 text-admin-base text-admin-ink">{since ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
              Ende
            </dt>
            <dd className="mt-1 text-admin-base text-admin-ink">
              {until ? `automatisch am ${until}` : "bis du sie aufhebst"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-[0.08em] text-admin-muted uppercase">
              Grund
            </dt>
            <dd className="mt-1 text-admin-base break-words text-admin-ink">
              {reason ?? <span className="text-admin-muted">nicht angegeben</span>}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-admin-sm text-admin-muted">
          Der Wirt kann sich nicht anmelden, und Gäste sehen statt der Karte einen neutralen
          Hinweis. Gerichte, Einstellungen und QR-Codes bleiben unverändert erhalten.
        </p>

        <FormError>{error}</FormError>
        <Button
          variant="secondary"
          className="mt-4"
          disabled={lifting}
          onClick={async () => {
            setLifting(true);
            setError(null);
            const result = await liftSuspensionAction(restaurantId);
            if (result.ok) {
              toast(result.message ?? "Sperre aufgehoben.");
              router.refresh();
            } else {
              setError(result.error);
            }
            setLifting(false);
          }}
        >
          <Unlock size={16} strokeWidth={1.75} aria-hidden />
          {lifting ? "Wird aufgehoben…" : "Sperre aufheben"}
        </Button>
      </CardBody>
    </Card>
  );
}

function SuspendForm({ restaurantId, restaurantName, minDate }: Props) {
  const router = useRouter();
  const toast = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [state, action, pending] = React.useActionState(suspendTenantAction, null);

  React.useEffect(() => {
    if (state?.ok) {
      setConfirmOpen(false);
      toast(state.message ?? "Kunde gesperrt.");
      router.refresh();
    } else if (state && !state.ok) {
      // Field errors belong next to the fields, which the dialog is covering.
      setConfirmOpen(false);
    }
  }, [state, router, toast]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Vorübergehend sperren</CardTitle>
      </CardHeader>
      <CardBody>
        <p className="text-admin-base text-admin-muted">
          Sperrt den Zugang des Wirts und nimmt die Gastkarte offline — zum Beispiel bei einer
          offenen Rechnung. Nichts wird gelöscht: Nach dem Entsperren ist alles wie vorher, und
          gedruckte QR-Codes funktionieren wieder.
        </p>

        <form
          ref={formRef}
          action={action}
          className="mt-4 grid gap-4 sm:grid-cols-2"
          noValidate
          onSubmit={(e) => {
            // The real submit comes from the dialog; Enter in a field opens it.
            if (!confirmOpen) {
              e.preventDefault();
              setConfirmOpen(true);
            }
          }}
        >
          <input type="hidden" name="restaurantId" value={restaurantId} />
          <div className="sm:col-span-2">
            <FormError>{state && !state.ok && !fieldErrors ? state.error : null}</FormError>
          </div>

          <Field
            label="Automatisch entsperren am"
            htmlFor="until"
            hint="optional"
            error={fieldErrors?.until}
          >
            <Input
              id="until"
              name="until"
              type="date"
              min={minDate}
              invalid={Boolean(fieldErrors?.until)}
            />
          </Field>

          <Field label="Grund" htmlFor="reason" hint="nur für dich sichtbar" error={fieldErrors?.reason}>
            <Input
              id="reason"
              name="reason"
              maxLength={200}
              placeholder="z. B. Rechnung März offen"
              autoComplete="off"
              invalid={Boolean(fieldErrors?.reason)}
            />
          </Field>

          <div className="sm:col-span-2">
            <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
              <Ban size={16} strokeWidth={1.75} aria-hidden />
              Kunde sperren
            </Button>
          </div>
        </form>
      </CardBody>

      <Dialog
        open={confirmOpen}
        onClose={() => (pending ? undefined : setConfirmOpen(false))}
        title={`${restaurantName} sperren?`}
      >
        <p className="text-admin-base text-admin-muted">
          Ab sofort sehen Gäste beim Scannen nur „Die Speisekarte ist gerade nicht verfügbar". Der
          Wirt wird abgemeldet und kann sich nicht mehr anmelden, bis die Sperre endet.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" disabled={pending} onClick={() => setConfirmOpen(false)}>
            Abbrechen
          </Button>
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => formRef.current?.requestSubmit()}
          >
            {pending ? "Wird gesperrt…" : "Jetzt sperren"}
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
