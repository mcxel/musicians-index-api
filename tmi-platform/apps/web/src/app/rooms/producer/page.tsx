import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function ProducerRoomPage() {
  return (
    <main data-testid="room-producer">
      <LobbyTheaterShell slug="producer" mode="room" />
    </main>
  );
}
