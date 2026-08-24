import { describe, expect, it } from "vitest";

import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  countActive,
  filtersToSearch,
  parseFilters,
  toApiQuery,
} from "@/features/filter-findings/model/query";

const parse = (search: string) => parseFilters(new URLSearchParams(search));

describe("parseFilters", () => {
  it("пустой URL даёт пустые фильтры", () => {
    expect(parse("")).toEqual({
      chat: undefined,
      query: undefined,
      cluster: undefined,
      verdict: undefined,
      money: undefined,
      question: undefined,
      search: undefined,
      kind: undefined,
      hideRepeated: undefined,
      sort: DEFAULT_SORT,
    });
  });

  it("читает все условия", () => {
    const filters = parse("chat=3&query=надоело&cluster=импорт&verdict=yes&money=true&search=склад&sort=date");
    expect(filters.chat).toBe(3);
    expect(filters.query).toBe("надоело");
    expect(filters.cluster).toBe("импорт");
    expect(filters.verdict).toBe("yes");
    expect(filters.money).toBe(true);
    expect(filters.search).toBe("склад");
    expect(filters.sort).toBe("date");
  });

  it("money=false — это отдельное условие, а не выключенный фильтр", () => {
    expect(parse("money=false").money).toBe(false);
    expect(parse("money=нет").money).toBeUndefined();
  });

  it("мусор в chat и sort игнорирует", () => {
    expect(parse("chat=abc").chat).toBeUndefined();
    expect(parse("sort=никак").sort).toBe(DEFAULT_SORT);
  });
});

describe("filtersToSearch", () => {
  it("пустые фильтры дают пустую строку", () => {
    expect(filtersToSearch(EMPTY_FILTERS)).toBe("");
  });

  it("сортировку по умолчанию в URL не пишет", () => {
    expect(filtersToSearch({ sort: DEFAULT_SORT, verdict: "yes" })).toBe("verdict=yes");
    expect(filtersToSearch({ sort: "date" })).toBe("sort=date");
  });

  it("переживает круговой проход", () => {
    const filters = { chat: 7, money: false, question: true, search: "остатк", sort: "replies" };
    expect(parse(filtersToSearch(filters))).toMatchObject(filters);
  });
});

describe("toApiQuery", () => {
  it("добавляет пагинацию", () => {
    const query = toApiQuery({ sort: "score", verdict: "none" }, 50, 25);
    expect(query).toMatchObject({ verdict: "none", sort: "score", offset: 50, limit: 25 });
  });
});

describe("countActive", () => {
  it("сортировка условием не считается", () => {
    expect(countActive(EMPTY_FILTERS)).toBe(0);
    expect(countActive({ sort: "date" })).toBe(0);
    expect(countActive({ sort: "score", money: false, chat: 2 })).toBe(2);
  });
});

describe("частые повторы", () => {
  it("читаются и пишутся в URL", () => {
    expect(parse("repeats=hide").hideRepeated).toBe(true);
    expect(parse("").hideRepeated).toBeUndefined();
    expect(filtersToSearch({ sort: DEFAULT_SORT, hideRepeated: true })).toBe("repeats=hide");
    expect(filtersToSearch({ sort: DEFAULT_SORT })).toBe("");
  });

  it("уходят в запрос к API только когда включены", () => {
    expect(toApiQuery({ sort: "score", hideRepeated: true }).hide_repeated).toBe(true);
    expect(toApiQuery({ sort: "score" }).hide_repeated).toBeUndefined();
  });

  it("считаются активным условием", () => {
    expect(countActive({ sort: "score", hideRepeated: true })).toBe(1);
  });
});

describe("тип сообщения", () => {
  it("живёт в URL как остальные фильтры", () => {
    expect(parse("kind=offer").kind).toBe("offer");
    expect(filtersToSearch({ sort: DEFAULT_SORT, kind: "complaint" })).toBe("kind=complaint");
  });

  it("уходит в запрос и считается активным условием", () => {
    expect(toApiQuery({ sort: "score", kind: "offer" }).kind).toBe("offer");
    expect(countActive({ sort: "score", kind: "offer" })).toBe(1);
  });
});
