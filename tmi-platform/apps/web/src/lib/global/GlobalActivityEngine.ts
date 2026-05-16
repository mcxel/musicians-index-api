export type ActivityLevel = "empty" | "low" | "moderate" | "high" | "peak";

export interface CountryActivity {
  country: string;
  countryCode: string;
  city: string;
  timezone: string;
  activeRooms: number;
  activeBattles: number;
  activeVenues: number;
  activeArtists: number;
  activeFans: number;
  activityLevel: ActivityLevel;
  updatedAt: string;
}

const store = new Map<string, CountryActivity>();

const SEED_COUNTRIES: CountryActivity[] = [
  { country: "United States",  countryCode: "US", city: "Atlanta",     timezone: "America/New_York",  activeRooms: 14, activeBattles: 6, activeVenues: 8, activeArtists: 42, activeFans: 380, activityLevel: "peak",     updatedAt: new Date().toISOString() },
  { country: "Nigeria",        countryCode: "NG", city: "Lagos",       timezone: "Africa/Lagos",       activeRooms: 9,  activeBattles: 4, activeVenues: 5, activeArtists: 28, activeFans: 210, activityLevel: "high",     updatedAt: new Date().toISOString() },
  { country: "United Kingdom", countryCode: "GB", city: "London",      timezone: "Europe/London",      activeRooms: 7,  activeBattles: 3, activeVenues: 4, activeArtists: 20, activeFans: 160, activityLevel: "high",     updatedAt: new Date().toISOString() },
  { country: "Jamaica",        countryCode: "JM", city: "Kingston",    timezone: "America/Jamaica",    activeRooms: 4,  activeBattles: 2, activeVenues: 3, activeArtists: 12, activeFans: 95,  activityLevel: "moderate", updatedAt: new Date().toISOString() },
  { country: "Brazil",         countryCode: "BR", city: "São Paulo",   timezone: "America/Sao_Paulo",  activeRooms: 6,  activeBattles: 3, activeVenues: 4, activeArtists: 18, activeFans: 140, activityLevel: "high",     updatedAt: new Date().toISOString() },
  { country: "South Korea",    countryCode: "KR", city: "Seoul",       timezone: "Asia/Seoul",         activeRooms: 5,  activeBattles: 2, activeVenues: 3, activeArtists: 15, activeFans: 120, activityLevel: "moderate", updatedAt: new Date().toISOString() },
  { country: "Ghana",          countryCode: "GH", city: "Accra",       timezone: "Africa/Accra",       activeRooms: 3,  activeBattles: 1, activeVenues: 2, activeArtists: 8,  activeFans: 60,  activityLevel: "moderate", updatedAt: new Date().toISOString() },
  { country: "Canada",         countryCode: "CA", city: "Toronto",     timezone: "America/Toronto",    activeRooms: 5,  activeBattles: 2, activeVenues: 3, activeArtists: 14, activeFans: 110, activityLevel: "moderate", updatedAt: new Date().toISOString() },
  { country: "Trinidad",       countryCode: "TT", city: "Port of Spain",timezone:"America/Port_of_Spain",activeRooms: 2, activeBattles: 1, activeVenues: 1, activeArtists: 6, activeFans: 45, activityLevel: "low",      updatedAt: new Date().toISOString() },
  { country: "France",         countryCode: "FR", city: "Paris",       timezone: "Europe/Paris",       activeRooms: 3,  activeBattles: 1, activeVenues: 2, activeArtists: 9,  activeFans: 70,  activityLevel: "low",      updatedAt: new Date().toISOString() },
  { country: "Japan",          countryCode: "JP", city: "Tokyo",       timezone: "Asia/Tokyo",         activeRooms: 4,  activeBattles: 2, activeVenues: 2, activeArtists: 11, activeFans: 88,  activityLevel: "moderate", updatedAt: new Date().toISOString() },
  { country: "Colombia",       countryCode: "CO", city: "Medellín",    timezone: "America/Bogota",     activeRooms: 3,  activeBattles: 1, activeVenues: 2, activeArtists: 8,  activeFans: 62,  activityLevel: "low",      updatedAt: new Date().toISOString() },
  { country: "South Africa",   countryCode: "ZA", city: "Johannesburg",timezone: "Africa/Johannesburg",activeRooms: 3,  activeBattles: 1, activeVenues: 2, activeArtists: 9,  activeFans: 72,  activityLevel: "moderate", updatedAt: new Date().toISOString() },
  { country: "India",          countryCode: "IN", city: "Mumbai",      timezone: "Asia/Kolkata",       activeRooms: 5,  activeBattles: 2, activeVenues: 3, activeArtists: 16, activeFans: 130, activityLevel: "moderate", updatedAt: new Date().toISOString() },
];

function seed() {
  if (store.size === 0) {
    for (const c of SEED_COUNTRIES) store.set(c.countryCode, c);
  }
}

export function getLiveCountries(): CountryActivity[] {
  seed();
  return [...store.values()].filter(c => c.activityLevel !== "empty").sort((a, b) => b.activeRooms - a.activeRooms);
}

export function getActiveTimezones(): string[] {
  seed();
  return [...new Set([...store.values()].filter(c => c.activityLevel !== "empty" && c.activityLevel !== "low").map(c => c.timezone))];
}

export function getCurrentPeakRegions(): CountryActivity[] {
  seed();
  return [...store.values()].filter(c => c.activityLevel === "peak" || c.activityLevel === "high").sort((a, b) => b.activeFans - a.activeFans);
}

export function getFallbackRegions(): CountryActivity[] {
  seed();
  return [...store.values()].filter(c => c.activityLevel !== "empty").sort((a, b) => b.activeFans - a.activeFans).slice(0, 5);
}

export function getCountryActivity(countryCode: string): CountryActivity | null {
  seed();
  return store.get(countryCode.toUpperCase()) ?? null;
}

export function updateCountryActivity(countryCode: string, patch: Partial<CountryActivity>): CountryActivity {
  seed();
  const existing = store.get(countryCode.toUpperCase());
  if (!existing) throw new Error(`Unknown country: ${countryCode}`);
  const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  store.set(countryCode.toUpperCase(), next);
  return next;
}

export function getTotalActiveUsers(): number {
  seed();
  return [...store.values()].reduce((sum, c) => sum + c.activeArtists + c.activeFans, 0);
}
