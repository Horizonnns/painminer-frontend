import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-y rounded-md border border-border bg-bg px-3 py-2 text-sm text-text",
        "placeholder:text-faint focus:border-accent focus:outline-none",
        className,
      )}
      {...rest}
    />
  );
}
