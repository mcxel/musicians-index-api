// Sponsor Gift Injection Engine — event-driven gift drops during live sessions
// Surprise gifts, giveaway windows, milestone triggers, time-based injections
// SSR-safe: pure functions + deterministic seeding; no side effects at import time

// ── Types ─────────────────────────────────────────────────────────────────────

export type GiftTrigger =
  | "session_start"
  | "first_vote"
  | "vote_milestone"     // e.g. every 50 votes
  | "performer_join"
  | "streak_broken"
  | "crown_transfer"
  | "time_interval"      // every N minutes
  | "manual"             // admin-triggered
  | "crowd_heat_peak";   // crowd reaction exceeds threshold

export type GiftType =
  | "discount_code"
  | "nft_drop"
  | "merch_voucher"
  | "streaming_credit"
  | "exclusive_track"
  | "meet_greet_pass"
  | "giveaway_entry"
  | "tip_boost"          // multiplied tip value for 60s
  | "spotlight";         // performer gets highlight banner for 30s

export type SponsorGift = {
  id: string;
  sponsorId: string;
  sponsorName: string;
  type: GiftType;
  label: string;
  value: string;          // display string: "$20", "3x tip", "Free NFT"
  redeemUrl: string;
  expiresMs: number | null;
  maxClaims: number | null;
  claimsRemaining: number | null;
};

export type GiftInjectionRule = {
  sponsorId: string;
  trigger: GiftTrigger;
  gift: SponsorGift;
  triggerValue?: number;   // e.g. vote milestone = 50
  cooldownMs?: number;     // min ms between injections
  lastFiredMs?: number;
};

export type InjectedGiftEvent = {
  eventId: string;
  sessionId: string;
  gift: SponsorGift;
  trigger: GiftTrigger;
  firedAtMs: number;
};

// ── Deterministic ID generation ───────────────────────────────────────────────

function makeId(prefix: string, seed: number): string {
  return `${prefix}-${seed.toString(36).padStart(6, "0")}`;
}

// ── Rule evaluation ───────────────────────────────────────────────────────────

export function shouldFireRule(
  rule: GiftInjectionRule,
  trigger: GiftTrigger,
  nowMs: number,
  triggerValue?: number,
): boolean {
  if (rule.trigger !== trigger) return false;
  if (rule.cooldownMs && rule.lastFiredMs && nowMs - rule.lastFiredMs < rule.cooldownMs) return false;
  if (trigger === "vote_milestone" && rule.triggerValue !== undefined) {
    if (triggerValue === undefined || triggerValue % rule.triggerValue !== 0) return false;
  }
  return true;
}

export function fireGiftRule(
  rule: GiftInjectionRule,
  sessionId: string,
  nowMs: number,
  seed: number,
): { event: InjectedGiftEvent; updatedRule: GiftInjectionRule } {
  const event: InjectedGiftEvent = {
    eventId: makeId("gift-evt", seed),
    sessionId,
    gift: { ...rule.gift },
    trigger: rule.trigger,
    firedAtMs: nowMs,
  };
  const updatedRule: GiftInjectionRule = { ...rule, lastFiredMs: nowMs };
  return { event, updatedRule };
}

// ── Batch evaluation — pass all rules + current trigger ──────────────────────

export function evaluateRules(
  rules: GiftInjectionRule[],
  trigger: GiftTrigger,
  sessionId: string,
  nowMs: number,
  triggerValue?: number,
): { events: InjectedGiftEvent[]; updatedRules: GiftInjectionRule[] } {
  const events: InjectedGiftEvent[] = [];
  const updatedRules = rules.map((rule, i) => {
    if (!shouldFireRule(rule, trigger, nowMs, triggerValue)) return rule;
    const { event, updatedRule } = fireGiftRule(rule, sessionId, nowMs, nowMs + i);
    events.push(event);
    return updatedRule;
  });
  return { events, updatedRules };
}

// ── Gift claim ────────────────────────────────────────────────────────────────

export type ClaimResult =
  | { success: true; gift: SponsorGift }
  | { success: false; reason: string };

export function claimGift(gift: SponsorGift, nowMs: number = Date.now()): ClaimResult {
  if (gift.expiresMs !== null && nowMs > gift.expiresMs) {
    return { success: false, reason: "This gift has expired." };
  }
  if (gift.claimsRemaining !== null && gift.claimsRemaining <= 0) {
    return { success: false, reason: "All claims for this gift have been taken." };
  }
  const updated: SponsorGift = {
    ...gift,
    claimsRemaining: gift.claimsRemaining !== null ? gift.claimsRemaining - 1 : null,
  };
  return { success: true, gift: updated };
}

// ── Preset gift factories ─────────────────────────────────────────────────────

export function makeDiscountGift(sponsorId: string, sponsorName: string, code: string, pct: number, seed: number): SponsorGift {
  return {
    id: makeId("gift-disc", seed),
    sponsorId,
    sponsorName,
    type: "discount_code",
    label: `${pct}% Off from ${sponsorName}`,
    value: `${pct}% OFF`,
    redeemUrl: `/shop?sponsor=${sponsorId}&code=${code}`,
    expiresMs: null,
    maxClaims: 50,
    claimsRemaining: 50,
  };
}

export function makeTipBoostGift(sponsorId: string, sponsorName: string, multiplier: number, seed: number): SponsorGift {
  return {
    id: makeId("gift-tip", seed),
    sponsorId,
    sponsorName,
    type: "tip_boost",
    label: `${multiplier}x Tip Boost — ${sponsorName}`,
    value: `${multiplier}x tips`,
    redeemUrl: `/live?boost=${sponsorId}`,
    expiresMs: null,
    maxClaims: null,
    claimsRemaining: null,
  };
}

export function makeSpotlightGift(sponsorId: string, sponsorName: string, seed: number): SponsorGift {
  return {
    id: makeId("gift-spot", seed),
    sponsorId,
    sponsorName,
    type: "spotlight",
    label: `Spotlight by ${sponsorName}`,
    value: "30s Highlight",
    redeemUrl: `/live?spotlight=${sponsorId}`,
    expiresMs: null,
    maxClaims: null,
    claimsRemaining: null,
  };
}
