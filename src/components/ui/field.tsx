import * as React from "react";
import { cn } from "@/lib/utils";

const CONTROL = cn(
  "w-full rounded-admin border border-admin-border-strong bg-white px-3 text-[16px] text-admin-ink",
  "placeholder:text-admin-muted outline-none",
  "transition-shadow duration-[var(--dur-fast)]",
  "focus:border-admin-primary focus:shadow-admin-focus",
  "disabled:cursor-not-allowed disabled:bg-admin-bg disabled:text-admin-muted"
);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, "h-10", invalid && "border-admin-danger", className)}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, "min-h-[84px] py-2 leading-relaxed", invalid && "border-admin-danger", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, "h-10 cursor-pointer pr-8", invalid && "border-admin-danger", className)}
      {...props}
    />
  );
});

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label className={cn("mb-1.5 block text-admin-sm font-medium text-admin-ink-2", className)} {...props}>
      {children}
      {hint ? <span className="ml-1.5 font-normal text-admin-muted">{hint}</span> : null}
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-admin-sm text-admin-danger">{children}</p>;
}

/** Label + control + error, the shape every admin form field uses. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} hint={hint}>
        {label}
      </Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
