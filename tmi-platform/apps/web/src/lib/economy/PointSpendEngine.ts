import { addPoints, getPointBalance } from "./PointWalletEngine";

export function spendPoints(userId: string, points: number): { ok: boolean; balance: number } {
  const current = getPointBalance(userId);
  if (points <= 0 || current < points) {
    return { ok: false, balance: current };
  }

  const balance = addPoints(userId, -points);
  return { ok: true, balance };
}
