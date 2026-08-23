/** Отбор кандидатов из поиска. Чистые функции, без React. */

import type { Candidate } from "@/shared/api/types";

/**
 * Кандидата можно добавить в нишу только по публичному username: числовой id
 * из поиска Telethon не резолвит, ссылка получилась бы нерабочей.
 */
export function isAddable(candidate: Candidate): boolean {
  return Boolean(candidate.username) && candidate.kind === "group";
}

export function existingSet(existing: readonly string[]): Set<string> {
  return new Set(existing.map((ref) => ref.toLowerCase()));
}

/** Уже записан в YAML ниши. Такие показываем, но пометкой, а не молчком. */
export function isAdded(candidate: Candidate, existing: ReadonlySet<string>): boolean {
  return Boolean(candidate.username) && existing.has(candidate.username!.toLowerCase());
}

/** По умолчанию отмечены группы с username, которых ещё нет в нише. */
export function defaultSelection(
  candidates: readonly Candidate[],
  existing: ReadonlySet<string>,
): Set<number> {
  return new Set(
    candidates
      .filter((item) => isAddable(item) && !isAdded(item, existing))
      .map((item) => item.tg_id),
  );
}

export function toggle(selected: ReadonlySet<number>, tgId: number): Set<number> {
  const next = new Set(selected);
  if (next.has(tgId)) next.delete(tgId);
  else next.add(tgId);
  return next;
}

/** Ссылки для записи в YAML — только отмеченные, пригодные и ещё не добавленные. */
export function selectedRefs(
  candidates: readonly Candidate[],
  selected: ReadonlySet<number>,
  existing: ReadonlySet<string>,
): string[] {
  return candidates
    .filter(
      (item) =>
        selected.has(item.tg_id) && isAddable(item) && !isAdded(item, existing),
    )
    .map((item) => item.username as string);
}

/** Сколько из найденного вообще можно добавить — от этого зависит текст пустого экрана. */
export function countAddable(
  candidates: readonly Candidate[],
  existing: ReadonlySet<string>,
): number {
  return candidates.filter((item) => isAddable(item) && !isAdded(item, existing)).length;
}
