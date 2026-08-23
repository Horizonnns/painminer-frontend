"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiSend } from "@/shared/api/client";
import type { AuthStatus } from "@/shared/api/types";

export const authKeys = {
  status: ["auth", "status"] as const,
};

export function useAuthStatus() {
  return useQuery({
    queryKey: authKeys.status,
    queryFn: () => apiGet<AuthStatus>("/auth/status"),
    staleTime: 0,
    retry: false,
  });
}

/**
 * Шаги входа. Ответ каждого шага — это и есть новое состояние, поэтому
 * кладём его прямо в кэш: лишний запрос ничего не уточнит.
 */
function useAuthStep<TBody>(path: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: TBody) => apiSend<AuthStatus>("POST", path, body),
    onSuccess: (status) => client.setQueryData(authKeys.status, status),
  });
}

export function useSendPhone() {
  return useAuthStep<{ phone: string }>("/auth/phone");
}

export function useSendCode() {
  return useAuthStep<{ code: string }>("/auth/code");
}

export function useSendPassword() {
  return useAuthStep<{ password: string }>("/auth/password");
}

export function useCancelLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiSend<AuthStatus>("POST", "/auth/cancel"),
    onSuccess: (status) => client.setQueryData(authKeys.status, status),
  });
}
