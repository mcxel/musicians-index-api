import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function BackstageRoomPage() {
  return (
    <main data-testid="room-backstage">
      <LobbyTheaterShell slug="backstage" mode="room" />
    </main>
  );
}
