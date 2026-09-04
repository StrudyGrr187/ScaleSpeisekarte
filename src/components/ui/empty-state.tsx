import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <span
        className="flex size-11 items-center justify-center rounded-full bg-admin-primary-soft text-admin-primary"
        aria-hidden
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-admin-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-[320px] text-admin-sm text-admin-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
