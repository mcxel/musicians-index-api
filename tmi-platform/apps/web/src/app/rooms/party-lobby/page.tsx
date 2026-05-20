import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function PartyLobbyRoomPage() {
  return (
    <main data-testid="room-party-lobby">
      <LobbyTheaterShell slug="party-lobby" mode="room" />
    </main>
  );
}
