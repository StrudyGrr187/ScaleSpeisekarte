import { AlertCircle } from "lucide-react";

/** Top-of-form error banner for failures that aren't tied to one field. */
export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-admin border border-admin-danger/25 bg-admin-danger-soft px-3.5 py-3 text-admin-base text-admin-danger"
    >
      <AlertCircle size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
