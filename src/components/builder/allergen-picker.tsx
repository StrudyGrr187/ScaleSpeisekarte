"use client";

import * as React from "react";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Allergens are legally required and the dullest part of data entry, so this is
 * a type-to-filter chip picker rather than fourteen checkboxes: typing "gl"
 * finds Gluten, Enter takes the top match.
 */
export function AllergenPicker({
  allergens,
  selected,
  onChange,
  lastUsed,
}: {
  allergens: { code: string; name: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  lastUsed?: string[];
}) {
  const [query, setQuery] = React.useState("");
  const inputId = React.useId();

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allergens;
    return allergens.filter(
      (a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase() === q
    );
  }, [allergens, query]);

  const toggle = (code: string) => {
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);
  };

  const selectedAllergens = allergens.filter((a) => selected.includes(a.code));
  const canReuse = Boolean(lastUsed?.length) && lastUsed!.join() !== selected.join();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-admin-sm font-medium text-admin-ink-2">
          Allergene
        </label>
        {canReuse ? (
          <button
            type="button"
            onClick={() => onChange(lastUsed!)}
            className="text-admin-sm font-medium text-admin-primary hover:underline"
          >
            Vom letzten Gericht übernehmen
          </button>
        ) : null}
      </div>

      {selectedAllergens.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {selectedAllergens.map((allergen) => (
            <li key={allergen.code}>
              <button
                type="button"
                onClick={() => toggle(allergen.code)}
                aria-label={`${allergen.name} entfernen`}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-admin-primary-border bg-admin-primary-soft pr-1.5 pl-2.5 text-admin-sm font-medium text-[#4338ca] transition-colors hover:bg-[#e0e7ff]"
              >
                <span className="font-mono font-bold">{allergen.code}</span>
                {allergen.name}
                <X size={13} strokeWidth={2.25} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative">
        <Search
          size={15}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-admin-muted"
        />
        <input
          id={inputId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) {
              e.preventDefault();
              toggle(matches[0].code);
              setQuery("");
            }
          }}
          placeholder="Suchen, z. B. „gl“ für Gluten"
          className="h-10 w-full rounded-admin border border-admin-border-strong bg-white pr-3 pl-9 text-[16px] outline-none transition-shadow focus:border-admin-primary focus:shadow-admin-focus"
        />
      </div>

      <ul className="mt-2 grid max-h-[168px] grid-cols-1 gap-0.5 overflow-y-auto rounded-admin border border-admin-border p-1 sm:grid-cols-2">
        {matches.map((allergen) => {
          const active = selected.includes(allergen.code);
          return (
            <li key={allergen.code}>
              <button
                type="button"
                onClick={() => toggle(allergen.code)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-2 rounded-admin-sm px-2 py-1.5 text-left text-admin-base",
                  "transition-colors duration-[var(--dur-fast)]",
                  active ? "bg-admin-primary-soft text-[#4338ca]" : "text-admin-ink-2 hover:bg-[#f3f4f6]"
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                    active
                      ? "border-admin-primary bg-admin-primary text-white"
                      : "border-admin-border-strong bg-white"
                  )}
                  aria-hidden
                >
                  {active ? <Check size={11} strokeWidth={3} /> : null}
                </span>
                <span className="w-4 shrink-0 font-mono font-bold">{allergen.code}</span>
                <span className="truncate">{allergen.name}</span>
              </button>
            </li>
          );
        })}
        {matches.length === 0 ? (
          <li className="col-span-full px-2 py-3 text-center text-admin-sm text-admin-muted">
            Kein Allergen gefunden.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
