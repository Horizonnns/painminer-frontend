import { ReportView } from "@/views/report/ReportView";

export default async function Page({ params }: PageProps<"/n/[niche]/report">) {
  const { niche } = await params;
  return <ReportView niche={niche} />;
}
