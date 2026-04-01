/**
 * Venue Booking Engine — Client-Side
 * Handles venue discovery, booking requests, offer management,
 * territory rules, and recommendation UI for artists and venues.
 *
 * Connects to: /api/venue-booking/* REST endpoints
 * Integrates with: VenueBookingModule (Phase 4 backend scoring engine)
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'OFFERED'
  | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';

export type VenueType =
  | 'CLUB' | 'THEATER' | 'ARENA' | 'BAR' | 'FESTIVAL'
  | 'ROOFTOP' | 'STUDIO' | 'ONLINE' | 'HYBRID';

export type BookingTier = 'EMERGING' | 'RISING' | 'ESTABLISHED' | 'HEADLINER';

export interface VenueLocation {
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  timezone: string;
  lat?: number;
  lng?: number;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  type: VenueType;
  location: VenueLocation;
  capacity: number;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  amenities: string[];
  genres: string[];
  minBookingTier: BookingTier;
  baseRate: number;
  currency: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  availableDates?: string[];
  score?: number;
}

export interface BookingRequest {
  id: string;
  artistId: string;
  artistName: string;
  venueId: string;
  venueName: string;
  status: BookingStatus;
  proposedDate: string;
  alternativeDates?: string[];
  genre: string;
  expectedAttendance: number;
  ticketPrice?: number;
  notes?: string;
  offerAmount?: number;
  offerCurrency?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

export interface VenueOffer {
  id: string;
  bookingRequestId: string;
  venueId: string;
  artistId: string;
  amount: number;
  currency: string;
  date: string;
  conditions?: string;
  expiresAt: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
}

export interface VenueRecommendation {
  venue: Venue;
  score: number;
  matchReasons: string[];
  estimatedFee: number;
  currency: string;
  availableSlots: number;
}

export interface TerritoryRule {
  id: string;
  artistId: string;
  country: string;
  region?: string;
  exclusiveUntil?: string;
  minGapDays: number;
  notes?: string;
}

export interface BookingFilters {
  venueType?: VenueType;
  country?: string;
  city?: string;
  minCapacity?: number;
  maxCapacity?: number;
  genres?: string[];
  dateFrom?: string;
  dateTo?: string;
  minRating?: number;
  sortBy?: 'score' | 'rating' | 'capacity' | 'rate_asc' | 'rate_desc' | 'name';
  page?: number;
  limit?: number;
}

// ─── Venue Booking Engine ──────────────────────────────────────────────────────

export class VenueBookingEngine {
  private baseUrl: string;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private cachedRecommendations: VenueRecommendation[] = [];
  private activeBookings: BookingRequest[] = [];

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // ─── Event Bus ─────────────────────────────────────────────────────────────

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private fire(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  // ─── Recommendation Helpers ─────────────────────────────────────────────────

  getTopRecommendations(limit = 5): VenueRecommendation[] {
    return [...this.cachedRecommendations]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getRecommendationsByCountry(country: string): VenueRecommendation[] {
    return this.cachedRecommendations.filter(
      r => r.venue.location.countryCode === country || r.venue.location.country === country,
    );
  }

  // ─── Booking Status Helpers ─────────────────────────────────────────────────

  getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      DRAFT:        'Draft',
      PENDING:      'Pending Review',
      UNDER_REVIEW: 'Under Review',
      OFFERED:      'Offer Received',
      ACCEPTED:     'Accepted',
      DECLINED:     'Declined',
      CANCELLED:    'Cancelled',
      COMPLETED:    'Completed',
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: BookingStatus): string {
    const colors: Record<BookingStatus, string> = {
      DRAFT:        '#6b7280',
      PENDING:      '#f59e0b',
      UNDER_REVIEW: '#3b82f6',
      OFFERED:      '#8b5cf6',
      ACCEPTED:     '#10b981',
      DECLINED:     '#ef4444',
      CANCELLED:    '#6b7280',
      COMPLETED:    '#059669',
    };
    return colors[status] ?? '#6b7280';
  }

  isActionable(status: BookingStatus): boolean {
    return ['PENDING', 'OFFERED'].includes(status);
  }

  canCancel(status: BookingStatus): boolean {
    return ['DRAFT', 'PENDING', 'UNDER_REVIEW'].includes(status);
  }

  // ─── Tier Helpers ───────────────────────────────────────────────────────────

  getTierLabel(tier: BookingTier): string {
    const labels: Record<BookingTier, string> = {
      EMERGING:    'Emerging Artist',
      RISING:      'Rising Star',
      ESTABLISHED: 'Established Act',
      HEADLINER:   'Headliner',
    };
    return labels[tier];
  }

  getTierColor(tier: BookingTier): string {
    const colors: Record<BookingTier, string> = {
      EMERGING:    '#6b7280',
      RISING:      '#3b82f6',
      ESTABLISHED: '#8b5cf6',
      HEADLINER:   '#f59e0b',
    };
    return colors[tier];
  }

  // ─── Active Bookings ────────────────────────────────────────────────────────

  getActiveBookings(): BookingRequest[] { return [...this.activeBookings]; }

  getPendingOffers(): BookingRequest[] {
    return this.activeBookings.filter(b => b.status === 'OFFERED');
  }

  // ─── REST API ───────────────────────────────────────────────────────────────

  async fetchVenues(filters?: BookingFilters): Promise<{ venues: Venue[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          params.set(k, Array.isArray(v) ? v.join(',') : String(v));
        }
      });
    }
    const url = `${this.baseUrl}/venue-booking/venues${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`Venues fetch failed: ${res.status}`);
    return res.json();
  }

  async fetchVenue(id: string): Promise<Venue> {
    const res = await fetch(`${this.baseUrl}/venue-booking/venues/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Venue fetch failed: ${res.status}`);
    return res.json() as Promise<Venue>;
  }

  async fetchRecommendations(artistId: string, options?: { country?: string; genre?: string; date?: string }): Promise<VenueRecommendation[]> {
    const params = new URLSearchParams({ artistId });
    if (options?.country) params.set('country', options.country);
    if (options?.genre) params.set('genre', options.genre);
    if (options?.date) params.set('date', options.date);

    const res = await fetch(`${this.baseUrl}/venue-booking/recommendations?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Recommendations fetch failed: ${res.status}`);
    const recs = await res.json() as VenueRecommendation[];
    this.cachedRecommendations = recs;
    this.fire('recommendations_loaded', recs);
    return recs;
  }

  async createBookingRequest(data: {
    venueId: string;
    proposedDate: string;
    alternativeDates?: string[];
    genre: string;
    expectedAttendance: number;
    ticketPrice?: number;
    notes?: string;
  }): Promise<BookingRequest> {
    const res = await fetch(`${this.baseUrl}/venue-booking/requests`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Booking request failed: ${res.status}`);
    const booking = await res.json() as BookingRequest;
    this.activeBookings.push(booking);
    this.fire('booking_created', booking);
    return booking;
  }

  async fetchMyBookings(status?: BookingStatus): Promise<BookingRequest[]> {
    const url = status
      ? `${this.baseUrl}/venue-booking/requests/me?status=${status}`
      : `${this.baseUrl}/venue-booking/requests/me`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`Bookings fetch failed: ${res.status}`);
    const bookings = await res.json() as BookingRequest[];
    this.activeBookings = bookings;
    return bookings;
  }

  async acceptOffer(offerId: string): Promise<VenueOffer> {
    const res = await fetch(`${this.baseUrl}/venue-booking/offers/${offerId}/accept`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Accept offer failed: ${res.status}`);
    const offer = await res.json() as VenueOffer;
    this.fire('offer_accepted', offer);
    return offer;
  }

  async declineOffer(offerId: string, reason?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/venue-booking/offers/${offerId}/decline`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`Decline offer failed: ${res.status}`);
    this.fire('offer_declined', { offerId });
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/venue-booking/requests/${bookingId}/cancel`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`Cancel booking failed: ${res.status}`);
    this.activeBookings = this.activeBookings.filter(b => b.id !== bookingId);
    this.fire('booking_cancelled', { bookingId });
  }

  async fetchTerritoryRules(artistId: string): Promise<TerritoryRule[]> {
    const res = await fetch(`${this.baseUrl}/venue-booking/territory/${artistId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Territory rules fetch failed: ${res.status}`);
    return res.json() as Promise<TerritoryRule[]>;
  }

  async checkAvailability(venueId: string, date: string): Promise<{ available: boolean; conflictReason?: string }> {
    const res = await fetch(`${this.baseUrl}/venue-booking/venues/${venueId}/availability?date=${date}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Availability check failed: ${res.status}`);
    return res.json();
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const venueBookingEngine = new VenueBookingEngine();

export function useVenueBookingEngine(): VenueBookingEngine {
  return venueBookingEngine;
}
