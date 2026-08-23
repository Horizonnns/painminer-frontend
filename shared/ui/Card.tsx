import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
        className,
      )}
      {...rest}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, hint, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-divider px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-text">{title}</h2>
        {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
