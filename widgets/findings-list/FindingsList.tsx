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
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-divider px-4 py-2.5 text-xs text-faint">
        <span>
          {MESSAGES.findings.shown}{" "}
          <span className="font-mono text-muted tabular-nums">
            {formatNumber(findings.length)}
          </span>{" "}
          {MESSAGES.findings.total.toLowerCase()}{" "}
          <span className="font-mono text-muted tabular-nums">{formatNumber(total)}</span>
        </span>
      </div>

      <ul>
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
        <div className="border-t border-divider p-3">
          <Button size="sm" className="w-full" onClick={onLoadMore} disabled={loadingMore}>
            {MESSAGES.findings.loadMore}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
