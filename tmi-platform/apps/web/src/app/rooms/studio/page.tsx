import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function StudioRoomPage() {
  return (
    <main data-testid="room-studio">
      <LobbyTheaterShell slug="studio" mode="room" />
    </main>
  );
}
