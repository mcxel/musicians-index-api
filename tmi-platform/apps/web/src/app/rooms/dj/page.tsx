import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function DJRoomPage() {
  return (
    <main data-testid="room-dj">
      <LobbyTheaterShell slug="dj" mode="room" />
    </main>
  );
}
