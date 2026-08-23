"use client";

import { useCallback, useMemo, useState } from "react";

import { useAnnotate, useFindings } from "@/entities/finding/api/queries";
import { flattenPages, maxScore } from "@/entities/finding/model/patch";
import { NotePanel } from "@/features/annotate-finding/ui/NotePanel";
import { useVerdictHotkeys } from "@/features/annotate-finding/model/use-verdict-hotkeys";
import { toApiQuery } from "@/features/filter-findings/model/query";
import { useFindingsFilters } from "@/features/filter-findings/model/use-findings-filters";
import { FiltersPanel } from "@/features/filter-findings/ui/FiltersPanel";
import { FindingsList } from "@/widgets/findings-list/FindingsList";
import { ApiError } from "@/shared/api/client";
import { MESSAGES } from "@/shared/config/messages";
import { Card, CardHeader } from "@/shared/ui/Card";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { ErrorState, StateBlock } from "@/shared/ui/StateBlock";
import type { Facets, Verdict } from "@/shared/api/types";

const EMPTY_FACETS: Facets = { chats: [], queries: [], clusters: [] };

export function FindingsView({ niche }: { niche: string }) {
  const { filters, update, reset } = useFindingsFilters();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const query = useMemo(() => toApiQuery(filters), [filters]);
  const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFindings(niche, query);
  const annotate = useAnnotate(niche);

  const findings = useMemo(() => flattenPages(data), [data]);
  const facets = data?.pages[0]?.facets ?? EMPTY_FACETS;
  const total = data?.pages[0]?.total ?? 0;
  const max = useMemo(() => maxScore(findings), [findings]);
  const selected = findings.find((item) => item.message_id === selectedId) ?? null;

  const move = useCallback(
    (delta: number) => {
      if (findings.length === 0) return;
      const index = findings.findIndex((item) => item.message_id === selectedId);
      const next = index === -1 ? 0 : Math.min(findings.length - 1, Math.max(0, index + delta));
      setSelectedId(findings[next].message_id);
    },
    [findings, selectedId],
  );

  const setVerdict = useCallback(
    (verdict: Verdict) => {
      if (!selected) return;
      annotate.mutate({
        messageId: selected.message_id,
        payload: { cluster: selected.cluster, verdict },
      });
    },
    [annotate, selected],
  );

  useVerdictHotkeys({ onVerdict: setVerdict, onMove: move, enabled: findings.length > 0 });

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)_320px]">
      <FiltersPanel filters={filters} facets={facets} onUpdate={update} onReset={reset} />

      <div>
        {isPending ? <SkeletonList rows={4} /> : null}

        {error ? (
          <ErrorState
            message={error instanceof ApiError ? error.humanMessage : MESSAGES.errors.unknown}
            onRetry={() => void refetch()}
          />
        ) : null}

        {data && findings.length === 0 ? (
          <StateBlock
            title={total === 0 ? MESSAGES.findings.noneTitle : MESSAGES.findings.emptyTitle}
            hint={total === 0 ? MESSAGES.findings.noneHint : MESSAGES.findings.emptyHint}
          />
        ) : null}

        {findings.length > 0 ? (
          <FindingsList
            findings={findings}
            max={max}
            total={total}
            selectedId={selectedId}
            onSelect={(finding) => setSelectedId(finding.message_id)}
            onLoadMore={() => void fetchNextPage()}
            hasMore={Boolean(hasNextPage)}
            loadingMore={isFetchingNextPage}
          />
        ) : null}
      </div>

      <Card className="flex max-h-[calc(100vh-14rem)] flex-col lg:sticky lg:top-36">
        <CardHeader title={MESSAGES.note.title} />
        {selected ? (
          <NotePanel
            key={selected.message_id}
            finding={selected}
            clusters={facets.clusters}
            saving={annotate.isPending}
            onSave={(payload) =>
              annotate.mutate({ messageId: selected.message_id, payload })
            }
          />
        ) : (
          <p className="p-4 text-xs text-faint">{MESSAGES.findings.selectHint}</p>
        )}
      </Card>
    </div>
  );
}
