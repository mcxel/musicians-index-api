import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function GameRoomPage() {
  return (
    <main data-testid="room-game">
      <LobbyTheaterShell slug="game" mode="room" />
    </main>
  );
}
