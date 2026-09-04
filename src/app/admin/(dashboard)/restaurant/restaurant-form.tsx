"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateRestaurantAction } from "@/app/actions/restaurant";
import { FormError } from "@/components/admin/form-error";
import { ImageField } from "@/components/builder/image-field";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CURRENCIES } from "@/lib/constants";

type Restaurant = {
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  currency: string;
  logo: string | null;
  coverImage: string | null;
};

export function RestaurantForm({
  restaurant,
  origin,
}: {
  restaurant: Restaurant;
  origin: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [state, formAction, pending] = useActionState(updateRestaurantAction, null);
  const [logo, setLogo] = React.useState(restaurant.logo);
  const [cover, setCover] = React.useState(restaurant.coverImage);
  const [slug, setSlug] = React.useState(restaurant.slug);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast(state.message ?? "Gespeichert.");
      router.refresh();
    } else if (!state.fieldErrors) {
      toast(state.error, "error");
    }
  }, [state, toast, router]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const slugChanged = slug !== restaurant.slug;

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormError>{state && !state.ok && !state.fieldErrors ? state.error : null}</FormError>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="Name" htmlFor="name" error={fieldErrors?.name}>
            <Input
              id="name"
              name="name"
              defaultValue={restaurant.name}
              required
              invalid={Boolean(fieldErrors?.name)}
            />
          </Field>

          <Field
            label="Adresse der Speisekarte"
            htmlFor="slug"
            hint="erscheint im QR-Code"
            error={fieldErrors?.slug}
          >
            <div className="flex items-center gap-0 overflow-hidden rounded-admin border border-admin-border-strong bg-white focus-within:border-admin-primary focus-within:shadow-admin-focus">
              <span className="shrink-0 border-r border-admin-border bg-admin-bg px-3 py-2.5 font-mono text-admin-sm text-admin-muted">
                {origin.replace(/^https?:\/\//, "")}/menu/
              </span>
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                spellCheck={false}
                className="h-10 min-w-0 flex-1 bg-transparent px-3 font-mono text-[16px] outline-none"
              />
            </div>
            {slugChanged ? (
              <p className="mt-1.5 flex items-start gap-1.5 text-admin-sm text-admin-warning">
                Achtung: Bereits gedruckte QR-Codes zeigen nach dem Speichern ins Leere.
              </p>
            ) : null}
          </Field>

          <Field
            label="Beschreibung"
            htmlFor="description"
            hint="optional"
            error={fieldErrors?.description}
          >
            <Textarea
              id="description"
              name="description"
              defaultValue={restaurant.description ?? ""}
              placeholder="Italienische Küche im Herzen der Stadt."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Adresse" htmlFor="address" hint="optional" error={fieldErrors?.address}>
              <Input id="address" name="address" defaultValue={restaurant.address ?? ""} />
            </Field>
            <Field label="Telefon" htmlFor="phone" hint="optional" error={fieldErrors?.phone}>
              <Input id="phone" name="phone" type="tel" defaultValue={restaurant.phone ?? ""} />
            </Field>
          </div>

          <Field label="Website" htmlFor="website" hint="optional" error={fieldErrors?.website}>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://…"
              defaultValue={restaurant.website ?? ""}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Erscheinungsbild</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField
              kind="logo"
              value={logo}
              onChange={setLogo}
              label="Logo"
              hint="quadratisch"
            />
            <ImageField
              kind="cover"
              value={cover}
              onChange={setCover}
              label="Titelbild"
              hint="16:9"
              aspect="wide"
            />
          </div>

          <Field label="Währung" htmlFor="currency" error={fieldErrors?.currency}>
            <Select id="currency" name="currency" defaultValue={restaurant.currency}>
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.label}
                </option>
              ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Wird gespeichert…" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  );
}
