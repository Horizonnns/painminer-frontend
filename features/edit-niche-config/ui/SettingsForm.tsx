"use client";

import type { SettingsForm as FormValues } from "@/features/edit-niche-config/model/lists";
import { MESSAGES } from "@/shared/config/messages";
import { Card, CardHeader } from "@/shared/ui/Card";
import { Field, Input } from "@/shared/ui/Input";
import { cn } from "@/shared/lib/cn";

const FIELDS: Array<{
  key: keyof FormValues;
  label: string;
  hint: string;
  step?: string;
}> = [
  {
    key: "days_back",
    label: MESSAGES.settings.daysBack,
    hint: MESSAGES.settings.daysBackHint,
  },
  {
    key: "limit_per_query",
    label: MESSAGES.settings.limitPerQuery,
    hint: MESSAGES.settings.limitPerQueryHint,
  },
  {
    key: "min_length",
    label: MESSAGES.settings.minLength,
    hint: MESSAGES.settings.minLengthHint,
  },
  {
    key: "pause_seconds",
    label: MESSAGES.settings.pauseSeconds,
    hint: MESSAGES.settings.pauseSecondsHint,
    step: "0.1",
  },
];

interface SettingsFormProps {
  values: FormValues;
  invalid: Array<keyof FormValues>;
  onChange: (key: keyof FormValues, value: string) => void;
}

export function SettingsForm({ values, invalid, onChange }: SettingsFormProps) {
  return (
    <Card>
      <CardHeader title={MESSAGES.settings.numbers} />
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <Field key={field.key} label={field.label} hint={field.hint}>
            <Input
              type="number"
              step={field.step}
              value={values[field.key]}
              aria-invalid={invalid.includes(field.key)}
              className={cn(invalid.includes(field.key) && "border-bad")}
              onChange={(event) => onChange(field.key, event.target.value)}
            />
          </Field>
        ))}
      </div>
    </Card>
  );
}
