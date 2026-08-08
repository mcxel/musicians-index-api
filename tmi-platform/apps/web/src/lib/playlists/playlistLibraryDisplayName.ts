/**
 * Institutional playlist library labels for Command Center surfaces.
 * Never surface owner personal / governance test identities on public chrome.
 */

const BLOCKED_NAME = /marcel\s*dickens|marcelid|marcel\s*d/i;

function cleanCandidate(name: string | null | undefined): string | null {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.includes("@")) return null;
  if (BLOCKED_NAME.test(trimmed)) return null;
  return trimmed;
}

export function resolvePlaylistLibraryHeader(opts: {
  activePlaylistName?: string | null;
  roomOrStationName?: string | null;
  role?: "fan" | "performer";
}): string {
  return (
    cleanCandidate(opts.activePlaylistName) ??
    cleanCandidate(opts.roomOrStationName) ??
    (opts.role === "performer" ? "TMI Curator Playlist" : "Platform Library")
  );
}
