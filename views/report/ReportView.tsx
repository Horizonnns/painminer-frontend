"use client";

import { useNicheReport } from "@/entities/niche/api/queries";
import { ChatsTable } from "@/widgets/chats-table/ChatsTable";
import { FindingsCard } from "@/widgets/findings-card/FindingsCard";
import { NgramPanel } from "@/widgets/ngram-panel/NgramPanel";
import { ApiError } from "@/shared/api/client";
import { MESSAGES } from "@/shared/config/messages";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { ErrorState } from "@/shared/ui/StateBlock";

export function ReportView({ niche }: { niche: string }) {
  const { data, isPending, error, refetch } = useNicheReport(niche);

  if (isPending) return <SkeletonList rows={4} />;

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
      <section>
        <h2 className="text-sm font-medium text-text">{MESSAGES.report.ngrams}</h2>
        <p className="mt-1 mb-3 text-xs text-faint">{MESSAGES.report.ngramsHint}</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <NgramPanel
            title={MESSAGES.report.bigrams}
            niche={niche}
            ngrams={data.bigrams}
          />
          <NgramPanel
            title={MESSAGES.report.trigrams}
            niche={niche}
            ngrams={data.trigrams}
          />
        </div>
      </section>

      <FindingsCard
        title={MESSAGES.report.money}
        hint={MESSAGES.report.moneyHint}
        findings={data.money}
        emptyTitle={MESSAGES.report.noMoney}
      />

      <FindingsCard
        title={MESSAGES.report.top}
        findings={data.top}
        emptyTitle={MESSAGES.findings.noneTitle}
        emptyHint={MESSAGES.findings.noneHint}
      />

      <ChatsTable chats={data.per_chat} />
    </div>
  );
}
