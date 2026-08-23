"use client";

import { useEffect } from "react";

import type { Verdict } from "@/shared/api/types";

const KEYS: Record<string, Verdict> = { y: "yes", n: "no", m: "maybe" };

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

interface Handlers {
  onVerdict: (verdict: Verdict) => void;
  onMove: (delta: number) => void;
  enabled: boolean;
}

/** y/n/m — вердикт, j/k и стрелки — переход по списку. */
export function useVerdictHotkeys({ onVerdict, onMove, enabled }: Handlers) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;

      const verdict = KEYS[event.key.toLowerCase()];
      if (verdict) {
        event.preventDefault();
        onVerdict(verdict);
        return;
      }
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        onMove(1);
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        onMove(-1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onMove, onVerdict]);
}
