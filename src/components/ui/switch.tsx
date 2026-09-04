"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full",
        "transition-colors duration-[160ms] ease-[var(--ease-out-soft)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-admin-primary" : "bg-admin-border-strong",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none ml-0.5 size-5 rounded-full bg-white shadow",
          "transition-transform duration-[160ms] ease-[var(--ease-out-soft)]",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}
