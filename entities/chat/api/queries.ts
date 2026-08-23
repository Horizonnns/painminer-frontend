"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/api/client";
import { nicheKeys } from "@/entities/niche/api/queries";
import type { Candidate, Chat } from "@/shared/api/types";

export const chatKeys = {
  all: (niche: string) => ["chats", niche] as const,
  discover: (niche: string, keyword: string) =>
    ["discover", niche, keyword] as const,
};

export function useChats(niche: string) {
  return useQuery({
    queryKey: chatKeys.all(niche),
    queryFn: () => apiGet<Chat[]>(`/niches/${niche}/chats`),
  });
}

/**
 * Поиск идёт в Telegram, поэтому запускается только по явному действию:
 * пустое слово — запрос не выполняется.
 */
export function useDiscover(niche: string, keyword: string) {
  return useQuery({
    queryKey: chatKeys.discover(niche, keyword),
    queryFn: () =>
      apiGet<Candidate[]>(`/niches/${niche}/discover`, { keyword, limit: 50 }),
    enabled: keyword.trim().length >= 2,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

function useInvalidateNiche(niche: string) {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: chatKeys.all(niche) });
    void client.invalidateQueries({ queryKey: nicheKeys.all });
  };
}

export function useAddChats(niche: string) {
  const invalidate = useInvalidateNiche(niche);
  return useMutation({
    mutationFn: (refs: string[]) =>
      apiSend<{ added: string[] }>("POST", `/niches/${niche}/chats`, { refs }),
    onSuccess: invalidate,
  });
}

export function useRemoveChat(niche: string) {
  const invalidate = useInvalidateNiche(niche);
  return useMutation({
    mutationFn: (ref: string) =>
      apiSend<void>(
        "DELETE",
        `/niches/${niche}/chats/${encodeURIComponent(ref)}`,
      ),
    onSuccess: invalidate,
  });
}
