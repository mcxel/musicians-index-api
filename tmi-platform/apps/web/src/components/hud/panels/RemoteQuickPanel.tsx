"use client";

/**
 * RemoteQuickPanel — two-sided compact controller (LOCKED).
 * Side A: PLAYLIST REMOTE — selector, queue, search (no player teardown).
 * Side B: MEDIA PLAYER REMOTE — transport, seek, volume (no playlist reset).
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CompactFloatingQuickPanel from "@/components/hud/CompactFloatingQuickPanel";
import {
  sendPlaybackCommand,
  subscribePlaylistNowPlaying,
  subscribePlaylistQueue,
  type PlaylistNowPlayingPayload,
  type PlaylistQueueSyncPayload,
} from "@/lib/playlists/commandCenterPlaybackBus";
import { useAudio } from "@/components/AudioProvider";
import { openCanonicalDeepStudio } from "@/lib/workspace/universal/openCanonicalPresentation";

type RemoteSide = "playlist" | "player";

interface ApiPlaylistSummary {
  id: string;
  name: string;
  _count?: { items: number };
}

interface ApiSong {
  id: string;
  title: string;
  audioUrl?: string | null;
  coverUrl?: string | null;
}

export default function RemoteQuickPanel({ onClose }: { onClose: () => void }) {
  const accent = "#00FF88";
  const [side, setSide] = useState<RemoteSide>("playlist");
  const [nowPlaying, setNowPlaying] = useState<PlaylistNowPlayingPayload | null>(null);
  const [queueSync, setQueueSync] = useState<PlaylistQueueSyncPayload | null>(null);
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<ApiSong[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; title: string; kind: "track" | "playlist"; playlistId?: string; trackIndex?: number }[]
  >([]);

  const { currentTime, duration, volume, isMuted, seek, setVolume, toggleMute } = useAudio();

  useEffect(() => subscribePlaylistNowPlaying(setNowPlaying), []);
  useEffect(() => subscribePlaylistQueue(setQueueSync), []);

  const loadPlaylists = useCallback(async () => {
    setLoadingLists(true);
    try {
      const res = await fetch("/api/user/content", { cache: "no-store", credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { playlists?: ApiPlaylistSummary[] };
        const list = data.playlists ?? [];
        setPlaylists(list);
        setSelectedId((prev) => prev ?? queueSync?.selectedPlaylistId ?? list[0]?.id ?? null);
      }
    } finally {
      setLoadingLists(false);
    }
  }, [queueSync?.selectedPlaylistId]);

  useEffect(() => {
    void loadPlaylists();
  }, [loadPlaylists]);

  useEffect(() => {
    if (queueSync?.selectedPlaylistId) setSelectedId(queueSync.selectedPlaylistId);
    if (queueSync?.tracks?.length) {
      setTracks(
        queueSync.tracks.map((t) => ({
          id: t.id,
          title: t.title,
        })),
      );
    }
  }, [queueSync]);

  useEffect(() => {
    if (!selectedId) {
      setTracks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/user/playlists/${selectedId}/songs`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { items?: { song: ApiSong }[] };
        if (!cancelled) setTracks((data.items ?? []).map((i) => i.song));
      } catch {
        if (!cancelled) setTracks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const displayTracks = queueSync?.tracks?.length ? queueSync.tracks : tracks;
  const currentIndex = queueSync?.currentTrackIndex ?? 0;

  const runSearch = useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const results: typeof searchResults = [];
    for (const pl of playlists) {
      if (pl.name.toLowerCase().includes(q)) {
        results.push({ id: `pl-${pl.id}`, title: pl.name, kind: "playlist", playlistId: pl.id });
      }
    }
    displayTracks.forEach((t, i) => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({
          id: `tr-${t.id}`,
          title: t.title,
          kind: "track",
          playlistId: selectedId ?? undefined,
          trackIndex: i,
        });
      }
    });
    setSearchResults(results.slice(0, 12));
  }, [searchQuery, playlists, displayTracks, selectedId]);

  useEffect(() => {
    const t = window.setTimeout(runSearch, 200);
    return () => window.clearTimeout(t);
  }, [runSearch]);

  const seekRatio = duration > 0 ? currentTime / duration : (nowPlaying?.progress ?? 0);

  const tabRow = (
    <div style={{ display: "flex", gap: 2, padding: "6px 8px" }}>
      {(
        [
          { id: "playlist" as const, label: "PLAYLIST" },
          { id: "player" as const, label: "PLAYER" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setSide(tab.id)}
          style={{
            flex: 1,
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "5px 6px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            background: side === tab.id ? `${accent}33` : "rgba(255,255,255,0.05)",
            color: side === tab.id ? accent : "rgba(255,255,255,0.45)",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <CompactFloatingQuickPanel
      title="REMOTE"
      accentColor={accent}
      corner="bottom-right"
      onClose={onClose}
      onOpenDeep={() => openCanonicalDeepStudio("playlist-studio")}
      deepLabel="PLAYLIST"
      tabs={tabRow}
    >
      {side === "playlist" ? (
        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>
            PLAYLIST
          </label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => {
              const id = e.target.value || null;
              setSelectedId(id);
              if (id) sendPlaybackCommand("select-playlist", { playlistId: id });
            }}
            style={selectStyle(accent)}
          >
            {loadingLists ? <option value="">Loading…</option> : null}
            {!loadingLists && playlists.length === 0 ? (
              <option value="">No playlists</option>
            ) : null}
            {playlists.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name}
                {pl._count?.items != null ? ` (${pl._count.items})` : ""}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            <button type="button" onClick={() => sendPlaybackCommand("prev")} style={btn(accent)}>
              ◀ PREV
            </button>
            <button type="button" onClick={() => sendPlaybackCommand("next")} style={btn(accent)}>
              NEXT ▶
            </button>
          </div>

          <label style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>
            QUEUE
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 140, overflowY: "auto" }}>
            {displayTracks.length === 0 ? (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", padding: "8px 0" }}>
                Queue empty — select a playlist with tracks.
              </div>
            ) : (
              displayTracks.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => sendPlaybackCommand("select-track", { trackIndex: i, trackId: t.id })}
                  style={{
                    textAlign: "left",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: `1px solid ${i === currentIndex ? accent : "rgba(255,255,255,0.1)"}`,
                    background: i === currentIndex ? `${accent}18` : "rgba(255,255,255,0.03)",
                    color: i === currentIndex ? accent : "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {i + 1}. {t.title}
                </button>
              ))
            )}
          </div>

          <label style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>
            SEARCH
          </label>
          <input
            type="search"
            placeholder="Search songs / playlists…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={inputStyle(accent)}
          />
          {searchQuery.trim() && searchResults.length === 0 ? (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
              {`No results for '${searchQuery.trim()}'`}
            </div>
          ) : null}
          {searchResults.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                if (r.kind === "playlist" && r.playlistId) {
                  setSelectedId(r.playlistId);
                  sendPlaybackCommand("select-playlist", { playlistId: r.playlistId });
                } else if (r.kind === "track" && r.trackIndex != null) {
                  sendPlaybackCommand("select-track", { trackIndex: r.trackIndex, trackId: r.id.replace("tr-", "") });
                }
              }}
              style={{
                textAlign: "left",
                padding: "5px 8px",
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#fff",
                fontSize: 9,
                cursor: "pointer",
              }}
            >
              {r.kind === "playlist" ? "📁" : "🎵"} {r.title}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {nowPlaying?.title ? (
            <>
              <div style={{ fontSize: 10, fontWeight: 800 }}>{nowPlaying.title}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{nowPlaying.artist ?? "—"}</div>
            </>
          ) : (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Nothing playing</div>
          )}

          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => sendPlaybackCommand("toggle")} style={btn(accent, true)}>
              {nowPlaying?.isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
            </button>
            <button type="button" onClick={() => sendPlaybackCommand("prev")} style={btn(accent)}>
              ◀ PREV
            </button>
            <button type="button" onClick={() => sendPlaybackCommand("next")} style={btn(accent)}>
              NEXT ▶
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button type="button" onClick={() => sendPlaybackCommand("rewind", { seekDeltaSec: 10 })} style={btn(accent)}>
              REWIND
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(seekRatio * 100)}
              onChange={(e) => {
                const ratio = Number(e.target.value) / 100;
                sendPlaybackCommand("seek", { seekRatio: ratio });
                if (duration > 0) seek(ratio * duration);
              }}
              style={{ flex: 1, accentColor: accent }}
              aria-label="Seek"
            />
            <button type="button" onClick={() => sendPlaybackCommand("forward", { seekDeltaSec: 10 })} style={btn(accent)}>
              FWD
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => sendPlaybackCommand(isMuted ? "unmute" : "mute")}
              style={btn(accent)}
            >
              {isMuted ? "🔇 MUTE" : "🔊 SOUND"}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((isMuted ? 0 : volume) * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setVolume(v);
                sendPlaybackCommand("volume", { volume: v });
              }}
              style={{ flex: 1, accentColor: accent }}
              aria-label="Volume"
            />
          </div>
        </div>
      )}
    </CompactFloatingQuickPanel>
  );
}

function btn(accent: string, wide = false): React.CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    padding: wide ? "6px 14px" : "5px 8px",
    borderRadius: 6,
    border: `1px solid ${accent}`,
    background: `${accent}18`,
    color: accent,
    cursor: "pointer",
  };
}

function selectStyle(accent: string): React.CSSProperties {
  return {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 6,
    border: `1px solid ${accent}55`,
    background: "rgba(0,0,0,0.4)",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
  };
}

function inputStyle(accent: string): React.CSSProperties {
  return {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 6,
    border: `1px solid ${accent}44`,
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    fontSize: 9,
    boxSizing: "border-box",
  };
}
