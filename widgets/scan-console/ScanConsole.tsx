"use client";

import {
  isFinished,
  progressPercent,
  statLines,
  type RunView,
} from "@/features/run-scan/model/events";
import { MESSAGES } from "@/shared/config/messages";
import { Badge } from "@/shared/ui/Badge";
import { Card, CardHeader } from "@/shared/ui/Card";
import { StateBlock } from "@/shared/ui/StateBlock";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";

const STATUS_TEXT: Record<string, string> = {
  running: MESSAGES.scan.running,
  done: MESSAGES.scan.done,
  stopped: MESSAGES.scan.stopped,
  failed: MESSAGES.scan.failed,
};

export function ScanConsole({
  view,
  action,
}: {
  view: RunView | null;
  action?: React.ReactNode;
}) {
  if (!view) {
    return (
      <Card>
        <CardHeader title={MESSAGES.scan.progress} />
        <div className="p-4">
          <StateBlock title={MESSAGES.scan.idleTitle} hint={MESSAGES.scan.idleHint} />
        </div>
      </Card>
    );
  }

  const percent = progressPercent(view);
  const lines = statLines(view.stats);
  const done = isFinished(view.status);

  return (
    <Card>
      <CardHeader
        title={STATUS_TEXT[view.status] ?? MESSAGES.scan.progress}
        hint={<span className="font-mono">{view.runId}</span>}
        action={action}
      />

      <div className="space-y-3 border-b border-divider p-4">
        <div className="flex items-baseline justify-between text-xs">
          <span className="truncate text-muted">
            {view.current ?? MESSAGES.states.loading}
          </span>
          <span className="ml-3 shrink-0 font-mono text-faint tabular-nums">
            {view.done} / {view.total} · {percent}%
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-divider">
          <div
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              view.status === "failed" ? "bg-bad" : done ? "bg-ok" : "bg-accent",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {lines.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 p-4 sm:grid-cols-3">
          {lines.map((line) => (
            <div key={line.key} className="flex items-baseline justify-between gap-2">
              <dt className="truncate text-xs text-faint">{line.label}</dt>
              <dd className="font-mono text-sm text-text tabular-nums">
                {formatNumber(line.value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {view.errors.length > 0 ? (
        <div className="border-t border-divider p-4">
          <p className="mb-2 text-xs text-faint">{MESSAGES.scan.problems}</p>
          <ul className="space-y-1">
            {view.errors.map((problem) => (
              <li key={problem}>
                <Badge tone="bad">{problem}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
