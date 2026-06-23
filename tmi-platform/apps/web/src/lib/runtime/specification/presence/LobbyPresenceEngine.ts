export interface LobbyPresence {
  lobbyId: string;
  participantCount: number;
  participantIds: string[];
}

export interface LobbyPresenceEngine {
  getLobbyPresence(lobbyId: string): Promise<LobbyPresence>;
}
