import { scoreRatio } from "@/shared/lib/format";

/** Число моноширинное, полоса показывает вес находки относительно топа. */
export function ScoreBadge({ score, max }: { score: number; max: number }) {
  const ratio = scoreRatio(score, max);
  return (
    <div className="w-12 shrink-0 text-right">
      <div className="font-mono text-sm text-text tabular-nums">{score}</div>
      <div className="mt-1 h-px w-full bg-divider">
        <div
          className="h-px bg-accent"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
