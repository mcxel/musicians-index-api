import { listVenueBookingMatches } from "@/lib/booking/tmiVenueBookingMatchEngine";
import { bookingRepository } from "@/lib/booking/MemoryBookingRepository";
import type { BookingRequest, CreateBookingRequestInput } from "@/lib/booking/BookingRepository";

export type { BookingRequest };

export async function listBookingRequests(): Promise<BookingRequest[]> {
  return bookingRepository.list();
}

export async function createBookingRequest(input: CreateBookingRequestInput): Promise<BookingRequest> {
  return bookingRepository.create(input);
}

export function computeProfitMargin(expectedRevenue: number, totalCost: number) {
  const profit = expectedRevenue - totalCost;
  const margin = expectedRevenue === 0 ? 0 : (profit / expectedRevenue) * 100;
  return {
    expectedRevenue,
    totalCost,
    profit,
    margin,
  };
}

export async function runMcMichaelCharlieProfitabilityAnalysis() {
  const matches = listVenueBookingMatches();
  const bookingRequests = await bookingRepository.list();
  const totalOffers = bookingRequests.reduce((sum, entry) => sum + entry.offerAmount, 0);
  const totalExpectedRevenue = bookingRequests.reduce((sum, entry) => sum + entry.expectedRevenue, 0);
  const totalCost = totalOffers + matches.length * 900;
  const metrics = computeProfitMargin(totalExpectedRevenue, totalCost);

  return {
    analyst: "MC Michael Charlie",
    matchesTracked: matches.length,
    bookingRequestsTracked: bookingRequests.length,
    ...metrics,
  };
}
