/** Локальная правка находки в кэше — чтобы разметка отражалась мгновенно. */

import type { InfiniteData } from "@tanstack/react-query";

import type { Finding, FindingsPage } from "@/shared/api/types";

export interface FindingPatch {
  cluster: string | null;
  verdict: string | null;
}

export function applyPatch(finding: Finding, patch: FindingPatch): Finding {
  return { ...finding, cluster: patch.cluster, verdict: patch.verdict };
}

/** Заменяет находку во всех загруженных страницах, не трогая остальные. */
export function patchPages(
  data: InfiniteData<FindingsPage> | undefined,
  messageId: number,
  patch: FindingPatch,
): InfiniteData<FindingsPage> | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.message_id === messageId ? applyPatch(item, patch) : item,
      ),
    })),
  };
}

/** Все находки из загруженных страниц одним списком. */
export function flattenPages(data: InfiniteData<FindingsPage> | undefined): Finding[] {
  return data ? data.pages.flatMap((page) => page.items) : [];
}

export function maxScore(findings: Finding[]): number {
  return findings.reduce((peak, item) => Math.max(peak, item.score), 0);
}
