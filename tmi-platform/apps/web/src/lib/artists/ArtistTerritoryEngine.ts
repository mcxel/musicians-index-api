/**
 * ArtistTerritoryEngine.ts
 *
 * Manages artist identity by territory/geography.
 * Tracks: country, region, city, language, genre, nationality flag.
 * Purpose: Create local pride while enabling global ambition.
 */

export interface ArtistTerritory {
  territoryId: string;
  artistId: string;
  displayName: string;
  countryCode: string; // ISO 3166-1 alpha-2
  countryName: string;
  region?: string;
  city?: string;
  timezone: string;
  primaryLanguage: string;
  genres: string[]; // e.g., ["hip-hop", "trap", "boom-bap"]
  isVerified: boolean;
  verifiedAt?: number;
  createdAt: number;
}

export interface TerritoryRanking {
  artistId: string;
  displayName: string;
  countryCode: string;
  countryRank: number;
  countryTotalXP: number;
  globalRank?: number;
  globalTotalXP?: number;
  genreRank?: number;
  genreTotalXP?: number;
  movementDirection: 'up' | 'down' | 'stable';
  movementDays: number;
}

export interface CountryMetadata {
  countryCode: string;
  countryName: string;
  artistCount: number;
  totalXP: number;
  topArtistId?: string;
  populationRank: number; // 1 = most artists
  engagementLevel: number; // 0-1
}

// In-memory registries
const artistTerritories = new Map<string, ArtistTerritory>();
const territoryRankings = new Map<string, TerritoryRanking>();
const countryMetadata = new Map<string, CountryMetadata>();

/**
 * Registers artist territory.
 */
export function registerArtistTerritory(input: {
  artistId: string;
  displayName: string;
  countryCode: string;
  countryName: string;
  region?: string;
  city?: string;
  timezone: string;
  primaryLanguage: string;
  genres: string[];
}): string {
  const territoryId = `territory-${input.artistId}-${Date.now()}`;

  const territory: ArtistTerritory = {
    territoryId,
    artistId: input.artistId,
    displayName: input.displayName,
    countryCode: input.countryCode,
    countryName: input.countryName,
    region: input.region,
    city: input.city,
    timezone: input.timezone,
    primaryLanguage: input.primaryLanguage,
    genres: input.genres,
    isVerified: false,
    createdAt: Date.now(),
  };

  artistTerritories.set(input.artistId, territory);

  // Update country metadata
  updateCountryMetadata(input.countryCode, input.countryName);

  return territoryId;
}

/**
 * Verifies artist territory (admin action).
 */
export function verifyArtistTerritory(artistId: string): void {
  const territory = artistTerritories.get(artistId);
  if (territory) {
    territory.isVerified = true;
    territory.verifiedAt = Date.now();
  }
}

/**
 * Updates country metadata.
 */
function updateCountryMetadata(countryCode: string, countryName: string): void {
  let metadata = countryMetadata.get(countryCode);

  if (!metadata) {
    metadata = {
      countryCode,
      countryName,
      artistCount: 0,
      totalXP: 0,
      populationRank: countryMetadata.size + 1,
      engagementLevel: 0,
    };
    countryMetadata.set(countryCode, metadata);
  }

  metadata.artistCount = Array.from(artistTerritories.values()).filter(
    (t) => t.countryCode === countryCode
  ).length;
}

/**
 * Gets artist territory (non-mutating).
 */
export function getArtistTerritory(artistId: string): ArtistTerritory | null {
  return artistTerritories.get(artistId) ?? null;
}

/**
 * Lists artists by country (non-mutating).
 */
export function listArtistsByCountry(countryCode: string): ArtistTerritory[] {
  return Array.from(artistTerritories.values()).filter(
    (t) => t.countryCode === countryCode && t.isVerified
  );
}

/**
 * Lists artists by genre (non-mutating).
 */
export function listArtistsByGenre(genre: string): ArtistTerritory[] {
  return Array.from(artistTerritories.values()).filter(
    (t) => t.genres.includes(genre) && t.isVerified
  );
}

/**
 * Records territory ranking (XP contribution to country/genre/global).
 */
export function recordTerritoryRanking(input: {
  artistId: string;
  displayName: string;
  countryCode: string;
  countryRank: number;
  countryTotalXP: number;
  globalRank?: number;
  globalTotalXP?: number;
  genreRank?: number;
  genreTotalXP?: number;
  movementDirection: 'up' | 'down' | 'stable';
  movementDays: number;
}): void {
  const ranking: TerritoryRanking = {
    artistId: input.artistId,
    displayName: input.displayName,
    countryCode: input.countryCode,
    countryRank: input.countryRank,
    countryTotalXP: input.countryTotalXP,
    globalRank: input.globalRank,
    globalTotalXP: input.globalTotalXP,
    genreRank: input.genreRank,
    genreTotalXP: input.genreTotalXP,
    movementDirection: input.movementDirection,
    movementDays: input.movementDays,
  };

  territoryRankings.set(input.artistId, ranking);
}

/**
 * Gets artist ranking across all territories (non-mutating).
 */
export function getArtistTerritoryRanking(artistId: string): TerritoryRanking | null {
  return territoryRankings.get(artistId) ?? null;
}

/**
 * Lists top artists in country.
 */
export function getTopArtistsInCountry(
  countryCode: string,
  limit: number = 10
): TerritoryRanking[] {
  return Array.from(territoryRankings.values())
    .filter((r) => r.countryCode === countryCode)
    .sort((a, b) => b.countryTotalXP - a.countryTotalXP)
    .slice(0, limit);
}

/**
 * Gets country metadata (non-mutating).
 */
export function getCountryMetadata(countryCode: string): CountryMetadata | null {
  return countryMetadata.get(countryCode) ?? null;
}

/**
 * Lists all countries with artists (non-mutating).
 */
export function listAllCountriesWithArtists(): CountryMetadata[] {
  return Array.from(countryMetadata.values()).sort((a, b) => b.artistCount - a.artistCount);
}

/**
 * Gets global artist distribution report.
 */
export function getGlobalArtistDistributionReport(): {
  totalArtists: number;
  countriesRepresented: number;
  topCountries: CountryMetadata[];
  averageArtistsPerCountry: number;
} {
  const allTerritories = Array.from(artistTerritories.values());
  const countries = listAllCountriesWithArtists();

  return {
    totalArtists: allTerritories.length,
    countriesRepresented: countries.length,
    topCountries: countries.slice(0, 10),
    averageArtistsPerCountry:
      allTerritories.length > 0 ? Math.round(allTerritories.length / countries.length) : 0,
  };
}
