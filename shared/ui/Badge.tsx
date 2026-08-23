import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type Tone = "neutral" | "accent" | "ok" | "bad";

const TONES: Record<Tone, string> = {
  neutral: "border-border text-muted",
  accent: "border-accent/40 text-accent bg-accent/10",
  ok: "border-ok/40 text-ok",
  bad: "border-bad/40 text-bad",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Точка статуса: цвет несёт смысл, но не заливает интерфейс. */
export function StatusDot({ tone = "neutral" }: { tone?: Tone }) {
  const color =
    tone === "ok" ? "bg-ok" : tone === "bad" ? "bg-bad" : tone === "accent" ? "bg-accent" : "bg-faint";
  return <span className={cn("inline-block size-1.5 shrink-0 rounded-full", color)} />;
}
