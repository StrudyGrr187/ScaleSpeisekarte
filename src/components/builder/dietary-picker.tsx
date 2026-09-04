"use client";

import { DietaryIcon } from "@/components/menu/dietary-icon";
import { cn } from "@/lib/utils";

export function DietaryPicker({
  tags,
  selected,
  onChange,
}: {
  tags: { key: string; name: string; icon: string; color: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-admin-sm font-medium text-admin-ink-2">Kennzeichnung</legend>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const active = selected.includes(tag.key);
          return (
            <li key={tag.key}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange(
                    active ? selected.filter((k) => k !== tag.key) : [...selected, tag.key]
                  )
                }
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-admin-base font-medium",
                  "transition-colors duration-[var(--dur-fast)]",
                  active
                    ? "border-guest-veg/40 bg-guest-veg-soft text-guest-veg"
                    : "border-admin-border-strong bg-white text-admin-ink-2 hover:bg-[#f9fafb]"
                )}
              >
                <DietaryIcon icon={tag.icon} size={14} />
                {tag.name}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
