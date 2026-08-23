"use client";

import Link from "next/link";

import { useNicheSummary } from "@/entities/niche/api/queries";
import { useAuthStatus } from "@/entities/auth/api/queries";
import { ChatsTable } from "@/widgets/chats-table/ChatsTable";
import { NextStep } from "@/widgets/next-step/NextStep";
import { FindingsCard } from "@/widgets/findings-card/FindingsCard";
import { ApiError } from "@/shared/api/client";
import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Badge } from "@/shared/ui/Badge";
import { Card, CardHeader } from "@/shared/ui/Card";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { ErrorState } from "@/shared/ui/StateBlock";
import { formatNumber } from "@/shared/lib/format";

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

export function NicheDashboardView({ niche }: { niche: string }) {
  const { data, isPending, error, refetch } = useNicheSummary(niche);
  const auth = useAuthStatus();

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
      <NextStep
        niche={niche}
        authorized={Boolean(auth.data?.authorized)}
        chats={data.chats.length}
        findings={data.counts.messages ?? 0}
      />

      <Counters counts={data.counts} />

      <FindingsCard
        title={MESSAGES.dashboard.top}
        findings={data.top}
        emptyTitle={MESSAGES.dashboard.noFindings}
        emptyHint={MESSAGES.dashboard.noFindingsHint}
        action={
          <Link
            href={ROUTES.findings(niche)}
            className="text-xs text-muted transition-colors hover:text-accent"
          >
            {MESSAGES.dashboard.openFindings}
          </Link>
        }
      />

      {data.money.length > 0 ? (
        <FindingsCard
          title={MESSAGES.dashboard.money}
          findings={data.money}
          emptyTitle={MESSAGES.report.noMoney}
        />
      ) : null}

      <Card>
        <CardHeader title={MESSAGES.dashboard.clusters} />
        <div className="flex flex-wrap gap-2 p-4">
          {data.clusters.length === 0 ? (
            <p className="text-xs text-faint">{MESSAGES.dashboard.noClusters}</p>
          ) : (
            data.clusters.map((cluster) => (
              <Link
                key={cluster.value}
                href={`${ROUTES.findings(niche)}?cluster=${encodeURIComponent(cluster.value)}`}
              >
                <Badge tone="accent">
                  {cluster.label} · {cluster.count}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </Card>

      <ChatsTable chats={data.chats} />
    </div>
  );
}
