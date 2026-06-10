// Shared expiry sweep for the Prisma-backed seat reservation chain
// (used by both the reserve/release transaction and the read-path poll
// so stale "occupied" rows never outlive their TTL for other fans).
export async function cleanupExpiredSeatReservations(tx: any, roomId: string) {
  const now = new Date();
  const expired = await tx.seatReservation.findMany({
    where: {
      roomId,
      expiresAt: { lt: now }
    }
  });

  for (const row of expired) {
    await tx.seatReservation.delete({ where: { id: row.id } }).catch(() => null);
    await tx.roomSeatState.updateMany({
      where: { roomId, seatId: row.seatId, currentUser: row.userId },
      data: { occupied: false, currentUser: null }
    });
  }
}
