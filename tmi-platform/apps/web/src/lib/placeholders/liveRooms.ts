export const liveRooms: unknown[] = [];

export async function fetchLiveRooms(): Promise<unknown[]> {
  try {
    const res = await fetch('/api/homepage/live');
    if (!res.ok) return [];
    return res.json() as Promise<unknown[]>;
  } catch {
    return [];
  }
}
