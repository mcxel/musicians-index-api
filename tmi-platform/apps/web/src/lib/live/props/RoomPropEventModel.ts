/**
 * Room prop events — shared contract (client-safe, no server imports).
 *
 * One append-only event per action, ordered by a per-room sequence number assigned
 * by the server. Every viewer folds the same ordered events into the same state, so
 * the actor and all other viewers render the same prop at the same moment.
 * Expired activations fold to "not active", so a reconnecting viewer never replays
 * an old lighter flash.
 *
 * Effects are visual only: a prop event never creates a balance, payout or reward.
 */

export type HeldPropPricing =
  | { kind: "FREE" }
  /** Purchasable by any account (never tier-gated). Ownership = store_item_ownerships row. */
  | { kind: "PURCHASE"; catalogItemId: string };

export type HeldPropPolicy = {
  /** Id used by the HUD props tray (LobbyPropRegistry). */
  hudPropId: string;
  /** 3D asset that renders on the avatar's hand. */
  assetId: string;
  glbUrl: string;
  socket: "socket_primary_hand";
  /** Node toggled by IGNITE (null = no effect node). */
  effectNode: string | null;
  /** Colour of the small point light the flame/glow casts on the hand and face. */
  lightColor: string;
  /** "flame" flickers; "glow" pulses gently; "none" = no light/effect node (signs, money gun). */
  effectKind: "flame" | "glow" | "none";
  /** HUD label and icon. */
  label: string;
  icon: string;
  /** How long one tap keeps the prop up. */
  durationMs: number;
  /** Minimum gap between two activations by the same person. */
  cooldownMs: number;
  pricing: HeldPropPricing;
  /** PLACEHOLDER / NON-PRODUCTION asset: never rendered unless placeholders are enabled. */
  placeholder: boolean;
  /** Template nodes (e.g. the money gun's Bill card) the renderer hides and instances instead. */
  templateNodes?: readonly string[];
};

export const HELD_PROP_POLICIES: Readonly<Record<string, HeldPropPolicy>> = Object.freeze({
  lighter: {
    hudPropId: "lighter",
    assetId: "prop_lighter_placeholder_v0",
    glbUrl: "/models/props/_placeholder/prop_lighter_placeholder_v0.glb",
    socket: "socket_primary_hand",
    effectNode: "Flame",
    lightColor: "#ff8a1e",
    effectKind: "flame",
    label: "Lighter",
    icon: "🔥",
    durationMs: 12_000,
    cooldownMs: 2_500,
    pricing: { kind: "FREE" },
    placeholder: true,
  },
  // Slow-jam lights: same pipeline, same event service, longer hold.
  candle: {
    hudPropId: "candle",
    assetId: "prop_candle_placeholder_v0",
    glbUrl: "/models/props/_placeholder/prop_candle_placeholder_v0.glb",
    socket: "socket_primary_hand",
    effectNode: "Flame",
    lightColor: "#ffb046",
    effectKind: "flame",
    label: "Candle",
    icon: "🕯️",
    durationMs: 20_000,
    cooldownMs: 2_500,
    pricing: { kind: "FREE" },
    placeholder: true,
  },
  torch: {
    hudPropId: "torch",
    assetId: "prop_torch_placeholder_v0",
    glbUrl: "/models/props/_placeholder/prop_torch_placeholder_v0.glb",
    socket: "socket_primary_hand",
    effectNode: "Flame",
    lightColor: "#ff7014",
    effectKind: "flame",
    label: "Torch",
    icon: "🔦",
    durationMs: 15_000,
    cooldownMs: 4_000,
    pricing: { kind: "FREE" },
    placeholder: true,
  },
  glow_stick: {
    hudPropId: "glow_stick",
    assetId: "prop_glowstick_placeholder_v0",
    glbUrl: "/models/props/_placeholder/prop_glowstick_placeholder_v0.glb",
    socket: "socket_primary_hand",
    effectNode: "Glow",
    lightColor: "#00ffcc",
    effectKind: "glow",
    label: "Glow Stick",
    icon: "🪄",
    durationMs: 20_000,
    cooldownMs: 2_500,
    pricing: { kind: "FREE" },
    placeholder: true,
  },
  // Approved P1 hand props (placeholder models; final art: Anti-Gravity).
  sign_i_love_you: {
    hudPropId: "sign_i_love_you",
    assetId: "prop_sign_i_love_you_placeholder_v0",
    glbUrl: "/models/props/_placeholder/prop_sign_i_love_you_placeholder_v0.glb",
    socket: "socket_primary_hand",
    effectNode: null,
    lightColor: "#ff2daa",
    effectKind: "none",
    label: "I ❤️ YOU Sign",
    icon: "🪧",
    durationMs: 15_000,
    cooldownMs: 3_000,
    pricing: { kind: "FREE" },
    placeholder: true,
  },
  sign_encore: {
    hudPropId: "sign_encore",
    assetId: "prop_sign_encore_placeholder_v0",
    glbUrl: "/models/props/_placeholder/prop_sign_encore_placeholder_v0.glb",
    socket: "socket_primary_hand",
    effectNode: null,
    lightColor: "#00ffff",
    effectKind: "none",
    label: "ENCORE Sign",
    icon: "🪧",
    durationMs: 15_000,
    cooldownMs: 3_000,
    pricing: { kind: "FREE" },
    placeholder: true,
  },
  // Visual only: the bill burst never moves money (tips go through the canonical tip flow).
  money_gun: {
    hudPropId: "money_gun",
    assetId: "prop_money_gun_placeholder_v0",
    glbUrl: "/models/props/_placeholder/prop_money_gun_placeholder_v0.glb",
    socket: "socket_primary_hand",
    effectNode: null,
    lightColor: "#00d000",
    effectKind: "none",
    templateNodes: ["Bill"],
    label: "Money Gun",
    icon: "💸",
    durationMs: 8_000,
    cooldownMs: 6_000,
    pricing: { kind: "FREE" },
    placeholder: true,
  },
});

