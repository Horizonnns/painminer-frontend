/** Проверки полей входа. Зеркалят painminer/api/auth.py, чтобы не гонять
    заведомо мусорные запросы. Чистые функции. */

/** ``+7 (999) 123-45-67`` → ``+79991234567``. Формат проверяет Telegram. */
export function normalizePhone(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

export function isPhoneReady(raw: string): boolean {
  return normalizePhone(raw).length >= 8;
}

/** Код приходит цифрами, обычно пять. Пробелы пользователь ставит сам. */
export function isCodeReady(raw: string): boolean {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits.length >= 3 && digits.length <= 16;
}

export function cleanCode(raw: string): string {
  return (raw ?? "").replace(/\D/g, "");
}

export function isPasswordReady(raw: string): boolean {
  return (raw ?? "").length > 0;
}

/** Ключи приложения. Проверки те же, что в painminer/tg_client.py. */
export function isApiIdReady(raw: string): boolean {
  return /^\d+$/.test((raw ?? "").trim());
}

export function isApiHashReady(raw: string): boolean {
  return /^[0-9a-f]{32}$/i.test((raw ?? "").trim());
}
