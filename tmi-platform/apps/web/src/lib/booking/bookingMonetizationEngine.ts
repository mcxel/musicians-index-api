import { listVenueBookingMatches } from "@/lib/booking/tmiVenueBookingMatchEngine";

export type BookingRequest = {
  id: string;
  venueSlug: string;
  artistSlug: string;
  offerAmount: number;
  expectedRevenue: number;
  status: "pending" | "accepted" | "rejected";
};

const bookingRequests: BookingRequest[] = [
  {
    id: "req-1001",
    venueSlug: "test-venue",
    artistSlug: "ray-journey",
    offerAmount: 4500,
    expectedRevenue: 16200,
    status: "pending",
  },
];

export function listBookingRequests(): BookingRequest[] {
  return bookingRequests;
}

export function createBookingRequest(input: Omit<BookingRequest, "id" | "status">): BookingRequest {
  const entry: BookingRequest = {
    ...input,
    id: `req-${Math.floor(Math.random() * 900000 + 100000)}`,
    status: "pending",
  };
  bookingRequests.unshift(entry);
  return entry;
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

export function runMcMichaelCharlieProfitabilityAnalysis() {
  const matches = listVenueBookingMatches();
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
