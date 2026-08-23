import { describe, expect, it } from "vitest";

import { chooseNextStep } from "@/entities/niche/model/next-step";

describe("chooseNextStep", () => {
  it("без входа зовёт войти", () => {
    expect(chooseNextStep({ authorized: false, chats: 0, findings: 0 })).toBe("login");
    expect(chooseNextStep({ authorized: false, chats: 3, findings: 0 })).toBe("login");
  });

  it("после входа без чатов — добавить чаты", () => {
    expect(chooseNextStep({ authorized: true, chats: 0, findings: 0 })).toBe("chats");
  });

  it("чаты есть, находок нет — запустить прогон", () => {
    expect(chooseNextStep({ authorized: true, chats: 2, findings: 0 })).toBe("scan");
  });

  it("находки важнее всего остального", () => {
    expect(chooseNextStep({ authorized: true, chats: 2, findings: 40 })).toBe("findings");
    // Даже если вход отвалился, разбирать собранное можно и без Telegram.
    expect(chooseNextStep({ authorized: false, chats: 0, findings: 5 })).toBe("findings");
  });
});
