import { describe, expect, it } from "vitest";

import {
  defaultSelection,
  isAddable,
  selectedRefs,
  toggle,
  withoutExisting,
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

const CANDIDATES = [group(1, "alpha"), group(2, null), channel];

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

describe("defaultSelection", () => {
  it("отмечает только пригодные группы", () => {
    expect([...defaultSelection(CANDIDATES)]).toEqual([1]);
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
    expect(selectedRefs(CANDIDATES, new Set([1, 2, 99]))).toEqual(["alpha"]);
  });

  it("пустой выбор — пустой список", () => {
    expect(selectedRefs(CANDIDATES, new Set())).toEqual([]);
  });
});

describe("withoutExisting", () => {
  it("прячет уже добавленные, регистр не важен", () => {
    const left = withoutExisting(CANDIDATES, ["ALPHA"]);
    expect(left.map((c) => c.tg_id)).toEqual([2, 99]);
  });
});
