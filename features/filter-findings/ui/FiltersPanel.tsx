"use client";

import { X } from "lucide-react";

import { FacetList } from "@/features/filter-findings/ui/FacetList";
import { countActive, type FindingsFilters } from "@/features/filter-findings/model/query";
import { MESSAGES } from "@/shared/config/messages";
import { SORTS, VERDICTS } from "@/shared/config/constants";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Switch } from "@/shared/ui/Switch";
import { Toggle } from "@/shared/ui/Toggle";
import { cn } from "@/shared/lib/cn";
import type { Facets } from "@/shared/api/types";

const SORT_LABELS: Record<string, string> = {
  score: MESSAGES.filters.sortScore,
  date: MESSAGES.filters.sortDate,
  replies: MESSAGES.filters.sortReplies,
  reactions: MESSAGES.filters.sortReactions,
};

interface FiltersPanelProps {
  filters: FindingsFilters;
  facets: Facets;
  onUpdate: (patch: Partial<FindingsFilters>) => void;
  onReset: () => void;
}

export function FiltersPanel({ filters, facets, onUpdate, onReset }: FiltersPanelProps) {
  const active = countActive(filters);

  return (
    // Длинный список фасетов не должен тянуть всю страницу: колонка
    // прилипает и скроллится сама, как и список находок рядом.
    <aside className="space-y-4 lg:sticky lg:top-36 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">{MESSAGES.filters.title}</h2>
        {active > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-accent"
          >
            <X size={12} />
            {MESSAGES.filters.reset} · {active}
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Input
          value={filters.search ?? ""}
          placeholder={MESSAGES.filters.searchPlaceholder}
          aria-label={MESSAGES.filters.search}
          onChange={(event) => onUpdate({ search: event.target.value || undefined })}
        />
        <Select
          value={filters.sort}
          aria-label={MESSAGES.filters.sort}
          onChange={(event) => onUpdate({ sort: event.target.value })}
        >
          {SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Toggle
          label={MESSAGES.filters.money}
          value={filters.money}
          onChange={(money) => onUpdate({ money })}
        />
        <Toggle
          label={MESSAGES.filters.question}
          value={filters.question}
          onChange={(question) => onUpdate({ question })}
        />
        <Switch
          label={MESSAGES.filters.repeated}
          state={
            filters.hideRepeated
              ? MESSAGES.filters.repeatedHidden
              : MESSAGES.filters.repeatedShown
          }
          on={Boolean(filters.hideRepeated)}
          onChange={(hide) => onUpdate({ hideRepeated: hide || undefined })}
        />
        <p className="px-0.5 text-xs text-faint">{MESSAGES.filters.repeatedHint}</p>
      </div>

      <section>
        <h3 className="mb-1.5 text-xs text-muted">{MESSAGES.filters.kind}</h3>
        <div className="flex flex-wrap gap-1">
          {[
            { value: undefined, label: MESSAGES.filters.kindAny },
            { value: "complaint", label: MESSAGES.filters.kindComplaint },
            { value: "offer", label: MESSAGES.filters.kindOffer },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onUpdate({ kind: option.value })}
              aria-pressed={filters.kind === option.value}
              className={cn(
                "rounded-md border px-2 py-1 text-xs transition-colors",
                filters.kind === option.value
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-faint hover:text-text",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-faint">{MESSAGES.filters.kindHint}</p>
      </section>

      <section>
        <h3 className="mb-1.5 text-xs text-muted">{MESSAGES.filters.verdict}</h3>
        <div className="flex flex-wrap gap-1">
          {[undefined, ...VERDICTS, "none"].map((verdict) => {
            const value = verdict as string | undefined;
            const selected = filters.verdict === value;
            const label =
              value === undefined
                ? MESSAGES.filters.anyVerdict
                : value === "none"
                  ? MESSAGES.filters.noVerdict
                  : MESSAGES.verdict[value as keyof typeof MESSAGES.verdict];
            return (
              <button
                key={label}
                type="button"
                onClick={() => onUpdate({ verdict: value })}
                aria-pressed={selected}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs transition-colors",
                  selected
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border text-muted hover:border-faint hover:text-text",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <FacetList
        title={MESSAGES.filters.chats}
        items={facets.chats}
        value={filters.chat === undefined ? undefined : String(filters.chat)}
        onSelect={(value) => onUpdate({ chat: value === undefined ? undefined : Number(value) })}
      />
      <FacetList
        title={MESSAGES.filters.queries}
        items={facets.queries}
        value={filters.query}
        onSelect={(query) => onUpdate({ query })}
      />
      <FacetList
        title={MESSAGES.filters.clusters}
        items={facets.clusters}
        value={filters.cluster}
        onSelect={(cluster) => onUpdate({ cluster })}
        extra={{ value: "none", label: MESSAGES.filters.noCluster }}
      />
    </aside>
  );
}
