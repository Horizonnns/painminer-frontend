"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useDeleteNiche,
  useNicheConfig,
  useUpdateNicheConfig,
} from "@/entities/niche/api/queries";
import { ListEditor } from "@/features/edit-niche-config/ui/ListEditor";
import { SettingsForm } from "@/features/edit-niche-config/ui/SettingsForm";
import {
  listsEqual,
  parseSettings,
  settingsEqual,
  toForm,
  type SettingsForm as FormValues,
} from "@/features/edit-niche-config/model/lists";
import { ApiError } from "@/shared/api/client";
import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";
import { Card, CardHeader } from "@/shared/ui/Card";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { ErrorState } from "@/shared/ui/StateBlock";
import type { NicheConfig } from "@/shared/api/types";

interface Draft {
  queries: string[];
  noise: string[];
  numbers: FormValues;
}

function toDraft(config: NicheConfig): Draft {
  return {
    queries: config.queries,
    noise: config.noise_patterns,
    numbers: toForm(config.settings),
  };
}

/** Форма пересоздаётся при смене ниши — за это отвечает key на Editor. */
function Editor({ niche, config }: { niche: string; config: NicheConfig }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(config));
  const update = useUpdateNicheConfig(niche);

  const parsed = parseSettings(draft.numbers);
  const invalid = parsed.ok ? [] : parsed.fields;

  const dirty =
    !listsEqual(draft.queries, config.queries) ||
    !listsEqual(draft.noise, config.noise_patterns) ||
    !(parsed.ok && settingsEqual(parsed.value, config.settings));

  const save = () => {
    if (!parsed.ok) return;
    update.mutate(
      {
        queries: draft.queries,
        noise_patterns: draft.noise,
        settings: parsed.value,
      },
      { onSuccess: (saved) => setDraft(toDraft(saved)) },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled={!dirty || !parsed.ok || update.isPending} onClick={save}>
          {MESSAGES.settings.save}
        </Button>
        <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(toDraft(config))}>
          {MESSAGES.settings.reset}
        </Button>
        {dirty ? (
          <span className="text-xs text-accent">{MESSAGES.settings.unsaved}</span>
        ) : update.isSuccess ? (
          <span className="text-xs text-ok">{MESSAGES.settings.saved}</span>
        ) : null}
        {!parsed.ok ? (
          <span className="text-xs text-bad">{MESSAGES.settings.invalid}</span>
        ) : null}
        {update.error ? (
          <span className="text-xs text-bad">
            {update.error instanceof ApiError
              ? update.error.humanMessage
              : MESSAGES.errors.unknown}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-faint">{MESSAGES.settings.replaceWarning}</p>

      <ListEditor
        title={MESSAGES.settings.queries}
        hint={MESSAGES.settings.queriesHint}
        items={draft.queries}
        onChange={(queries) => setDraft((current) => ({ ...current, queries }))}
      />

      <ListEditor
        title={MESSAGES.settings.noise}
        hint={MESSAGES.settings.noiseHint}
        items={draft.noise}
        onChange={(noise) => setDraft((current) => ({ ...current, noise }))}
      />

      <SettingsForm
        values={draft.numbers}
        invalid={invalid}
        onChange={(key, value) =>
          setDraft((current) => ({
            ...current,
            numbers: { ...current.numbers, [key]: value },
          }))
        }
      />
    </div>
  );
}


/** Удаление необратимо, поэтому в два шага и с перечислением потерь. */
function DangerZone({ niche }: { niche: string }) {
  const [asking, setAsking] = useState(false);
  const remove = useDeleteNiche();
  const router = useRouter();

  return (
    <Card className="border-bad/30">
      <CardHeader
        title={MESSAGES.settings.dangerTitle}
        hint={MESSAGES.settings.dangerHint}
      />
      <div className="flex flex-wrap items-center gap-2 p-4">
        {asking ? (
          <>
            <span className="text-xs text-bad">{MESSAGES.settings.deleteConfirm}</span>
            <Button
              variant="danger"
              size="sm"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(niche, { onSuccess: () => router.push(ROUTES.niches) })
              }
            >
              {MESSAGES.settings.deleteYes}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAsking(false)}>
              {MESSAGES.settings.deleteNo}
            </Button>
          </>
        ) : (
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={12} />}
            onClick={() => setAsking(true)}
          >
            {MESSAGES.settings.delete}
          </Button>
        )}
        {remove.error ? (
          <span className="text-xs text-bad">
            {remove.error instanceof ApiError
              ? remove.error.humanMessage
              : MESSAGES.errors.unknown}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

export function SettingsView({ niche }: { niche: string }) {
  const config = useNicheConfig(niche);

  if (config.isPending) return <SkeletonList rows={3} />;

  if (config.error) {
    return (
      <ErrorState
        message={
          config.error instanceof ApiError
            ? config.error.humanMessage
            : MESSAGES.errors.unknown
        }
        onRetry={() => void config.refetch()}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-sm font-medium text-text">{MESSAGES.settings.title}</h1>
        <p className="mt-1 text-xs text-faint">{MESSAGES.settings.hint}</p>
      </div>
      <Editor key={niche} niche={niche} config={config.data} />
      <div className="pt-2">
        <DangerZone niche={niche} />
      </div>
    </div>
  );
}
