/**
 * Pack Fan Lobby seating into LobbyPresence.activeTheme until dedicated
 * isSeated/seatId columns exist (no migration required for Phase A++).
 */

export function packLobbyTheme(skinId: string, seatId: string | null): string {
  return seatId ? `${skinId}@@seat:${seatId}` : `${skinId}@@stand`;
}

export function unpackLobbyTheme(raw: string): {
  theme: string;
  seatId: string | null;
  isSeated: boolean;
} {
  if (!raw) return { theme: "lobby-cinema", seatId: null, isSeated: false };
  const sep = raw.indexOf("@@");
  if (sep < 0) return { theme: raw, seatId: null, isSeated: false };
  const theme = raw.slice(0, sep) || "lobby-cinema";
  const flag = raw.slice(sep + 2);
  if (flag.startsWith("seat:")) {
    const seatId = flag.slice(5);
    return { theme, seatId: seatId || null, isSeated: Boolean(seatId) };
  }
  return { theme, seatId: null, isSeated: false };
}
