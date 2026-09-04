"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { FormError } from "@/components/admin/form-error";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin");
      router.refresh();
    }
  }, [state, router]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} noValidate>
      <FormError>{state && !state.ok && !state.fieldErrors ? state.error : null}</FormError>

      <div className="space-y-4">
        <Field label="E-Mail" htmlFor="email" error={fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@restaurant.de"
            invalid={Boolean(fieldErrors?.email)}
          />
        </Field>

        <Field label="Passwort" htmlFor="password" error={fieldErrors?.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            invalid={Boolean(fieldErrors?.password)}
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
        {pending ? "Wird angemeldet…" : "Anmelden"}
      </Button>

      <p className="mt-5 rounded-admin bg-admin-bg px-3.5 py-3 text-admin-sm text-admin-muted">
        <span className="font-semibold text-admin-ink-2">Demo-Zugang:</span> demo@cafe-milano.de ·
        demo1234
      </p>
    </form>
  );
}
