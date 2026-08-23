"use client";

import { useEffect, useState } from "react";

import { runEventsUrl } from "@/shared/api/client";
import {
  applyEvent,
  isFinished,
  type RunView,
} from "@/features/run-scan/model/events";

const EVENTS = ["state", "step", "done"] as const;

interface StreamState {
  runId: string;
  view: RunView | null;
  error: boolean;
}

/**
 * Подписка на прогресс прогона.
 *
 * Состояние помнит, какому прогону принадлежит, и наружу отдаётся только
 * совпадающее — так не нужен сброс в теле эффекта, а от прошлого прогона
 * ничего не протекает.
 *
 * Поток закрываем сами: после `done` сервер обрывает соединение, а
 * EventSource иначе начал бы переподключаться.
 */
export function useRunStream(runId: string | null, onFinish?: () => void) {
  const [state, setState] = useState<StreamState | null>(null);

  useEffect(() => {
    if (!runId) return;

    const source = new EventSource(runEventsUrl(runId));

    const handle = (name: string) => (event: MessageEvent<string>) => {
      let payload: unknown;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return; // битый кадр пропускаем, поток продолжается
      }

      setState((current) => ({
        runId,
        error: false,
        view: applyEvent(current?.runId === runId ? current.view : null, name, payload),
      }));

      if (name === "done") {
        source.close();
        onFinish?.();
      }
    };

    const listeners = EVENTS.map((name) => {
      const listener = handle(name) as EventListener;
      source.addEventListener(name, listener);
      return [name, listener] as const;
    });

    source.onerror = () => {
      setState((current) => ({
        runId,
        error: true,
        view: current?.runId === runId ? current.view : null,
      }));
      source.close();
    };

    return () => {
      listeners.forEach(([name, listener]) => source.removeEventListener(name, listener));
      source.close();
    };
  }, [runId, onFinish]);

  // Пока прогон идёт, показываем его. Когда он кончился и /health очистился,
  // runId становится null — но итог должен остаться на экране, а не исчезнуть.
  const current =
    state && (state.runId === runId || (runId === null && isFinished(state.view?.status)))
      ? state
      : null;

  return {
    view: current?.view ?? null,
    streamError: current?.error ?? false,
    finished: isFinished(current?.view?.status),
  };
}
