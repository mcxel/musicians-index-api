"use client";

/**
 * PlaylistSharePanel — §20995-W1 share surface.
 * Copy link, native device share, TMI messages, honest external intents (no fake publish).
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  downloadPortablePlaylistManifest,
  buildPortablePlaylistManifest,
  fetchShareThreadOptions,
  sharePlaylistToThread,
  type MessageThreadOption,
  type PortablePlaylistItem,
} from "@/lib/playlists/sharePlaylistToThread";

export interface PlaylistSharePanelProps {
  playlistId: string;
  playlistTitle: string;
  isPublic?: boolean;
  trackId?: string | null;
  trackTitle?: string | null;
  portableItems?: PortablePlaylistItem[];
  accentColor?: string;
  onClose?: () => void;
  onPrivacyChange?: (isPublic: boolean) => void;
  /** When viewing someone else's playlist — save membership into own library */
  canSaveToLibrary?: boolean;
  onSaveToLibrary?: () => Promise<void> | void;
}

export default function PlaylistSharePanel({
  playlistId,
  playlistTitle,
  isPublic = true,
  trackId = null,
  trackTitle = null,
  portableItems = [],
  accentColor = "#00FFFF",
  onClose,
  onPrivacyChange,
  canSaveToLibrary = false,
  onSaveToLibrary,
}: PlaylistSharePanelProps) {
  const [threads, setThreads] = useState<MessageThreadOption[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/playlist/${playlistId}`;
    return `${window.location.origin}/playlist/${playlistId}`;
  }, [playlistId]);

  useEffect(() => {
    let active = true;
    void fetchShareThreadOptions().then((opts) => {
      if (active) setThreads(opts);
    });
    return () => {
      active = false;
    };
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus(isPublic ? "Link copied." : "Link copied — playlist is private; only you can open it unless you make it public.");
    } catch {
      setStatus("Could not copy — select and copy the link below.");
    }
  };

  const nativeShare = async () => {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      setStatus("Device share menu not available — use Copy Link.");
      return;
    }
    try {
      await navigator.share({
        title: playlistTitle,
        text: `Listen on TMI: ${playlistTitle}`,
        url: shareUrl,
      });
      setStatus("Opened device share menu.");
    } catch {
      setStatus("Share cancelled.");
    }
  };

  const sendToThread = async (threadId: string) => {
    const result = await sharePlaylistToThread({
      threadId,
      playlistId,
      playlistTitle,
      trackId: trackId ?? undefined,
      trackTitle: trackTitle ?? undefined,
    });
    setStatus(result.ok ? "Shared to TMI Messages." : result.error ?? "Share failed.");
  };

  const externalIntent = (kind: "x" | "facebook" | "whatsapp" | "email" | "sms") => {
    const encoded = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`${playlistTitle} — ${shareUrl}`);
    const href =
      kind === "x"
        ? `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(playlistTitle)}`
        : kind === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encoded}`
          : kind === "whatsapp"
            ? `https://wa.me/?text=${text}`
            : kind === "email"
              ? `mailto:?subject=${encodeURIComponent(playlistTitle)}&body=${text}`
              : `sms:?&body=${text}`;
    window.open(href, "_blank", "noopener,noreferrer");
    setStatus("Opened share destination. Posting is handled by that app — TMI only provides the link.");
  };

  const togglePrivacy = async (next: boolean) => {
    if (!onPrivacyChange) return;
    setPrivacyBusy(true);
    try {
      await onPrivacyChange(next);
      setStatus(next ? "Playlist is public." : "Playlist is private — link will not open for others.");
    } finally {
      setPrivacyBusy(false);
    }
  };

  const saveLibrary = async () => {
    if (!onSaveToLibrary) return;
    setSaving(true);
    try {
      await onSaveToLibrary();
      setStatus("Saved to My Library.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not save playlist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-testid="playlist-share-panel"
      role="dialog"
      aria-label="Share playlist"
      style={{
        width: "100%",
        maxWidth: 400,
        background: "#080518",
        border: `1px solid ${accentColor}`,
        borderRadius: 14,
        padding: 18,
        color: "#fff",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: accentColor, letterSpacing: "0.1em", marginBottom: 6 }}>
        SHARE PLAYLIST
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{playlistTitle}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 12, wordBreak: "break-all" }}>
        {shareUrl}
      </div>

      {onPrivacyChange ? (
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={privacyBusy || isPublic}
            onClick={() => void togglePrivacy(true)}
            style={btn(isPublic ? "#00FF88" : "rgba(255,255,255,0.35)")}
          >
            PUBLIC
          </button>
          <button
            type="button"
            disabled={privacyBusy || !isPublic}
            onClick={() => void togglePrivacy(false)}
            style={btn(!isPublic ? "#FFD700" : "rgba(255,255,255,0.35)")}
          >
            PRIVATE
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <button type="button" data-testid="playlist-share-copy" onClick={() => void copyLink()} style={btn(accentColor)}>
          COPY LINK
        </button>
        <button type="button" data-testid="playlist-share-native" onClick={() => void nativeShare()} style={btn("#FFD700")}>
          DEVICE SHARE
        </button>
        <button
          type="button"
          onClick={() => {
            downloadPortablePlaylistManifest(
              buildPortablePlaylistManifest({
                playlistId,
                playlistTitle,
                items: portableItems,
              }),
            );
            setStatus("Downloaded membership list (no audio files).");
          }}
          style={btn("#AA2DFF")}
        >
          EXPORT LIST
        </button>
        {canSaveToLibrary && onSaveToLibrary ? (
          <button
            type="button"
            data-testid="playlist-save-to-library"
            disabled={saving}
            onClick={() => void saveLibrary()}
            style={btn("#00FF88")}
          >
            {saving ? "…" : "SAVE TO MY LIBRARY"}
          </button>
        ) : null}
      </div>

      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
        EXTERNAL (LINK ONLY)
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {(
          [
            ["x", "X / TWITTER"],
            ["facebook", "FACEBOOK"],
            ["whatsapp", "WHATSAPP"],
            ["email", "EMAIL"],
            ["sms", "TEXT"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => externalIntent(id)} style={btn("rgba(255,255,255,0.45)")}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 12, lineHeight: 1.4 }}>
        Instagram / TikTok: copy the link and paste in-app — those apps do not expose a reliable web share intent.
      </div>

      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
        TMI MESSAGES
      </div>
      {threads.length === 0 ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
          No active conversations. Open Messages to start a chat.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {threads.map((t) => (
            <button
              key={t.threadId}
              type="button"
              onClick={() => void sendToThread(t.threadId)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: `${accentColor}14`,
                border: `1px solid ${accentColor}`,
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {status ? (
        <div style={{ fontSize: 10, color: status.toLowerCase().includes("fail") || status.toLowerCase().includes("could not") ? "#ffb0b0" : "#9dffc8", marginBottom: 10 }}>
          {status}
        </div>
      ) : null}

      {onClose ? (
        <button type="button" onClick={onClose} style={btn("rgba(255,255,255,0.4)")}>
          CLOSE
        </button>
      ) : null}
    </div>
  );
}

function btn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    border: `1px solid ${color}66`,
    borderRadius: 6,
    padding: "6px 12px",
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
