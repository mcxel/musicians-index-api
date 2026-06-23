export interface LobbyInvite {
  inviteId: string;
  fromUserId: string;
  toUserId: string;
  lobbyId: string;
  createdAtMs: number;
}

export interface LobbyInviteEngine {
  createInvite(fromUserId: string, toUserId: string, lobbyId: string): Promise<LobbyInvite>;
  acceptInvite(inviteId: string): Promise<void>;
}
