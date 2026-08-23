"use client";

import { FindingRow } from "@/entities/finding/ui/FindingRow";
import { maxScore } from "@/entities/finding/model/patch";
import { Card, CardHeader } from "@/shared/ui/Card";
import { StateBlock } from "@/shared/ui/StateBlock";
import type { Finding } from "@/shared/api/types";

interface FindingsCardProps {
  title: string;
  hint?: string;
  findings: Finding[];
  emptyTitle: string;
  emptyHint?: string;
  action?: React.ReactNode;
}

/** Карточка со списком находок — общая для сводки и отчёта. */
export function FindingsCard({
  title,
  hint,
  findings,
  emptyTitle,
  emptyHint,
  action,
}: FindingsCardProps) {
  const max = maxScore(findings);

  return (
    <Card>
      <CardHeader title={title} hint={hint} action={action} />
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
