import { ScanView } from "@/views/scan/ScanView";

export default async function Page({ params }: PageProps<"/n/[niche]/scan">) {
  const { niche } = await params;
  return <ScanView niche={niche} />;
}
