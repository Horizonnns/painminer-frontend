import { describe, expect, it } from "vitest";

import {
  countAddable,
  countAdded,
  defaultSelection,
  existingSet,
  isAdded,
  isAddable,
  selectedRefs,
  toggle,
} from "@/features/discover-chats/model/selection";
import type { Candidate } from "@/shared/api/types";

const group = (tg_id: number, username: string | null): Candidate => ({
  tg_id,
  title: `Чат ${tg_id}`,
  username,
  members: 100,
  kind: "group",
});

const channel: Candidate = {
  tg_id: 99,
  title: "Новости",
  username: "news",
  members: 9000,
  kind: "channel",
};

const CANDIDATES = [group(1, "alpha"), group(2, null), group(3, "beta"), channel];
const NONE = existingSet([]);

describe("isAddable", () => {
  it("группа с username подходит", () => {
    expect(isAddable(group(1, "alpha"))).toBe(true);
  });

  it("без username добавить нельзя — ссылка не соберётся", () => {
    expect(isAddable(group(2, null))).toBe(false);
  });

  it("канал не подходит: нам нужны обсуждения, а не вещание", () => {
    expect(isAddable(channel)).toBe(false);
  });
});

describe("isAdded", () => {
  it("сравнивает username без учёта регистра", () => {
    expect(isAdded(group(1, "Alpha"), existingSet(["alpha"]))).toBe(true);
    expect(isAdded(group(1, "alpha"), existingSet(["beta"]))).toBe(false);
    expect(isAdded(group(2, null), existingSet(["alpha"]))).toBe(false);
  });
});

describe("defaultSelection", () => {
  it("отмечает пригодные и ещё не добавленные", () => {
    expect([...defaultSelection(CANDIDATES, NONE)]).toEqual([1, 3]);
    expect([...defaultSelection(CANDIDATES, existingSet(["ALPHA"]))]).toEqual([3]);
  });
});

describe("toggle", () => {
  it("снимает и ставит отметку", () => {
    const once = toggle(new Set([1]), 1);
    expect(once.has(1)).toBe(false);
    expect(toggle(once, 5).has(5)).toBe(true);
  });

  it("не мутирует исходное множество", () => {
    const source = new Set([1]);
    toggle(source, 1);
    expect(source.has(1)).toBe(true);
  });
});

describe("selectedRefs", () => {
  it("отдаёт username отмеченных пригодных", () => {
    expect(selectedRefs(CANDIDATES, new Set([1, 2, 99]), NONE)).toEqual(["alpha"]);
  });

  it("уже добавленный повторно не отдаёт", () => {
    expect(selectedRefs(CANDIDATES, new Set([1, 3]), existingSet(["alpha"]))).toEqual([
      "beta",
    ]);
  });

  it("пустой выбор — пустой список", () => {
    expect(selectedRefs(CANDIDATES, new Set(), NONE)).toEqual([]);
  });
});

describe("countAddable", () => {
  it("считает то, что реально можно добавить", () => {
    expect(countAddable(CANDIDATES, NONE)).toBe(2);
    expect(countAddable(CANDIDATES, existingSet(["alpha", "beta"]))).toBe(0);
    expect(countAddable([], NONE)).toBe(0);
  });
});

describe("countAdded", () => {
  it("считает только уже добавленные", () => {
    expect(countAdded(CANDIDATES, existingSet(["alpha"]))).toBe(1);
    expect(countAdded(CANDIDATES, NONE)).toBe(0);
  });

  it("каналы и чаты без username в «уже добавленных» не числятся", () => {
    // Ни один из них добавить было нельзя, значит и добавленными они не стали.
    expect(countAdded([group(2, null), channel], existingSet(["news"]))).toBe(1);
  });
});
