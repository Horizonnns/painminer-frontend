/** Какой шаг предложить пользователю дальше. Чистая функция. */

export type NextStepKind = "login" | "chats" | "scan" | "findings";

export interface NicheProgress {
  authorized: boolean;
  chats: number;
  findings: number;
}

/**
 * Порядок один и тот же: вход → чаты → прогон → разбор находок.
 * Возвращает первый незакрытый шаг; когда находки есть, зовём их разбирать.
 */
export function chooseNextStep({
  authorized,
  chats,
  findings,
}: NicheProgress): NextStepKind {
  if (findings > 0) return "findings";
  if (!authorized) return "login";
  if (chats === 0) return "chats";
  return "scan";
}
