/** Сборка состояния прогона из потока SSE. Чистые функции, без React. */

import { MESSAGES } from "@/shared/config/messages";
import type { RunState, ScanStats } from "@/shared/api/types";

export interface RunView {
  runId: string;
  status: RunState["status"];
  done: number;
  total: number;
  current: string | null;
  stats: ScanStats | null;
  errors: string[];
}

export function toView(state: RunState): RunView {
  return {
    runId: state.run_id,
    status: state.status,
    done: state.done,
    total: state.total,
    current: state.current,
    stats: state.stats,
    errors: state.errors ?? [],
  };
}

interface StepPayload {
  done?: number;
  total?: number;
  current?: string | null;
  stats?: ScanStats;
}

/**
 * Событие `step` несёт только прогресс, `state` и `done` — состояние целиком.
 * Неизвестные события ничего не меняют: поток должен переживать любую добавку.
 */
export function applyEvent(
  view: RunView | null,
  name: string,
  payload: unknown,
): RunView | null {
  if (name === "state" || name === "done") {
    return toView(payload as RunState);
  }
  if (name === "step" && view) {
    const step = payload as StepPayload;
    return {
      ...view,
      done: step.done ?? view.done,
      total: step.total ?? view.total,
      current: step.current ?? view.current,
      stats: step.stats ?? view.stats,
      errors: step.stats?.errors ?? view.errors,
    };
  }
  return view;
}

export function progressPercent(view: RunView | null): number {
  if (!view || view.total <= 0) return 0;
  return Math.min(100, Math.round((view.done / view.total) * 100));
}

export function isFinished(status: RunState["status"] | undefined): boolean {
  return status === "done" || status === "failed" || status === "stopped";
}

const ALWAYS: ReadonlyArray<keyof ScanStats> = [
  "new_messages",
  "hits",
  "chats_ok",
];

const OPTIONAL: ReadonlyArray<keyof ScanStats> = [
  "updated_messages",
  "refreshed",
  "queries_run",
  "chats_failed",
  "skipped_short",
  "skipped_noise",
  "skipped_empty",
  "skipped_crosspost",
  "flood_waits",
];

export interface StatLine {
  key: string;
  label: string;
  value: number;
}

/** Главные счётчики показываем всегда, прочие — только если не нули. */
export function statLines(stats: ScanStats | null): StatLine[] {
  if (!stats) return [];
  const labels = MESSAGES.scan.stats as Record<string, string>;
  const pick = (key: keyof ScanStats) => ({
    key: String(key),
    label: labels[String(key)] ?? String(key),
    value: Number(stats[key] ?? 0),
  });

  return [
    ...ALWAYS.map(pick),
    ...OPTIONAL.map(pick).filter((line) => line.value > 0),
  ];
}
