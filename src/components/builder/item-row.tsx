"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Pencil, Star, Trash2 } from "lucide-react";
import { InlineEdit } from "@/components/builder/inline-edit";
import { Dropdown } from "@/components/ui/dropdown";
import type { BuilderItem } from "@/lib/builder-types";
import { formatPrice, priceToInput } from "@/lib/money";
import { cn } from "@/lib/utils";

export type ItemRowActions = {
  onRename: (itemId: string, name: string) => void;
  onRepriceInline: (itemId: string, value: string) => void;
  onToggleAvailable: (itemId: string, next: boolean) => void;
  onEdit: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onFocusItem: (itemId: string) => void;
};

export function ItemRow({
  item,
  currency,
  locale,
  actions,
}: {
  item: BuilderItem;
  currency: string;
  locale: string;
  actions: ItemRowActions;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: "item" },
  });

  const soldOut = !item.available;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex h-14 items-center gap-3 border-b border-admin-border px-3 last:border-b-0",
        "transition-colors duration-[var(--dur-fast)] hover:bg-[#f9fafb]",
        isDragging && "opacity-35",
        soldOut && "opacity-55",
        !item.visible && "bg-[#fcfcfd]"
      )}
    >
      <button
        type="button"
        aria-label={`${item.name}: Position ändern`}
        className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-admin text-admin-border-strong hover:text-admin-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} strokeWidth={1.75} aria-hidden />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <InlineEdit
          value={item.name}
          ariaLabel={`Name von ${item.name}`}
          onCommit={(next) => actions.onRename(item.id, next)}
          onFocus={() => actions.onFocusItem(item.id)}
          className={cn(
            "min-w-0 flex-1 text-admin-base font-medium",
            soldOut ? "text-admin-muted" : "text-admin-ink"
          )}
        />
        {item.featured ? (
          <Star size={14} strokeWidth={2} aria-label="Empfehlung" className="shrink-0 text-admin-warning" />
        ) : null}
        {!item.visible ? (
          <span className="shrink-0 rounded-full bg-admin-bg px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-admin-muted uppercase">
            Versteckt
          </span>
        ) : null}
      </div>

      <span className="hidden w-24 shrink-0 truncate font-mono text-admin-sm text-admin-muted sm:block">
        {item.allergenCodes.join(" ")}
      </span>

      <InlineEdit
        value={priceToInput(item.price)}
        ariaLabel={`Preis von ${item.name}`}
        onCommit={(next) => actions.onRepriceInline(item.id, next)}
        onFocus={() => actions.onFocusItem(item.id)}
        align="right"
        className="w-24 shrink-0 text-admin-base font-semibold tabular-nums text-admin-ink"
      />
      <span className="sr-only">{formatPrice(item.price, currency, locale)}</span>

      <button
        type="button"
        onClick={() => actions.onToggleAvailable(item.id, soldOut)}
        aria-label={soldOut ? `${item.name} wieder verfügbar machen` : `${item.name} auf „heute aus" setzen`}
        aria-pressed={soldOut}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-admin",
          "transition-colors duration-[var(--dur-fast)] hover:bg-[#f3f4f6]",
          soldOut ? "text-admin-warning" : "text-admin-muted"
        )}
      >
        {soldOut ? (
          <EyeOff size={16} strokeWidth={1.75} aria-hidden />
        ) : (
          <Eye size={16} strokeWidth={1.75} aria-hidden />
        )}
      </button>

      <Dropdown
        label={`Aktionen für ${item.name}`}
        items={[
          { label: "Bearbeiten", icon: Pencil, onSelect: () => actions.onEdit(item.id) },
          { label: "Duplizieren", icon: Copy, onSelect: () => actions.onDuplicate(item.id) },
          {
            label: "Löschen",
            icon: Trash2,
            danger: true,
            onSelect: () => actions.onDelete(item.id),
          },
        ]}
      />
    </div>
  );
}
