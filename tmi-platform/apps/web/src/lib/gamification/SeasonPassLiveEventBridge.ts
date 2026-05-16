// SeasonPassLiveEventBridge
// Listens for live TMI events and grants season pass XP.
// Events: wins, crowns, battles, cyphers, uploads, streams.
// Dispatches notifications to SeasonPassDisplayEngine for Home 2 live ticker.

import { seasonPassEngine } from "./SeasonPassEngine";
import { addXpAndSnapshot, type ProgressionSnapshot } from "./SeasonPassProgressionEngine";
import { pushUnlockNotification } from "./SeasonPassDisplayEngine";

export type LiveEventType =
  | "battle_win"
  | "crown_awarded"
  | "battle_entered"
  | "cypher_entered"
  | "song_uploaded"
  | "stream_earned"
  | "fan_vote_received"
  | "merch_purchased"
  | "sponsor_clicked"
  | "friend_joined"
  | "referral_converted";

export type LiveEventPayload = {
  eventType: LiveEventType;
  userId: string;
  userName: string;
  metadata?: Record<string, string | number>;
};

export type XpGrant = {
  eventType: LiveEventType;
  xpAwarded: number;
  snapshot: ProgressionSnapshot;
  leveledUp: boolean;
  newLevel?: number;
};

// XP per event type
const XP_GRANTS: Record<LiveEventType, number> = {
  battle_win:         250,
  crown_awarded:      500,
  battle_entered:      50,
  cypher_entered:      30,
  song_uploaded:       80,
  stream_earned:       10,  // per unit (call multiple times for per-minute grants)
  fan_vote_received:    5,
  merch_purchased:    100,
  sponsor_clicked:      8,
  friend_joined:       40,
  referral_converted: 150,
};

// ── Event processing ──────────────────────────────────────────────────────────

export function processLiveEvent(payload: LiveEventPayload): XpGrant | null {
  const { eventType, userId, userName } = payload;
  if (!seasonPassEngine.isActive(userId)) return null;

  const xp = XP_GRANTS[eventType] ?? 0;
  if (xp === 0) return null;

  const snapshot = addXpAndSnapshot(userId, xp);
  const leveledUp = snapshot.justLeveledUp;

  if (leveledUp && snapshot.newLevel) {
    const rewardLabel = snapshot.levels[snapshot.newLevel - 1]?.rewardPreview ?? "Reward Unlocked";
    pushUnlockNotification(userName, `${rewardLabel} (Level ${snapshot.newLevel})`);
  }

  return {
    eventType,
    xpAwarded: xp,
    snapshot,
    leveledUp,
    newLevel: leveledUp ? snapshot.newLevel : undefined,
  };
}

// Convenience dispatchers for common events
export function onBattleWin(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "battle_win", userId, userName });
}

export function onCrownAwarded(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "crown_awarded", userId, userName });
}

export function onBattleEntered(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "battle_entered", userId, userName });
}

export function onCypherEntered(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "cypher_entered", userId, userName });
}

export function onSongUploaded(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "song_uploaded", userId, userName });
}

export function onStreamUnit(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "stream_earned", userId, userName });
}

export function onMerchPurchased(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "merch_purchased", userId, userName });
}

export function onReferralConverted(userId: string, userName: string): XpGrant | null {
  return processLiveEvent({ eventType: "referral_converted", userId, userName });
}

// ── XP table (for UI display) ─────────────────────────────────────────────────

export function getXpTable(): Array<{ eventType: LiveEventType; xp: number; label: string }> {
  const labels: Record<LiveEventType, string> = {
    battle_win:          "Win a Battle",
    crown_awarded:       "Receive Crown",
    battle_entered:      "Enter a Battle",
    cypher_entered:      "Join a Cypher",
    song_uploaded:       "Upload a Song",
    stream_earned:       "Stream (per unit)",
    fan_vote_received:   "Receive Fan Vote",
    merch_purchased:     "Buy Merch",
    sponsor_clicked:     "Sponsor Click",
    friend_joined:       "Friend Joins TMI",
    referral_converted:  "Referral Converts",
  };

  return (Object.keys(XP_GRANTS) as LiveEventType[]).map((et) => ({
    eventType: et,
    xp: XP_GRANTS[et]!,
    label: labels[et],
  }));
}
