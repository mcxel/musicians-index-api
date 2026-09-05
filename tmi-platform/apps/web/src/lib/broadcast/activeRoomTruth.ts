/**
 * Target 4 — client helpers for LIVE NOW — N ACTIVE ROOMS.
 * Always prefer GET /api/live/go `count`. Never invent a second counter service.
 */

export function formatLiveNowActiveRoomsLabel(count: number): string {
  return `LIVE NOW — ${count} ACTIVE ROOMS`;
}

export async function fetchActiveRoomTruthCount(
  fetchFn: typeof fetch = fetch,
): Promise<number> {
  const res = await fetchFn(`/api/live/go?_=${Date.now()}`, {
    credentials: "omit",
    cache: "no-store",
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { count?: unknown };
  return typeof data.count === "number" && Number.isFinite(data.count)
    ? Math.max(0, Math.floor(data.count))
    : 0;
}
