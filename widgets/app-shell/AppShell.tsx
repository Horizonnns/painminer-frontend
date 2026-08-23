import Link from "next/link";
import type { ReactNode } from "react";

import { MESSAGES } from "@/shared/config/messages";
import { ROUTES } from "@/shared/config/constants";

/** Общая рама: узкая шапка и колонка контента фиксированной ширины. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-divider bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-6">
          <Link
            href={ROUTES.niches}
            className="font-mono text-sm text-text transition-colors hover:text-accent"
          >
            {MESSAGES.app.name}
          </Link>
          <span className="text-xs text-faint">{MESSAGES.app.tagline}</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
