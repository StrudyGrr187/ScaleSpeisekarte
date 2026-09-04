"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDismissable } from "@/components/ui/use-dismissable";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const panelRef = useDismissable<HTMLDivElement>(open, onClose);
  const titleId = React.useId();
  const descId = React.useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-guest-overlay motion-safe:animate-[fade-in_var(--dur-base)_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative w-full bg-white shadow-admin-pop",
          "rounded-t-guest-sheet sm:max-w-[480px] sm:rounded-admin-lg",
          "motion-safe:animate-[dialog-in_var(--dur-base)_var(--ease-out-soft)]",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div>
            <h2 id={titleId} className="text-admin-h2 font-semibold text-admin-ink">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-admin-base text-admin-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Dialog schließen">
            <X size={18} strokeWidth={1.75} aria-hidden />
          </Button>
        </div>
        {children ? <div className="px-5 pb-2">{children}</div> : null}
        {footer ? (
          <div className="flex flex-col-reverse gap-2 px-5 pt-3 pb-5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Destructive confirmation. Never delete anything without one of these. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Löschen",
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {pending ? "Wird gelöscht…" : confirmLabel}
          </Button>
        </>
      }
    />
  );
}
