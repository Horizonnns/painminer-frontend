import type { SelectHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Select({
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-md border border-border bg-bg px-2 text-xs text-text",
        "focus:border-accent focus:outline-none",
        className,
      )}
      {...rest}
    />
  );
}
