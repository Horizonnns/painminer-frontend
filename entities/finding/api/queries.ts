"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/api/client";
import { PAGE_SIZE } from "@/shared/config/constants";
import type { FindingsPage, FindingsQuery, NotePayload } from "@/shared/api/types";
import { patchPages, type FindingPatch } from "@/entities/finding/model/patch";
import { nicheKeys } from "@/entities/niche/api/queries";

export const findingKeys = {
  all: (niche: string) => ["findings", niche] as const,
  list: (niche: string, query: FindingsQuery) =>
    ["findings", niche, query] as const,
};

export function useFindings(niche: string, query: FindingsQuery) {
  return useInfiniteQuery({
    queryKey: findingKeys.list(niche, query),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      apiGet<FindingsPage>(`/niches/${niche}/findings`, {
        ...query,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (last: FindingsPage) => {
      const next = last.offset + last.limit;
      return next < last.total ? next : undefined;
    },
  });
}

interface AnnotateArgs {
  messageId: number;
  payload: NotePayload;
}

/**
 * Разметка находки. Панель всегда шлёт кластер и вердикт вместе: в отчёт
 * идёт последняя заметка целиком, поэтому частичная отправка стёрла бы
 * соседнее поле.
 */
export function useAnnotate(niche: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, payload }: AnnotateArgs) =>
      apiSend<unknown>("POST", `/messages/${messageId}/notes`, payload),

    onMutate: async ({ messageId, payload }: AnnotateArgs) => {
      const key = { queryKey: findingKeys.all(niche) };
      await client.cancelQueries(key);
      const snapshots = client.getQueriesData<InfiniteData<FindingsPage>>(key);
      const patch: FindingPatch = {
        cluster: payload.cluster ?? null,
        verdict: payload.verdict ?? null,
      };
      for (const [queryKey, data] of snapshots) {
        client.setQueryData(queryKey, patchPages(data, messageId, patch));
      }
      return { snapshots };
    },

    onError: (_error, _args, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        client.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      void client.invalidateQueries({ queryKey: findingKeys.all(niche) });
      void client.invalidateQueries({ queryKey: nicheKeys.summary(niche) });
    },
  });
}
