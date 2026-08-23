import type { ReactNode } from "react";

import { Button } from "@/shared/ui/Button";
import { MESSAGES } from "@/shared/config/messages";

interface StateBlockProps {
  title: string;
  hint?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "bad";
}

/** Пустое состояние и ошибка выглядят одинаково — меняются текст и тон. */
export function StateBlock({ title, hint, action, tone = "neutral" }: StateBlockProps) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <p className={tone === "bad" ? "text-sm text-bad" : "text-sm text-text"}>{title}</p>
      {hint ? <p className="mx-auto mt-2 max-w-md text-xs text-faint">{hint}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <StateBlock
      tone="bad"
      title={MESSAGES.states.errorTitle}
      hint={message}
      action={
        onRetry ? (
          <Button size="sm" onClick={onRetry}>
            {MESSAGES.states.retry}
          </Button>
        ) : null
      }
    />
  );
}
