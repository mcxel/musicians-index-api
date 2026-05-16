/**
 * CountryDiscoveryEngine.ts
 *
 * Discovery engine for finding artists, venues, battles by country
 */

export interface CountryArtist {
  id: string;
  name: string;
  country: string;
  genres: string[];
  language: string;
  followersGlobal: number;
  followersLocal: number;
  verified: boolean;
  isLocal: boolean;
}

export interface CountryVenue {
  id: string;
  name: string;
  country: string;
  city: string;
  timezone: string;
  genres: string[];
  capacity: number;
  isActive: boolean;
}

export interface CountryBattle {
  id: string;
  name: string;
  country: string;
  competitors: Array<{ id: string; country: string }>;
  genre: string;
  timestamp: number;
  isLive: boolean;
  winner?: string;
}

const artistsByCountry = new Map<string, CountryArtist[]>();
const venuesByCountry = new Map<string, CountryVenue[]>();
const battlesByCountry = new Map<string, CountryBattle[]>();

export class CountryDiscoveryEngine {
  /**
   * Get artists from a country
   */
  static getArtistsByCountry(
    countryCode: string,
    limit = 50
  ): CountryArtist[] {
    return (artistsByCountry.get(countryCode) || []).slice(0, limit);
  }

  /**
   * Get venues in a country
   */
  static getVenuesByCountry(
    countryCode: string,
    limit = 30
  ): CountryVenue[] {
    return (venuesByCountry.get(countryCode) || []).slice(0, limit);
  }

  /**
   * Get battles in a country
   */
  static getBattlesByCountry(
    countryCode: string,
    limit = 20
  ): CountryBattle[] {
    return (battlesByCountry.get(countryCode) || []).slice(0, limit);
  }

  /**
   * Register an artist in a country
   */
  static registerArtist(artist: CountryArtist): void {
    const artists = artistsByCountry.get(artist.country) || [];
    artists.push(artist);
    artistsByCountry.set(artist.country, artists);
  }

  /**
   * Register a venue in a country
   */
  static registerVenue(venue: CountryVenue): void {
    const venues = venuesByCountry.get(venue.country) || [];
    venues.push(venue);
    venuesByCountry.set(venue.country, venues);
  }

  /**
   * Register a battle in a country
   */
  static registerBattle(battle: CountryBattle): void {
    const battles = battlesByCountry.get(battle.country) || [];
    battles.push(battle);
    battlesByCountry.set(battle.country, battles);
  }

  /**
   * Get artist count in country
   */
  static getArtistCountInCountry(countryCode: string): number {
    return artistsByCountry.get(countryCode)?.length || 0;
  }

  /**
   * Get venue count in country
   */
  static getVenueCountInCountry(countryCode: string): number {
    return venuesByCountry.get(countryCode)?.length || 0;
  }

  /**
   * Get battle count in country
   */
  static getBattleCountInCountry(countryCode: string): number {
    return battlesByCountry.get(countryCode)?.length || 0;
  }

  /**
   * Find artists by genre in country
   */
  static getArtistsByGenre(
    countryCode: string,
    genre: string
  ): CountryArtist[] {
    return (artistsByCountry.get(countryCode) || []).filter((a) =>
      a.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  /**
   * Find verified artists in country
   */
  static getVerifiedArtists(countryCode: string): CountryArtist[] {
    return (artistsByCountry.get(countryCode) || []).filter((a) => a.verified);
  }

  /**
   * Find rising artists (local followers > global followers weighted)
   */
  static getRisingArtists(countryCode: string, limit = 10): CountryArtist[] {
    const artists = artistsByCountry.get(countryCode) || [];
    return artists
      .sort((a, b) => {
        const aRatio = a.followersLocal / Math.max(a.followersGlobal, 1);
        const bRatio = b.followersLocal / Math.max(b.followersGlobal, 1);
        return bRatio - aRatio;
      })
      .slice(0, limit);
  }

  /**
   * Get battles with international competitors
   */
  static getInternationalBattles(countryCode: string): CountryBattle[] {
    return (battlesByCountry.get(countryCode) || []).filter((b) =>
      b.competitors.some((c) => c.country !== countryCode)
    );
  }

  /**
   * Clear all discovery data (for testing)
   */
  static clearAll(): void {
    artistsByCountry.clear();
    venuesByCountry.clear();
    battlesByCountry.clear();
  }
}

export default CountryDiscoveryEngine;
