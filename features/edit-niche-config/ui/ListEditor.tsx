"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { addItem, removeItem } from "@/features/edit-niche-config/model/lists";
import { MESSAGES } from "@/shared/config/messages";
import { Button } from "@/shared/ui/Button";
import { Card, CardHeader } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";

interface ListEditorProps {
  title: string;
  hint: string;
  items: string[];
  onChange: (next: string[]) => void;
}

export function ListEditor({ title, hint, items, onChange }: ListEditorProps) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    onChange(addItem(items, draft));
    setDraft("");
  };

  return (
    <Card>
      <CardHeader title={title} hint={hint} />

      <div className="flex flex-wrap gap-1.5 p-4">
        {items.length === 0 ? (
          <p className="text-xs text-faint">{MESSAGES.settings.emptyList}</p>
        ) : (
          items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border py-1 pl-2 pr-1 text-xs text-muted"
            >
              {item}
              <button
                type="button"
                aria-label={`${MESSAGES.settings.remove}: ${item}`}
                onClick={() => onChange(removeItem(items, index))}
                className="rounded p-0.5 text-faint transition-colors hover:bg-raised hover:text-bad"
              >
                <X size={11} />
              </button>
            </span>
          ))
        )}
      </div>

      <div className="flex gap-2 border-t border-divider p-4">
        <Input
          value={draft}
          placeholder={MESSAGES.settings.addPlaceholder}
          aria-label={title}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button size="md" icon={<Plus size={14} />} disabled={!draft.trim()} onClick={submit}>
          {MESSAGES.settings.add}
        </Button>
      </div>
    </Card>
  );
}
