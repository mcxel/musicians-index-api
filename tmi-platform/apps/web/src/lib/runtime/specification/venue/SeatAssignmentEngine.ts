export interface SeatAssignmentEngine {
  assignSeat(venueId: string, userId: string): Promise<{ seatId: string }>;
  releaseSeat(venueId: string, userId: string): Promise<void>;
}
