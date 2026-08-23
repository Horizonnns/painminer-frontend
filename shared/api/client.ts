/** Тонкий клиент над fetch. Все запросы к API идут только отсюда. */

import { API_BASE_URL } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import type { ApiErrorBody } from "@/shared/api/types";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }

  /** Понятный текст для интерфейса: свой для известных кодов бэкенда. */
  get humanMessage(): string {
    const known = MESSAGES.errors as Record<string, string>;
    return known[this.code] ?? this.message ?? MESSAGES.errors.unknown;
  }
}

/** `{a: 1, b: undefined}` → `?a=1`. Пустые значения не отправляем. */
export function buildQuery(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (body?.error?.code) {
      return new ApiError(body.error.code, body.error.message, response.status);
    }
  } catch {
    // тело не JSON — сообщим хотя бы статусом
  }
  return new ApiError("unknown", `HTTP ${response.status}`, response.status);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    // Сеть недоступна — почти всегда это «бэкенд не запущен».
    throw new ApiError("network", MESSAGES.states.offlineHint, 0);
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiGet<T>(path: string, params?: Record<string, unknown>) {
  return apiFetch<T>(`${path}${buildQuery(params)}`);
}

export function apiSend<T>(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
) {
  return apiFetch<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** URL потока событий прогона — его читает EventSource, а не fetch. */
export function runEventsUrl(runId: string): string {
  return `${API_BASE_URL}/runs/${runId}/events`;
}
