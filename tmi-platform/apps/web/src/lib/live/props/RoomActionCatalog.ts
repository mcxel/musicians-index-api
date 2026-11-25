/**
 * Room action catalog — every synced thing a person can do in a live room, one event log.
 * (client-safe; the server authority is RoomPropEventService, table live_room_prop_events)
 *
 * Kinds share one ordered log so viewers fold the same state:
 *   HELD_PROP     fan holds something in the hand (lighter, sign, money gun …)      slot "hand"
 *   EMOTE         fan body action (peace, clap, ovation, wave, chant …)            slot "body"
 *   WEARABLE_FX   fan wrist/body light (LED wristband)                              slot "wrist"
 *   STAGE_EFFECT  host-only stage effect from venue launch points (confetti, pyro)  slot "stage"
 *   MOMENT        host opens a crowd moment (Raise Your Lights, Encore Meter …)     slot "moment"
 *   PARTICIPATION fan opts into an open moment (team colour, consent …)            slot "participation"
 *   HOST_SELECT   host picks a CONSENTING fan (spotlight / dance cam)              slot "select"
 *
 * Laws: participation is voluntary and counted from real distinct actors only; crowd support
 * (team sections, chants, colours) is never a competition vote; Fan Spotlight / Dance Cam need
 * the fan's own consent event; MISSING-asset actions are refused (no invisible "success");
 * effects are visual only — no balance, payout or reward is ever created.
 */

import { HELD_PROP_POLICIES, type HeldPropPricing } from "./RoomPropEventModel";

export type RoomActionKind = "HELD_PROP" | "EMOTE" | "WEARABLE_FX" | "STAGE_EFFECT" | "MOMENT" | "PARTICIPATION" | "HOST_SELECT";
export type RoomActionSlot = "hand" | "body" | "wrist" | "stage" | "moment" | "participation" | "select";
export type RoomActionAudience = "FAN" | "HOST";
/**
 * PLACEHOLDER = test model exists (non-production); PRODUCTION = certified asset;
 * MISSING = no asset → action refused; RENDERER_PENDING = event is real and synced, the visual
 * (animation/VFX) is not built yet — clients must not claim it plays.
 */
export type RoomActionAssetStatus = "PLACEHOLDER" | "PRODUCTION" | "MISSING" | "RENDERER_PENDING";

export type MomentKind =
  | "raise_your_lights"
  | "encore"
  | "call_response"
  | "crowd_color"
  | "team_sections"
  | "spotlight"
  | "dance_cam"
  | "birthday"
  | "anniversary"
  | "celebration";

export type RoomActionPolicy = {
  id: string;
  kind: RoomActionKind;
  slot: RoomActionSlot;
  audience: RoomActionAudience;
  label: string;
  icon: string;
  durationMs: number;
  cooldownMs: number;
  pricing: HeldPropPricing;
  assetStatus: RoomActionAssetStatus;
  assetId: string | null;
  glbUrl: string | null;
  /** MOMENT: which moment this opens. */
  opensMoment?: MomentKind;
  /** PARTICIPATION / HOST_SELECT: only valid while this moment is open. */
  requiresMoment?: MomentKind;
  /** PARTICIPATION choice group: an actor's latest choice in the group replaces the earlier one. */
  choiceGroup?: string;
  /** HOST_SELECT: target must have an active consent event with this action id. */
  requiresTargetConsent?: string;
  /** Lights that count toward Raise Your Lights. */
  isConcertLight?: boolean;
  /** Counts toward the Encore Meter / Call & Response tallies. */
  countsToward?: MomentKind;
  /** Sing-Along needs licensed lyrics; never enabled by this catalog. */
  requiresLicense?: boolean;
};

const FREE: HeldPropPricing = { kind: "FREE" };
const S = 1000;
const MIN = 60 * S;

