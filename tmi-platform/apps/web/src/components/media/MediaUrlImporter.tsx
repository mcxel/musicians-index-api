"use client";

/**
 * MediaUrlImporter — reusable URL-based media import widget.
 *
 * Flow: PASTE URL → validate/preview → add to collection → choose playlist → SAVE
 * Uses: POST /api/media/ingest, GET /api/media/my-playlists
 *
 * Drop this into Playlist Studio, AccountCommandMenu, or any other add-media surface.
 *
 * Props:
 *   defaultPlaylistId — pre-selects a playlist in the picker
 *   onImported        — called with the saved songId + title on success
 *   compact           — reduced padding for embedding inside menus
 */

import { useState, useEffect, useCallback } from "react";

export interface ImportedTrack {
  songId: string;
  title: string;
  artistName: string | null;
  coverUrl: string | null;
  duration: number | null;
  provider: string;
  isDuplicate: boolean;
  addedToPlaylist: boolean;
}

interface UserPlaylist {
  id: string;
  name: string;
  trackCount: number;
}

interface IngestResponse {
  ok?: boolean;
  songId?: string;
  title?: string;
  artistName?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
  provider?: string;
  isDuplicate?: boolean;
  addedToPlaylist?: boolean;
  error?: string;
  code?: string;
  message?: string;
}

type ImportStep = "idle" | "resolving" | "preview" | "saving" | "done" | "error";

const PROVIDER_LABELS: Record<string, string> = {
  youtube: "YouTube",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
  apple_music: "Apple Music",
  tidal: "Tidal",
  bandcamp: "Bandcamp",
  tmi: "TMI Library",
  external: "External Link",
};

const ERROR_COPY: Record<string, string> = {
  INVALID_URL:                  "That doesn't look like a valid URL. Check it and try again.",
  UNSUPPORTED_PROVIDER:         "This platform isn't supported yet.",
  NO_PLAYABLE_SOURCE:           "No playable media found at that URL.",
  PRIVATE_OR_UNAUTHORIZED_MEDIA:"This media is private or age-restricted and can't be imported.",
  DUPLICATE_TRACK:              "You've already added this track to your collection.",
  IMPORT_FAILED:                "Import failed. The platform may be unavailable.",
  SAVE_FAILED:                  "Saved metadata but the track couldn't be stored. Try again.",
};

interface MediaUrlImporterProps {
  defaultPlaylistId?: string;
  onImported?: (track: ImportedTrack) => void;
  compact?: boolean;
}

