import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import {
  applyPatch,
  flattenPages,
  maxScore,
  patchPages,
} from "@/entities/finding/model/patch";
import type { Finding, FindingsPage } from "@/shared/api/types";

function finding(message_id: number, score = 1): Finding {
  return {
    message_id,
    chat_id: 1,
    chat_title: "Чат",
    chat_username: "chat",
    tg_msg_id: message_id,
    date: null,
    text: "текст",
    replies: 0,
    reactions: 0,
    link: null,
    queries: [],
    cluster: null,
    verdict: null,
    score,
    has_money: false,
    is_question: false,
    repeats: 1,
    first_seen: null,
    last_seen: null,
  };
}

function page(items: Finding[], offset = 0): FindingsPage {
  return {
    items,
    total: 4,
    limit: 2,
    offset,
    facets: { chats: [], queries: [], clusters: [] },
  };
}

const DATA: InfiniteData<FindingsPage> = {
  pages: [page([finding(1, 10), finding(2, 3)]), page([finding(3, 7)], 2)],
  pageParams: [0, 2],
};

describe("applyPatch", () => {
  it("ставит кластер и вердикт вместе", () => {
    const patched = applyPatch(finding(1), { cluster: "импорт", verdict: "yes" });
    expect(patched).toMatchObject({ cluster: "импорт", verdict: "yes" });
  });

  it("умеет очищать разметку", () => {
    const marked = applyPatch(finding(1), { cluster: "импорт", verdict: "yes" });
    expect(applyPatch(marked, { cluster: null, verdict: null })).toMatchObject({
      cluster: null,
      verdict: null,
    });
  });
});

describe("patchPages", () => {
  it("правит нужную находку на второй странице", () => {
    const next = patchPages(DATA, 3, { cluster: "отзывы", verdict: "maybe" });
    expect(next?.pages[1].items[0]).toMatchObject({ cluster: "отзывы", verdict: "maybe" });
    expect(next?.pages[0].items[0].cluster).toBeNull();
  });

  it("не мутирует исходные данные", () => {
    patchPages(DATA, 1, { cluster: "импорт", verdict: "yes" });
    expect(DATA.pages[0].items[0].cluster).toBeNull();
  });

  it("неизвестный id ничего не ломает", () => {
    const next = patchPages(DATA, 999, { cluster: "x", verdict: "no" });
    expect(flattenPages(next)).toHaveLength(3);
  });

  it("пустые данные пропускает", () => {
    expect(patchPages(undefined, 1, { cluster: null, verdict: null })).toBeUndefined();
  });
});

describe("flattenPages и maxScore", () => {
  it("склеивает страницы по порядку", () => {
    expect(flattenPages(DATA).map((f) => f.message_id)).toEqual([1, 2, 3]);
  });

  it("находит максимум score", () => {
    expect(maxScore(flattenPages(DATA))).toBe(10);
    expect(maxScore([])).toBe(0);
  });
});
