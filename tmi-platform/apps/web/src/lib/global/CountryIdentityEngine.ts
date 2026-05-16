import { getCountry } from "./GlobalCountryRegistry";

export interface CountryBadge {
  countryCode: string;
  flag: string;
  name: string;
  primaryLanguage: string;
  translationAvailable: boolean;
  captionAvailable: boolean;
  genreNote: string;
  activeRoomCount: number;
  accentColor: string;
}

export interface ArtistIdentity {
  artistId: string;
  countryCode: string;
  badge: CountryBadge;
}

const ACCENT_COLORS: Record<string, string> = {
  US: "#00FFFF", NG: "#00FF88", GB: "#FF2DAA", JM: "#FFD700",
  BR: "#00FF88", KR: "#FF6B9D", ZA: "#FF9500", GH: "#FFD700",
  TT: "#FF2DAA", JP: "#AA2DFF", FR: "#00FFFF", IN: "#FFB347",
  CO: "#00FF88", CA: "#FF2DAA",
};

const GENRE_NOTES: Record<string, string> = {
  US: "Hip-Hop · R&B · Country",
  NG: "Afrobeats · Highlife",
  GB: "Grime · UK Drill · Garage",
  JM: "Dancehall · Reggae",
  BR: "Funk · Samba · Forró",
  KR: "K-Hip-Hop · K-Pop",
  ZA: "Amapiano · House",
  GH: "Highlife · Hiplife",
  TT: "Soca · Calypso",
  JP: "J-Hip-Hop · City Pop",
  FR: "French Rap · Electro",
  CO: "Reggaeton · Vallenato",
  IN: "Desi Hip-Hop · Bhangra",
  CA: "Hip-Hop · Electronic",
};

const artistIdentities = new Map<string, ArtistIdentity>();

export function getCountryBadge(countryCode: string, activeRoomCount = 0): CountryBadge | null {
  const country = getCountry(countryCode);
  if (!country) return null;
  return {
    countryCode: country.countryCode,
    flag: country.flag,
    name: country.name,
    primaryLanguage: country.languages[0] ?? "en",
    translationAvailable: country.translationAvailable,
    captionAvailable: country.captionAvailable,
    genreNote: GENRE_NOTES[country.countryCode] ?? country.primaryGenre,
    activeRoomCount,
    accentColor: ACCENT_COLORS[country.countryCode] ?? "#00FFFF",
  };
}

export function registerArtistIdentity(artistId: string, countryCode: string): ArtistIdentity {
  const badge = getCountryBadge(countryCode);
  if (!badge) throw new Error(`Unknown country: ${countryCode}`);
  const identity: ArtistIdentity = { artistId, countryCode: countryCode.toUpperCase(), badge };
  artistIdentities.set(artistId, identity);
  return identity;
}

export function getArtistIdentity(artistId: string): ArtistIdentity | null {
  return artistIdentities.get(artistId) ?? null;
}

export function getArtistsByCountry(countryCode: string): ArtistIdentity[] {
  return [...artistIdentities.values()].filter(a => a.countryCode === countryCode.toUpperCase());
}
