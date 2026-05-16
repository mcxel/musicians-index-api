import type { TaxRegion } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { calculateTax, getTaxRate } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { generateReceipt, type Receipt } from "@/lib/commerce/ReceiptEngine";
import { calculateRevenueSplitByPreset, type RevenueSplitResult } from "@/lib/commerce/RevenueSplitEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VenueBookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type ArtistProfile = {
  artistId: string;
  name: string;
  genres: string[];
  location: string;
  lat?: number;
  lng?: number;
  followerCount: number;
  bookingRate: number;          // cents per booking
  availabilityWindows: string[]; // ISO date strings
  exposureBoost: number;         // 0–100
};

export type VenueProfile = {
  venueId: string;
  name: string;
  genres: string[];
  location: string;
  lat?: number;
  lng?: number;
  capacity: number;
  bookingFeePercent: number;   // 0–100 (e.g. 10 = 10%)
  availabilityWindows: string[];
};

export type BookingMatchScore = {
  artistId: string;
  venueId: string;
  score: number;         // 0–100
  genreMatchScore: number;
  distanceScore: number;
  availabilityScore: number;
  exposureScore: number;
  reasons: string[];
};

export type VenueBookingOrder = {
  id: string;
  artistId: string;
  venueId: string;
  eventDate: string;
  bookingFeeBaseCents: number;
  region: TaxRegion;
  status: VenueBookingStatus;
  receipt: Receipt;
  split: RevenueSplitResult;
  createdAtMs: number;
};

// ─── Registries ───────────────────────────────────────────────────────────────

const artistProfiles = new Map<string, ArtistProfile>();
const venueProfiles  = new Map<string, VenueProfile>();
const bookingOrders: VenueBookingOrder[] = [];
let _counter = 0;

// ─── Matching ─────────────────────────────────────────────────────────────────

function genreMatchScore(artistGenres: string[], venueGenres: string[]): number {
  const matches = artistGenres.filter(g => venueGenres.includes(g)).length;
  const total = Math.max(artistGenres.length, venueGenres.length, 1);
  return Math.round((matches / total) * 100);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceScore(artist: ArtistProfile, venue: VenueProfile): number {
  if (!artist.lat || !artist.lng || !venue.lat || !venue.lng) return 50;
  const km = haversineKm(artist.lat, artist.lng, venue.lat, venue.lng);
  return Math.max(0, 100 - Math.round(km / 5));
}

function availabilityScore(artistWindows: string[], venueWindows: string[]): number {
  const overlap = artistWindows.filter(d => venueWindows.includes(d)).length;
  return Math.min(100, overlap * 20);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerArtistProfile(profile: ArtistProfile): void {
  artistProfiles.set(profile.artistId, profile);
}

export function registerVenueProfile(profile: VenueProfile): void {
  venueProfiles.set(profile.venueId, profile);
}

export function matchArtistToVenues(artistId: string, limit: number = 10): BookingMatchScore[] {
  const artist = artistProfiles.get(artistId);
  if (!artist) return [];

  const scores: BookingMatchScore[] = [];

  for (const venue of venueProfiles.values()) {
    const genre    = genreMatchScore(artist.genres, venue.genres);
    const distance = distanceScore(artist, venue);
    const avail    = availabilityScore(artist.availabilityWindows, venue.availabilityWindows);
    const exposure = artist.exposureBoost;
    const score    = Math.round((genre * 0.35) + (distance * 0.25) + (avail * 0.25) + (exposure * 0.15));
    const reasons: string[] = [];
    if (genre >= 70)    reasons.push("Strong genre match");
    if (distance >= 70) reasons.push("Close proximity");
    if (avail >= 60)    reasons.push("Good availability overlap");
    if (exposure >= 70) reasons.push("High artist exposure boost");

    scores.push({ artistId, venueId: venue.venueId, score, genreMatchScore: genre, distanceScore: distance, availabilityScore: avail, exposureScore: exposure, reasons });
  }

  return scores.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function bookVenueForArtist(
  artistId: string,
  venueId: string,
  eventDate: string,
  region: TaxRegion,
): VenueBookingOrder | { error: string } {
  const artist = artistProfiles.get(artistId);
  const venue  = venueProfiles.get(venueId);
  if (!artist) return { error: "Artist not found" };
  if (!venue)  return { error: "Venue not found" };

  const baseCents     = artist.bookingRate;
  const feePercent    = venue.bookingFeePercent;
  const feeCents      = Math.round(baseCents * feePercent / 100);
  const totalBaseCents = baseCents + feeCents;

  const taxRateBps = getTaxRate(region);
  const taxCents   = calculateTax(totalBaseCents, taxRateBps);
  const label      = `Booking — ${artist.name} @ ${venue.name} on ${eventDate}`;

  const receipt = generateReceipt(artistId, "booking", label, totalBaseCents, region, {
    artistId, venueId, eventDate,
  });

  const split = calculateRevenueSplitByPreset("booking", receipt.totalCents, taxCents);

  const order: VenueBookingOrder = {
    id: `book-${++_counter}`,
    artistId,
    venueId,
    eventDate,
    bookingFeeBaseCents: totalBaseCents,
    region,
    status: "pending",
    receipt,
    split,
    createdAtMs: Date.now(),
  };

  bookingOrders.push(order);
  return order;
}

export function confirmBooking(bookingId: string): boolean {
  const order = bookingOrders.find(o => o.id === bookingId);
  if (!order || order.status !== "pending") return false;
  order.status = "confirmed";
  return true;
}

export function getBookingsForArtist(artistId: string): VenueBookingOrder[] {
  return bookingOrders.filter(o => o.artistId === artistId);
}

export function getBookingsForVenue(venueId: string): VenueBookingOrder[] {
  return bookingOrders.filter(o => o.venueId === venueId);
}
