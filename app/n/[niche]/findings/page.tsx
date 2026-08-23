import { Suspense } from "react";

import { FindingsView } from "@/views/findings/FindingsView";
import { SkeletonList } from "@/shared/ui/Skeleton";

export default async function Page({ params }: PageProps<"/n/[niche]/findings">) {
  const { niche } = await params;

  // Фильтры читаются из useSearchParams — Next требует границу Suspense.
  return (
    <Suspense fallback={<SkeletonList rows={4} />}>
      <FindingsView niche={niche} />
    </Suspense>
  );
}
