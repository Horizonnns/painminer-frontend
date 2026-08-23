"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/shared/config/constants";
import { MESSAGES } from "@/shared/config/messages";
import { cn } from "@/shared/lib/cn";

/** Вкладки добавляются по мере появления экранов — на несуществующие не ведём. */
function tabs(niche: string) {
  return [
    { href: ROUTES.niche(niche), label: MESSAGES.nav.dashboard },
    { href: ROUTES.findings(niche), label: MESSAGES.nav.findings },
    { href: ROUTES.report(niche), label: MESSAGES.nav.report },
  ];
}

export function NicheNav({ niche }: { niche: string }) {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-divider">
      <div className="flex items-baseline gap-4 pb-3">
        <h1 className="font-mono text-lg text-text">{niche}</h1>
      </div>
      <nav className="flex gap-1">
        {tabs(niche).map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "-mb-px border-b px-3 py-2 text-sm transition-colors",
                active
                  ? "border-accent text-text"
                  : "border-transparent text-muted hover:text-text",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
