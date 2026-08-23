"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/api/client";
import type { NicheBrief, NicheConfig, NicheSummary } from "@/shared/api/types";

export const nicheKeys = {
  all: ["niches"] as const,
  list: () => [...nicheKeys.all, "list"] as const,
  summary: (niche: string) => [...nicheKeys.all, niche, "summary"] as const,
  config: (niche: string) => [...nicheKeys.all, niche, "config"] as const,
};

export function useNiches() {
  return useQuery({
    queryKey: nicheKeys.list(),
    queryFn: () => apiGet<NicheBrief[]>("/niches"),
  });
}

export function useNicheSummary(niche: string) {
  return useQuery({
    queryKey: nicheKeys.summary(niche),
    queryFn: () => apiGet<NicheSummary>(`/niches/${niche}/summary`),
  });
}

export function useNicheConfig(niche: string) {
  return useQuery({
    queryKey: nicheKeys.config(niche),
    queryFn: () => apiGet<NicheConfig>(`/niches/${niche}/config`),
  });
}

export function useCreateNiche() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (niche: string) =>
      apiSend<NicheConfig>("POST", "/niches", { niche }),
    onSuccess: () => client.invalidateQueries({ queryKey: nicheKeys.all }),
  });
}
