import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks a read-only area for the restaurant's own login. */
export function AdminOnlyNote({
  children = "Ändern kann das der Admin.",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("flex items-center gap-1.5 text-admin-sm text-admin-muted", className)}>
      <Lock size={13} strokeWidth={2} aria-hidden className="shrink-0" />
      {children}
    </p>
  );
}
