"use client";

import { cn } from "@/shared/lib/cn";

/** Двухпозиционный фильтр: включён или нет. */
export function Switch({
  label,
  state,
  on,
  onChange,
}: {
  label: string;
  state: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={cn(
        "flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition-colors",
        on
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-border text-muted hover:border-faint",
      )}
    >
      <span>{label}</span>
      <span className="font-mono">{state}</span>
    </button>
  );
}
