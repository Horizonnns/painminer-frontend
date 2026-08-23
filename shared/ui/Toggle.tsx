"use client";

import { cn } from "@/shared/lib/cn";

/** Фильтр-переключатель: три состояния — выкл, «да», «нет». */
export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (next: boolean | undefined) => void;
}) {
  const next = value === undefined ? true : value ? false : undefined;
  const state = value === undefined ? "любые" : value ? "да" : "нет";

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-pressed={value === true}
      className={cn(
        "flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition-colors",
        value === undefined
          ? "border-border text-muted hover:border-faint"
          : "border-accent/40 bg-accent/10 text-accent",
      )}
    >
      <span>{label}</span>
      <span className="font-mono">{state}</span>
    </button>
  );
}
