import { redirect } from "next/navigation";

// LEGACY (2026-07-20) — superseded by /rooms/monday-stage, the canonical
// Monday Night Stage route (real 3D venue via ArenaEventShell + the real
// Bebo hook/boo-vote panel + a real submission form). Query params (e.g.
// PlaylistActionBridge's `?action=submit&trackId=...` deep link) are
// forwarded so existing submit-from-playlist links keep working.
export default async function CompetitionsMondayNightStageLegacyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
  }
  const suffix = qs.toString();
  redirect(`/rooms/monday-stage${suffix ? `?${suffix}` : ""}`);
}
