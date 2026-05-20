import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function DealOrFeudRoomPage() {
  return (
    <main data-testid="room-deal-or-feud">
      <LobbyTheaterShell slug="deal-or-feud" mode="room" />
    </main>
  );
}
