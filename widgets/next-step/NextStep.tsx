"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { chooseNextStep, type NextStepKind } from "@/entities/niche/model/next-step";
import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";

interface NextStepProps {
  niche: string;
  authorized: boolean;
  chats: number;
  findings: number;
}

function describe(kind: NextStepKind, niche: string) {
  const { nextStep } = MESSAGES;
  switch (kind) {
    case "login":
      return {
        title: nextStep.loginTitle,
        hint: nextStep.loginHint,
        href: ROUTES.login,
        action: nextStep.loginAction,
      };
    case "chats":
      return {
        title: nextStep.chatsTitle,
        hint: nextStep.chatsHint,
        href: ROUTES.chats(niche),
        action: nextStep.chatsAction,
      };
    case "scan":
      return {
        title: nextStep.scanTitle,
        hint: nextStep.scanHint,
        href: ROUTES.scan(niche),
        action: nextStep.scanAction,
      };
    default:
      return {
        title: nextStep.findingsTitle,
        hint: nextStep.findingsHint,
        href: ROUTES.findings(niche),
        action: nextStep.findingsAction,
      };
  }
}

/** Подсказка «что дальше»: ведёт по цепочке вход → чаты → прогон → находки. */
export function NextStep({ niche, authorized, chats, findings }: NextStepProps) {
  const step = describe(chooseNextStep({ authorized, chats, findings }), niche);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-accent/25 bg-accent/5 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-faint">{MESSAGES.nextStep.label}</p>
        <p className="mt-0.5 text-sm text-text">{step.title}</p>
        <p className="mt-0.5 text-xs text-muted">{step.hint}</p>
      </div>
      <Link href={step.href}>
        <Button size="sm" variant="primary" icon={<ArrowRight size={14} />}>
          {step.action}
        </Button>
      </Link>
    </div>
  );
}
