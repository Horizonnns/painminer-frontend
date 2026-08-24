"use client";

import { MESSAGES } from "@/shared/config/messages";
import { Card, CardHeader } from "@/shared/ui/Card";
import { StateBlock } from "@/shared/ui/StateBlock";
import { cn } from "@/shared/lib/cn";
import type { QueryStat } from "@/shared/api/types";

/** Точность фразы в процентах. Прочерк, пока нет ни одного вердикта. */
function share(stat: QueryStat): string {
  return stat.accuracy === null ? "—" : `${Math.round(stat.accuracy * 100)}%`;
}

function tone(stat: QueryStat): string {
  if (stat.accuracy === null) return "text-faint";
  return stat.accuracy >= 0.5 ? "text-ok" : "text-bad";
}

export function QueryStats({ stats }: { stats: QueryStat[] }) {
  return (
    <Card>
      <CardHeader
        title={MESSAGES.report.accuracy}
        hint={MESSAGES.report.accuracyHint}
      />
      {stats.length === 0 ? (
        <div className="p-4">
          <StateBlock title={MESSAGES.report.accuracyEmpty} />
        </div>
      ) : (
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-divider text-left text-xs text-faint">
                <th className="px-4 py-2 font-normal">{MESSAGES.report.accuracyQuery}</th>
                <th className="px-2 py-2 text-right font-normal">
                  {MESSAGES.report.accuracyFindings}
                </th>
                <th className="px-2 py-2 text-right font-normal">
                  {MESSAGES.report.accuracyMarked}
                </th>
                <th className="px-4 py-2 text-right font-normal">
                  {MESSAGES.report.accuracyValue}
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.query} className="border-b border-divider last:border-b-0">
                  <td className="px-4 py-2 text-muted">{stat.query}</td>
                  <td className="px-2 py-2 text-right font-mono text-xs text-muted tabular-nums">
                    {stat.findings}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-xs text-faint tabular-nums">
                    {stat.marked}
                  </td>
                  <td
                    className={cn("px-4 py-2 text-right font-mono tabular-nums", tone(stat))}
                  >
                    {share(stat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
