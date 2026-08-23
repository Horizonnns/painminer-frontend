/** Отбор кандидатов из поиска. Чистые функции, без React. */

import type { Candidate } from "@/shared/api/types";

/**
 * Кандидата можно добавить в нишу только по публичному username: числовой id
 * из поиска Telethon не резолвит, ссылка получилась бы нерабочей.
 */
export function isAddable(candidate: Candidate): boolean {
  return Boolean(candidate.username) && candidate.kind === "group";
}

/** По умолчанию отмечены группы с username — каналы нам не нужны. */
export function defaultSelection(candidates: readonly Candidate[]): Set<number> {
  return new Set(candidates.filter(isAddable).map((item) => item.tg_id));
}

export function toggle(selected: ReadonlySet<number>, tgId: number): Set<number> {
  const next = new Set(selected);
  if (next.has(tgId)) next.delete(tgId);
  else next.add(tgId);
  return next;
}

/** Ссылки для записи в YAML — только у отмеченных и только username. */
export function selectedRefs(
  candidates: readonly Candidate[],
  selected: ReadonlySet<number>,
): string[] {
  return candidates
    .filter((item) => selected.has(item.tg_id) && isAddable(item))
    .map((item) => item.username as string);
}

/** Уже добавленные в нишу отмечать повторно незачем. */
export function withoutExisting(
  candidates: readonly Candidate[],
  existing: readonly string[],
): Candidate[] {
  const taken = new Set(existing.map((ref) => ref.toLowerCase()));
  return candidates.filter(
    (item) => !item.username || !taken.has(item.username.toLowerCase()),
  );
}
