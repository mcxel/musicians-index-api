import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function BandRoomPage() {
  return (
    <main data-testid="room-band">
      <LobbyTheaterShell slug="band" mode="room" />
    </main>
  );
}
