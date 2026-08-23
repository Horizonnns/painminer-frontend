"use client";

import Link from "next/link";
import { useState } from "react";

import {
  useAuthStatus,
  useCancelLogin,
  useSendCode,
  useSendPassword,
  useSendPhone,
} from "@/entities/auth/api/queries";
import {
  cleanCode,
  isCodeReady,
  isPasswordReady,
  isPhoneReady,
  normalizePhone,
} from "@/features/login/model/stage";
import { ApiError } from "@/shared/api/client";
import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";
import { Card, CardHeader } from "@/shared/ui/Card";
import { Field, Input } from "@/shared/ui/Input";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorState, StateBlock } from "@/shared/ui/StateBlock";

function StepError({ error }: { error: unknown }) {
  if (!error) return null;
  const text =
    error instanceof ApiError ? error.humanMessage : MESSAGES.errors.unknown;
  return <p className="text-xs text-bad">{text}</p>;
}

function Authorized({ user }: { user: string | null }) {
  const cancel = useCancelLogin();

  return (
    <Card>
      <CardHeader title={MESSAGES.login.authorized} hint={user ?? undefined} />
      <div className="flex flex-wrap items-center gap-2 p-4">
        <Link href={ROUTES.niches}>
          <Button variant="primary" size="sm">
            {MESSAGES.login.goToNiches}
          </Button>
        </Link>
        <Button size="sm" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
          {MESSAGES.login.relogin}
        </Button>
      </div>
      <p className="px-4 pb-4 text-xs text-faint">{MESSAGES.login.sessionWarning}</p>
    </Card>
  );
}

function PhoneStep() {
  const [phone, setPhone] = useState("");
  const send = useSendPhone();

  return (
    <form
      className="space-y-3 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        send.mutate({ phone: normalizePhone(phone) });
      }}
    >
      <Field label={MESSAGES.login.phone} hint={MESSAGES.login.phoneHint}>
        <Input
          autoFocus
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          placeholder={MESSAGES.login.phonePlaceholder}
          onChange={(event) => setPhone(event.target.value)}
        />
      </Field>
      <Button
        type="submit"
        variant="primary"
        disabled={!isPhoneReady(phone) || send.isPending}
      >
        {MESSAGES.login.sendCode}
      </Button>
      <StepError error={send.error} />
    </form>
  );
}

function CodeStep({ phone }: { phone: string | null }) {
  const [code, setCode] = useState("");
  const send = useSendCode();
  const cancel = useCancelLogin();

  return (
    <form
      className="space-y-3 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        send.mutate({ code: cleanCode(code) });
      }}
    >
      {phone ? (
        <p className="text-xs text-faint">
          {MESSAGES.login.codeSentTo} <span className="font-mono text-muted">{phone}</span>
        </p>
      ) : null}
      <Field label={MESSAGES.login.code} hint={MESSAGES.login.codeHint}>
        <Input
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          placeholder={MESSAGES.login.codePlaceholder}
          onChange={(event) => setCode(event.target.value)}
        />
      </Field>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={!isCodeReady(code) || send.isPending}
        >
          {MESSAGES.login.confirm}
        </Button>
        <Button type="button" variant="ghost" onClick={() => cancel.mutate()}>
          {MESSAGES.login.cancel}
        </Button>
      </div>
      <StepError error={send.error} />
    </form>
  );
}

function PasswordStep() {
  const [password, setPassword] = useState("");
  const send = useSendPassword();
  const cancel = useCancelLogin();

  return (
    <form
      className="space-y-3 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        send.mutate({ password });
      }}
    >
      <Field label={MESSAGES.login.password} hint={MESSAGES.login.passwordHint}>
        <Input
          autoFocus
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={!isPasswordReady(password) || send.isPending}
        >
          {MESSAGES.login.signIn}
        </Button>
        <Button type="button" variant="ghost" onClick={() => cancel.mutate()}>
          {MESSAGES.login.cancel}
        </Button>
      </div>
      <StepError error={send.error} />
    </form>
  );
}

export function LoginView() {
  const { data, isPending, error, refetch } = useAuthStatus();

  if (isPending) return <Skeleton className="h-64 w-full max-w-lg" />;

  if (error) {
    return (
      <ErrorState
        message={error instanceof ApiError ? error.humanMessage : MESSAGES.errors.unknown}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-text">{MESSAGES.login.title}</h1>
        <p className="mt-1 text-sm text-muted">{MESSAGES.login.hint}</p>
      </div>

      {!data.has_credentials ? (
        <StateBlock
          tone="bad"
          title={MESSAGES.login.noCredentialsTitle}
          hint={MESSAGES.login.noCredentialsHint}
        />
      ) : data.authorized ? (
        <Authorized user={data.user} />
      ) : data.stage === "unknown" || !data.checked ? (
        <StateBlock
          title={MESSAGES.login.unknownTitle}
          hint={MESSAGES.login.unknownHint}
          action={
            <Button size="sm" onClick={() => void refetch()}>
              {MESSAGES.states.retry}
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader title={MESSAGES.login.action} hint={MESSAGES.login.privacy} />
          {data.stage === "code" ? (
            <CodeStep phone={data.phone} />
          ) : data.stage === "password" ? (
            <PasswordStep />
          ) : (
            <PhoneStep />
          )}
        </Card>
      )}

      <p className="text-xs text-faint">{MESSAGES.login.terminalAlternative}</p>
    </div>
  );
}
