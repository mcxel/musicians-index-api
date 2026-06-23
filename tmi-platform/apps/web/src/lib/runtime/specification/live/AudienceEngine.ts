export interface AudienceSeat {
  seatId: string;
  occupantUserId?: string;
}

export interface AudienceEngine {
  listSeats(roomId: string): Promise<AudienceSeat[]>;
  assignSeat(roomId: string, userId: string, seatId?: string): Promise<{ seatId: string }>;
}