export default function MediaUrlImporter({
  defaultPlaylistId,
  onImported,
  compact = false,
}: MediaUrlImporterProps) {
  const [url, setUrl]               = useState("");
  const [step, setStep]             = useState<ImportStep>("idle");
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [errorCode, setErrorCode]   = useState<string | null>(null);
  const [preview, setPreview]       = useState<IngestResponse | null>(null);
  const [playlists, setPlaylists]   = useState<UserPlaylist[]>([]);
  const [selectedPl, setSelectedPl] = useState<string>(defaultPlaylistId ?? "__none__");
  const [newPlName, setNewPlName]   = useState("");
  const [showNewPl, setShowNewPl]   = useState(false);
  const [creatingPl, setCreatingPl] = useState(false);

  const pad = compact ? "10px 12px" : "14px 16px";
  const gap = compact ? 8 : 12;

  const loadPlaylists = useCallback(async () => {
    try {
      const r = await fetch("/api/media/my-playlists", { credentials: "include" });
      if (r.ok) {
        const d = await r.json() as { playlists?: UserPlaylist[] };
        setPlaylists(d.playlists ?? []);
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void loadPlaylists(); }, [loadPlaylists]);

  const reset = () => {
    setUrl(""); setStep("idle"); setErrorMsg(null); setErrorCode(null); setPreview(null);
  };

  const resolveUrl = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setStep("resolving");
    setErrorMsg(null);
    setErrorCode(null);
    try {
      // Use the ingest endpoint in resolve-only mode (no playlistId) to get metadata preview
      const r = await fetch("/api/media/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: trimmed }),
      });
      const d = await r.json() as IngestResponse;

      if (!r.ok || !d.ok) {
        const code = d.code ?? "IMPORT_FAILED";
        setErrorMsg(ERROR_COPY[code] ?? d.error ?? "Import failed.");
        setErrorCode(code);
        // DUPLICATE_TRACK is shown as preview, not blocking error
        if (code === "DUPLICATE_TRACK") {
          setPreview(d);
          setStep("preview");
        } else {
          setStep("error");
        }
        return;
      }

      setPreview(d);
      setStep("preview");
    } catch {
      setErrorMsg("Network error. Check your connection and try again.");
      setStep("error");
    }
  };

  const createPlaylist = async () => {
    const name = newPlName.trim();
    if (!name) return;
    setCreatingPl(true);
    try {
      const r = await fetch("/api/playlists/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (r.ok) {
        const d = await r.json() as { playlist?: { id: string; name: string } };
        if (d.playlist) {
          setPlaylists((prev) => [{ id: d.playlist!.id, name: d.playlist!.name, trackCount: 0 }, ...prev]);
          setSelectedPl(d.playlist.id);
          setNewPlName("");
          setShowNewPl(false);
        }
      }
    } catch { /* noop */ } finally {
      setCreatingPl(false);
    }
  };

  const saveToCollection = async () => {
    if (!preview?.songId) return;
    // Already saved in resolve step — just add to playlist if selected
    const pl = selectedPl !== "__none__" ? selectedPl : null;
    if (!pl) {
      // Nothing more to do: song already persisted in collection
      onImported?.({
        songId: preview.songId,
        title: preview.title ?? "Untitled",
        artistName: preview.artistName ?? null,
        coverUrl: preview.coverUrl ?? null,
        duration: preview.duration ?? null,
        provider: preview.provider ?? "external",
        isDuplicate: Boolean(preview.isDuplicate),
        addedToPlaylist: false,
      });
      setStep("done");
      return;
    }

    setStep("saving");
    try {
      const r = await fetch("/api/media/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: url.trim(), playlistId: pl }),
      });
      const d = await r.json() as IngestResponse;
      if (r.ok || d.code === "DUPLICATE_TRACK") {
        onImported?.({
          songId: d.songId ?? preview.songId!,
          title: d.title ?? preview.title ?? "Untitled",
          artistName: d.artistName ?? preview.artistName ?? null,
          coverUrl: d.coverUrl ?? preview.coverUrl ?? null,
          duration: d.duration ?? preview.duration ?? null,
          provider: d.provider ?? preview.provider ?? "external",
          isDuplicate: Boolean(d.isDuplicate),
          addedToPlaylist: Boolean(d.addedToPlaylist),
        });
        setStep("done");
      } else {
        setErrorMsg(ERROR_COPY[d.code ?? "SAVE_FAILED"] ?? d.error ?? "Save failed.");
        setStep("error");
      }
    } catch {
      setErrorMsg("Network error while saving. Try again.");
      setStep("error");
    }
  };

  // ── Shared style tokens ──────────────────────────────────────────────────────

  const base: React.CSSProperties = {
    fontFamily: "inherit",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8,
    color: "#fff",
    fontSize: compact ? 11 : 12,
    padding: "7px 10px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const btn = (primary?: boolean, danger?: boolean): React.CSSProperties => ({
    fontFamily: "inherit",
    fontSize: compact ? 9 : 10,
    fontWeight: 900,
    letterSpacing: "0.1em",
    borderRadius: 7,
    padding: compact ? "6px 12px" : "7px 14px",
    cursor: "pointer",
    border: primary
      ? "1px solid #00FFFF"
      : danger
        ? "1px solid rgba(255,107,107,0.5)"
        : "1px solid rgba(255,255,255,0.15)",
    background: primary
      ? "rgba(0,255,255,0.12)"
      : danger
        ? "rgba(255,107,107,0.1)"
        : "rgba(255,255,255,0.05)",
    color: primary ? "#00FFFF" : danger ? "#FF6B6B" : "rgba(255,255,255,0.6)",
  });

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap, padding: pad }}>
      {/* Header */}
      <div style={{ fontSize: compact ? 9 : 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
        ADD MEDIA BY URL
      </div>

      {/* URL input */}
      {(step === "idle" || step === "error") && (
        <>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void resolveUrl(); }}
            placeholder="Paste YouTube, SoundCloud, Spotify, Bandcamp, or direct audio URL…"
            style={{ ...base, padding: "8px 10px" }}
            autoFocus={!compact}
          />
          {errorMsg && (
            <div style={{ fontSize: 10, color: "#FF6B6B", lineHeight: 1.5 }}>
              ✕ {errorMsg}
              {errorCode && (
                <span style={{ marginLeft: 6, fontSize: 8, opacity: 0.6, fontFamily: "monospace" }}>
                  [{errorCode}]
                </span>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <button style={btn(true)} onClick={() => void resolveUrl()} disabled={!url.trim()}>
              RESOLVE
            </button>
            {url && <button style={btn()} onClick={reset}>CLEAR</button>}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
            Supported: YouTube · SoundCloud · Spotify · Apple Music · Tidal · Bandcamp · direct MP3/MP4 links
          </div>
        </>
      )}

      {/* Resolving spinner */}
      {step === "resolving" && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "16px 0" }}>
          Resolving media…
        </div>
      )}

      {/* Preview */}
      {(step === "preview" || step === "saving") && preview && (
        <>
          {errorMsg && (
            <div style={{ fontSize: 10, color: "#FFD700", lineHeight: 1.4, padding: "4px 8px", background: "rgba(255,215,0,0.07)", borderRadius: 6 }}>
              ⚠ {errorMsg}
            </div>
          )}
          <div style={{
            display: "flex", gap: 10, padding: "10px", background: "rgba(255,255,255,0.04)",
            borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {preview.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.coverUrl} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 6, background: "rgba(0,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>
                🎵
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {preview.title ?? "Untitled"}
              </div>
              {preview.artistName && (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {preview.artistName}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", color: "#00FFFF", background: "rgba(0,255,255,0.08)", borderRadius: 4, padding: "2px 6px" }}>
                  {PROVIDER_LABELS[preview.provider ?? "external"] ?? preview.provider}
                </span>
                {preview.duration && (
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
                    {Math.floor(preview.duration / 60)}:{String(preview.duration % 60).padStart(2, "0")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Playlist picker */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
              ADD TO PLAYLIST (optional)
            </div>
            <select
              value={selectedPl}
              onChange={(e) => setSelectedPl(e.target.value)}
              style={{ ...base, padding: "6px 8px" }}
            >
              <option value="__none__">— My Collection only —</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.trackCount} tracks)</option>
              ))}
            </select>
            {!showNewPl ? (
              <button style={btn()} onClick={() => setShowNewPl(true)}>+ NEW PLAYLIST</button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  value={newPlName}
                  onChange={(e) => setNewPlName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void createPlaylist(); }}
                  placeholder="Playlist name…"
                  style={{ ...base, flex: 1 }}
                  autoFocus
                />
                <button style={btn(true)} onClick={() => void createPlaylist()} disabled={creatingPl || !newPlName.trim()}>
                  {creatingPl ? "…" : "CREATE"}
                </button>
                <button style={btn()} onClick={() => { setShowNewPl(false); setNewPlName(""); }}>✕</button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 6 }}>
            <button style={btn(true)} onClick={() => void saveToCollection()} disabled={step === "saving"}>
              {step === "saving" ? "SAVING…" : errorCode === "DUPLICATE_TRACK" ? "ADD TO PLAYLIST" : "SAVE TO COLLECTION"}
            </button>
            <button style={btn()} onClick={reset}>START OVER</button>
          </div>
        </>
      )}

      {/* Done */}
      {step === "done" && (
        <div style={{ display: "flex", flexDirection: "column", gap, alignItems: "flex-start" }}>
          <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 700 }}>
            ✓ Saved to your collection{preview?.addedToPlaylist ? " and playlist" : ""}.
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            {preview?.title ?? "Track"} is now in your Media Locker. Reload this page to confirm.
          </div>
          <button style={btn()} onClick={reset}>ADD ANOTHER</button>
        </div>
      )}
    </div>
  );
}
