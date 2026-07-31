/**
 * sharePlaylistToThread — individual playlist/track share into messaging.
 * Payload: { type: 'playlist', playlistId, trackId? } — not the whole UI shell.
 */

export interface SharePlaylistToThreadInput {
  threadId: string;
  playlistId: string;
  playlistTitle: string;
  trackId?: string;
  trackTitle?: string;
}

export async function sharePlaylistToThread(
  input: SharePlaylistToThreadInput,
): Promise<{ ok: boolean; error?: string }> {
  const body = input.trackId
    ? `Shared track “${input.trackTitle ?? "Track"}” from playlist “${input.playlistTitle}”`
    : `Shared playlist “${input.playlistTitle}”`;

  try {
    const res = await fetch(`/api/messages/${input.threadId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        body,
        type: "playlist",
        playlistId: input.playlistId,
        trackId: input.trackId,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error ?? "Failed to share playlist" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export interface MessageThreadOption {
  threadId: string;
  name: string;
}

/** Load real inbox threads for the share picker (honest empty if none). */
export async function fetchShareThreadOptions(): Promise<MessageThreadOption[]> {
  try {
    const res = await fetch("/api/messages", { credentials: "include", cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      threads?: Array<{
        threadId?: string;
        participants?: Array<{ userId?: string; displayName?: string }>;
      }>;
    };
    if (!Array.isArray(data.threads)) return [];
    return data.threads
      .filter((t) => typeof t.threadId === "string" && t.threadId.length > 0)
      .map((t) => {
        const participants = t.participants ?? [];
        const name =
          participants.map((p) => p.displayName).filter(Boolean).join(", ") || "Conversation";
        return { threadId: t.threadId as string, name };
      });
  } catch {
    return [];
  }
}
