export type BookingRequestStatus = "pending" | "accepted" | "rejected";

export type BookingRequest = {
  id: string;
  venueSlug: string;
  artistSlug: string;
  offerAmount: number;
  expectedRevenue: number;
  status: BookingRequestStatus;
  createdAt: number;
};

export type CreateBookingRequestInput = Omit<BookingRequest, "id" | "status" | "createdAt">;

/**
 * BookingRepository — storage-agnostic contract for booking requests.
 * MemoryBookingRepository is the current implementation (non-persistent —
 * data is lost on server restart). Swap to a PrismaBookingRepository once
 * a BookingRequest table exists; callers never need to change.
 */
export interface BookingRepository {
  list(): Promise<BookingRequest[]>;
  create(input: CreateBookingRequestInput): Promise<BookingRequest>;
}
