import { getCountry, type CountryRecord } from "./GlobalCountryRegistry";

export interface CountryHub {
  countryCode: string;
  country: CountryRecord;
  artistCount: number;
  venueCount: number;
  battleCount: number;
  articleCount: number;
  activeRooms: number;
  featuredGenre: string;
  isLive: boolean;
}

export interface ParityScore {
  countryCode: string;
  hasArtists: boolean;
  hasVenues: boolean;
  hasBattles: boolean;
  hasMagazine: boolean;
  hasCharts: boolean;
  hasTicketing: boolean;
  hasSponsors: boolean;
  hasFanRooms: boolean;
  score: number;
  maxScore: number;
  parityPercent: number;
}

const hubStore = new Map<string, CountryHub>();
const SEED_HUBS: Array<Omit<CountryHub, "country">> = [
  { countryCode: "US", artistCount: 420, venueCount: 85, battleCount: 210, articleCount: 180, activeRooms: 14, featuredGenre: "Hip-Hop",     isLive: true },
  { countryCode: "NG", artistCount: 280, venueCount: 50, battleCount: 140, articleCount: 120, activeRooms: 9,  featuredGenre: "Afrobeats",   isLive: true },
  { countryCode: "GB", artistCount: 200, venueCount: 40, battleCount: 100, articleCount: 90,  activeRooms: 7,  featuredGenre: "Grime",       isLive: true },
  { countryCode: "JM", artistCount: 120, venueCount: 30, battleCount: 60,  articleCount: 50,  activeRooms: 4,  featuredGenre: "Dancehall",   isLive: true },
  { countryCode: "BR", artistCount: 180, venueCount: 40, battleCount: 90,  articleCount: 80,  activeRooms: 6,  featuredGenre: "Funk",        isLive: true },
  { countryCode: "KR", artistCount: 150, venueCount: 30, battleCount: 75,  articleCount: 60,  activeRooms: 5,  featuredGenre: "K-Hip-Hop",  isLive: false },
  { countryCode: "ZA", artistCount: 90,  venueCount: 20, battleCount: 45,  articleCount: 40,  activeRooms: 3,  featuredGenre: "Amapiano",   isLive: false },
  { countryCode: "GH", artistCount: 80,  venueCount: 15, battleCount: 40,  articleCount: 35,  activeRooms: 3,  featuredGenre: "Highlife",    isLive: false },
];

function seed() {
  if (hubStore.size === 0) {
    for (const h of SEED_HUBS) {
      const country = getCountry(h.countryCode);
      if (country) hubStore.set(h.countryCode, { ...h, country });
    }
  }
}

export function getCountryHub(countryCode: string): CountryHub | null {
  seed();
  return hubStore.get(countryCode.toUpperCase()) ?? null;
}

export function getAllHubs(): CountryHub[] {
  seed();
  return [...hubStore.values()];
}

export function getLiveHubs(): CountryHub[] {
  seed();
  return [...hubStore.values()].filter(h => h.isLive);
}

export function getParityScore(countryCode: string): ParityScore {
  seed();
  const hub = hubStore.get(countryCode.toUpperCase());
  const checks = {
    hasArtists:  (hub?.artistCount ?? 0) > 0,
    hasVenues:   (hub?.venueCount ?? 0) > 0,
    hasBattles:  (hub?.battleCount ?? 0) > 0,
    hasMagazine: (hub?.articleCount ?? 0) > 0,
    hasCharts:   true,
    hasTicketing: true,
    hasSponsors: (hub?.artistCount ?? 0) > 50,
    hasFanRooms: (hub?.activeRooms ?? 0) > 0,
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { countryCode: countryCode.toUpperCase(), ...checks, score, maxScore: 8, parityPercent: Math.round((score / 8) * 100) };
}
