"use client";

import { MESSAGES } from "@/shared/config/messages";
import { cn } from "@/shared/lib/cn";
import type { FacetItem } from "@/shared/api/types";

interface FacetListProps {
  title: string;
  items: FacetItem[];
  value: string | undefined;
  onSelect: (value: string | undefined) => void;
  extra?: { value: string; label: string };
  limit?: number;
}

/** Список значений фильтра со счётчиками. Повторный клик снимает выбор. */
export function FacetList({
  title,
  items,
  value,
  onSelect,
  extra,
  limit = 8,
}: FacetListProps) {
  if (items.length === 0 && !extra) return null;
  const shown = items.slice(0, limit);
  const options = extra ? [{ ...extra, count: -1 }, ...shown] : shown;

  return (
    <section>
      <h3 className="mb-1.5 text-xs text-muted">{title}</h3>
      <ul className="space-y-0.5">
        {options.map((item) => {
          const active = value === item.value;
          return (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => onSelect(active ? undefined : item.value)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors",
                  active ? "bg-accent/10 text-accent" : "text-muted hover:bg-raised hover:text-text",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.count >= 0 ? (
                  <span className="font-mono tabular-nums text-faint">{item.count}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {items.length > limit ? (
        <p className="mt-1 px-2 text-xs text-faint">
          +{items.length - limit} {MESSAGES.filters.all}
        </p>
      ) : null}
    </section>
  );
}
