"use client";

import * as React from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { InlineEdit } from "@/components/builder/inline-edit";
import { ItemRow, type ItemRowActions } from "@/components/builder/item-row";
import { CategoryIcon } from "@/components/menu/category-icon";
import { Dropdown } from "@/components/ui/dropdown";
import type { BuilderCategory } from "@/lib/builder-types";
import { cn } from "@/lib/utils";

export type CategoryActions = {
  onRename: (categoryId: string, name: string) => void;
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
  onAddItem: (categoryId: string) => void;
};

export function CategoryBlock({
  category,
  currency,
  locale,
  collapsed,
  onToggleCollapse,
  categoryActions,
  itemActions,
  dragging,
}: {
  category: BuilderCategory;
  currency: string;
  locale: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  categoryActions: CategoryActions;
  itemActions: ItemRowActions;
  dragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    data: { type: "category" },
  });

  const itemIds = React.useMemo(() => category.items.map((i) => i.id), [category.items]);
  // Collapse every block while a category is being dragged, so the list stays
  // short enough to see where the block will land.
  const showItems = !collapsed && !dragging;

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        // No overflow-hidden here: a collapsed block is only 52px tall and would
        // clip the row action menu. The header and body round their own corners.
        "rounded-admin-lg border border-admin-border bg-admin-surface shadow-admin-card",
        isDragging && "opacity-35"
      )}
    >
      <header className="flex h-[52px] items-center gap-2 rounded-t-admin-lg border-b border-admin-border bg-admin-surface-2 px-3">
        <button
          type="button"
          aria-label={`${category.name}: Position ändern`}
          className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-admin text-admin-border-strong hover:text-admin-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={showItems}
          aria-label={collapsed ? `${category.name} ausklappen` : `${category.name} einklappen`}
          className="flex size-7 shrink-0 items-center justify-center rounded-admin text-admin-muted hover:bg-[#f3f4f6]"
        >
          <ChevronDown
            size={16}
            strokeWidth={2}
            aria-hidden
            className={cn("transition-transform duration-[180ms]", collapsed && "-rotate-90")}
          />
        </button>

        <CategoryIcon icon={category.icon} size={16} className="shrink-0 text-admin-muted" />

        <InlineEdit
          value={category.name}
          ariaLabel={`Name der Kategorie ${category.name}`}
          onCommit={(next) => categoryActions.onRename(category.id, next)}
          className="min-w-0 flex-1 text-admin-h2 font-semibold text-admin-ink"
        />

        {!category.active ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-admin-bg px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-admin-muted uppercase">
            <EyeOff size={11} strokeWidth={2} aria-hidden />
            Versteckt
          </span>
        ) : null}

        <span className="hidden shrink-0 text-admin-sm text-admin-muted sm:inline">
          {category.items.length} {category.items.length === 1 ? "Gericht" : "Gerichte"}
        </span>

        <button
          type="button"
          onClick={() => categoryActions.onAddItem(category.id)}
          className="hidden h-8 shrink-0 items-center gap-1.5 rounded-admin border border-admin-border-strong bg-white px-3 text-admin-sm font-semibold text-admin-ink-2 transition-colors hover:bg-[#f9fafb] sm:inline-flex"
        >
          <Plus size={15} strokeWidth={2} aria-hidden />
          Gericht
        </button>

        <Dropdown
          label={`Aktionen für ${category.name}`}
          items={[
            {
              label: "Kategorie bearbeiten",
              icon: Pencil,
              onSelect: () => categoryActions.onEdit(category.id),
            },
            {
              label: "Gericht hinzufügen",
              icon: Plus,
              onSelect: () => categoryActions.onAddItem(category.id),
            },
            {
              label: "Kategorie löschen",
              icon: Trash2,
              danger: true,
              onSelect: () => categoryActions.onDelete(category.id),
            },
          ]}
        />
      </header>

      {showItems ? (
        <div className="overflow-hidden rounded-b-admin-lg">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {category.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                currency={currency}
                locale={locale}
                actions={itemActions}
              />
            ))}
          </SortableContext>

          {category.items.length === 0 ? (
            <div className="m-3 flex h-[76px] flex-col items-center justify-center rounded-admin border border-dashed border-admin-border-strong text-center">
              <p className="text-admin-sm text-admin-muted">Noch keine Gerichte</p>
              <button
                type="button"
                onClick={() => categoryActions.onAddItem(category.id)}
                className="mt-1 text-admin-sm font-semibold text-admin-primary hover:underline"
              >
                Erstes Gericht anlegen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => categoryActions.onAddItem(category.id)}
              className="flex h-11 w-full items-center justify-center gap-1.5 border-t border-dashed border-admin-border text-admin-sm font-semibold text-admin-muted transition-colors hover:bg-[#f9fafb] hover:text-admin-primary"
            >
              <Plus size={15} strokeWidth={2} aria-hidden />
              Gericht hinzufügen
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}
