"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { STALE_TIME_MS } from "@/shared/config/constants";

const MAX_ATTEMPTS = 2;

/**
 * Повторять есть смысл сетевой сбой и 5xx, но не 404/409/422.
 * Статус читаем как обычное поле: `instanceof` через границы бандлов
 * ненадёжен, а нам тут важна только цифра.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_ATTEMPTS) return false;
  const status = (error as { status?: number } | null)?.status;
  return status === undefined || status === 0 || status >= 500;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            // API живёт на 127.0.0.1: доступность интернета к делу не относится,
            // иначе React Query поставит запрос на паузу и экран замрёт на скелетоне.
            networkMode: "always",
            refetchOnWindowFocus: false,
            retry: shouldRetry,
          },
          mutations: { networkMode: "always" },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