function held(id: string): RoomActionPolicy {
  const p = HELD_PROP_POLICIES[id]!;
  return {
    id, kind: "HELD_PROP", slot: "hand", audience: "FAN", label: p.label, icon: p.icon,
    durationMs: p.durationMs, cooldownMs: p.cooldownMs, pricing: p.pricing,
    assetStatus: p.placeholder ? "PLACEHOLDER" : "PRODUCTION", assetId: p.assetId, glbUrl: p.glbUrl,
    isConcertLight: p.effectNode === "Flame" || p.effectNode === "Glow" || undefined,
  };
}
const missingHeld = (id: string, label: string, icon: string, durationMs = 10 * S): RoomActionPolicy => ({
  id, kind: "HELD_PROP", slot: "hand", audience: "FAN", label, icon, durationMs, cooldownMs: 2_500,
  pricing: FREE, assetStatus: "MISSING", assetId: null, glbUrl: null,
});
const emote = (id: string, label: string, icon: string, durationMs: number, extra: Partial<RoomActionPolicy> = {}): RoomActionPolicy => ({
  id, kind: "EMOTE", slot: "body", audience: "FAN", label, icon, durationMs, cooldownMs: 1_500,
  pricing: FREE, assetStatus: "RENDERER_PENDING", assetId: null, glbUrl: null, ...extra,
});
const stage = (id: string, label: string, icon: string, durationMs: number): RoomActionPolicy => ({
  id, kind: "STAGE_EFFECT", slot: "stage", audience: "HOST", label, icon, durationMs, cooldownMs: 5_000,
  pricing: FREE, assetStatus: "RENDERER_PENDING", assetId: null, glbUrl: null,
});
const moment = (kind: MomentKind, label: string, icon: string, durationMs: number, extra: Partial<RoomActionPolicy> = {}): RoomActionPolicy => ({
  id: `moment_${kind}`, kind: "MOMENT", slot: "moment", audience: "HOST", label, icon, durationMs, cooldownMs: 3_000,
  pricing: FREE, assetStatus: "RENDERER_PENDING", assetId: null, glbUrl: null, opensMoment: kind, ...extra,
});
const participate = (id: string, label: string, icon: string, requiresMoment: MomentKind, extra: Partial<RoomActionPolicy> = {}): RoomActionPolicy => ({
  id, kind: "PARTICIPATION", slot: "participation", audience: "FAN", label, icon, durationMs: 10 * MIN, cooldownMs: 1_000,
  pricing: FREE, assetStatus: "RENDERER_PENDING", assetId: null, glbUrl: null, requiresMoment, ...extra,
});

