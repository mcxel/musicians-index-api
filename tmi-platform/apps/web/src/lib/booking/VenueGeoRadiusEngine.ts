/**
 * VenueGeoRadiusEngine
 * Finds artists near venues using geo radius search.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoArtist {
  artistId: string;
  displayName: string;
  genre: string[];
  location: GeoPoint;
  city: string;
  state: string;
  country: string;
  radiusMiles: number; // how far they're willing to travel
  bookingRate: number; // USD per show
  rating: number;      // 0–5
  isAvailable: boolean;
  nextAvailableDate?: string; // ISO date
}

export interface GeoVenue {
  venueId: string;
  name: string;
  location: GeoPoint;
  city: string;
  state: string;
  country: string;
  capacity: number;
  genres: string[];
}

export interface RadiusSearchResult {
  artist: GeoArtist;
  distanceMiles: number;
  genreMatch: boolean;
  withinArtistRadius: boolean;
  score: number; // relevance 0–100
}

export interface RadiusSearchOptions {
  radiusMiles?: number;
  genres?: string[];
  maxResults?: number;
  minRating?: number;
  maxBookingRate?: number;
  availableOnly?: boolean;
  availableAfter?: string;
}

const EARTH_RADIUS_MILES = 3958.8;

function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.asin(Math.sqrt(x));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function genreIntersect(a: string[], b: string[]): boolean {
  const set = new Set(a.map((g) => g.toLowerCase()));
  return b.some((g) => set.has(g.toLowerCase()));
}

export class VenueGeoRadiusEngine {
  private static _instance: VenueGeoRadiusEngine | null = null;

  private _artists: Map<string, GeoArtist> = new Map();
  private _venues: Map<string, GeoVenue> = new Map();

  static getInstance(): VenueGeoRadiusEngine {
    if (!VenueGeoRadiusEngine._instance) {
      VenueGeoRadiusEngine._instance = new VenueGeoRadiusEngine();
    }
    return VenueGeoRadiusEngine._instance;
  }

  // ── Registration ───────────────────────────────────────────────────────────

  registerArtist(artist: GeoArtist): void {
    this._artists.set(artist.artistId, artist);
  }

  registerVenue(venue: GeoVenue): void {
    this._venues.set(venue.venueId, venue);
  }

  updateArtistAvailability(artistId: string, isAvailable: boolean, nextDate?: string): void {
    const artist = this._artists.get(artistId);
    if (artist) {
      artist.isAvailable = isAvailable;
      if (nextDate) artist.nextAvailableDate = nextDate;
    }
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  searchNearVenue(venueId: string, options: RadiusSearchOptions = {}): RadiusSearchResult[] {
    const venue = this._venues.get(venueId);
    if (!venue) return [];
    return this.searchNearPoint(venue.location, { genres: venue.genres, ...options });
  }

  searchNearPoint(origin: GeoPoint, options: RadiusSearchOptions = {}): RadiusSearchResult[] {
    const {
      radiusMiles = 100,
      genres,
      maxResults = 50,
      minRating = 0,
      maxBookingRate,
      availableOnly = false,
    } = options;

    const results: RadiusSearchResult[] = [];

    for (const artist of this._artists.values()) {
      if (availableOnly && !artist.isAvailable) continue;
      if (artist.rating < minRating) continue;
      if (maxBookingRate !== undefined && artist.bookingRate > maxBookingRate) continue;

      const dist = haversineDistance(origin, artist.location);
      if (dist > radiusMiles) continue;

      const genreMatch = !genres?.length || genreIntersect(artist.genre, genres);
      const withinArtistRadius = dist <= artist.radiusMiles;

      const distScore = Math.max(0, 40 - (dist / radiusMiles) * 40);
      const ratingScore = artist.rating * 8;
      const genreScore = genreMatch ? 20 : 0;
      const radiusScore = withinArtistRadius ? 10 : 0;
      const availScore = artist.isAvailable ? 10 : 0;
      const score = Math.min(100, distScore + ratingScore + genreScore + radiusScore + availScore);

      results.push({ artist, distanceMiles: Math.round(dist * 10) / 10, genreMatch, withinArtistRadius, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  // ── Venue ↔ artist compatibility ────────────────────────────────────────────

  getCompatibilityScore(venueId: string, artistId: string): number {
    const venue = this._venues.get(venueId);
    const artist = this._artists.get(artistId);
    if (!venue || !artist) return 0;

    const dist = haversineDistance(venue.location, artist.location);
    const results = this.searchNearPoint(venue.location, { genres: venue.genres });
    return results.find((r) => r.artist.artistId === artistId)?.score ?? 0;
  }

  getNearbyVenues(artistId: string, radiusMiles = 100): GeoVenue[] {
    const artist = this._artists.get(artistId);
    if (!artist) return [];
    return [...this._venues.values()]
      .filter((v) => haversineDistance(artist.location, v.location) <= Math.min(radiusMiles, artist.radiusMiles))
      .sort((a, b) => haversineDistance(artist.location, a.location) - haversineDistance(artist.location, b.location));
  }

  // ── Lookup ────────────────────────────────────────────────────────────────

  getArtist(artistId: string): GeoArtist | null {
    return this._artists.get(artistId) ?? null;
  }

  getVenue(venueId: string): GeoVenue | null {
    return this._venues.get(venueId) ?? null;
  }

  getAllArtists(): GeoArtist[] {
    return [...this._artists.values()];
  }

  getAllVenues(): GeoVenue[] {
    return [...this._venues.values()];
  }
}

export const venueGeoRadiusEngine = VenueGeoRadiusEngine.getInstance();
