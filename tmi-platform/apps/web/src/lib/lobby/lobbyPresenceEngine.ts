export type LobbyPresence = {
  activeUsers: number;
  vipUsers: number;
  bots: number;
  reactionsPerMinute: number;
  tipsPerMinute: number;
  countdownSeconds: number;
};

export function createInitialPresence(): LobbyPresence {
  return {
    activeUsers: 184,
    vipUsers: 22,
    bots: 4,
    reactionsPerMinute: 54,
    tipsPerMinute: 7,
    countdownSeconds: 300,
  };
}

export function startCountdown(presence: LobbyPresence): LobbyPresence {
  return {
    ...presence,
    countdownSeconds: Math.max(0, presence.countdownSeconds - 1),
  };
}

export function sendReaction(presence: LobbyPresence, type: "clap" | "heart" | "fire" | "star"): LobbyPresence {
  const bump = type === "fire" ? 3 : 1;
  return {
    ...presence,
    reactionsPerMinute: presence.reactionsPerMinute + bump,
  };
}

export function sendTip(presence: LobbyPresence, amount: number): LobbyPresence {
  return {
    ...presence,
    tipsPerMinute: presence.tipsPerMinute + (amount >= 10 ? 2 : 1),
  };
}
