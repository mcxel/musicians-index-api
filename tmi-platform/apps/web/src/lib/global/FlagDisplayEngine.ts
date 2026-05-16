export interface FlagConfig {
  countryCode: string;
  emoji: string;
  label: string;
  showOnArtistCard: boolean;
  showOnRoomCard: boolean;
  showOnLeaderboard: boolean;
  showOnMagazine: boolean;
  showOnBattles: boolean;
  showOnTickets: boolean;
}

const FLAGS: Record<string, FlagConfig> = {
  US: { countryCode: "US", emoji: "🇺🇸", label: "United States",  showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  NG: { countryCode: "NG", emoji: "🇳🇬", label: "Nigeria",         showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  GB: { countryCode: "GB", emoji: "🇬🇧", label: "United Kingdom",  showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  JM: { countryCode: "JM", emoji: "🇯🇲", label: "Jamaica",         showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  BR: { countryCode: "BR", emoji: "🇧🇷", label: "Brazil",          showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  KR: { countryCode: "KR", emoji: "🇰🇷", label: "South Korea",     showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  ZA: { countryCode: "ZA", emoji: "🇿🇦", label: "South Africa",    showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: false },
  GH: { countryCode: "GH", emoji: "🇬🇭", label: "Ghana",           showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: false },
  TT: { countryCode: "TT", emoji: "🇹🇹", label: "Trinidad",        showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: false },
  JP: { countryCode: "JP", emoji: "🇯🇵", label: "Japan",           showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  FR: { countryCode: "FR", emoji: "🇫🇷", label: "France",          showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  CO: { countryCode: "CO", emoji: "🇨🇴", label: "Colombia",        showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: false },
  IN: { countryCode: "IN", emoji: "🇮🇳", label: "India",           showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
  CA: { countryCode: "CA", emoji: "🇨🇦", label: "Canada",          showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true, showOnMagazine: true, showOnBattles: true, showOnTickets: true },
};

export function getFlag(countryCode: string): FlagConfig | null {
  return FLAGS[countryCode.toUpperCase()] ?? null;
}

export function getFlagEmoji(countryCode: string): string {
  return FLAGS[countryCode.toUpperCase()]?.emoji ?? "🌐";
}

export function getAllFlags(): FlagConfig[] {
  return Object.values(FLAGS);
}

export function shouldShowFlag(countryCode: string, surface: keyof Omit<FlagConfig, "countryCode" | "emoji" | "label">): boolean {
  const flag = FLAGS[countryCode.toUpperCase()];
  if (!flag) return false;
  return flag[surface] as boolean;
}

export function registerCustomFlag(countryCode: string, emoji: string, label: string): void {
  FLAGS[countryCode.toUpperCase()] = {
    countryCode: countryCode.toUpperCase(), emoji, label,
    showOnArtistCard: true, showOnRoomCard: true, showOnLeaderboard: true,
    showOnMagazine: true, showOnBattles: true, showOnTickets: false,
  };
}
