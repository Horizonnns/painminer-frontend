"use client";

import { Play, Square } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { useNicheConfig } from "@/entities/niche/api/queries";
import {
  useActiveRun,
  useRefreshAfterRun,
  useStartRun,
  useStopRun,
} from "@/entities/run/api/queries";
import { useRunStream } from "@/features/run-scan/model/use-run-stream";
import { ScanConsole } from "@/widgets/scan-console/ScanConsole";
import { ApiError } from "@/shared/api/client";
import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";
import { Card, CardHeader } from "@/shared/ui/Card";
import { Field, Input } from "@/shared/ui/Input";
import { SkeletonList } from "@/shared/ui/Skeleton";
import { StateBlock } from "@/shared/ui/StateBlock";

function Checkbox({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-3.5 accent-accent"
      />
      <span>
        <span className="block text-xs text-text">{label}</span>
        <span className="block text-xs text-faint">{hint}</span>
      </span>
    </label>
  );
}

interface StartProblem {
  title: string;
  hint: string;
  code?: string;
}

function startError(error: unknown): StartProblem | null {
  if (!(error instanceof ApiError)) return null;
  if (error.code === "no_session") {
    return {
      title: MESSAGES.scan.needLogin,
      hint: MESSAGES.scan.needLoginHint,
      code: error.code,
    };
  }
  if (error.code === "run_in_progress") {
    return { title: MESSAGES.scan.busy, hint: MESSAGES.scan.busyHint };
  }
  return { title: MESSAGES.states.errorTitle, hint: error.humanMessage };
}

export function ScanView({ niche }: { niche: string }) {
  const config = useNicheConfig(niche);
  const active = useActiveRun();
  const start = useStartRun(niche);
  const stop = useStopRun();
  const refresh = useRefreshAfterRun(niche);

  const [startedRunId, setStartedRunId] = useState<string | null>(null);
  const [days, setDays] = useState("");
  const [full, setFull] = useState(false);
  const [join, setJoin] = useState(false);

  // Свой запуск важнее: он переживает завершение, когда /health уже пуст.
  // Прогон, начатый до перезагрузки страницы, подхватываем по active_run.
  const runId = startedRunId ?? active.data?.active_run ?? null;

  const onFinish = useCallback(() => refresh(), [refresh]);
  const { view, streamError, finished } = useRunStream(runId, onFinish);

  if (config.isPending) return <SkeletonList rows={2} />;

  const chats = config.data?.chats ?? [];
  const problem = startError(start.error);
  const running = Boolean(view && !finished);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader title={MESSAGES.scan.title} hint={MESSAGES.scan.hint} />
        <div className="space-y-4 p-4">
          <Field label={MESSAGES.scan.days} hint={MESSAGES.scan.daysHint}>
            <Input
              type="number"
              min={1}
              value={days}
              placeholder={String(config.data?.settings.days_back ?? "")}
              onChange={(event) => setDays(event.target.value)}
            />
          </Field>

          <Checkbox
            label={MESSAGES.scan.full}
            hint={MESSAGES.scan.fullHint}
            checked={full}
            onChange={setFull}
          />
          <Checkbox
            label={MESSAGES.scan.join}
            hint={MESSAGES.scan.joinHint}
            checked={join}
            onChange={setJoin}
          />

          <Button
            variant="primary"
            className="w-full"
            icon={<Play size={14} />}
            disabled={chats.length === 0 || running || start.isPending}
            onClick={() =>
              start.mutate(
                { days: days ? Number(days) : null, full, join },
                { onSuccess: (state) => setStartedRunId(state.run_id) },
              )
            }
          >
            {MESSAGES.scan.start}
          </Button>

          {chats.length === 0 ? (
            <p className="text-xs text-bad">{MESSAGES.scan.noChats}</p>
          ) : null}
        </div>
      </Card>

      <div className="space-y-4">
        {problem ? (
          <StateBlock
            tone="bad"
            title={problem.title}
            hint={problem.hint}
            action={
              problem.code === "no_session" ? (
                <Link href={ROUTES.login}>
                  <Button size="sm" variant="primary">
                    {MESSAGES.login.action}
                  </Button>
                </Link>
              ) : null
            }
          />
        ) : null}

        {streamError && !finished ? (
          <StateBlock
            tone="bad"
            title={MESSAGES.states.offlineTitle}
            hint={MESSAGES.states.offlineHint}
          />
        ) : null}

        <ScanConsole
          view={view}
          action={
            running ? (
              <Button
                variant="danger"
                size="sm"
                icon={<Square size={12} />}
                disabled={stop.isPending}
                onClick={() => runId && stop.mutate(runId)}
              >
                {MESSAGES.scan.stop}
              </Button>
            ) : null
          }
        />
      </div>
    </div>
  );
}
