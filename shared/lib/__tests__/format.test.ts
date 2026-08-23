import { describe, expect, it } from "vitest";

import {
  formatMembers,
  formatRelative,
  plural,
  scoreRatio,
  truncate,
  withPlural,
} from "@/shared/lib/format";

const FORMS: [string, string, string] = ["находка", "находки", "находок"];

describe("plural", () => {
  it("выбирает форму по последней цифре", () => {
    expect(plural(1, FORMS)).toBe("находка");
    expect(plural(3, FORMS)).toBe("находки");
    expect(plural(7, FORMS)).toBe("находок");
    expect(plural(21, FORMS)).toBe("находка");
    expect(plural(102, FORMS)).toBe("находки");
  });

  it("знает про исключение 11-14", () => {
    expect(plural(11, FORMS)).toBe("находок");
    expect(plural(12, FORMS)).toBe("находок");
    expect(plural(14, FORMS)).toBe("находок");
    expect(plural(111, FORMS)).toBe("находок");
  });

  it("не спотыкается на нуле и отрицательных", () => {
    expect(plural(0, FORMS)).toBe("находок");
    expect(plural(-2, FORMS)).toBe("находки");
  });
});

describe("withPlural", () => {
  it("склеивает число и форму", () => {
    expect(withPlural(2, FORMS)).toBe("2 находки");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-03-01T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it("считает от переданного момента", () => {
    expect(formatRelative(ago(30_000), now)).toBe("только что");
    expect(formatRelative(ago(5 * 60_000), now)).toBe("5 минут назад");
    expect(formatRelative(ago(3 * 3600_000), now)).toBe("3 часа назад");
    expect(formatRelative(ago(2 * 86400_000), now)).toBe("2 дня назад");
  });

  it("старше месяца показывает датой", () => {
    expect(formatRelative(ago(90 * 86400_000), now)).toMatch(/2025|2026/);
  });

  it("пустое и битое значение — прочерк", () => {
    expect(formatRelative(null, now)).toBe("—");
    expect(formatRelative("не дата", now)).toBe("—");
  });
});

describe("formatMembers", () => {
  it("тысячи сокращает", () => {
    expect(formatMembers(null)).toBe("—");
    expect(formatMembers(940)).toBe("940");
    expect(formatMembers(12400)).toBe("12.4K");
  });
});

describe("truncate", () => {
  it("режет по длине и схлопывает пробелы", () => {
    expect(truncate("  много   пробелов  ", 100)).toBe("много пробелов");
    expect(truncate("абвгде", 4)).toBe("абв…");
  });
});

describe("scoreRatio", () => {
  it("держится в границах 0..1", () => {
    expect(scoreRatio(5, 10)).toBe(0.5);
    expect(scoreRatio(20, 10)).toBe(1);
    expect(scoreRatio(5, 0)).toBe(0);
  });
});
