import { getSeatTierPolicy, type TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";

export type TmiSeatPosition = {
  seatId: string;
  row: number;
  col: number;
  x: number;
  y: number;
  z: number;
};

export type TmiFanSeatAssignment = {
  fanId: string;
  seat: TmiSeatPosition;
  tier: TmiSeatTier;
  roomId: string;
};

export function assignSeatForFan(
  fanId: string,
  roomId: string,
  tier: TmiSeatTier,
  seats: TmiSeatPosition[],
): TmiFanSeatAssignment | undefined {
  const policy = getSeatTierPolicy(tier);
  const ordered = [...seats].sort((a, b) => {
    const aScore = Math.abs(a.row - policy.rowPriority);
    const bScore = Math.abs(b.row - policy.rowPriority);
    return aScore - bScore;
  });

  const seat = ordered[0];
  if (!seat) return undefined;

  return {
    fanId,
    roomId,
    tier,
    seat,
  };
}
