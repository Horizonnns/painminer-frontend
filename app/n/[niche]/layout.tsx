import { NicheNav } from "@/widgets/niche-nav/NicheNav";

export default async function NicheLayout({
  children,
  params,
}: LayoutProps<"/n/[niche]">) {
  const { niche } = await params;

  return (
    <div>
      <NicheNav niche={niche} />
      {children}
    </div>
  );
}