export function heldPropPolicy(propId: string): HeldPropPolicy | null {
  return Object.prototype.hasOwnProperty.call(HELD_PROP_POLICIES, propId)
    ? HELD_PROP_POLICIES[propId]!
    : null;
}

export type PropEventAction = "ACTIVATE" | "STOP";

export type RoomPropEvent = {
  roomId: string;
  /** Per-room, strictly increasing, assigned by the server under a room lock. */
  seq: number;
  /** Client-generated id; the same id twice is the same event (idempotent retry). */
  eventId: string;
  actorId: string;
  propId: string;
  assetId: string;
  action: PropEventAction;
  /** Server clock (ms). */
  startAtMs: number;
  durationMs: number;
  /** Deterministic seed so every viewer renders the same flicker/particles. */
  seed: number;
};

export type ActiveHeldProp = {
  actorId: string;
  propId: string;
  assetId: string;
  eventId: string;
  seq: number;
  startAtMs: number;
  endsAtMs: number;
  seed: number;
};

/**
 * Fold ordered events into what should be visible right now.
 * Last event per (actor, prop) wins; ACTIVATE is visible until it expires; STOP clears it.
 * Events are re-sorted by seq, so out-of-order delivery folds to the same answer.
 */
export function foldActiveHeldProps(events: readonly RoomPropEvent[], nowMs: number): Map<string, ActiveHeldProp> {
  const ordered = [...events].sort((a, b) => a.seq - b.seq);
  const last = new Map<string, RoomPropEvent>();
  for (const e of ordered) {
    // Only hand props: emotes/moments share the log and must never displace a held prop.
    if (!Object.prototype.hasOwnProperty.call(HELD_PROP_POLICIES, e.propId)) continue;
    last.set(`${e.actorId}\u0000${e.propId}`, e);
  }
  const out = new Map<string, ActiveHeldProp>();
  for (const e of last.values()) {
    if (e.action !== "ACTIVATE") continue;
    const endsAtMs = e.startAtMs + e.durationMs;
    if (endsAtMs <= nowMs) continue;
    // One held prop per actor's hand: the newest activation wins.
    const prev = out.get(e.actorId);
    if (prev && prev.seq > e.seq) continue;
    out.set(e.actorId, {
      actorId: e.actorId,
      propId: e.propId,
      assetId: e.assetId,
      eventId: e.eventId,
      seq: e.seq,
      startAtMs: e.startAtMs,
      endsAtMs,
      seed: e.seed,
    });
  }
  return out;
}

/** Stable 31-bit seed from the event id (same on server and every client). */
export function seedFromEventId(eventId: string): number {
  let h = 2166136261;
  for (let i = 0; i < eventId.length; i++) {
    h ^= eventId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) & 0x7fffffff;
}

export const PROP_EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Rendering gate for PLACEHOLDER assets. Off in production builds unless an operator
 * explicitly enables it for a test deployment.
 */
export function placeholderPropsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  if (env.NEXT_PUBLIC_TMI_PLACEHOLDER_PROPS === "1") return true;
  if (env.NEXT_PUBLIC_TMI_PLACEHOLDER_PROPS === "0") return false;
  return env.NODE_ENV !== "production";
}
