export type EconomyRole = 'fan' | 'performer';

export type FanEarnAction =
  | 'listen_song'
  | 'vote_battle'
  | 'rate_performance'
  | 'join_live_room'
  | 'watch_showcase'
  | 'complete_challenge'
  | 'invite_friend'
  | 'daily_checkin'
  | 'discover_artist'
  | 'write_review'
  | 'participate_poll';

export type PerformerEarnAction =
  | 'perform_live'
  | 'win_battle'
  | 'complete_performer_challenge'
  | 'audience_engagement'
  | 'high_rating'
  | 'consistent_activity'
  | 'daily_mission'
  | 'weekly_mission'
  | 'fan_growth'
  | 'sell_ticket'
  | 'receive_tip';

export type EarnAction = FanEarnAction | PerformerEarnAction;

export type SpendAction =
  | 'avatar_outfit'
  | 'emote_pack'
  | 'dance_move_pack'
  | 'profile_frame'
  | 'animated_badge'
  | 'venue_decoration'
  | 'fan_club_perk'
  | 'digital_collectible'
  | 'sweepstakes_entry'
  | 'meet_greet_discount'
  | 'ticket_discount'
  | 'playlist_boost'
  | 'discovery_boost'
  | 'spotlight_placement'
  | 'battle_entry'
  | 'premium_analytics'
  | 'featured_campaign'
  | 'magazine_submission_credit'
  | 'digital_asset_pack'
  | 'ranking_boost';

export interface EconomyWallet {
  userId: string;
  xp: number;
  coins: number;
  cashCents: number;
  updatedAt: string;
}

export interface EconomyLedgerEntry {
  id: string;
  userId: string;
  kind: 'earn' | 'spend' | 'cash';
  action: string;
  xpDelta: number;
  coinsDelta: number;
  cashDeltaCents: number;
  meta?: Record<string, string | number | boolean>;
  createdAt: string;
}

const wallets = new Map<string, EconomyWallet>();
const ledger = new Map<string, EconomyLedgerEntry[]>();

const FAN_EARN_TABLE: Record<FanEarnAction, { xp: number; coins: number }> = {
  listen_song: { xp: 8, coins: 2 },
  vote_battle: { xp: 15, coins: 4 },
  rate_performance: { xp: 12, coins: 3 },
  join_live_room: { xp: 10, coins: 3 },
  watch_showcase: { xp: 14, coins: 4 },
  complete_challenge: { xp: 30, coins: 8 },
  invite_friend: { xp: 40, coins: 12 },
  daily_checkin: { xp: 6, coins: 2 },
  discover_artist: { xp: 11, coins: 3 },
  write_review: { xp: 18, coins: 5 },
  participate_poll: { xp: 9, coins: 2 },
};

const PERFORMER_EARN_TABLE: Record<PerformerEarnAction, { xp: number; coins: number }> = {
  perform_live: { xp: 50, coins: 10 },
  win_battle: { xp: 80, coins: 20 },
  complete_performer_challenge: { xp: 60, coins: 14 },
  audience_engagement: { xp: 25, coins: 8 },
  high_rating: { xp: 35, coins: 10 },
  consistent_activity: { xp: 28, coins: 9 },
  daily_mission: { xp: 20, coins: 6 },
  weekly_mission: { xp: 70, coins: 18 },
  fan_growth: { xp: 42, coins: 12 },
  sell_ticket: { xp: 26, coins: 8 },
  receive_tip: { xp: 15, coins: 5 },
};

const SPEND_TABLE: Record<Exclude<SpendAction, 'ranking_boost'>, number> = {
  avatar_outfit: 120,
  emote_pack: 80,
  dance_move_pack: 110,
  profile_frame: 70,
  animated_badge: 95,
  venue_decoration: 150,
  fan_club_perk: 130,
  digital_collectible: 140,
  sweepstakes_entry: 50,
  meet_greet_discount: 180,
  ticket_discount: 160,
  playlist_boost: 220,
  discovery_boost: 260,
  spotlight_placement: 300,
  battle_entry: 200,
  premium_analytics: 280,
  featured_campaign: 350,
  magazine_submission_credit: 240,
  digital_asset_pack: 175,
};

