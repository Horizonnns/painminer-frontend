import { Badge } from "@/shared/ui/Badge";
import { MESSAGES } from "@/shared/config/messages";

const TONE: Record<string, "ok" | "bad" | "neutral"> = {
  yes: "ok",
  no: "bad",
  maybe: "neutral",
};

export function VerdictChip({ verdict }: { verdict: string }) {
  const label = MESSAGES.verdict[verdict as keyof typeof MESSAGES.verdict] ?? verdict;
  return <Badge tone={TONE[verdict] ?? "neutral"}>{label}</Badge>;
}
