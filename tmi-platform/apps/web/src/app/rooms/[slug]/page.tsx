import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function RoomPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <main data-testid="room-page">
      <LobbyTheaterShell slug={params.slug} mode="room" />
    </main>
  );
}
