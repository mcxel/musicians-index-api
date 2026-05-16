export type LobbyParticipationEntry = {
  id: string;
  label: string;
  points: number;
  route: string;
  backRoute: string;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  reason?: string;
};

const PARTICIPATION: LobbyParticipationEntry[] = [
  { id: "p1", label: "Fan Squad Alpha", points: 9800, route: "/lobbies", backRoute: "/home/4", status: "ACTIVE" },
  { id: "p2", label: "Cypher Crew Neon", points: 9200, route: "/cypher", backRoute: "/lobbies", status: "ACTIVE" },
  { id: "p3", label: "Arena Jump Team", points: 8700, route: "/games", backRoute: "/lobbies", status: "NEEDS_SETUP", reason: "Game bridge pending" },
];

export function listLobbyParticipationBoard() {
  return PARTICIPATION;
}
