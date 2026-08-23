import { SettingsView } from "@/views/settings/SettingsView";

export default async function Page({ params }: PageProps<"/n/[niche]/settings">) {
  const { niche } = await params;
  return <SettingsView niche={niche} />;
}
