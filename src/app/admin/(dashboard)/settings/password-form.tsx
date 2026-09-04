"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction } from "@/app/actions/auth";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function PasswordForm() {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(changePasswordAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast(state.message ?? "Passwort geändert.");
      formRef.current?.reset();
    }
  }, [state, toast]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form ref={formRef} action={formAction} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <FormError>{state && !state.ok && !state.fieldErrors ? state.error : null}</FormError>

          <Field
            label="Aktuelles Passwort"
            htmlFor="currentPassword"
            error={fieldErrors?.currentPassword}
          >
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              invalid={Boolean(fieldErrors?.currentPassword)}
            />
          </Field>

          <Field
            label="Neues Passwort"
            htmlFor="newPassword"
            hint="mind. 8 Zeichen"
            error={fieldErrors?.newPassword}
          >
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              invalid={Boolean(fieldErrors?.newPassword)}
            />
          </Field>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Wird geändert…" : "Passwort ändern"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
