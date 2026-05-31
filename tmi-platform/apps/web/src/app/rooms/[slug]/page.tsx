import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function RoomPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { autoSeat?: string };
}) {
  const autoSeat = searchParams.autoSeat === "1";
  return (
    <main data-testid="room-page">
      <LobbyTheaterShell slug={params.slug} mode="room" autoSeat={autoSeat} />
    </main>
  );
}
