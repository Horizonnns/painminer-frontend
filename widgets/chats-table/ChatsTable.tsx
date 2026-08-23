"use client";

import type { ReactNode } from "react";

import { ChatStatusBadge } from "@/entities/chat/ui/ChatStatusBadge";
import { sortChats } from "@/entities/chat/model/sort";
import { MESSAGES } from "@/shared/config/messages";
import { Card, CardHeader } from "@/shared/ui/Card";
import { StateBlock } from "@/shared/ui/StateBlock";
import { formatMembers, formatNumber, formatRelative } from "@/shared/lib/format";
import type { Chat } from "@/shared/api/types";

interface ChatsTableProps {
  chats: Chat[];
  action?: ReactNode;
  rowAction?: (chat: Chat) => ReactNode;
}

/** Разбивка по чатам: сколько нашлось и какие запросы сработали. */
export function ChatsTable({ chats, action, rowAction }: ChatsTableProps) {
  const rows = sortChats(chats);

  return (
    <Card>
      <CardHeader title={MESSAGES.chats.title} action={action} />
      {rows.length === 0 ? (
        <div className="p-4">
          <StateBlock title={MESSAGES.chats.empty} hint={MESSAGES.chats.emptyHint} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider text-left text-xs text-faint">
                <th className="px-4 py-2 font-normal">{MESSAGES.chats.chat}</th>
                <th className="px-2 py-2 text-right font-normal">{MESSAGES.chats.members}</th>
                <th className="px-2 py-2 text-right font-normal">{MESSAGES.chats.findings}</th>
                <th className="px-2 py-2 font-normal">{MESSAGES.chats.status}</th>
                <th className="px-2 py-2 font-normal">{MESSAGES.chats.lastScan}</th>
                {rowAction ? <th className="px-4 py-2" /> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((chat) => (
                <tr key={chat.id} className="border-b border-divider last:border-b-0 align-top">
                  <td className="px-4 py-2.5">
                    <div className="text-text">{chat.title}</div>
                    {chat.username ? (
                      <div className="font-mono text-xs text-faint">@{chat.username}</div>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {chat.queries.length === 0 ? (
                        <span className="text-xs text-faint">{MESSAGES.chats.noQueries}</span>
                      ) : (
                        chat.queries.slice(0, 4).map((item) => (
                          <span
                            key={item.query}
                            className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted"
                          >
                            {item.query}
                            <span className="ml-1 font-mono text-faint tabular-nums">
                              {item.count}
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-xs text-muted tabular-nums">
                    {formatMembers(chat.members)}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-text tabular-nums">
                    {formatNumber(chat.findings)}
                  </td>
                  <td className="px-2 py-2.5">
                    <ChatStatusBadge status={chat.status} />
                  </td>
                  <td className="px-2 py-2.5 text-xs text-faint">
                    {formatRelative(chat.last_scanned_at)}
                  </td>
                  {rowAction ? <td className="px-4 py-2.5 text-right">{rowAction(chat)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