function nowIso(): string {
  return new Date().toISOString();
}

function entryId(userId: string): string {
  return `${userId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function getOrCreateWallet(userId: string): EconomyWallet {
  const existing = wallets.get(userId);
  if (existing) return existing;
  const created: EconomyWallet = {
    userId,
    xp: 0,
    coins: 0,
    cashCents: 0,
    updatedAt: nowIso(),
  };
  wallets.set(userId, created);
  return created;
}

function pushLedger(userId: string, item: EconomyLedgerEntry): void {
  const current = ledger.get(userId) ?? [];
  ledger.set(userId, [item, ...current].slice(0, 500));
}

export class ParticipationEconomyEngine {
  getWallet(userId: string): EconomyWallet {
    return getOrCreateWallet(userId);
  }

  getLedger(userId: string): EconomyLedgerEntry[] {
    return ledger.get(userId) ?? [];
  }

  earn(userId: string, role: EconomyRole, action: EarnAction, meta?: Record<string, string | number | boolean>) {
    const wallet = getOrCreateWallet(userId);
    const reward = role === 'fan'
      ? FAN_EARN_TABLE[action as FanEarnAction]
      : PERFORMER_EARN_TABLE[action as PerformerEarnAction];

    if (!reward) {
      return { ok: false, error: 'action_not_allowed_for_role', wallet };
    }

    const updated: EconomyWallet = {
      ...wallet,
      xp: wallet.xp + reward.xp,
      coins: wallet.coins + reward.coins,
      updatedAt: nowIso(),
    };
    wallets.set(userId, updated);

    pushLedger(userId, {
      id: entryId(userId),
      userId,
      kind: 'earn',
      action,
      xpDelta: reward.xp,
      coinsDelta: reward.coins,
      cashDeltaCents: 0,
      meta,
      createdAt: nowIso(),
    });

    return { ok: true, wallet: updated, reward };
  }

  spend(userId: string, action: SpendAction, meta?: Record<string, string | number | boolean>) {
    const wallet = getOrCreateWallet(userId);

    // Non-negotiable anti-pay-to-win rule: points cannot buy rank.
    if (action === 'ranking_boost') {
      return { ok: false, error: 'ranking_purchase_blocked', wallet };
    }

    const price = SPEND_TABLE[action];
    if (!price) {
      return { ok: false, error: 'unsupported_spend_action', wallet };
    }

    if (wallet.coins < price) {
      return { ok: false, error: 'insufficient_coins', wallet, price };
    }

    const updated: EconomyWallet = {
      ...wallet,
      coins: wallet.coins - price,
      updatedAt: nowIso(),
    };
    wallets.set(userId, updated);

    pushLedger(userId, {
      id: entryId(userId),
      userId,
      kind: 'spend',
      action,
      xpDelta: 0,
      coinsDelta: -price,
      cashDeltaCents: 0,
      meta,
      createdAt: nowIso(),
    });

    return { ok: true, wallet: updated, price };
  }

  adjustCash(userId: string, deltaCents: number, reason: string) {
    const wallet = getOrCreateWallet(userId);
    const updated: EconomyWallet = {
      ...wallet,
      cashCents: Math.max(0, wallet.cashCents + deltaCents),
      updatedAt: nowIso(),
    };
    wallets.set(userId, updated);

    pushLedger(userId, {
      id: entryId(userId),
      userId,
      kind: 'cash',
      action: reason,
      xpDelta: 0,
      coinsDelta: 0,
      cashDeltaCents: deltaCents,
      createdAt: nowIso(),
    });

    return updated;
  }
}

export const participationEconomyEngine = new ParticipationEconomyEngine();
