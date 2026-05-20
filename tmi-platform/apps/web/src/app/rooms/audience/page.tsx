import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function AudienceRoomPage() {
  return (
    <main data-testid="room-audience">
      <LobbyTheaterShell slug="audience" mode="room" />
    </main>
  );
}
