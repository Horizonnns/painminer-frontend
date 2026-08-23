"use client";

import { useNicheSummary } from "@/entities/niche/api/queries";
import { ChatStatusBadge } from "@/entities/chat/ui/ChatStatusBadge";
import { FindingRow } from "@/entities/finding/ui/FindingRow";
import { ApiError } from "@/shared/api/client";
import { MESSAGES } from "@/shared/config/messages";
import { Badge } from "@/shared/ui/Badge";
import { Card, CardHeader } from "@/shared/ui/Card";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { ErrorState, StateBlock } from "@/shared/ui/StateBlock";
import { formatNumber, formatRelative } from "@/shared/lib/format";
import type { Finding } from "@/shared/api/types";

function Counters({ counts }: { counts: Record<string, number> }) {
  const items = [
    { label: MESSAGES.niches.findings, value: counts.messages ?? 0 },
    { label: MESSAGES.niches.hits, value: counts.hits ?? 0 },
    { label: MESSAGES.niches.chats, value: counts.chats ?? 0 },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="px-4 py-3">
          <div className="font-mono text-2xl text-text tabular-nums">
            {formatNumber(item.value)}
          </div>
          <div className="mt-1 text-xs text-faint">{item.label}</div>
        </Card>
      ))}
    </div>
  );
}

function FindingsCard({
  title,
  findings,
  emptyTitle,
  emptyHint,
}: {
  title: string;
  findings: Finding[];
  emptyTitle: string;
  emptyHint?: string;
}) {
  const max = findings.reduce((peak, item) => Math.max(peak, item.score), 0);
  return (
    <Card>
      <CardHeader title={title} />
      {findings.length === 0 ? (
        <div className="p-4">
          <StateBlock title={emptyTitle} hint={emptyHint} />
        </div>
      ) : (
        findings.map((finding) => (
          <FindingRow key={finding.message_id} finding={finding} max={max} />
        ))
      )}
    </Card>
  );
}

export function NicheDashboardView({ niche }: { niche: string }) {
  const { data, isPending, error, refetch } = useNicheSummary(niche);

  if (isPending) return <SkeletonList rows={3} />;

  if (error) {
    return (
      <ErrorState
        message={error instanceof ApiError ? error.humanMessage : MESSAGES.errors.unknown}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Counters counts={data.counts} />

      <FindingsCard
        title={MESSAGES.dashboard.top}
        findings={data.top}
        emptyTitle={MESSAGES.dashboard.noFindings}
        emptyHint={MESSAGES.dashboard.noFindingsHint}
      />

      {data.money.length > 0 ? (
        <FindingsCard
          title={MESSAGES.dashboard.money}
          findings={data.money}
          emptyTitle={MESSAGES.dashboard.noFindings}
        />
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title={MESSAGES.dashboard.clusters} />
          <div className="flex flex-wrap gap-2 p-4">
            {data.clusters.length === 0 ? (
              <p className="text-xs text-faint">{MESSAGES.dashboard.noClusters}</p>
            ) : (
              data.clusters.map((cluster) => (
                <Badge key={cluster.value} tone="accent">
                  {cluster.label} · {cluster.count}
                </Badge>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={MESSAGES.dashboard.chats}
            hint={
              data.last_scanned_at
                ? `${MESSAGES.niches.lastScan}: ${formatRelative(data.last_scanned_at)}`
                : MESSAGES.niches.neverScanned
            }
          />
          {data.chats.length === 0 ? (
            <p className="p-4 text-xs text-faint">{MESSAGES.niches.emptyHint}</p>
          ) : (
            <ul>
              {data.chats.map((chat) => (
                <li
                  key={chat.id}
                  className="flex items-center gap-3 border-b border-divider px-4 py-2.5 last:border-b-0"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-text">
                    {chat.title}
                  </span>
                  <span className="font-mono text-xs text-faint tabular-nums">
                    {formatNumber(chat.findings)}
                  </span>
                  <ChatStatusBadge status={chat.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
