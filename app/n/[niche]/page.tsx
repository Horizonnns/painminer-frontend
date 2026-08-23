import { NicheDashboardView } from "@/views/niche/NicheDashboardView";

export default async function Page({ params }: PageProps<"/n/[niche]">) {
  const { niche } = await params;
  return <NicheDashboardView niche={niche} />;
}
