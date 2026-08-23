"use client";

import { ExternalLink } from "lucide-react";

import { ScoreBadge } from "@/entities/finding/ui/ScoreBadge";
import { VerdictChip } from "@/entities/finding/ui/VerdictChip";
import { Badge } from "@/shared/ui/Badge";
import { MESSAGES } from "@/shared/config/messages";
import { cn } from "@/shared/lib/cn";
import { formatRelative, truncate } from "@/shared/lib/format";
import type { Finding } from "@/shared/api/types";

interface FindingRowProps {
  finding: Finding;
  max: number;
  limit?: number;
  selected?: boolean;
  onSelect?: (finding: Finding) => void;
}

/**
 * Строка находки: текст, метрики, ссылка. Автора не показываем — ни имени,
 * ни username, ни id.
 */
export function FindingRow({
  finding,
  max,
  limit = 180,
  selected = false,
  onSelect,
}: FindingRowProps) {
  return (
    <article
      className={cn(
        "flex gap-4 border-b border-divider px-4 py-3 transition-colors last:border-b-0",
        selected ? "bg-accent/5" : onSelect ? "hover:bg-raised/60" : undefined,
      )}
    >
      <ScoreBadge score={finding.score} max={max} />
      <div className="min-w-0 flex-1">
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(finding)}
            aria-current={selected}
            className="block w-full text-left text-sm leading-relaxed text-text"
          >
            {truncate(finding.text, limit)}
          </button>
        ) : (
          <p className="text-sm leading-relaxed text-text">
            {truncate(finding.text, limit)}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-faint">
          <span className="truncate text-muted">{finding.chat_title}</span>
          <span>·</span>
          <span>{formatRelative(finding.date)}</span>
          <span>·</span>
          <span className="font-mono tabular-nums">
            {finding.replies} / {finding.reactions}
          </span>
          {finding.has_money ? <Badge tone="accent">{MESSAGES.finding.money}</Badge> : null}
          {finding.cluster ? <Badge>{finding.cluster}</Badge> : null}
          {finding.verdict ? <VerdictChip verdict={finding.verdict} /> : null}
          {finding.link ? (
            <a
              href={finding.link}
              target="_blank"
              rel="noreferrer noopener"
              className="ml-auto inline-flex items-center gap-1 text-muted transition-colors hover:text-accent"
            >
              <ExternalLink size={12} />
              {MESSAGES.finding.openInTelegram}
            </a>
          ) : (
            <span className="ml-auto" title={MESSAGES.finding.noLink}>
              —
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
