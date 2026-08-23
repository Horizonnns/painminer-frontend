"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  EMPTY_FILTERS,
  filtersToSearch,
  parseFilters,
  type FindingsFilters,
} from "@/features/filter-findings/model/query";

/** Фильтры живут в URL: перезагрузка и «назад» их не теряют. */
export function useFindingsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(params.toString())),
    [params],
  );

  const replace = useCallback(
    (next: FindingsFilters) => {
      const search = filtersToSearch(next);
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const update = useCallback(
    (patch: Partial<FindingsFilters>) => replace({ ...filters, ...patch }),
    [filters, replace],
  );

  const reset = useCallback(
    () => replace({ ...EMPTY_FILTERS, sort: filters.sort }),
    [filters.sort, replace],
  );

  return { filters, update, reset };
}
