"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCreateNiche, useNiches } from "@/entities/niche/api/queries";
import { NicheCard } from "@/entities/niche/ui/NicheCard";
import { ApiError } from "@/shared/api/client";
import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Input";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { ErrorState, StateBlock } from "@/shared/ui/StateBlock";

function CreateNicheForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const create = useCreateNiche();
  const router = useRouter();

  return (
    <form
      className="rounded-lg border border-border bg-surface p-4"
      onSubmit={(event) => {
        event.preventDefault();
        // Сразу ведём на следующий шаг — пустая ниша сама по себе бесполезна.
        create.mutate(name.trim(), {
          onSuccess: (config) => {
            onDone();
            router.push(ROUTES.chats(config.niche));
          },
        });
      }}
    >
      <Field label={MESSAGES.niches.createTitle} hint={MESSAGES.niches.nameHint}>
        <Input
          autoFocus
          value={name}
          placeholder={MESSAGES.niches.namePlaceholder}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <div className="mt-3 flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={!name.trim() || create.isPending}>
          {MESSAGES.niches.create}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Отмена
        </Button>
        {create.error ? (
          <span className="text-xs text-bad">
            {create.error instanceof ApiError
              ? create.error.humanMessage
              : MESSAGES.errors.unknown}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function NichesView() {
  const [creating, setCreating] = useState(false);
  const { data, isPending, error, refetch } = useNiches();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">{MESSAGES.niches.title}</h1>
          <p className="mt-1 text-sm text-muted">{MESSAGES.niches.subtitle}</p>
          <p className="mt-2 max-w-2xl text-xs text-faint">{MESSAGES.niches.explain}</p>
        </div>
        {/* Пока ниш нет, звать создавать должна одна кнопка — та, что в пустом
            состоянии. Дублировать её в шапке незачем. */}
        {!creating && data && data.length > 0 ? (
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
            {MESSAGES.niches.create}
          </Button>
        ) : null}
      </div>

      {creating ? <CreateNicheForm onDone={() => setCreating(false)} /> : null}

      {isPending ? <SkeletonList rows={2} /> : null}

      {error ? (
        <ErrorState
          message={error instanceof ApiError ? error.humanMessage : MESSAGES.errors.unknown}
          onRetry={() => void refetch()}
        />
      ) : null}

      {data && data.length === 0 ? (
        <StateBlock
          title={MESSAGES.niches.emptyTitle}
          hint={MESSAGES.niches.emptyHint}
          action={
            <Button size="sm" variant="primary" onClick={() => setCreating(true)}>
              {MESSAGES.niches.create}
            </Button>
          }
        />
      ) : null}

      {data && data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((niche) => (
            <NicheCard key={niche.name} niche={niche} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
