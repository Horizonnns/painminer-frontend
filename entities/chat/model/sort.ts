/** Порядок чатов в таблицах. Чистая функция — её и тестируем. */

import type { Chat } from "@/shared/api/types";

const BROKEN: ReadonlySet<string> = new Set([
  "private",
  "not_found",
  "admin_required",
  "error",
]);

export function isBroken(status: string): boolean {
  return BROKEN.has(status);
}

/**
 * Сначала рабочие чаты по числу находок, следом — недоступные:
 * сломанное не должно вытеснять полезное наверх, но и теряться не должно.
 */
export function sortChats(chats: readonly Chat[]): Chat[] {
  return [...chats].sort((left, right) => {
    const brokenDiff = Number(isBroken(left.status)) - Number(isBroken(right.status));
    if (brokenDiff !== 0) return brokenDiff;
    if (right.findings !== left.findings) return right.findings - left.findings;
    return left.title.localeCompare(right.title, "ru");
  });
}
