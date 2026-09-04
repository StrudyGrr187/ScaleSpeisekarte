"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Eye, FolderPlus, LayoutList, Plus, Smartphone } from "lucide-react";
import {
  deleteCategoryAction,
  deleteItemAction,
  duplicateItemAction,
  renameCategoryAction,
  reorderCategoriesAction,
  reorderItemsAction,
  toggleItemFlagAction,
  updateItemFieldAction,
} from "@/app/actions/menu";
import { CategoryBlock, type CategoryActions } from "@/components/builder/category-block";
import { CategoryDialog } from "@/components/builder/category-dialog";
import { ItemDialog, type ItemDraft } from "@/components/builder/item-dialog";
import { PhonePreview } from "@/components/builder/phone-preview";
import type { ItemRowActions } from "@/components/builder/item-row";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { builderToPublic, type BuilderCategory, type BuilderData } from "@/lib/builder-types";
import { parsePrice } from "@/lib/money";
import { cn } from "@/lib/utils";

type Pending = { kind: "category" | "item"; id: string; name: string } | null;

export function MenuBuilder({ initial }: { initial: BuilderData }) {
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = React.useState(initial);
  // Server data wins whenever the route revalidates, so optimistic state can
  // never drift permanently away from the database.
  React.useEffect(() => setData(initial), [initial]);

  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [activeDrag, setActiveDrag] = React.useState<{ type: string; id: string } | null>(null);
  const [itemDraft, setItemDraft] = React.useState<ItemDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = React.useState<{ category: BuilderCategory | null } | null>(null);
  const [confirm, setConfirm] = React.useState<Pending>(null);
  const [confirmPending, setConfirmPending] = React.useState(false);
  const [focusedItemId, setFocusedItemId] = React.useState<string | null>(null);
  const [mobileTab, setMobileTab] = React.useState<"edit" | "preview">("edit");

  const lastUsedAllergens = React.useRef<string[]>([]);
  // onDragOver moves items between categories optimistically. If the drag is then
  // cancelled (Escape, lost pointer), nothing is persisted — so we keep the
  // pre-drag state to restore, otherwise the row would sit in the wrong category
  // until the next server refresh.
  const preDragData = React.useRef<BuilderData | null>(null);

  const sensors = useSensors(
    // A small distance threshold keeps a click on the handle from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const categoryIds = React.useMemo(() => data.categories.map((c) => c.id), [data.categories]);
  const preview = React.useMemo(() => builderToPublic(data), [data]);

  const findCategoryOfItem = React.useCallback(
    (itemId: string) => data.categories.find((c) => c.items.some((i) => i.id === itemId)),
    [data.categories]
  );

  const refresh = React.useCallback(() => router.refresh(), [router]);

  /** Runs a server action, reverting local state and reporting on failure. */
  const persist = React.useCallback(
    async (run: () => Promise<{ ok: boolean; error?: string; message?: string }>, silent = false) => {
      const result = await run();
      if (!result.ok) {
        toast(result.error ?? "Speichern fehlgeschlagen.", "error");
        refresh();
        return false;
      }
      if (!silent && result.message) toast(result.message);
      return true;
    },
    [toast, refresh]
  );

  /* ---------------- drag & drop ---------------- */

  const onDragStart = (event: DragStartEvent) => {
    preDragData.current = data;
    setActiveDrag({
      type: String(event.active.data.current?.type ?? "item"),
      id: String(event.active.id),
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "item") return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const from = findCategoryOfItem(activeId);
    // The drop target is either another item or an (empty) category block.
    const to = findCategoryOfItem(overId) ?? data.categories.find((c) => c.id === overId);
    if (!from || !to || from.id === to.id) return;

    setData((current) => {
      const source = current.categories.find((c) => c.id === from.id);
      const target = current.categories.find((c) => c.id === to.id);
      const moved = source?.items.find((i) => i.id === activeId);
      if (!source || !target || !moved) return current;

      const overIndex = target.items.findIndex((i) => i.id === overId);
      const insertAt = overIndex === -1 ? target.items.length : overIndex;

      return {
        ...current,
        categories: current.categories.map((category) => {
          if (category.id === source.id) {
            return { ...category, items: category.items.filter((i) => i.id !== activeId) };
          }
          if (category.id === target.id) {
            const next = [...category.items];
            next.splice(insertAt, 0, moved);
            return { ...category, items: next };
          }
          return category;
        }),
      };
    });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const type = active.data.current?.type;
    setActiveDrag(null);

    // A drop outside any target is a cancel: roll the optimistic move back.
    if (!over) {
      if (preDragData.current) setData(preDragData.current);
      preDragData.current = null;
      return;
    }
    preDragData.current = null;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (type === "category") {
      if (activeId === overId) return;
      const oldIndex = categoryIds.indexOf(activeId);
      const newIndex = categoryIds.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const nextIds = arrayMove(categoryIds, oldIndex, newIndex);
      setData((current) => ({
        ...current,
        categories: arrayMove(current.categories, oldIndex, newIndex),
      }));
      await persist(() => reorderCategoriesAction(nextIds), true);
      return;
    }

    const container = findCategoryOfItem(activeId);
    if (!container) return;

    const ids = container.items.map((i) => i.id);
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);

    let nextIds = ids;
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      nextIds = arrayMove(ids, oldIndex, newIndex);
      setData((current) => ({
        ...current,
        categories: current.categories.map((category) =>
          category.id === container.id
            ? { ...category, items: arrayMove(category.items, oldIndex, newIndex) }
            : category
        ),
      }));
    }

    // Always persist: the item may have changed category during dragOver even
    // when its index within the destination did not change here.
    await persist(() => reorderItemsAction(container.id, nextIds), true);
    refresh();
  };

  /* ---------------- item actions ---------------- */

  const itemActions: ItemRowActions = {
    onFocusItem: setFocusedItemId,

    onRename: async (itemId, name) => {
      if (!name) {
        toast("Der Name darf nicht leer sein.", "error");
        refresh();
        return;
      }
      setData((current) => mapItem(current, itemId, (item) => ({ ...item, name })));
      await persist(() => updateItemFieldAction(itemId, "name", name), true);
    },

    onRepriceInline: async (itemId, value) => {
      const cents = parsePrice(value);
      if (cents === null) {
        toast("Bitte einen gültigen Preis eingeben, z. B. 18,90.", "error");
        refresh();
        return;
      }
      setData((current) => mapItem(current, itemId, (item) => ({ ...item, price: cents })));
      await persist(() => updateItemFieldAction(itemId, "price", value), true);
    },

    onToggleAvailable: async (itemId, next) => {
      setData((current) => mapItem(current, itemId, (item) => ({ ...item, available: next })));
      await persist(() => toggleItemFlagAction(itemId, "available", next), true);
    },

    onEdit: (itemId) => {
      const category = findCategoryOfItem(itemId);
      const item = category?.items.find((i) => i.id === itemId);
      if (category && item) {
        lastUsedAllergens.current = item.allergenCodes;
        setItemDraft({ item, categoryId: category.id });
      }
    },

    onDuplicate: async (itemId) => {
      const done = await persist(() => duplicateItemAction(itemId));
      if (done) refresh();
    },

    onDelete: (itemId) => {
      const item = findCategoryOfItem(itemId)?.items.find((i) => i.id === itemId);
      if (item) setConfirm({ kind: "item", id: itemId, name: item.name });
    },
  };

  const categoryActions: CategoryActions = {
    onRename: async (categoryId, name) => {
      if (!name) {
        toast("Der Name darf nicht leer sein.", "error");
        refresh();
        return;
      }
      setData((current) => ({
        ...current,
        categories: current.categories.map((c) => (c.id === categoryId ? { ...c, name } : c)),
      }));
      await persist(() => renameCategoryAction(categoryId, name), true);
    },
    onEdit: (categoryId) => {
      const category = data.categories.find((c) => c.id === categoryId);
      if (category) setCategoryDraft({ category });
    },
    onDelete: (categoryId) => {
      const category = data.categories.find((c) => c.id === categoryId);
      if (category) setConfirm({ kind: "category", id: categoryId, name: category.name });
    },
    onAddItem: (categoryId) => {
      setItemDraft({ item: null, categoryId });
    },
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmPending(true);
    const done = await persist(() =>
      confirm.kind === "item" ? deleteItemAction(confirm.id) : deleteCategoryAction(confirm.id)
    );
    setConfirmPending(false);
    setConfirm(null);
    if (done) refresh();
  };

  const totalItems = data.categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <>
      {/* Mobile: builder and preview are tabs; desktop shows both side by side. */}
      <div className="mb-4 flex gap-1 rounded-admin border border-admin-border bg-admin-surface p-1 xl:hidden">
        {(
          [
            { key: "edit", label: "Bearbeiten", icon: LayoutList },
            { key: "preview", label: "Vorschau", icon: Smartphone },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMobileTab(tab.key)}
            aria-pressed={mobileTab === tab.key}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-2 rounded-admin-sm text-admin-base font-semibold",
              "transition-colors duration-[var(--dur-fast)]",
              mobileTab === tab.key
                ? "bg-admin-primary-soft text-[#4338ca]"
                : "text-admin-muted hover:bg-[#f3f4f6]"
            )}
          >
            <tab.icon size={16} strokeWidth={1.75} aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className={cn("min-w-0", mobileTab === "preview" && "hidden xl:block")}>
          {data.categories.length === 0 ? (
            <div className="rounded-admin-lg border border-admin-border bg-admin-surface">
              <EmptyState
                icon={FolderPlus}
                title="Noch keine Kategorien"
                description="Fang mit einer Kategorie an — zum Beispiel „Vorspeisen“, „Hauptgerichte“ oder „Getränke“."
                action={
                  <Button onClick={() => setCategoryDraft({ category: null })}>
                    <Plus size={16} strokeWidth={2} aria-hidden />
                    Kategorie anlegen
                  </Button>
                }
              />
            </div>
          ) : (
            <DndContext
              // A stable id keeps the aria-describedby dnd-kit puts on every drag
              // handle identical on server and client; without it React reports a
              // hydration mismatch on first render.
              id="menu-builder"
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDragCancel={() => {
                if (preDragData.current) setData(preDragData.current);
                preDragData.current = null;
                setActiveDrag(null);
              }}
              accessibility={{
                announcements: {
                  onDragStart: ({ active }) => `${active.id} aufgenommen.`,
                  onDragOver: () => "Position wird verschoben.",
                  onDragEnd: () => "Abgelegt. Reihenfolge gespeichert.",
                  onDragCancel: () => "Verschieben abgebrochen.",
                },
              }}
            >
              <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {data.categories.map((category) => (
                    <CategoryBlock
                      key={category.id}
                      category={category}
                      currency={data.restaurant.currency}
                      locale={data.restaurant.locale}
                      collapsed={collapsed.has(category.id)}
                      onToggleCollapse={() =>
                        setCollapsed((current) => {
                          const next = new Set(current);
                          if (next.has(category.id)) next.delete(category.id);
                          else next.add(category.id);
                          return next;
                        })
                      }
                      categoryActions={categoryActions}
                      itemActions={itemActions}
                      dragging={activeDrag?.type === "category"}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeDrag ? (
                  <div className="rounded-admin border border-admin-primary-border bg-white px-4 py-3 text-admin-base font-semibold text-admin-ink shadow-admin-drag">
                    {labelFor(data, activeDrag.id)}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {data.categories.length > 0 ? (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => setCategoryDraft({ category: null })}
            >
              <FolderPlus size={16} strokeWidth={1.75} aria-hidden />
              Kategorie hinzufügen
            </Button>
          ) : null}

          <p className="mt-4 flex items-center gap-2 text-admin-sm text-admin-muted">
            <Eye size={15} strokeWidth={1.75} aria-hidden />
            {totalItems} {totalItems === 1 ? "Gericht" : "Gerichte"} · Änderungen sind sofort in der
            Gastansicht sichtbar.
          </p>
        </div>

        <div className={cn(mobileTab === "edit" && "hidden xl:block")}>
          <PhonePreview menu={preview} focusedItemId={focusedItemId} />
        </div>
      </div>

      <ItemDialog
        draft={itemDraft}
        categories={data.categories}
        allergens={data.allergens}
        dietaryTags={data.dietaryTags}
        lastUsedAllergens={lastUsedAllergens.current}
        onClose={() => setItemDraft(null)}
        onSaved={refresh}
      />

      <CategoryDialog
        open={categoryDraft !== null}
        category={categoryDraft?.category ?? null}
        onClose={() => setCategoryDraft(null)}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        pending={confirmPending}
        title={confirm?.kind === "category" ? "Kategorie löschen?" : "Gericht löschen?"}
        description={
          confirm?.kind === "category"
            ? `„${confirm?.name}“ und alle enthaltenen Gerichte werden endgültig gelöscht.`
            : `„${confirm?.name}“ wird endgültig gelöscht.`
        }
      />
    </>
  );
}

function mapItem(
  data: BuilderData,
  itemId: string,
  update: (item: BuilderData["categories"][number]["items"][number]) => BuilderData["categories"][number]["items"][number]
): BuilderData {
  return {
    ...data,
    categories: data.categories.map((category) => ({
      ...category,
      items: category.items.map((item) => (item.id === itemId ? update(item) : item)),
    })),
  };
}

function labelFor(data: BuilderData, id: string): string {
  const category = data.categories.find((c) => c.id === id);
  if (category) return category.name;
  for (const c of data.categories) {
    const item = c.items.find((i) => i.id === id);
    if (item) return item.name;
  }
  return "";
}
