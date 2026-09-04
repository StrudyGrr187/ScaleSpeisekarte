import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  brand: "bg-brand-soft text-brand-text border-transparent",
  veg: "bg-guest-veg-soft text-guest-veg border-guest-veg/25",
  neutral: "bg-guest-surface-2 text-guest-muted border-guest-border",
  success: "bg-admin-success-soft text-admin-success border-admin-success/20",
  warning: "bg-admin-warning-soft text-admin-warning border-admin-warning/20",
  danger: "bg-admin-danger-soft text-admin-danger border-admin-danger/20",
  adminNeutral: "bg-admin-bg text-admin-muted border-admin-border",
} as const;

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof VARIANTS }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 rounded-full border px-2",
        "text-[12px] font-semibold tracking-[0.06em] uppercase",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
