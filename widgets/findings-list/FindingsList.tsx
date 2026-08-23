"use client";

import { FindingRow } from "@/entities/finding/ui/FindingRow";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";
import { formatNumber } from "@/shared/lib/format";
import type { Finding } from "@/shared/api/types";

interface FindingsListProps {
  findings: Finding[];
  max: number;
  total: number;
  selectedId: number | null;
  onSelect: (finding: Finding) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

export function FindingsList({
  findings,
  max,
  total,
  selectedId,
  onSelect,
  onLoadMore,
  hasMore,
  loadingMore,
}: FindingsListProps) {
  return (
    // Высота ограничена высотой окна: скролл живёт внутри списка, а шапка со
    // счётчиком и кнопка «показать ещё» остаются на виду.
    <div className="flex max-h-[calc(100vh-14rem)] flex-col rounded-lg border border-border bg-surface">
      <div className="flex shrink-0 items-center justify-between border-b border-divider px-4 py-2.5 text-xs text-faint">
        <span>
          {MESSAGES.findings.shown}{" "}
          <span className="font-mono text-muted tabular-nums">
            {formatNumber(findings.length)}
          </span>{" "}
          {MESSAGES.findings.total.toLowerCase()}{" "}
          <span className="font-mono text-muted tabular-nums">{formatNumber(total)}</span>
        </span>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {findings.map((finding) => (
          <li key={finding.message_id}>
            <FindingRow
              finding={finding}
              max={max}
              selected={finding.message_id === selectedId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div className="shrink-0 border-t border-divider p-3">
          <Button size="sm" className="w-full" onClick={onLoadMore} disabled={loadingMore}>
            {MESSAGES.findings.loadMore}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
