import { describe, expect, it } from "vitest";

import {
  applyEvent,
  isFinished,
  progressPercent,
  statLines,
  toView,
} from "@/features/run-scan/model/events";
import type { RunState, RunStatus, ScanStats } from "@/shared/api/types";

const STATS: ScanStats = {
  chats_ok: 1,
  chats_failed: 0,
  queries_run: 3,
  new_messages: 4,
  updated_messages: 0,
  refreshed: 0,
  hits: 5,
  skipped_empty: 0,
  skipped_short: 2,
  skipped_noise: 0,
  skipped_crosspost: 0,
  flood_waits: 0,
  flood_seconds: 0,
  errors: [],
  interrupted: false,
};

const STATE: RunState = {
  run_id: "abc123",
  niche: "wb",
  status: "running",
  started_at: "2026-08-23T10:00:00Z",
  finished_at: null,
  done: 2,
  total: 10,
  current: "Чат A · надоело вручную",
  stats: STATS,
  errors: [],
};

describe("applyEvent", () => {
  it("state задаёт состояние целиком", () => {
    const view = applyEvent(null, "state", STATE);
    expect(view).toMatchObject({ runId: "abc123", done: 2, total: 10, status: "running" });
  });

  it("step двигает только прогресс", () => {
    const view = applyEvent(toView(STATE), "step", {
      done: 7,
      total: 10,
      current: "Чат B · готов заплатить",
      stats: { ...STATS, new_messages: 9 },
    });
    expect(view).toMatchObject({ done: 7, current: "Чат B · готов заплатить" });
    expect(view?.stats?.new_messages).toBe(9);
    expect(view?.status).toBe("running");
  });

  it("done переводит в финальный статус", () => {
    const view = applyEvent(toView(STATE), "done", {
      ...STATE,
      status: "done",
      done: 10,
      finished_at: "2026-08-23T10:05:00Z",
    });
    expect(view?.status).toBe("done");
    expect(view?.done).toBe(10);
  });

  it("ошибки прогона подтягивает из статистики", () => {
    const view = applyEvent(toView(STATE), "step", {
      stats: { ...STATS, errors: ["closed_chat: private"] },
    });
    expect(view?.errors).toEqual(["closed_chat: private"]);
  });

  it("незнакомое событие и step без состояния ничего не ломают", () => {
    expect(applyEvent(toView(STATE), "ping", {})).toMatchObject({ done: 2 });
    expect(applyEvent(null, "step", { done: 5 })).toBeNull();
  });
});

describe("progressPercent", () => {
  it("считает долю и не выходит за 100", () => {
    expect(progressPercent(toView(STATE))).toBe(20);
    expect(progressPercent({ ...toView(STATE), done: 99, total: 10 })).toBe(100);
  });

  it("нулевой total не роняет деление", () => {
    expect(progressPercent({ ...toView(STATE), total: 0 })).toBe(0);
    expect(progressPercent(null)).toBe(0);
  });
});

describe("isFinished", () => {
  it("различает работающий и завершённый прогон", () => {
    expect(isFinished("running")).toBe(false);
    expect(isFinished(undefined)).toBe(false);
    const final: RunStatus[] = ["done", "failed", "stopped"];
    expect(final.every((status) => isFinished(status))).toBe(true);
  });
});

describe("statLines", () => {
  it("главные счётчики показывает всегда, нулевые прочие прячет", () => {
    const keys = statLines(STATS).map((line) => line.key);
    expect(keys).toContain("new_messages");
    expect(keys).toContain("chats_ok");
    expect(keys).toContain("skipped_short");
    expect(keys).not.toContain("skipped_noise");
  });

  it("подставляет русские подписи", () => {
    expect(statLines(STATS)[0].label).toBe("новых сообщений");
  });

  it("без статистики отдаёт пустой список", () => {
    expect(statLines(null)).toEqual([]);
  });
});
