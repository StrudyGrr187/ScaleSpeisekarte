"use client";

import * as React from "react";
import { AlertCircle, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: ToastTone };

const ToastContext = React.createContext<{
  toast: (message: string, tone?: ToastTone) => void;
} | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}

const ICONS: Record<ToastTone, typeof Check> = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(0);

  const toast = React.useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    // Cap the stack at 3 so a burst of optimistic saves cannot cover the page.
    setToasts((current) => [...current, { id, message, tone }].slice(-3));
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed top-4 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2 sm:top-5 sm:right-5 sm:left-auto sm:translate-x-0 sm:items-end"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex min-h-11 items-center gap-2.5 rounded-admin px-4 py-2.5",
                "text-admin-base font-medium text-white shadow-admin-pop",
                "motion-safe:animate-[toast-in_var(--dur-base)_var(--ease-out-soft)]",
                t.tone === "error" ? "bg-admin-danger" : "bg-admin-ink"
              )}
            >
              <Icon size={16} strokeWidth={2} className="shrink-0" aria-hidden />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
