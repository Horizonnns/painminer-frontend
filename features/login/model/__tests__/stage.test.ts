import { describe, expect, it } from "vitest";

import {
  cleanCode,
  isApiHashReady,
  isApiIdReady,
  isCodeReady,
  isPasswordReady,
  isPhoneReady,
  normalizePhone,
} from "@/features/login/model/stage";

describe("normalizePhone", () => {
  it("оставляет только цифры и ведущий плюс", () => {
    expect(normalizePhone("+7 (999) 123-45-67")).toBe("+79991234567");
    expect(normalizePhone("89991234567")).toBe("+89991234567");
    expect(normalizePhone("  +1 202 555 0143 ")).toBe("+12025550143");
  });

  it("без цифр отдаёт пустую строку — так же, как бэкенд", () => {
    expect(normalizePhone("не телефон")).toBe("");
    expect(normalizePhone("")).toBe("");
  });
});

describe("isPhoneReady", () => {
  it("короткое не пропускает", () => {
    expect(isPhoneReady("+7999")).toBe(false);
    expect(isPhoneReady("абвгд")).toBe(false);
  });

  it("нормальный номер пропускает", () => {
    expect(isPhoneReady("+7 999 123-45-67")).toBe(true);
  });
});

describe("isCodeReady и cleanCode", () => {
  it("код из цифр, пробелы не мешают", () => {
    expect(isCodeReady("12 345")).toBe(true);
    expect(cleanCode("1 2-3 4 5")).toBe("12345");
  });

  it("пустой и слишком длинный не проходят", () => {
    expect(isCodeReady("")).toBe(false);
    expect(isCodeReady("12")).toBe(false);
    expect(isCodeReady("1".repeat(17))).toBe(false);
  });
});

describe("isPasswordReady", () => {
  it("любой непустой пароль годится — проверяет Telegram", () => {
    expect(isPasswordReady("")).toBe(false);
    expect(isPasswordReady(" ")).toBe(true);
  });
});

describe("ключи приложения", () => {
  it("api_id — только цифры", () => {
    expect(isApiIdReady(" 1234567 ")).toBe(true);
    expect(isApiIdReady("12ab")).toBe(false);
    expect(isApiIdReady("")).toBe(false);
  });

  it("api_hash — ровно 32 шестнадцатеричных символа", () => {
    expect(isApiHashReady("0123456789abcdef0123456789ABCDEF")).toBe(true);
    expect(isApiHashReady("0123456789abcdef")).toBe(false);
    expect(isApiHashReady("z".repeat(32))).toBe(false);
  });
});
