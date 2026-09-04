"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { FormError } from "@/components/admin/form-error";

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin/onboarding");
      router.refresh();
    }
  }, [state, router]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} noValidate>
      <FormError>{state && !state.ok && !state.fieldErrors ? state.error : null}</FormError>

      <div className="space-y-4">
        <Field label="Name des Restaurants" htmlFor="restaurantName" error={fieldErrors?.restaurantName}>
          <Input
            id="restaurantName"
            name="restaurantName"
            required
            placeholder="Café Milano"
            invalid={Boolean(fieldErrors?.restaurantName)}
          />
        </Field>

        <Field label="Dein Name" htmlFor="name" hint="optional" error={fieldErrors?.name}>
          <Input id="name" name="name" autoComplete="name" placeholder="Marco Rossi" />
        </Field>

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

        <Field
          label="Passwort"
          htmlFor="password"
          hint="mind. 8 Zeichen"
          error={fieldErrors?.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            invalid={Boolean(fieldErrors?.password)}
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
        {pending ? "Wird angelegt…" : "Restaurant anlegen"}
      </Button>
    </form>
  );
}
