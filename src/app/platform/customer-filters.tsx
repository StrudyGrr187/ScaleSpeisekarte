"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Select } from "@/components/ui/field";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type CustomerSort,
  type CustomerStatus,
} from "./customer-query";
import { cn } from "@/lib/utils";

/**
 * Search, status filter and sort for the customer list.
 *
 * State lives in the URL, not in React: the server renders the filtered list,
 * a filtered view can be bookmarked or sent to a colleague, and the back button
 * steps through filter changes the way it steps through pages.
 */
export function CustomerFilters({
  query,
  status,
  sort,
  counts,
}: {
  query: string;
  status: CustomerStatus;
  sort: CustomerSort;
  counts: Record<CustomerStatus, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  const [text, setText] = React.useState(query);
  // The last value this component pushed into the URL. When the URL changes to
  // something else — back button, reset link — the field follows; when it only
  // catches up with what was typed, the field is left alone, so a slow round
  // trip can never overwrite the characters typed in the meantime.
  const lastPushed = React.useRef(query);

  // The params of the navigation most recently *requested*. useSearchParams
  // only reflects the last one that finished rendering, so building on it
  // while a navigation is still loading drops that navigation's change: type,
  // then pick a status within the debounce, and the late search replace
  // would silently discard the status.
  const requested = React.useRef<string | null>(null);
  const current = searchParams.toString();
  // Any committed URL ends the pending request — including one that differs
  // from what was asked for (Back pressed mid-navigation). Waiting for an exact
  // match left the ref stale forever in those cases.
  React.useEffect(() => {
    requested.current = null;
  }, [current]);

  React.useEffect(() => {
    if (query !== lastPushed.current) {
      lastPushed.current = query;
      setText(query);
    }
  }, [query]);

  const navigate = React.useCallback(
    (
      patch: Partial<Record<"q" | "status" | "sort", string>>,
      // Discrete choices get their own history entry so Back undoes them; typing
      // replaces the current one, or every pause in a search would be a Back step.
      history: "push" | "replace" = "push"
    ) => {
      const base = requested.current ?? window.location.search.slice(1);
      const params = new URLSearchParams(base);
      for (const [key, value] of Object.entries(patch)) {
        // Defaults stay out of the URL so the plain list keeps its plain address.
        const isDefault =
          value === "" ||
          (key === "status" && value === "alle") ||
          (key === "sort" && value === "neu");
        if (isDefault) params.delete(key);
        else params.set(key, value);
      }
      const next = params.toString();
      // Re-selecting the active filter changes nothing; navigating anyway would
      // leave a request behind that no URL change ever clears.
      if (next === new URLSearchParams(base).toString()) return;
      requested.current = next;
      startTransition(() => {
        router[history](next ? `${pathname}?${next}` : pathname, { scroll: false });
      });
    },
    [pathname, router]
  );

  // Debounced: one navigation per pause in typing, not one per keystroke.
  React.useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === lastPushed.current) return;
    const timer = setTimeout(() => {
      lastPushed.current = trimmed;
      navigate({ q: trimmed }, "replace");
    }, 300);
    return () => clearTimeout(timer);
  }, [text, navigate]);

  const filtered = query !== "" || status !== "alle";

  return (
    <div className="mb-5 space-y-3" role="search" aria-label="Kunden durchsuchen">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="customer-search" className="sr-only">
            Suche nach Name, Adresse oder E-Mail
          </label>
          <span
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-admin-muted"
            aria-hidden
          >
            {pending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} strokeWidth={1.75} />
            )}
          </span>
          <input
            id="customer-search"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && text) {
                e.preventDefault();
                setText("");
              }
            }}
            placeholder="Name, Adresse oder E-Mail"
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "h-10 w-full rounded-admin border border-admin-border-strong bg-white pr-10 pl-9 text-[16px] text-admin-ink",
              "outline-none placeholder:text-admin-muted",
              "transition-shadow duration-[var(--dur-fast)] focus:border-admin-primary focus:shadow-admin-focus",
              // The native clear control duplicates ours and cannot be styled.
              "[&::-webkit-search-cancel-button]:appearance-none"
            )}
          />
          {text ? (
            <button
              type="button"
              onClick={() => setText("")}
              aria-label="Suche leeren"
              className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-admin text-admin-muted hover:bg-admin-bg hover:text-admin-ink"
            >
              <X size={16} strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:w-[220px]">
          <label
            htmlFor="customer-sort"
            className="shrink-0 text-admin-sm font-medium text-admin-muted"
          >
            Sortieren
          </label>
          <Select
            id="customer-sort"
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Nach Status filtern">
          {STATUS_OPTIONS.map((option) => {
            const active = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => navigate({ status: option.value })}
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-admin-sm font-medium",
                  "transition-colors duration-[var(--dur-fast)]",
                  active
                    ? "border-admin-primary bg-admin-primary-soft text-[#4338ca]"
                    : "border-admin-border-strong bg-white text-admin-ink-2 hover:bg-admin-bg"
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[12px] tabular-nums",
                    active ? "bg-white/70" : "bg-admin-bg text-admin-muted"
                  )}
                >
                  {counts[option.value]}
                </span>
              </button>
            );
          })}
        </div>

        {filtered ? (
          <button
            type="button"
            onClick={() => {
              setText("");
              lastPushed.current = "";
              navigate({ q: "", status: "alle" });
            }}
            className="ml-auto h-9 cursor-pointer rounded-admin px-2.5 text-admin-sm font-medium text-admin-muted hover:text-admin-ink"
          >
            Filter zurücksetzen
          </button>
        ) : null}
      </div>
    </div>
  );
}
