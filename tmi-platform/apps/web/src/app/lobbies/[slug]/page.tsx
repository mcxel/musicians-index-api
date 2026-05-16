import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function LobbySlugPage({ params }: { params: { slug: string } }) {
  return <LobbyTheaterShell slug={params.slug} mode="room" />;
}
