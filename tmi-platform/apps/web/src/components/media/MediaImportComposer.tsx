"use client";

/**
 * MediaImportComposer — §20995-W unified ADD entry for Playlist WORK.
 * SOURCE → validate → ingest/upload → library → SINGLE | ALBUM | PLAYLIST
 * Reuses /api/upload/media, /api/media/ingest, /api/user/content, playlist songs API.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { uploadCanonicalMediaFile } from "@/lib/media/clientMediaUpload";
import MediaUrlImporter, { type ImportedTrack } from "@/components/media/MediaUrlImporter";

export type MediaDestination = "single" | "album" | "playlist";
export type ImportSourceMode = "upload" | "url" | "library";

export interface PlaylistOption {
  id: string;
  name: string;
  trackCount?: number;
  isMixtape?: boolean;
}

export interface LibraryTrackOption {
  id: string;
  title: string;
  genre?: string | null;
  audioUrl?: string | null;
}

export interface MediaImportComposerProps {
  role?: "fan" | "performer";
  accentColor?: string;
  playlists: PlaylistOption[];
  libraryTracks: LibraryTrackOption[];
  defaultPlaylistId?: string | null;
  onClose?: () => void;
  onCompleted?: (result: {
    songIds: string[];
    destination: MediaDestination;
    playlistId?: string | null;
    playlistName?: string | null;
  }) => void;
  onRefreshLibrary?: () => void;
  onRefreshPlaylists?: () => void;
}

type Phase = "source" | "meta" | "destination" | "done" | "error";

const AUDIO_ACCEPT = ".mp3,.wav,.flac,.m4a,.aac,.ogg,.webm,audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/x-m4a";

export default function MediaImportComposer({
  role = "fan",
  accentColor = "#00FF88",
  playlists,
  libraryTracks,
  defaultPlaylistId = null,
  onClose,
  onCompleted,
  onRefreshLibrary,
  onRefreshPlaylists,
}: MediaImportComposerProps) {
  const isPerformer = role === "performer";
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("source");
  const [sourceMode, setSourceMode] = useState<ImportSourceMode>("upload");
  const [destination, setDestination] = useState<MediaDestination>("playlist");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pendingSongIds, setPendingSongIds] = useState<string[]>([]);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [lastTitle, setLastTitle] = useState("");

  const [targetPlaylistId, setTargetPlaylistId] = useState<string>(
    defaultPlaylistId && !defaultPlaylistId.startsWith("local-") ? defaultPlaylistId : "__new__",
  );
  const [newCollectionName, setNewCollectionName] = useState("");
  const [createdPlaylistId, setCreatedPlaylistId] = useState<string | null>(null);
  const [createdPlaylistName, setCreatedPlaylistName] = useState<string | null>(null);

  useEffect(() => {
    if (defaultPlaylistId && !defaultPlaylistId.startsWith("local-")) {
      setTargetPlaylistId(defaultPlaylistId);
    }
  }, [defaultPlaylistId]);

  const albumPlaylists = useMemo(
    () => playlists.filter((p) => p.isMixtape),
    [playlists],
  );
  const regularPlaylists = useMemo(
    () => playlists.filter((p) => !p.isMixtape),
    [playlists],
  );

  const resetForAnother = () => {
    setPhase("source");
    setSourceMode("upload");
    setPendingSongIds([]);
    setSelectedLibraryIds([]);
    setTitle("");
    setArtist("");
    setGenre("");
    setError(null);
    setProgress(null);
    setBusy(false);
  };

  const createCollection = useCallback(
    async (name: string, asAlbum: boolean): Promise<{ id: string; name: string } | null> => {
      const res = await fetch("/api/user/content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          isMixtape: asAlbum,
          isPublic: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        playlist?: { id: string; name: string };
        error?: string;
      };
      if (!res.ok || !data.playlist?.id) {
        setError(data.error ?? "Could not create collection.");
        return null;
      }
      onRefreshPlaylists?.();
      return data.playlist;
    },
    [onRefreshPlaylists],
  );

  const addSongsToPlaylist = useCallback(async (playlistId: string, songIds: string[]) => {
    const res = await fetch(`/api/user/playlists/${playlistId}/songs`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songIds }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Could not add tracks to playlist.");
    }
  }, []);

  const resolveTargetPlaylist = useCallback(async (): Promise<{ id: string; name: string } | null> => {
    if (destination === "single") return null;
    if (targetPlaylistId === "__new__") {
      const name =
        newCollectionName.trim() ||
        (destination === "album" ? `Album ${new Date().toLocaleDateString()}` : `Playlist ${new Date().toLocaleDateString()}`);
      return createCollection(name, destination === "album");
    }
    const existing = playlists.find((p) => p.id === targetPlaylistId);
    if (!existing) {
      setError("Select a playlist or album, or create a new one.");
      return null;
    }
    return { id: existing.id, name: existing.name };
  }, [destination, targetPlaylistId, newCollectionName, createCollection, playlists]);

  const finishWithSongs = useCallback(
    async (songIds: string[], displayTitle: string) => {
      if (songIds.length === 0) {
        setError("No tracks ready to save.");
        setPhase("error");
        return;
      }
      setBusy(true);
      setProgress("Assigning destination…");
      try {
        let playlistId: string | null = null;
        let playlistName: string | null = null;
        if (destination !== "single") {
          const target = await resolveTargetPlaylist();
          if (!target) {
            setBusy(false);
            setPhase("error");
            return;
          }
          await addSongsToPlaylist(target.id, songIds);
          playlistId = target.id;
          playlistName = target.name;
          setCreatedPlaylistId(target.id);
          setCreatedPlaylistName(target.name);
        }
        setLastTitle(displayTitle);
        setPendingSongIds(songIds);
        setPhase("done");
        onRefreshLibrary?.();
        onRefreshPlaylists?.();
        onCompleted?.({
          songIds,
          destination,
          playlistId,
          playlistName,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed.");
        setPhase("error");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [destination, resolveTargetPlaylist, addSongsToPlaylist, onRefreshLibrary, onRefreshPlaylists, onCompleted],
  );

  const handleFileUpload = async (file: File) => {
    setError(null);
    setBusy(true);
    setProgress("Uploading…");
    setPhase("meta");
    try {
      const suggested = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle((t) => t || suggested);
      const result = await uploadCanonicalMediaFile(file, {
        title: title.trim() || suggested,
        persistVia: "/api/upload/media",
        extraForm: {
          ...(genre.trim() ? { genre: genre.trim() } : {}),
          ...(artist.trim() ? { artistName: artist.trim() } : {}),
        },
      });
      if (!result.ok) {
        setError(result.error);
        setPhase("error");
        return;
      }
      setPendingSongIds([result.id]);
      setLastTitle(title.trim() || suggested);
      setProgress("Uploaded to Media Library.");
      setPhase("destination");
      onRefreshLibrary?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setPhase("error");
    } finally {
      setBusy(false);
    }
  };

  const handleUrlImported = (track: ImportedTrack) => {
    setPendingSongIds([track.songId]);
    setTitle(track.title);
    setArtist(track.artistName ?? "");
    setLastTitle(track.title);
    setProgress(track.isDuplicate ? "Already in library — choose destination." : "Imported to Media Library.");
    setPhase("destination");
    onRefreshLibrary?.();
  };

  const toggleLibraryId = (id: string) => {
    setSelectedLibraryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const confirmLibrarySelection = () => {
    if (selectedLibraryIds.length === 0) {
      setError("Select at least one library track.");
      return;
    }
    setPendingSongIds(selectedLibraryIds);
    const first = libraryTracks.find((t) => t.id === selectedLibraryIds[0]);
    setLastTitle(
      selectedLibraryIds.length === 1
        ? first?.title ?? "Track"
        : `${selectedLibraryIds.length} tracks`,
    );
    setPhase("destination");
    setError(null);
  };

  const confirmDestination = async () => {
    await finishWithSongs(pendingSongIds, lastTitle || title || "Track");
  };

  const destinationOptions: { id: MediaDestination; label: string; hint: string; gated?: boolean }[] = [
    {
      id: "single",
      label: "SINGLE",
      hint: isPerformer
        ? "Keep in library as a standalone release asset (publish via Performer release tools)."
        : "Save to your Media Library only — not a commercial release.",
    },
    {
      id: "album",
      label: "ALBUM",
      hint: "Create or select an album collection (playlist-backed mixtape). Commercial album publishing stays on Performer release tools.",
    },
    {
      id: "playlist",
      label: "PLAYLIST",
      hint: "Create or add to a personal playlist. Same library asset can live in many playlists.",
    },
  ];

  const collectionChoices = destination === "album" ? albumPlaylists : regularPlaylists;

  return (
    <div
      data-testid="media-import-composer"
      data-media-import-composer="1"
      role="dialog"
      aria-label="Add music"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${accentColor}66`,
        background: "rgba(8,5,20,0.96)",
        color: "#fff",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
            ADD MUSIC
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Upload, import URL, or pick from your library — then choose Single, Album, or Playlist.
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} style={chipBtn("rgba(255,255,255,0.45)")} aria-label="Close add music">
            CLOSE
          </button>
        ) : null}
      </div>

      {phase === "source" || phase === "meta" ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="tablist" aria-label="Import method">
            {(
              [
                ["upload", "UPLOAD FILE"],
                ["url", "IMPORT URL"],
                ["library", "MY LIBRARY"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={sourceMode === id}
                onClick={() => {
                  setSourceMode(id);
                  setError(null);
                }}
                style={{
                  ...chipBtn(sourceMode === id ? accentColor : "rgba(255,255,255,0.35)"),
                  background: sourceMode === id ? `${accentColor}22` : "transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {sourceMode === "upload" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                MP3, WAV, FLAC, M4A and other supported audio. File is stored once in Media Library.
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <input
                  aria-label="Track title"
                  placeholder="Title (optional — suggested from filename)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />
                <input
                  aria-label="Artist"
                  placeholder="Artist (optional)"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  style={inputStyle}
                />
                <input
                  aria-label="Genre"
                  placeholder="Genre (optional)"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={AUDIO_ACCEPT}
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFileUpload(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                data-testid="media-import-pick-file"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                style={{ ...chipBtn(accentColor), padding: "10px 14px", fontSize: 11 }}
              >
                {busy ? progress ?? "Uploading…" : "CHOOSE AUDIO FILE"}
              </button>
            </div>
          ) : null}

          {sourceMode === "url" ? (
            <div data-testid="media-import-url-panel">
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8, lineHeight: 1.4 }}>
                Supported public links only. Streaming services that block download stay as authorized references — never a DRM bypass.
              </div>
              <MediaUrlImporter
                compact
                onImported={(track) => {
                  handleUrlImported(track);
                }}
              />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                After import, you will choose Single / Album / Playlist here (URL importer may also attach to a playlist if you pick one inside it).
              </div>
            </div>
          ) : null}

          {sourceMode === "library" ? (
            <div data-testid="media-import-library-panel" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                Select one or more existing library tracks — no re-upload.
              </div>
              {libraryTracks.length === 0 ? (
                <div style={emptyStyle}>Library empty. Upload a file or import a URL first.</div>
              ) : (
                <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {libraryTracks.map((t) => {
                    const on = selectedLibraryIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: on ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
                          background: on ? `${accentColor}18` : "rgba(255,255,255,0.03)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleLibraryId(t.id)}
                          aria-label={`Select ${t.title}`}
                        />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {t.title}
                          </div>
                          {t.genre ? (
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{t.genre}</div>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                data-testid="media-import-library-continue"
                disabled={selectedLibraryIds.length === 0}
                onClick={confirmLibrarySelection}
                style={{ ...chipBtn(accentColor), padding: "10px 14px", opacity: selectedLibraryIds.length ? 1 : 0.45 }}
              >
                CONTINUE WITH {selectedLibraryIds.length || 0} TRACK{selectedLibraryIds.length === 1 ? "" : "S"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {phase === "destination" ? (
        <div data-testid="media-import-destination" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 10, color: "rgba(255,215,0,0.85)" }}>
            Ready: {lastTitle || title || `${pendingSongIds.length} track(s)`} · in Media Library
          </div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
            SAVE AS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {destinationOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`media-dest-${opt.id}`}
                onClick={() => setDestination(opt.id)}
                style={{
                  ...chipBtn(destination === opt.id ? accentColor : "rgba(255,255,255,0.35)"),
                  background: destination === opt.id ? `${accentColor}22` : "transparent",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
            {destinationOptions.find((o) => o.id === destination)?.hint}
          </div>

          {destination !== "single" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select
                aria-label={destination === "album" ? "Album destination" : "Playlist destination"}
                value={targetPlaylistId}
                onChange={(e) => setTargetPlaylistId(e.target.value)}
                style={inputStyle}
              >
                <option value="__new__">
                  {destination === "album" ? "+ Create new album" : "+ Create new playlist"}
                </option>
                {collectionChoices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {typeof p.trackCount === "number" ? ` (${p.trackCount})` : ""}
                  </option>
                ))}
              </select>
              {targetPlaylistId === "__new__" ? (
                <input
                  aria-label="New collection name"
                  placeholder={destination === "album" ? "Album title" : "Playlist title"}
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  style={inputStyle}
                />
              ) : null}
              {destination === "album" && collectionChoices.length === 0 ? (
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                  No album collections yet — create one above. Yo Albums commercial publishing remains on Performer release tools.
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            data-testid="media-import-confirm-destination"
            disabled={busy || pendingSongIds.length === 0}
            onClick={() => void confirmDestination()}
            style={{ ...chipBtn(accentColor), padding: "10px 14px", fontSize: 11 }}
          >
            {busy ? progress ?? "Saving…" : "SAVE"}
          </button>
        </div>
      ) : null}

      {phase === "done" ? (
        <div data-testid="media-import-done" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#00FF88" }}>
            Saved{createdPlaylistName ? ` · ${createdPlaylistName}` : destination === "single" ? " to library as Single" : ""}.
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {lastTitle} · {pendingSongIds.length} track{pendingSongIds.length === 1 ? "" : "s"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button type="button" onClick={resetForAnother} style={chipBtn(accentColor)} data-testid="media-import-add-another">
              ADD ANOTHER TRACK
            </button>
            {createdPlaylistId ? (
              <a
                href={`/playlist/${createdPlaylistId}`}
                style={{ ...chipBtn("#00FFFF"), textDecoration: "none" }}
              >
                OPEN PLAYLIST
              </a>
            ) : null}
            {onClose ? (
              <button type="button" onClick={onClose} style={chipBtn("rgba(255,255,255,0.45)")}>
                DONE
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === "error" ? (
        <div data-testid="media-import-error" role="alert" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: "#ffb0b0" }}>{error ?? "Something went wrong."}</div>
          <button type="button" onClick={resetForAnother} style={chipBtn("#FFD700")}>
            TRY AGAIN
          </button>
        </div>
      ) : null}

      {progress && phase !== "done" && phase !== "error" ? (
        <div style={{ fontSize: 10, color: "rgba(255,215,0,0.8)" }} aria-live="polite">
          {progress}
        </div>
      ) : null}
      {error && phase !== "error" ? (
        <div style={{ fontSize: 10, color: "#ffb0b0" }} role="status">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function chipBtn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    padding: "7px 12px",
    borderRadius: 8,
    border: `1px solid ${color}88`,
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 11,
  fontFamily: "inherit",
};

const emptyStyle: CSSProperties = {
  padding: 14,
  borderRadius: 8,
  border: "1px dashed rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.45)",
  fontSize: 11,
  textAlign: "center",
};
