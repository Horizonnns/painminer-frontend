/** Фильтры находок ↔ параметры URL. Чистые функции, без React. */

import { PAGE_SIZE, SORTS } from "@/shared/config/constants";
import type { FindingsQuery } from "@/shared/api/types";

export interface FindingsFilters {
  chat?: number;
  query?: string;
  cluster?: string;
  verdict?: string;
  money?: boolean;
  question?: boolean;
  search?: string;
  /** Скрывать тексты, опубликованные много раз подряд, — обычно это реклама. */
  hideRepeated?: boolean;
  sort: string;
}

export const DEFAULT_SORT = "score";

export const EMPTY_FILTERS: FindingsFilters = { sort: DEFAULT_SORT };

function parseBool(raw: string | null): boolean | undefined {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

export function parseFilters(params: URLSearchParams): FindingsFilters {
  const chatRaw = params.get("chat");
  const chat = chatRaw && /^\d+$/.test(chatRaw) ? Number(chatRaw) : undefined;
  const sort = params.get("sort");

  return {
    chat,
    query: params.get("query") || undefined,
    cluster: params.get("cluster") || undefined,
    verdict: params.get("verdict") || undefined,
    money: parseBool(params.get("money")),
    question: parseBool(params.get("question")),
    search: params.get("search") || undefined,
    hideRepeated: params.get("repeats") === "hide" ? true : undefined,
    sort: sort && (SORTS as readonly string[]).includes(sort) ? sort : DEFAULT_SORT,
  };
}

/** В URL пишем только то, что отличается от значения по умолчанию. */
export function filtersToSearch(filters: FindingsFilters): string {
  const params = new URLSearchParams();
  if (filters.chat !== undefined) params.set("chat", String(filters.chat));
  if (filters.query) params.set("query", filters.query);
  if (filters.cluster) params.set("cluster", filters.cluster);
  if (filters.verdict) params.set("verdict", filters.verdict);
  if (filters.money !== undefined) params.set("money", String(filters.money));
  if (filters.question !== undefined) params.set("question", String(filters.question));
  if (filters.search) params.set("search", filters.search);
  if (filters.hideRepeated) params.set("repeats", "hide");
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  return params.toString();
}

export function toApiQuery(
  filters: FindingsFilters,
  offset = 0,
  limit = PAGE_SIZE,
): FindingsQuery {
  return {
    chat: filters.chat,
    query: filters.query,
    cluster: filters.cluster,
    verdict: filters.verdict,
    money: filters.money,
    question: filters.question,
    search: filters.search,
    hide_repeated: filters.hideRepeated || undefined,
    sort: filters.sort,
    limit,
    offset,
  };
}

/** Сколько условий отбора включено — для счётчика у кнопки «Сбросить». */
export function countActive(filters: FindingsFilters): number {
  const values = [
    filters.chat,
    filters.query,
    filters.cluster,
    filters.verdict,
    filters.money,
    filters.question,
    filters.search,
    filters.hideRepeated,
  ];
  return values.filter((value) => value !== undefined && value !== "").length;
}
