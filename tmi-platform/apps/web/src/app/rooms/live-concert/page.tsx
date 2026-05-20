import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function LiveConcertRoomPage() {
  return (
    <main data-testid="room-live-concert">
      <LobbyTheaterShell slug="live-concert" mode="room" />
    </main>
  );
}
