"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { MESSAGES } from "@/shared/config/messages";
import { VERDICTS } from "@/shared/config/constants";
import { Button } from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import type { FacetItem, Finding, NotePayload, Verdict } from "@/shared/api/types";

interface NotePanelProps {
  finding: Finding;
  clusters: FacetItem[];
  saving: boolean;
  onSave: (payload: NotePayload) => void;
}

const CLUSTERS_LIST_ID = "painminer-clusters";

export function NotePanel({ finding, clusters, saving, onSave }: NotePanelProps) {
  // Состояние поднимается из находки один раз: при смене выбора родитель
  // передаёт новый key и форма пересоздаётся вместе с ним.
  const [cluster, setCluster] = useState(finding.cluster ?? "");
  const [verdict, setVerdict] = useState<Verdict | null>(
    (finding.verdict as Verdict | null) ?? null,
  );
  const [comment, setComment] = useState("");

  const submit = () =>
    onSave({
      cluster: cluster.trim() || null,
      verdict,
      comment: comment.trim() || null,
    });

  return (
    // Сообщение бывает на несколько экранов, поэтому скроллится только оно:
    // форма разметки нужна под рукой всегда.
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
        <div>
        <p className="text-sm leading-relaxed text-text">{finding.text}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-faint">
          <span className="text-muted">{finding.chat_title}</span>
          <span>·</span>
          <span>{formatDate(finding.date)}</span>
          {finding.link ? (
            <a
              href={finding.link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-muted transition-colors hover:text-accent"
            >
              <ExternalLink size={12} />
              {MESSAGES.finding.openInTelegram}
            </a>
          ) : null}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 border-y border-divider py-3 text-xs">
        <div>
          <dt className="text-faint">{MESSAGES.finding.score}</dt>
          <dd className="font-mono text-sm text-text tabular-nums">{finding.score}</dd>
        </div>
        <div>
          <dt className="text-faint">{MESSAGES.finding.replies}</dt>
          <dd className="font-mono text-sm text-text tabular-nums">{finding.replies}</dd>
        </div>
        <div>
          <dt className="text-faint">{MESSAGES.finding.reactions}</dt>
          <dd className="font-mono text-sm text-text tabular-nums">{finding.reactions}</dd>
        </div>
      </dl>

      {finding.queries.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs text-faint">{MESSAGES.note.queriesMatched}</p>
          <div className="flex flex-wrap gap-1">
            {finding.queries.map((query) => (
              <span
                key={query}
                className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted"
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      </div>

      <div className="shrink-0 space-y-3 border-t border-divider p-4">
        <div>
          <span className="mb-1.5 block text-xs text-muted">{MESSAGES.filters.verdict}</span>
          <div className="flex gap-1">
            {VERDICTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVerdict(verdict === option ? null : option)}
                aria-pressed={verdict === option}
                className={cn(
                  "flex-1 rounded-md border px-2 py-1.5 text-xs transition-colors",
                  verdict === option
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border text-muted hover:border-faint hover:text-text",
                )}
              >
                {MESSAGES.verdict[option]}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-faint">{MESSAGES.note.verdictHint}</p>
        </div>

        <Field label={MESSAGES.note.cluster} hint={MESSAGES.note.clusterHint}>
          <Input
            value={cluster}
            list={CLUSTERS_LIST_ID}
            placeholder={MESSAGES.note.clusterPlaceholder}
            onChange={(event) => setCluster(event.target.value)}
          />
        </Field>
        <datalist id={CLUSTERS_LIST_ID}>
          {clusters.map((item) => (
            <option key={item.value} value={item.value} />
          ))}
        </datalist>

        <Field label={MESSAGES.note.comment}>
          <Textarea
            rows={3}
            value={comment}
            placeholder={MESSAGES.note.commentPlaceholder}
            onChange={(event) => setComment(event.target.value)}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={submit} disabled={saving}>
            {MESSAGES.note.save}
          </Button>
          <span className="text-xs text-faint">{MESSAGES.note.history}</span>
        </div>
      </div>
    </div>
  );
}
