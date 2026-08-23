import { describe, expect, it } from "vitest";

import { isBroken, sortChats } from "@/entities/chat/model/sort";
import type { Chat, ChatStatus } from "@/shared/api/types";

function chat(title: string, findings: number, status: ChatStatus = "ok"): Chat {
  return {
    id: findings + title.length,
    tg_id: null,
    username: null,
    title,
    members: null,
    status,
    added_at: null,
    last_scanned_at: null,
    findings,
    queries: [],
  };
}

describe("isBroken", () => {
  it("недоступные статусы отличает от рабочих", () => {
    expect(isBroken("ok")).toBe(false);
    expect(isBroken("new")).toBe(false);
    expect(isBroken("private")).toBe(true);
    expect(isBroken("admin_required")).toBe(true);
  });
});

describe("sortChats", () => {
  it("рабочие сверху по числу находок, сломанные в конце", () => {
    const sorted = sortChats([
      chat("Закрытый", 0, "private"),
      chat("Малый", 2),
      chat("Большой", 9),
    ]);
    expect(sorted.map((c) => c.title)).toEqual(["Большой", "Малый", "Закрытый"]);
  });

  it("при равенстве сортирует по названию", () => {
    const sorted = sortChats([chat("Яндекс", 3), chat("Авито", 3)]);
    expect(sorted.map((c) => c.title)).toEqual(["Авито", "Яндекс"]);
  });

  it("исходный массив не мутирует", () => {
    const input = [chat("Б", 1), chat("А", 5)];
    sortChats(input);
    expect(input.map((c) => c.title)).toEqual(["Б", "А"]);
  });
});
