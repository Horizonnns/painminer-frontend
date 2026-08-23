"use client";

import Link from "next/link";

import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Card, CardHeader } from "@/shared/ui/Card";
import { StateBlock } from "@/shared/ui/StateBlock";
import { scoreRatio } from "@/shared/lib/format";
import type { Ngram } from "@/shared/api/types";

interface NgramPanelProps {
  title: string;
  niche: string;
  ngrams: Ngram[];
}

/**
 * Частотные n-граммы. Каждая ведёт в находки с этой формулировкой —
 * отсюда и начинается разбор кластера.
 */
export function NgramPanel({ title, niche, ngrams }: NgramPanelProps) {
  const max = ngrams.reduce((peak, item) => Math.max(peak, item.count), 0);

  return (
    <Card>
      <CardHeader title={title} />
      {ngrams.length === 0 ? (
        <div className="p-4">
          <StateBlock
            title={MESSAGES.report.noNgrams}
            hint={MESSAGES.report.noNgramsHint}
          />
        </div>
      ) : (
        <ul className="p-2">
          {ngrams.map((item) => (
            <li key={item.gram}>
              <Link
                href={`${ROUTES.findings(niche)}?search=${encodeURIComponent(item.gram)}`}
                title={MESSAGES.report.openFindings}
                className="group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-raised"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-muted group-hover:text-text">
                  {item.gram}
                </span>
                <span className="h-1 w-16 shrink-0 rounded-full bg-divider">
                  <span
                    className="block h-1 rounded-full bg-accent"
                    style={{ width: `${Math.round(scoreRatio(item.count, max) * 100)}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right font-mono text-xs text-faint tabular-nums">
                  {item.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
