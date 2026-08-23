import { ChatsView } from "@/views/chats/ChatsView";

export default async function Page({ params }: PageProps<"/n/[niche]/chats">) {
  const { niche } = await params;
  return <ChatsView niche={niche} />;
}
