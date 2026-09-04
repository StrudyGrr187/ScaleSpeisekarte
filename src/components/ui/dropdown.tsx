"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownItem = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
};

/** Row actions menu. Closes on outside click, Escape, and after any selection. */
export function Dropdown({
  items,
  label = "Aktionen",
  align = "right",
}: {
  items: DropdownItem[];
  label?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex size-9 items-center justify-center rounded-admin text-admin-muted",
          "transition-colors duration-[var(--dur-fast)] hover:bg-[#f3f4f6] hover:text-admin-ink-2",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary",
          open && "bg-[#f3f4f6] text-admin-ink-2"
        )}
      >
        <MoreVertical size={16} strokeWidth={1.75} aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-30 mt-1 min-w-[196px] rounded-admin border border-admin-border bg-white py-1 shadow-admin-pop",
            "motion-safe:animate-[dialog-in_var(--dur-fast)_var(--ease-out-soft)]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-admin-base",
                "transition-colors duration-[var(--dur-fast)] disabled:opacity-40",
                item.danger
                  ? "text-admin-danger hover:bg-admin-danger-soft"
                  : "text-admin-ink-2 hover:bg-[#f3f4f6]"
              )}
            >
              <item.icon size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
