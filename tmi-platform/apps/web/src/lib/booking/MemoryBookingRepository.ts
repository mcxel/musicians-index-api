import type { BookingRepository, BookingRequest, CreateBookingRequestInput } from "@/lib/booking/BookingRepository";

/**
 * MemoryBookingRepository — temporary adapter (Known gap: not persisted;
 * data resets on server restart / across instances). No seed data — an
 * empty list is the honest starting state per Rule 20. Replace with a
 * PrismaBookingRepository backed by a real BookingRequest table when ready;
 * BookingRepository callers do not need to change.
 */
export class MemoryBookingRepository implements BookingRepository {
  private requests: BookingRequest[] = [];

  async list(): Promise<BookingRequest[]> {
    return this.requests;
  }

  async create(input: CreateBookingRequestInput): Promise<BookingRequest> {
    const entry: BookingRequest = {
      ...input,
      id: `req-${Math.floor(Math.random() * 900000 + 100000)}`,
      status: "pending",
      createdAt: Date.now(),
    };
    this.requests.unshift(entry);
    return entry;
  }
}

export const bookingRepository: BookingRepository = new MemoryBookingRepository();
