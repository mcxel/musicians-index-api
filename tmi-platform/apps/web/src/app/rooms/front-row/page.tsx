import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function FrontRowRoomPage() {
  return (
    <main data-testid="room-front-row">
      <LobbyTheaterShell slug="front-row" mode="room" />
    </main>
  );
}
