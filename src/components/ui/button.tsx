import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-admin-primary text-white hover:bg-admin-primary-hover shadow-admin-card",
  secondary:
    "bg-white text-admin-ink-2 border border-admin-border-strong hover:bg-[#f9fafb]",
  ghost: "text-admin-ink-2 hover:bg-[#f3f4f6]",
  danger: "bg-admin-danger text-white hover:bg-[#b42318]",
  dangerGhost: "text-admin-danger hover:bg-admin-danger-soft",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-admin-sm",
  md: "h-10 px-4 text-admin-base",
  lg: "h-11 px-5 text-admin-base",
  icon: "size-9 p-0",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

export const buttonClasses = (
  variant: keyof typeof VARIANTS = "primary",
  size: keyof typeof SIZES = "md",
  className?: string
) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-admin font-semibold whitespace-nowrap",
    "transition-colors duration-[var(--dur-fast)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref
) {
  return (
    <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />
  );
});
