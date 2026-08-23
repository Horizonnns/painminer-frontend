import { Badge, StatusDot } from "@/shared/ui/Badge";
import { MESSAGES } from "@/shared/config/messages";
import type { ChatStatus } from "@/shared/api/types";

const TONE: Record<ChatStatus, "neutral" | "ok" | "bad"> = {
  new: "neutral",
  ok: "ok",
  private: "bad",
  not_found: "bad",
  admin_required: "bad",
  error: "bad",
};

export function ChatStatusBadge({ status }: { status: ChatStatus }) {
  const tone = TONE[status] ?? "neutral";
  return (
    <Badge tone={tone}>
      <span className="inline-flex items-center gap-1.5">
        <StatusDot tone={tone} />
        {MESSAGES.chatStatus[status] ?? status}
      </span>
    </Badge>
  );
}
