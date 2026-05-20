import LobbyTheaterShell from "@/components/lobbies/LobbyTheaterShell";

export default function TriviaRoomPage() {
  return (
    <main data-testid="room-trivia">
      <LobbyTheaterShell slug="trivia" mode="room" />
    </main>
  );
}
