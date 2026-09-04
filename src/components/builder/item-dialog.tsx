"use client";

import * as React from "react";
import { createItemAction, updateItemAction } from "@/app/actions/menu";
import { AllergenPicker } from "@/components/builder/allergen-picker";
import { DietaryPicker } from "@/components/builder/dietary-picker";
import { ImageField } from "@/components/builder/image-field";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormError } from "@/components/admin/form-error";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import type { BuilderCategory, BuilderItem } from "@/lib/builder-types";
import { priceToInput } from "@/lib/money";

export type ItemDraft = {
  item: BuilderItem | null;
  categoryId: string;
};

const EMPTY: BuilderItem = {
  id: "",
  name: "",
  description: null,
  price: 0,
  oldPrice: null,
  image: null,
  visible: true,
  available: true,
  featured: false,
  isExample: false,
  allergenCodes: [],
  dietaryTagKeys: [],
};

export function ItemDialog({
  draft,
  categories,
  allergens,
  dietaryTags,
  lastUsedAllergens,
  onClose,
  onSaved,
}: {
  draft: ItemDraft | null;
  categories: BuilderCategory[];
  allergens: { code: string; name: string }[];
  dietaryTags: { key: string; name: string; icon: string; color: string }[];
  lastUsedAllergens?: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = Boolean(draft?.item);
  const source = draft?.item ?? EMPTY;

  const [categoryId, setCategoryId] = React.useState(draft?.categoryId ?? "");
  const [name, setName] = React.useState(source.name);
  const [description, setDescription] = React.useState(source.description ?? "");
  const [price, setPrice] = React.useState(priceToInput(source.price));
  const [oldPrice, setOldPrice] = React.useState(
    source.oldPrice === null ? "" : priceToInput(source.oldPrice)
  );
  const [image, setImage] = React.useState(source.image);
  const [visible, setVisible] = React.useState(source.visible);
  const [available, setAvailable] = React.useState(source.available);
  const [featured, setFeatured] = React.useState(source.featured);
  const [allergenCodes, setAllergenCodes] = React.useState(source.allergenCodes);
  const [dietaryTagKeys, setDietaryTagKeys] = React.useState(source.dietaryTagKeys);

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Reset the form whenever a different item is opened.
  React.useEffect(() => {
    if (!draft) return;
    const next = draft.item ?? EMPTY;
    setCategoryId(draft.categoryId);
    setName(next.name);
    setDescription(next.description ?? "");
    setPrice(next.id ? priceToInput(next.price) : "");
    setOldPrice(next.oldPrice === null ? "" : priceToInput(next.oldPrice));
    setImage(next.image);
    setVisible(next.visible);
    setAvailable(next.available);
    setFeatured(next.featured);
    setAllergenCodes(next.allergenCodes);
    setDietaryTagKeys(next.dietaryTagKeys);
    setError(null);
    setFieldErrors({});
  }, [draft]);

  if (!draft) return null;

  const submit = async () => {
    setPending(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("categoryId", categoryId);
    formData.set("name", name);
    formData.set("description", description);
    formData.set("price", price);
    formData.set("oldPrice", oldPrice);
    formData.set("visible", String(visible));
    formData.set("available", String(available));
    formData.set("featured", String(featured));
    allergenCodes.forEach((code) => formData.append("allergenCodes", code));
    dietaryTagKeys.forEach((key) => formData.append("dietaryTagKeys", key));

    const result = draft.item
      ? await updateItemAction(draft.item.id, formData)
      : await createItemAction(null, formData);

    setPending(false);

    if (result.ok) {
      toast(result.message ?? "Gespeichert.");
      onSaved();
      onClose();
    } else {
      setError(result.fieldErrors ? null : result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={isEdit ? "Gericht bearbeiten" : "Neues Gericht"}
      className="sm:max-w-[560px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Abbrechen
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Wird gespeichert…" : "Speichern"}
          </Button>
        </>
      }
    >
      <div className="max-h-[min(60vh,560px)] space-y-4 overflow-y-auto pr-1">
        <FormError>{error}</FormError>

        <Field label="Name" htmlFor="item-name" error={fieldErrors.name}>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Wiener Schnitzel"
            invalid={Boolean(fieldErrors.name)}
            autoFocus
          />
        </Field>

        <Field label="Beschreibung" htmlFor="item-description" hint="optional" error={fieldErrors.description}>
          <Textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kalbsschnitzel, Petersilienkartoffeln, Preiselbeeren"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preis" htmlFor="item-price" error={fieldErrors.price}>
            <Input
              id="item-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="18,90"
              invalid={Boolean(fieldErrors.price)}
            />
          </Field>

          <Field
            label="Streichpreis"
            htmlFor="item-old-price"
            hint="optional"
            error={fieldErrors.oldPrice}
          >
            <Input
              id="item-old-price"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              inputMode="decimal"
              placeholder="—"
              invalid={Boolean(fieldErrors.oldPrice)}
            />
          </Field>
        </div>

        <Field label="Kategorie" htmlFor="item-category" error={fieldErrors.categoryId}>
          <Select
            id="item-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            invalid={Boolean(fieldErrors.categoryId)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        {draft.item ? (
          <ImageField
            kind="item"
            targetId={draft.item.id}
            value={image}
            onChange={setImage}
            label="Bild"
            hint="optional"
          />
        ) : (
          <p className="rounded-admin bg-admin-bg px-3.5 py-3 text-admin-sm text-admin-muted">
            Ein Bild kannst du hinzufügen, sobald das Gericht gespeichert ist.
          </p>
        )}

        <AllergenPicker
          allergens={allergens}
          selected={allergenCodes}
          onChange={setAllergenCodes}
          lastUsed={lastUsedAllergens}
        />

        <DietaryPicker tags={dietaryTags} selected={dietaryTagKeys} onChange={setDietaryTagKeys} />

        <div className="space-y-3 rounded-admin border border-admin-border bg-admin-bg p-3.5">
          <ToggleRow
            label="Auf der Karte sichtbar"
            description="Ausgeblendete Gerichte sieht kein Gast."
            checked={visible}
            onChange={setVisible}
          />
          <ToggleRow
            label="Heute verfügbar"
            description="Aus heißt: sichtbar, aber als ausverkauft markiert."
            checked={available}
            onChange={setAvailable}
          />
          <ToggleRow
            label="Als Empfehlung markieren"
            description="Zeigt ein Badge neben dem Namen."
            checked={featured}
            onChange={setFeatured}
          />
        </div>
      </div>
    </Dialog>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-admin-base font-medium text-admin-ink">{label}</p>
        <p className="text-admin-sm text-admin-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} label={label} />
    </div>
  );
}
