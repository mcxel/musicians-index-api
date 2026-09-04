/**
 * Data-driven Fan Lobby prop registry. One executor renders/broadcasts every
 * prop through the same pipeline instead of a bespoke component per item -
 * adding a new prop later means adding a row here, not new plumbing.
 */

export type PropEffectKind = "hold" | "burst";
export type PropTier = "free" | "pro" | "gold";

export interface LobbyPropDef {
  id: string;
  label: string;
  icon: string;
  effect: PropEffectKind;
  /** How long the effect plays before self-clearing (ms). */
  durationMs: number;
  accent: string;
  minTier: PropTier;
}

/** Held items — carried by the avatar until duration elapses or re-pressed to release early. */
export const LOBBY_HOLDABLE_PROPS: LobbyPropDef[] = [
  { id: "mic",          label: "Mic",          icon: "🎤", effect: "hold", durationMs: 6000, accent: "#00FFFF", minTier: "free" },
  { id: "sparkler",     label: "Sparkler",     icon: "✨", effect: "hold", durationMs: 6000, accent: "#FFD700", minTier: "free" },
  { id: "candle",       label: "Candle",       icon: "🕯️", effect: "hold", durationMs: 6000, accent: "#FFB84A", minTier: "free" },
  { id: "lighter",      label: "Lighter",      icon: "🔥", effect: "hold", durationMs: 6000, accent: "#FF6600", minTier: "free" },
  { id: "glow_stick",   label: "Glow Stick",   icon: "🪄", effect: "hold", durationMs: 6000, accent: "#00FF88", minTier: "pro" },
  { id: "foam_finger",  label: "Foam Finger",  icon: "🧤", effect: "hold", durationMs: 6000, accent: "#00CCFF", minTier: "pro" },
  { id: "rose",         label: "Rose",         icon: "🌹", effect: "hold", durationMs: 6000, accent: "#FF2DAA", minTier: "pro" },
  { id: "heart_prop",   label: "Heart Prop",   icon: "❤️", effect: "hold", durationMs: 5000, accent: "#FF2DAA", minTier: "free" },
  { id: "money_cannon", label: "Money Cannon", icon: "💸", effect: "hold", durationMs: 4500, accent: "#00FF88", minTier: "gold" },
  { id: "sky_cannon",   label: "Sky Cannon",   icon: "🎆", effect: "hold", durationMs: 4500, accent: "#FFD700", minTier: "gold" },
  // Fan social band instruments (camp-band style — same hold pipeline, not InstrumentRuntimeV2)
  { id: "inst_acoustic_guitar", label: "Acoustic Guitar", icon: "🎸", effect: "hold", durationMs: 12000, accent: "#C68642", minTier: "pro" },
  { id: "inst_electric_guitar", label: "Electric Guitar", icon: "🎸", effect: "hold", durationMs: 12000, accent: "#00FFFF", minTier: "gold" },
  { id: "inst_bass",            label: "Bass",            icon: "🎸", effect: "hold", durationMs: 12000, accent: "#AA2DFF", minTier: "gold" },
  { id: "inst_drums",           label: "Hand Drums",      icon: "🥁", effect: "hold", durationMs: 12000, accent: "#FF6600", minTier: "pro" },
  { id: "inst_keys",            label: "Keys",            icon: "🎹", effect: "hold", durationMs: 12000, accent: "#FF2DAA", minTier: "gold" },
  { id: "inst_sax",             label: "Sax",             icon: "🎷", effect: "hold", durationMs: 12000, accent: "#FFD700", minTier: "gold" },
  { id: "inst_ukulele",         label: "Ukulele",         icon: "🪕", effect: "hold", durationMs: 12000, accent: "#F0C895", minTier: "pro" },
];

/** One-shot burst reactions — fire, animate, and self-clear. */
export const LOBBY_REACTION_PROPS: LobbyPropDef[] = [
  { id: "hearts",    label: "Hearts",    icon: "❤️", effect: "burst", durationMs: 1400, accent: "#FF2DAA", minTier: "free" },
  { id: "fire",      label: "Fire",      icon: "🔥", effect: "burst", durationMs: 1400, accent: "#FF6600", minTier: "free" },
  { id: "confetti",  label: "Confetti",  icon: "🎉", effect: "burst", durationMs: 1600, accent: "#FFD700", minTier: "free" },
  { id: "crown",     label: "Crown",     icon: "👑", effect: "burst", durationMs: 1400, accent: "#FFD700", minTier: "gold" },
  { id: "jester_hat", label: "Jester Hat", icon: "🃏", effect: "burst", durationMs: 1600, accent: "#FF2DAA", minTier: "pro" },
  { id: "sunglasses", label: "Sunglasses", icon: "🕶️", effect: "burst", durationMs: 1400, accent: "#00FFFF", minTier: "pro" },
  { id: "money_rain", label: "Money Rain", icon: "💵", effect: "burst", durationMs: 1800, accent: "#00FF88", minTier: "gold" },
  { id: "sky_burst",  label: "Sky Burst",  icon: "🎇", effect: "burst", durationMs: 1800, accent: "#FFD700", minTier: "gold" },
];

export const LOBBY_INVENTORY_PROPS: LobbyPropDef[] = [...LOBBY_HOLDABLE_PROPS, ...LOBBY_REACTION_PROPS];

export function getLobbyPropDef(propId: string): LobbyPropDef | undefined {
  return LOBBY_INVENTORY_PROPS.find((p) => p.id === propId);
}

export function tierRank(tier: PropTier): number {
  return tier === "gold" ? 2 : tier === "pro" ? 1 : 0;
}

export function isPropUnlockedForTier(prop: LobbyPropDef, userTier: PropTier): boolean {
  return tierRank(userTier) >= tierRank(prop.minTier);
}

/** Touchable environment fixtures placed in the room itself (not carried). */
export interface LobbyEnvToyDef {
  id: string;
  label: string;
  icon: string;
  accent: string;
  /** Position as a percentage of the room floor. */
  anchor: { top: string; left: string };
}

export const LOBBY_ENV_TOYS: LobbyEnvToyDef[] = [
  { id: "popcorn_machine", label: "Popcorn Machine", icon: "🍿", accent: "#FFD700", anchor: { top: "64%", left: "16%" } },
  { id: "arcade_cabinet",  label: "Arcade",          icon: "🕹️", accent: "#FF2DAA", anchor: { top: "58%", left: "84%" } },
  { id: "mic_stand",       label: "Mic Stand",       icon: "🎤", accent: "#00FFFF", anchor: { top: "28%", left: "50%" } },
  { id: "jukebox",         label: "Jukebox",         icon: "📻", accent: "#00FF88", anchor: { top: "72%", left: "50%" } },
  { id: "disco_ball",      label: "Disco Ball",      icon: "🪩", accent: "#FFFFFF", anchor: { top: "10%", left: "50%" } },
];

export function getLobbyEnvToy(toyId: string): LobbyEnvToyDef | undefined {
  return LOBBY_ENV_TOYS.find((t) => t.id === toyId);
}
