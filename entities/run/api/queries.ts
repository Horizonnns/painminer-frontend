"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { apiGet, apiSend } from "@/shared/api/client";
import { nicheKeys } from "@/entities/niche/api/queries";
import { findingKeys } from "@/entities/finding/api/queries";
import type { RunParams, RunState } from "@/shared/api/types";

interface Health {
  status: string;
  active_run: string | null;
}

export const runKeys = {
  health: ["health"] as const,
  run: (runId: string) => ["run", runId] as const,
};

/** Даёт переподключиться к прогону, начатому до перезагрузки страницы. */
export function useActiveRun() {
  return useQuery({
    queryKey: runKeys.health,
    queryFn: () => apiGet<Health>("/health"),
    staleTime: 0,
  });
}

export function useStartRun(niche: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: RunParams) =>
      apiSend<RunState>("POST", `/niches/${niche}/runs`, params),
    onSuccess: () => client.invalidateQueries({ queryKey: runKeys.health }),
  });
}

export function useStopRun() {
  return useMutation({
    mutationFn: (runId: string) => apiSend<RunState>("POST", `/runs/${runId}/stop`),
  });
}

/**
 * После прогона данные ниши устарели — перечитываем находки и сводку.
 *
 * Ссылка стабильна намеренно: этот колбэк уходит в зависимости эффекта с
 * подпиской на SSE, и новая функция на каждый рендер переоткрывала бы поток
 * по кругу.
 */
export function useRefreshAfterRun(niche: string) {
  const client = useQueryClient();
  return useCallback(() => {
    void client.invalidateQueries({ queryKey: findingKeys.all(niche) });
    void client.invalidateQueries({ queryKey: nicheKeys.all });
    void client.invalidateQueries({ queryKey: runKeys.health });
  }, [client, niche]);
}
