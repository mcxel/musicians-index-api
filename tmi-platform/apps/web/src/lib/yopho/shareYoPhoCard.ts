/**
 * shareYoPhoCard — share interactive YoPho cards.
 * Canonical: { type: 'yopho_card', cardId } → /yopho/card/[cardId]
 */

import { buildShareUrl } from "@/lib/share/ShareLinkEngine";
import {
  fetchShareThreadOptions,
  type MessageThreadOption,
} from "@/lib/playlists/sharePlaylistToThread";
import { interactiveCardPath } from "@/lib/yopho/YoPhoCardRegistry";

export type YoPhoShareKind = "yopho" | "profile" | "yopho_card";

export interface YoPhoShareArtifact {
  type: YoPhoShareKind;
  slug?: string;
  cardId?: string;
  id?: string;
  displayName?: string;
  songTitle?: string | null;
}

export function buildYoPhoSharePath(artifact: YoPhoShareArtifact): string {
  if (artifact.type === "yopho_card" && artifact.cardId) {
    return interactiveCardPath(artifact.cardId);
  }
  if (artifact.slug) {
    return `/performers/${encodeURIComponent(artifact.slug)}`;
  }
  return "/performers";
}

export function defaultYoPhoShareText(artifact: YoPhoShareArtifact): string {
  const who = artifact.displayName ? `${artifact.displayName}: ` : "";
  const song = artifact.songTitle ? ` ♪ ${artifact.songTitle}` : "";
  return `${who}This is me right now.${song}`;
}

export function buildYoPhoShareUrl(artifact: YoPhoShareArtifact): string {
  const path = buildYoPhoSharePath(artifact);
  const text = defaultYoPhoShareText(artifact);
  return buildShareUrl({
    title: artifact.displayName
      ? `${artifact.displayName} — YoPho Card · Who I Am Right Now`
      : "TMI YoPho Card · Who I Am Right Now",
    text,
    path,
    context: { source: "yopho_card", medium: "share", campaign: "interactive_card" },
  });
}

export async function copyYoPhoShareLink(
  artifact: YoPhoShareArtifact,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  const url = buildYoPhoShareUrl(artifact);
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return { ok: true, url };
    }
    return { ok: false, error: "Clipboard unavailable", url };
  } catch {
    return { ok: false, error: "Copy failed", url };
  }
}

export async function nativeShareYoPhoCard(
  artifact: YoPhoShareArtifact,
): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const url = buildYoPhoShareUrl(artifact);
  const title = artifact.displayName
    ? `${artifact.displayName} — YoPho Card`
    : "TMI YoPho Card";
  const text = defaultYoPhoShareText(artifact);

  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return { ok: false, skipped: true, error: "Native share unavailable" };
  }
  try {
    await navigator.share({ title, text, url });
    return { ok: true };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "AbortError") return { ok: false, skipped: true };
    return { ok: false, error: "Share failed" };
  }
}

export interface ShareYoPhoToThreadInput {
  threadId: string;
  artifact: YoPhoShareArtifact;
}

export async function shareYoPhoToThread(
  input: ShareYoPhoToThreadInput,
): Promise<{ ok: boolean; error?: string }> {
  const { artifact } = input;
  const body = defaultYoPhoShareText(artifact);

  try {
    const res = await fetch(`/api/messages/${input.threadId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        body,
        type: artifact.type === "yopho_card" ? "yopho_card" : artifact.type ?? "yopho",
        shareSlug: artifact.slug,
        shareId: artifact.cardId ?? artifact.id,
        cardId: artifact.cardId,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error ?? "Failed to share card" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export { fetchShareThreadOptions };
export type { MessageThreadOption };
