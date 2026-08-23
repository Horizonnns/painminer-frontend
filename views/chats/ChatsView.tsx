"use client";

import { Trash2 } from "lucide-react";

import { useChats, useRemoveChat } from "@/entities/chat/api/queries";
import { useNicheConfig } from "@/entities/niche/api/queries";
import { DiscoverPanel } from "@/features/discover-chats/ui/DiscoverPanel";
import { ChatsTable } from "@/widgets/chats-table/ChatsTable";
import { ApiError } from "@/shared/api/client";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { ErrorState } from "@/shared/ui/StateBlock";
import type { Chat } from "@/shared/api/types";

export function ChatsView({ niche }: { niche: string }) {
  const chats = useChats(niche);
  const config = useNicheConfig(niche);
  const remove = useRemoveChat(niche);

  if (chats.isPending || config.isPending) return <SkeletonList rows={3} />;

  if (chats.error) {
    return (
      <ErrorState
        message={
          chats.error instanceof ApiError ? chats.error.humanMessage : MESSAGES.errors.unknown
        }
        onRetry={() => void chats.refetch()}
      />
    );
  }

  // Убирать можно только то, что записано в YAML: база помнит и старые чаты.
  const inConfig = new Set((config.data?.chats ?? []).map((ref) => ref.toLowerCase()));

  const rowAction = (chat: Chat) => {
    const ref = chat.username;
    if (!ref || !inConfig.has(ref.toLowerCase())) return null;
    return (
      <Button
        variant="ghost"
        size="sm"
        icon={<Trash2 size={12} />}
        disabled={remove.isPending}
        onClick={() => remove.mutate(ref)}
      >
        {MESSAGES.discover.remove}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <ChatsTable chats={chats.data} rowAction={rowAction} />
      <DiscoverPanel niche={niche} existing={config.data?.chats ?? []} />
    </div>
  );
}
