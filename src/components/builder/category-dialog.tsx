"use client";

import * as React from "react";
import { createCategoryAction, updateCategoryAction } from "@/app/actions/menu";
import { CategoryIcon } from "@/components/menu/category-icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FormError } from "@/components/admin/form-error";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { BuilderCategory } from "@/lib/builder-types";
import { cn } from "@/lib/utils";

export function CategoryDialog({
  open,
  category,
  onClose,
  onSaved,
}: {
  open: boolean;
  category: BuilderCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = React.useState(category?.name ?? "");
  const [description, setDescription] = React.useState(category?.description ?? "");
  const [icon, setIcon] = React.useState(category?.icon ?? "");
  const [active, setActive] = React.useState(category?.active ?? true);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setIcon(category?.icon ?? "");
    setActive(category?.active ?? true);
    setError(null);
    setFieldErrors({});
  }, [open, category]);

  if (!open) return null;

  const submit = async () => {
    setPending(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("icon", icon);
    formData.set("active", String(active));

    const result = category
      ? await updateCategoryAction(category.id, formData)
      : await createCategoryAction(null, formData);

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
      title={category ? "Kategorie bearbeiten" : "Neue Kategorie"}
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
      <div className="space-y-4">
        <FormError>{error}</FormError>

        <Field label="Name" htmlFor="category-name" error={fieldErrors.name}>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vorspeisen"
            invalid={Boolean(fieldErrors.name)}
            autoFocus
          />
        </Field>

        <Field
          label="Beschreibung"
          htmlFor="category-description"
          hint="optional"
          error={fieldErrors.description}
        >
          <Textarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Zum Ankommen und Teilen"
          />
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-admin-sm font-medium text-admin-ink-2">
            Symbol <span className="font-normal text-admin-muted">optional</span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            <IconChoice
              active={icon === ""}
              onClick={() => setIcon("")}
              label="Kein Symbol"
            >
              <span className="text-admin-sm">—</span>
            </IconChoice>
            {CATEGORY_ICONS.map((key) => (
              <IconChoice
                key={key}
                active={icon === key}
                onClick={() => setIcon(key)}
                label={`Symbol ${key}`}
              >
                <CategoryIcon icon={key} size={18} />
              </IconChoice>
            ))}
          </div>
        </fieldset>

        <div className="flex items-start justify-between gap-4 rounded-admin border border-admin-border bg-admin-bg p-3.5">
          <div>
            <p className="text-admin-base font-medium text-admin-ink">Auf der Karte sichtbar</p>
            <p className="text-admin-sm text-admin-muted">
              Versteckte Kategorien und ihre Gerichte sieht kein Gast.
            </p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} label="Auf der Karte sichtbar" />
        </div>
      </div>
    </Dialog>
  );
}

function IconChoice({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-10 items-center justify-center rounded-admin border transition-colors duration-[var(--dur-fast)]",
        active
          ? "border-admin-primary bg-admin-primary-soft text-admin-primary"
          : "border-admin-border-strong bg-white text-admin-muted hover:bg-[#f9fafb]"
      )}
    >
      {children}
    </button>
  );
}
