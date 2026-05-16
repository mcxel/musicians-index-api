const balances = new Map<string, number>();

export function getPointBalance(userId: string): number {
  return balances.get(userId) ?? 0;
}

export function addPoints(userId: string, points: number): number {
  const next = Math.max(0, getPointBalance(userId) + points);
  balances.set(userId, next);
  return next;
}
