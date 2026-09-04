"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Click-to-edit text that turns into an input inheriting the same typography and
 * position, so nothing shifts. Enter saves, Escape reverts, blur saves — a menu
 * has dozens of names and prices, and a modal for each would be unusable.
 */
export function InlineEdit({
  value,
  onCommit,
  onFocus,
  ariaLabel,
  className,
  inputClassName,
  align = "left",
  placeholder,
}: {
  value: string;
  onCommit: (next: string) => void | Promise<void>;
  onFocus?: () => void;
  ariaLabel: string;
  className?: string;
  inputClassName?: string;
  align?: "left" | "right";
  placeholder?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Escape must not trigger the blur-saves-changes path.
  const cancelled = React.useRef(false);

  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  React.useEffect(() => {
    if (!editing) return;
    // The input unmounts on Escape, so its blur may never fire to clear this.
    // Reset on every entry into edit mode, or the *next* edit would discard a
    // legitimate change without telling anyone.
    cancelled.current = false;
    inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== value.trim()) onCommit(next);
    else setDraft(value);
  };

  if (!editing) {
    return (
      <button
        type="button"
        aria-label={`${ariaLabel} bearbeiten`}
        onFocus={onFocus}
        onClick={() => {
          onFocus?.();
          setEditing(true);
        }}
        className={cn(
          "-mx-2 truncate rounded-admin-sm px-2 py-1 text-left",
          "transition-colors duration-[var(--dur-fast)] hover:bg-[#eef2ff]",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-admin-primary",
          align === "right" && "text-right",
          className
        )}
      >
        {value || <span className="text-admin-muted">{placeholder ?? "—"}</span>}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={onFocus}
      onBlur={() => {
        if (cancelled.current) {
          cancelled.current = false;
          return;
        }
        commit();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancelled.current = true;
          setDraft(value);
          setEditing(false);
        }
      }}
      className={cn(
        "-mx-2 h-8 w-[calc(100%+1rem)] rounded-admin-sm border border-admin-primary bg-white px-2",
        "shadow-admin-focus outline-none",
        align === "right" && "text-right",
        className,
        inputClassName
      )}
    />
  );
}
