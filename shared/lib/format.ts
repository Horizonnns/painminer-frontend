/** Форматирование чисел, дат и русских окончаний. Чистые функции. */

/**
 * Русское склонение: `plural(2, ["находка", "находки", "находок"])` → «находки».
 * Формы: 1, 2–4, 5+.
 */
export function plural(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(Math.trunc(count));
  const tens = abs % 100;
  if (tens >= 11 && tens <= 14) return forms[2];
  const ones = abs % 10;
  if (ones === 1) return forms[0];
  if (ones >= 2 && ones <= 4) return forms[1];
  return forms[2];
}

export function withPlural(
  count: number,
  forms: [string, string, string],
): string {
  return `${formatNumber(count)} ${plural(count, forms)}`;
}

/** Тысячи неразрывным пробелом, чтобы число не переносилось. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function formatMembers(members: number | null): string {
  if (members === null) return "—";
  if (members >= 1000) return `${Math.round(members / 100) / 10}K`;
  return formatNumber(members);
}

const DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : DATE_FORMAT.format(date);
}

/** «3 дня назад» — для дат скана, где точность не важна. */
export function formatRelative(iso: string | null, now: Date = new Date()): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "только что";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${withPlural(minutes, ["минуту", "минуты", "минут"])} назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${withPlural(hours, ["час", "часа", "часов"])} назад`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${withPlural(days, ["день", "дня", "дней"])} назад`;
  return formatDate(iso);
}

export function truncate(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1)}…`;
}

/** Доля score от максимума в выборке — для полоски рядом с числом. */
export function scoreRatio(score: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, score / max));
}
