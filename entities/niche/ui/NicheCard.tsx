import Link from "next/link";

import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { formatNumber, formatRelative } from "@/shared/lib/format";
import type { NicheBrief } from "@/shared/api/types";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-mono text-lg text-text tabular-nums">
        {formatNumber(value)}
      </div>
      <div className="text-xs text-faint">{label}</div>
    </div>
  );
}

export function NicheCard({ niche }: { niche: NicheBrief }) {
  return (
    <Link
      href={ROUTES.niche(niche.name)}
      className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-faint"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate font-medium text-text">{niche.name}</span>
        <span className="shrink-0 text-xs text-faint">
          {niche.last_scanned_at
            ? `${MESSAGES.niches.lastScan}: ${formatRelative(niche.last_scanned_at)}`
            : MESSAGES.niches.neverScanned}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat value={niche.findings} label={MESSAGES.niches.findings} />
        <Stat value={niche.chats} label={MESSAGES.niches.chats} />
        <Stat value={niche.hits} label={MESSAGES.niches.hits} />
      </div>
    </Link>
  );
}
