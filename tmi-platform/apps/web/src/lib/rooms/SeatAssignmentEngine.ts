const seatMap = new Map<string, Map<string, number>>();

export function assignSeat(roomId: string, userId: string): number {
  if (!seatMap.has(roomId)) seatMap.set(roomId, new Map());
  const roomSeats = seatMap.get(roomId)!;
  const existing = roomSeats.get(userId);
  if (existing !== undefined) return existing;

  const seatNumber = roomSeats.size + 1;
  roomSeats.set(userId, seatNumber);
  return seatNumber;
}

export function getSeat(roomId: string, userId: string): number | null {
  return seatMap.get(roomId)?.get(userId) ?? null;
}
