"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useAddChats, useDiscover } from "@/entities/chat/api/queries";
import {
  defaultSelection,
  isAddable,
  selectedRefs,
  toggle,
  withoutExisting,
} from "@/features/discover-chats/model/selection";
import { ApiError } from "@/shared/api/client";
import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card, CardHeader } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Skeleton } from "@/shared/ui/Skeleton";
import { StateBlock } from "@/shared/ui/StateBlock";
import { formatMembers } from "@/shared/lib/format";
import type { Candidate } from "@/shared/api/types";

function CandidateRow({
  candidate,
  checked,
  onToggle,
}: {
  candidate: Candidate;
  checked: boolean;
  onToggle: () => void;
}) {
  const addable = isAddable(candidate);

  return (
    <li className="flex items-center gap-3 border-b border-divider px-4 py-2.5 last:border-b-0">
      <input
        type="checkbox"
        checked={checked}
        disabled={!addable}
        onChange={onToggle}
        aria-label={candidate.title}
        className="size-3.5 accent-accent disabled:opacity-30"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-text">{candidate.title}</div>
        <div className="font-mono text-xs text-faint">
          {candidate.username ? `@${candidate.username}` : MESSAGES.discover.noUsername}
        </div>
      </div>
      <span className="font-mono text-xs text-muted tabular-nums">
        {formatMembers(candidate.members)}
      </span>
      <Badge tone={candidate.kind === "group" ? "neutral" : "bad"}>
        {candidate.kind === "group" ? MESSAGES.discover.group : MESSAGES.discover.channel}
      </Badge>
    </li>
  );
}

export function DiscoverPanel({
  niche,
  existing,
}: {
  niche: string;
  existing: string[];
}) {
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const discover = useDiscover(niche, submitted);
  const add = useAddChats(niche);

  const candidates = useMemo(
    () => withoutExisting(discover.data ?? [], existing),
    [discover.data, existing],
  );

  const search = () => {
    setSubmitted(keyword.trim());
    setSelected(new Set());
  };

  // Первый показ результатов сам отмечает пригодные группы.
  const marks = selected.size > 0 ? selected : defaultSelection(candidates);
  const refs = selectedRefs(candidates, marks);

  return (
    <Card>
      <CardHeader title={MESSAGES.discover.title} hint={MESSAGES.discover.hint} />

      <div className="flex gap-2 border-b border-divider p-4">
        <Input
          value={keyword}
          placeholder={MESSAGES.discover.keywordPlaceholder}
          aria-label={MESSAGES.discover.keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") search();
          }}
        />
        <Button
          icon={<Search size={14} />}
          onClick={search}
          disabled={keyword.trim().length < 2}
        >
          {MESSAGES.discover.search}
        </Button>
      </div>

      {discover.isFetching ? (
        <div className="space-y-2 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : null}

      {discover.error ? (
        <div className="p-4">
          <StateBlock
            tone="bad"
            action={
              discover.error instanceof ApiError && discover.error.code === "no_session" ? (
                <Link href={ROUTES.login}>
                  <Button size="sm" variant="primary">
                    {MESSAGES.login.action}
                  </Button>
                </Link>
              ) : null
            }
            title={
              discover.error instanceof ApiError && discover.error.code === "no_session"
                ? MESSAGES.discover.needLogin
                : MESSAGES.states.errorTitle
            }
            hint={
              discover.error instanceof ApiError && discover.error.code === "no_session"
                ? MESSAGES.discover.needLoginHint
                : discover.error instanceof ApiError
                  ? discover.error.humanMessage
                  : MESSAGES.errors.unknown
            }
          />
        </div>
      ) : null}

      {discover.data && candidates.length === 0 && !discover.isFetching ? (
        <div className="p-4">
          <StateBlock
            title={MESSAGES.discover.nothing}
            hint={MESSAGES.discover.nothingHint}
          />
        </div>
      ) : null}

      {candidates.length > 0 ? (
        <>
          <ul>
            {candidates.map((candidate) => (
              <CandidateRow
                key={candidate.tg_id}
                candidate={candidate}
                checked={marks.has(candidate.tg_id)}
                onToggle={() => setSelected(toggle(marks, candidate.tg_id))}
              />
            ))}
          </ul>
          <div className="flex items-center gap-3 border-t border-divider p-4">
            <Button
              variant="primary"
              size="sm"
              disabled={refs.length === 0 || add.isPending}
              onClick={() => add.mutate(refs, { onSuccess: () => setSelected(new Set()) })}
            >
              {MESSAGES.discover.add}
            </Button>
            <span className="text-xs text-faint">
              {MESSAGES.discover.selected}: {refs.length}
            </span>
            {add.data ? (
              <span className="text-xs text-ok">
                {MESSAGES.discover.added}: {add.data.added.length}
              </span>
            ) : null}
          </div>
          <p className="px-4 pb-4 text-xs text-faint">{MESSAGES.discover.noUsernameHint}</p>
        </>
      ) : null}
    </Card>
  );
}