const ENTRIES: RoomActionPolicy[] = [
  // Concert lights + approved hand props (placeholder models exist for these).
  held("lighter"), held("candle"), held("torch"), held("glow_stick"),
  ...(["sign_i_love_you", "sign_encore", "money_gun"] as const).filter((id) => HELD_PROP_POLICIES[id]).map(held),
  // Requested hand props without any model yet → refused until Anti-Gravity delivers.
  { ...missingHeld("phone_light", "Phone Light", "📱", 20 * S), isConcertLight: true },
  missingHeld("foam_finger", "Foam Finger", "☝️"),
  missingHeld("fan_flag", "Fan Flag", "🚩"),
  missingHeld("rose", "Rose", "🌹"),
  missingHeld("heart_balloon", "Heart Balloon", "🎈"),
  missingHeld("pom_poms", "Pom-Poms", "🎀"),
  // Wrist light: colour follows an open Crowd Colour moment.
  { id: "led_wristband", kind: "WEARABLE_FX", slot: "wrist", audience: "FAN", label: "LED Wristband", icon: "⌚", durationMs: 10 * MIN, cooldownMs: 2_000, pricing: FREE, assetStatus: "MISSING", assetId: null, glbUrl: null },
  // Body actions (catalog emotes exist; animations are not verified → RENDERER_PENDING).
  emote("peace", "Peace", "✌️", 4 * S),
  emote("thumbs_up", "Thumbs Up", "👍", 4 * S),
  emote("heart_hands", "Heart Hands", "🫶", 5 * S),
  emote("clap", "Clap", "👏", 5 * S),
  emote("standing_ovation", "Standing Ovation", "🧍", 10 * S),
  emote("cheer", "Cheer", "🙌", 5 * S),
  emote("dance", "Dance", "💃", 15 * S),
  emote("head_nod", "Head Nod", "🎶", 15 * S),
  emote("crowd_wave", "Crowd Wave", "🌊", 6 * S),
  emote("camera_flash", "Camera Flash", "📸", 1 * S),
  emote("chant_hey_hey_goodbye", "Na Na Hey Hey", "📣", 8 * S, { countsToward: "call_response" }),
  emote("encore_request", "Encore!", "🔁", 30 * S, { countsToward: "encore", cooldownMs: 10 * S }),
  // Host stage effects (venue launch-point anchors still missing in most venues).
  stage("stage_confetti", "Confetti", "🎊", 6 * S),
  stage("stage_pyro", "Pyro", "🎆", 5 * S),
  stage("stage_money_rain", "Make It Rain", "💸", 8 * S),
  stage("stage_heart_burst", "Show Love", "💖", 6 * S),
  // Host-opened crowd moments.
  moment("raise_your_lights", "Raise Your Lights", "🕯️", 5 * MIN),
  moment("encore", "Encore Meter", "🔁", 2 * MIN),
  moment("call_response", "Call & Response", "📣", 2 * MIN),
  moment("crowd_color", "Crowd Colour", "🌈", 5 * MIN),
  moment("team_sections", "Team Sections", "🏳️", 10 * MIN),
  moment("spotlight", "Fan Spotlight", "🔦", 3 * MIN),
  moment("dance_cam", "Dance Cam", "🎥", 3 * MIN),
  moment("birthday", "Birthday Shoutout", "🎂", 2 * MIN),
  moment("anniversary", "TMI Anniversary", "🎉", 10 * MIN),
  moment("celebration", "Celebration", "🏆", 2 * MIN),
  // Fan participation (voluntary; never votes).
  ...(["red", "gold", "purple", "cyan", "white"] as const).map((c) =>
    participate(`crowd_color_${c}`, `Colour: ${c}`, "🎨", "crowd_color", { choiceGroup: "crowd_color" })),
  participate("team_support_a", "Support Side A", "🅰️", "team_sections", { choiceGroup: "team" }),
  participate("team_support_b", "Support Side B", "🅱️", "team_sections", { choiceGroup: "team" }),
  participate("consent_spotlight", "Put me in the Spotlight", "🙋", "spotlight"),
  participate("consent_dance_cam", "Put me on Dance Cam", "🕺", "dance_cam"),
  // Host picks among consenting fans only.
  { id: "spotlight_select", kind: "HOST_SELECT", slot: "select", audience: "HOST", label: "Spotlight a fan", icon: "🔦", durationMs: 30 * S, cooldownMs: 5_000, pricing: FREE, assetStatus: "RENDERER_PENDING", assetId: null, glbUrl: null, requiresMoment: "spotlight", requiresTargetConsent: "consent_spotlight" },
  { id: "dance_cam_select", kind: "HOST_SELECT", slot: "select", audience: "HOST", label: "Dance Cam a fan", icon: "🎥", durationMs: 20 * S, cooldownMs: 5_000, pricing: FREE, assetStatus: "RENDERER_PENDING", assetId: null, glbUrl: null, requiresMoment: "dance_cam", requiresTargetConsent: "consent_dance_cam" },
];

export const ROOM_ACTIONS: Readonly<Record<string, RoomActionPolicy>> = Object.freeze(
  Object.fromEntries(ENTRIES.map((e) => [e.id, e])),
);

export function roomActionPolicy(id: string): RoomActionPolicy | null {
  return Object.prototype.hasOwnProperty.call(ROOM_ACTIONS, id) ? ROOM_ACTIONS[id]! : null;
}

export const MOMENT_ACTION_IDS: readonly string[] = ENTRIES.filter((e) => e.kind === "MOMENT").map((e) => e.id);
export const MAX_ACTION_DURATION_MS = Math.max(...ENTRIES.map((e) => e.durationMs));
