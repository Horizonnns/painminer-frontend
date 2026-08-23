/** Правка списков и чисел в конфиге ниши. Чистые функции, без React. */

import type { Settings } from "@/shared/api/types";

/** Минимум из бэкенда: MIN_PAUSE_SECONDS в painminer/defaults.py. */
export const MIN_PAUSE_SECONDS = 1;

export function addItem(list: readonly string[], value: string): string[] {
  const item = value.trim();
  if (!item) return [...list];
  const exists = list.some((existing) => existing.toLowerCase() === item.toLowerCase());
  return exists ? [...list] : [...list, item];
}

export function removeItem(list: readonly string[], index: number): string[] {
  return list.filter((_, position) => position !== index);
}

export function listsEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

export interface SettingsForm {
  days_back: string;
  limit_per_query: string;
  min_length: string;
  pause_seconds: string;
}

export function toForm(settings: Settings): SettingsForm {
  return {
    days_back: String(settings.days_back),
    limit_per_query: String(settings.limit_per_query),
    min_length: String(settings.min_length),
    pause_seconds: String(settings.pause_seconds),
  };
}

export type SettingsResult =
  | { ok: true; value: Settings }
  | { ok: false; fields: Array<keyof SettingsForm> };

/**
 * Разбор и проверка чисел — те же правила, что у Settings.from_dict на бэкенде,
 * чтобы форма ловила ошибку до запроса. Паузу подтягиваем до минимума молча:
 * сервер всё равно сделает это сам.
 */
export function parseSettings(form: SettingsForm): SettingsResult {
  const bad: Array<keyof SettingsForm> = [];

  const asNumber = (key: keyof SettingsForm, min: number, integer: boolean): number => {
    const raw = form[key].trim().replace(",", ".");
    const value = Number(raw);
    if (raw === "" || Number.isNaN(value) || value < min || (integer && !Number.isInteger(value))) {
      bad.push(key);
      return min;
    }
    return value;
  };

  const days_back = asNumber("days_back", 1, true);
  const limit_per_query = asNumber("limit_per_query", 1, true);
  const min_length = asNumber("min_length", 0, true);
  const pause_seconds = asNumber("pause_seconds", 0, false);

  if (bad.length > 0) return { ok: false, fields: bad };

  return {
    ok: true,
    value: {
      days_back,
      limit_per_query,
      min_length,
      pause_seconds: Math.max(MIN_PAUSE_SECONDS, pause_seconds),
    },
  };
}

export function settingsEqual(left: Settings, right: Settings): boolean {
  return (
    left.days_back === right.days_back &&
    left.limit_per_query === right.limit_per_query &&
    left.min_length === right.min_length &&
    left.pause_seconds === right.pause_seconds
  );
}
