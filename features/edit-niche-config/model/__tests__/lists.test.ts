import { describe, expect, it } from "vitest";

import {
  MIN_PAUSE_SECONDS,
  addItem,
  listsEqual,
  parseSettings,
  removeItem,
  settingsEqual,
  toForm,
} from "@/features/edit-niche-config/model/lists";
import type { Settings } from "@/shared/api/types";

const SETTINGS: Settings = {
  days_back: 180,
  limit_per_query: 60,
  min_length: 40,
  pause_seconds: 1.2,
};

describe("addItem", () => {
  it("добавляет в конец и обрезает пробелы", () => {
    expect(addItem(["а"], "  б  ")).toEqual(["а", "б"]);
  });

  it("пустое значение игнорирует", () => {
    expect(addItem(["а"], "   ")).toEqual(["а"]);
  });

  it("дубликат не добавляет, регистр не важен", () => {
    expect(addItem(["Надоело"], "надоело")).toEqual(["Надоело"]);
  });

  it("исходный список не мутирует", () => {
    const source = ["а"];
    addItem(source, "б");
    expect(source).toEqual(["а"]);
  });
});

describe("removeItem", () => {
  it("убирает по позиции", () => {
    expect(removeItem(["а", "б", "в"], 1)).toEqual(["а", "в"]);
  });
});

describe("listsEqual", () => {
  it("сравнивает состав и порядок", () => {
    expect(listsEqual(["а", "б"], ["а", "б"])).toBe(true);
    expect(listsEqual(["а", "б"], ["б", "а"])).toBe(false);
    expect(listsEqual(["а"], ["а", "б"])).toBe(false);
  });
});

describe("parseSettings", () => {
  it("разбирает валидную форму", () => {
    const result = parseSettings(toForm(SETTINGS));
    expect(result).toEqual({ ok: true, value: SETTINGS });
  });

  it("принимает запятую как разделитель", () => {
    const result = parseSettings({ ...toForm(SETTINGS), pause_seconds: "2,5" });
    expect(result.ok && result.value.pause_seconds).toBe(2.5);
  });

  it("паузу ниже минимума подтягивает — так же поступит сервер", () => {
    const result = parseSettings({ ...toForm(SETTINGS), pause_seconds: "0.2" });
    expect(result.ok && result.value.pause_seconds).toBe(MIN_PAUSE_SECONDS);
  });

  it("ноль и мусор в целочисленных полях — ошибка с указанием полей", () => {
    const result = parseSettings({
      days_back: "0",
      limit_per_query: "abc",
      min_length: "40",
      pause_seconds: "1.2",
    });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.fields).toEqual(["days_back", "limit_per_query"]);
  });

  it("нулевая минимальная длина допустима, дробная — нет", () => {
    expect(parseSettings({ ...toForm(SETTINGS), min_length: "0" }).ok).toBe(true);
    expect(parseSettings({ ...toForm(SETTINGS), min_length: "4.5" }).ok).toBe(false);
  });

  it("пустое поле — ошибка, а не ноль", () => {
    expect(parseSettings({ ...toForm(SETTINGS), days_back: "" }).ok).toBe(false);
  });
});

describe("settingsEqual", () => {
  it("ловит изменение любого поля", () => {
    expect(settingsEqual(SETTINGS, { ...SETTINGS })).toBe(true);
    expect(settingsEqual(SETTINGS, { ...SETTINGS, min_length: 41 })).toBe(false);
  });
});
