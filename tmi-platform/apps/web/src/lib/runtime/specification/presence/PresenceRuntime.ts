import type { OnlineStatusEngine } from "./OnlineStatusEngine";
import type { FriendPresenceEngine } from "./FriendPresenceEngine";
import type { LobbyPresenceEngine } from "./LobbyPresenceEngine";
import type { ActivityEngine } from "./ActivityEngine";

export interface PresenceRuntime {
  onlineStatus: OnlineStatusEngine;
  friendPresence: FriendPresenceEngine;
  lobbyPresence: LobbyPresenceEngine;
  activity: ActivityEngine;
}
