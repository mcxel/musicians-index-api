/**
 * Pack Fan Lobby seating + certified presence flags into LobbyPresence.activeTheme
 * until dedicated columns exist (no migration required for Phase A.5).
 *
 * Format (backward compatible):
 *   skin@@seat:chair-1|nav:SEATED|mic:1|cg:chair-circle
 *   skin@@stand|nav:WALKING|mic:0
 *
 * Legacy (still unpacked):
 *   skin@@seat:chair-1
 *   skin@@stand
 */

import type { FanLobbyNavigationState } from "./FanLobbyPresence";

export interface PackedLobbyTheme {
  theme: string;
  seatId: string | null;
  isSeated: boolean;
  navigationState: FanLobbyNavigationState;
  micEnabled: boolean;
  conversationGroupId: string | null;
}

export interface PackLobbyThemeInput {
  skinId: string;
  seatId: string | null;
  navigationState?: FanLobbyNavigationState;
  micEnabled?: boolean;
  conversationGroupId?: string | null;
}

export function packLobbyTheme(
  skinIdOrInput: string | PackLobbyThemeInput,
  seatId?: string | null,
): string {
  const input: PackLobbyThemeInput =
    typeof skinIdOrInput === "string"
      ? { skinId: skinIdOrInput, seatId: seatId ?? null }
      : skinIdOrInput;

  const skin = input.skinId || "lobby-cinema";
  const seated = Boolean(input.seatId);
  const base = seated ? `${skin}@@seat:${input.seatId}` : `${skin}@@stand`;

  const nav =
    input.navigationState ?? (seated ? ("SEATED" as const) : ("STANDING" as const));
  const parts: string[] = [`nav:${nav}`];
  if (input.micEnabled) parts.push("mic:1");
  if (input.conversationGroupId) parts.push(`cg:${input.conversationGroupId}`);

  // Always append flags so unpack can round-trip mic/nav/cg consistently.
  return `${base}|${parts.join("|")}`;
}

export function unpackLobbyTheme(raw: string): PackedLobbyTheme {
  if (!raw) {
    return {
      theme: "lobby-cinema",
      seatId: null,
      isSeated: false,
      navigationState: "STANDING",
      micEnabled: false,
      conversationGroupId: null,
    };
  }

  const sep = raw.indexOf("@@");
  if (sep < 0) {
    return {
      theme: raw,
      seatId: null,
      isSeated: false,
      navigationState: "STANDING",
      micEnabled: false,
      conversationGroupId: null,
    };
  }

  const theme = raw.slice(0, sep) || "lobby-cinema";
  const rest = raw.slice(sep + 2);
  const [flag, ...flagParts] = rest.split("|");

  let seatId: string | null = null;
  let isSeated = false;
  if (flag.startsWith("seat:")) {
    seatId = flag.slice(5) || null;
    isSeated = Boolean(seatId);
  }

  let navigationState: FanLobbyNavigationState = isSeated ? "SEATED" : "STANDING";
  let micEnabled = false;
  let conversationGroupId: string | null = null;

  for (const part of flagParts) {
    if (part.startsWith("nav:")) {
      const v = part.slice(4);
      if (v === "STANDING" || v === "SEATED" || v === "WALKING") navigationState = v;
    } else if (part === "mic:1") {
      micEnabled = true;
    } else if (part.startsWith("cg:") && part.length > 3) {
      conversationGroupId = part.slice(3);
    }
  }

  if (isSeated && navigationState === "STANDING") navigationState = "SEATED";
  if (!isSeated && navigationState === "SEATED") navigationState = "STANDING";

  return {
    theme,
    seatId,
    isSeated,
    navigationState,
    micEnabled,
    conversationGroupId,
  };
}
