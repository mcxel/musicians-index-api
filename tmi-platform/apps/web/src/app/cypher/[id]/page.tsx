import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

// Cypher rooms → Arena venue (slug "cypher-{id}" maps to venue index 1 in LobbyTheaterShell)
export default function CypherRoomPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { autoSeat?: string };
}) {
  const slug = `cypher-${params.id}`;
  const autoSeat = searchParams.autoSeat === "1";
  return (
    <main data-testid="cypher-room-page">
      <LobbyTheaterShell slug={slug} mode="room" autoSeat={autoSeat} />
    </main>
  );
}
