/** Константы приложения. Магических чисел в компонентах быть не должно. */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8765/api";

export const ROUTES = {
  niches: "/",
  niche: (niche: string) => `/n/${niche}`,
  findings: (niche: string) => `/n/${niche}/findings`,
  report: (niche: string) => `/n/${niche}/report`,
  chats: (niche: string) => `/n/${niche}/chats`,
  scan: (niche: string) => `/n/${niche}/scan`,
  settings: (niche: string) => `/n/${niche}/settings`,
} as const;

export const PAGE_SIZE = 50;

/** Порядок вердиктов важен: в таком виде они и показываются. */
export const VERDICTS = ["yes", "maybe", "no"] as const;

export const SORTS = ["score", "date", "replies", "reactions"] as const;

/** Статусы чата из базы — те же строки, что пишет scan. */
export const CHAT_STATUSES = [
  "new",
  "ok",
  "private",
  "not_found",
  "admin_required",
  "error",
] as const;

export const STALE_TIME_MS = 30_000;
