"use client";

import { useEffect, useState, useCallback } from "react";

interface Song { id: string; title: string; genre?: string; bpm?: number; audioUrl: string; coverUrl?: string; isPublic: boolean; status: string; playCount: number; createdAt: string; }
interface Video { id: string; title: string; genre?: string; videoUrl: string; thumbnailUrl?: string; isPublic: boolean; status: string; viewCount: number; createdAt: string; }
interface Playlist { id: string; name: string; description?: string; coverUrl?: string; isPublic: boolean; isMixtape: boolean; shareToken?: string; createdAt: string; _count: { items: number }; }

type Tab = "songs" | "videos" | "playlists";

const ACCENT = "#AA2DFF";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ShareBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ fontSize: 9, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: copied ? "#00FF88" : "rgba(255,255,255,0.5)", cursor: "pointer", fontWeight: 700 }}
    >
      {copied ? "✓ COPIED" : "SHARE"}
    </button>
  );
}

function InlineEdit({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(value);
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(v.trim()); }} style={{ display: "flex", gap: 6, flex: 1 }}>
      <input
        autoFocus value={v} onChange={e => setV(e.target.value)}
        style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(170,45,255,0.5)", borderRadius: 6, padding: "4px 8px", color: "#fff", fontSize: 12, fontFamily: "inherit" }}
      />
      <button type="submit" style={{ fontSize: 9, padding: "4px 10px", borderRadius: 6, border: "none", background: ACCENT, color: "#000", fontWeight: 800, cursor: "pointer" }}>SAVE</button>
      <button type="button" onClick={onCancel} style={{ fontSize: 9, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", fontWeight: 700, cursor: "pointer" }}>✕</button>
    </form>
  );
}

interface PlaylistTrack { id: string; position: number; song: { id: string; title: string; audioUrl: string; genre?: string; } }

function PlaylistTracksPanel({ playlistId, userSongs }: { playlistId: string; userSongs: Song[] }) {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSongId, setAddingSongId] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/user/playlists/${playlistId}/songs`, { credentials: "include" })
      .then(r => r.json())
      .then((d: { items: PlaylistTrack[] }) => setTracks(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [playlistId]);

  async function addSong() {
    if (!addingSongId) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/user/playlists/${playlistId}/songs`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ songId: addingSongId }),
      });
      if (res.ok) {
        const d = await res.json() as { item: PlaylistTrack };
        setTracks(prev => [...prev, d.item]);
        setAddingSongId("");
      }
    } finally { setAdding(false); }
  }

  async function removeTrack(trackId: string) {
    await fetch(`/api/playlists/${playlistId}/tracks/${trackId}`, { method: "DELETE", credentials: "include" });
    setTracks(prev => prev.filter(t => t.id !== trackId));
  }

  const addable = userSongs.filter(s => !tracks.some(t => t.song.id === s.id));

  return (
    <div style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px 14px" }}>
      {loading && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>Loading tracks…</div>}
      {!loading && tracks.length === 0 && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>No tracks yet.</div>}
      {tracks.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", minWidth: 18 }}>{t.position + 1}</span>
          <span style={{ flex: 1, fontSize: 11, color: "#fff", fontWeight: 600 }}>{t.song.title}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.song.genre}</span>
          <audio controls preload="none" src={t.song.audioUrl} style={{ height: 24, width: 160 }} />
          <button onClick={() => removeTrack(t.id)} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,68,68,0.3)", background: "transparent", color: "#FF4444", cursor: "pointer", fontWeight: 700 }}>✕</button>
        </div>
      ))}
      {addable.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <select value={addingSongId} onChange={e => setAddingSongId(e.target.value)}
            style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 8px", color: "#fff", fontSize: 11, fontFamily: "inherit" }}>
            <option value="">— add a song —</option>
            {addable.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <button onClick={() => void addSong()} disabled={adding || !addingSongId}
            style={{ fontSize: 9, padding: "5px 12px", borderRadius: 6, border: "none", background: "#AA2DFF", color: "#000", fontWeight: 800, cursor: "pointer", opacity: adding ? 0.6 : 1 }}>
            {adding ? "…" : "ADD"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyContentManager({ accentColor = ACCENT }: { accentColor?: string }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<Tab>("songs");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/content", { credentials: "include" });
      if (res.ok) {
        const d = await res.json() as { songs: Song[]; videos: Video[]; playlists: Playlist[] };
        setSongs(d.songs ?? []);
        setVideos(d.videos ?? []);
        setPlaylists(d.playlists ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function renameSong(id: string, title: string) {
    await fetch(`/api/songs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ title }) });
    setSongs(prev => prev.map(s => s.id === id ? { ...s, title } : s));
    setEditingId(null);
  }

  async function deleteSong(id: string) {
    if (!confirm("Delete this song permanently?")) return;
    await fetch(`/api/songs/${id}`, { method: "DELETE", credentials: "include" });
    setSongs(prev => prev.filter(s => s.id !== id));
  }

  async function toggleSongPrivacy(s: Song) {
    await fetch(`/api/songs/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ isPublic: !s.isPublic }) });
    setSongs(prev => prev.map(x => x.id === s.id ? { ...x, isPublic: !x.isPublic } : x));
  }

  async function renameVideo(id: string, title: string) {
    await fetch(`/api/videos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ title }) });
    setVideos(prev => prev.map(v => v.id === id ? { ...v, title } : v));
    setEditingId(null);
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video permanently?")) return;
    await fetch(`/api/videos/${id}`, { method: "DELETE", credentials: "include" });
    setVideos(prev => prev.filter(v => v.id !== id));
  }

  async function createPlaylist() {
    if (!newPlaylistName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/user/content", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name: newPlaylistName.trim() }) });
      if (res.ok) {
        const d = await res.json() as { playlist: Playlist };
        setPlaylists(prev => [{ ...d.playlist, _count: { items: 0 } }, ...prev]);
        setNewPlaylistName("");
      }
    } finally {
      setCreating(false);
    }
  }

  async function renamePlaylist(id: string, name: string) {
    await fetch(`/api/playlists/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name }) });
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    setEditingId(null);
  }

  async function deletePlaylist(id: string) {
    if (!confirm("Delete this playlist and all its tracks?")) return;
    await fetch(`/api/playlists/${id}`, { method: "DELETE", credentials: "include" });
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }

  async function togglePlaylistPrivacy(p: Playlist) {
    await fetch(`/api/playlists/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ isPublic: !p.isPublic }) });
    setPlaylists(prev => prev.map(x => x.id === p.id ? { ...x, isPublic: !x.isPublic } : x));
  }

  async function toggleMixtape(p: Playlist) {
    await fetch(`/api/playlists/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ isMixtape: !p.isMixtape }) });
    setPlaylists(prev => prev.map(x => x.id === p.id ? { ...x, isMixtape: !x.isMixtape } : x));
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "songs", label: "Songs", count: songs.length },
    { key: "videos", label: "Videos", count: videos.length },
    { key: "playlists", label: "Playlists", count: playlists.length },
  ];

  const row: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    minHeight: 48,
  };

  const actionBtn = (color: string): React.CSSProperties => ({
    fontSize: 9, padding: "4px 10px", borderRadius: 6,
    border: `1px solid ${color}40`, background: `${color}10`,
    color, fontWeight: 800, cursor: "pointer",
  });

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${accentColor}22`, borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800, marginBottom: 12 }}>MY CONTENT</div>
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "6px 14px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800,
                background: tab === t.key ? "rgba(255,255,255,0.06)" : "transparent",
                color: tab === t.key ? "#fff" : "rgba(255,255,255,0.35)",
                borderBottom: tab === t.key ? `2px solid ${accentColor}` : "2px solid transparent",
              }}>
              {t.label} <span style={{ opacity: 0.6 }}>({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ minHeight: 120 }}>
        {loading && <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Loading…</div>}

        {/* SONGS */}
        {!loading && tab === "songs" && (
          <div>
            {songs.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                No songs yet. Upload your first track.
              </div>
            )}
            {songs.map(s => (
              <div key={s.id} style={row}>
                <span style={{ fontSize: 16 }}>🎵</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === s.id
                    ? <InlineEdit value={s.title} onSave={v => renameSong(s.id, v)} onCancel={() => setEditingId(null)} />
                    : (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.genre ?? "—"}{s.bpm ? ` · ${s.bpm} BPM` : ""} · {s.playCount} plays · {fmtDate(s.createdAt)}</div>
                      </div>
                    )}
                </div>
                {editingId !== s.id && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <audio controls preload="none" src={s.audioUrl} style={{ height: 24, width: 170 }} />
                    <button onClick={() => toggleSongPrivacy(s)} style={actionBtn(s.isPublic ? "#00FF88" : "#FF8800")}>{s.isPublic ? "PUBLIC" : "PRIVATE"}</button>
                    <button onClick={() => setEditingId(s.id)} style={actionBtn("#00FFFF")}>EDIT</button>
                    <ShareBar url={`${typeof window !== "undefined" ? window.location.origin : ""}/song/${s.id}`} />
                    <button onClick={() => deleteSong(s.id)} style={actionBtn("#FF4444")}>DELETE</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VIDEOS */}
        {!loading && tab === "videos" && (
          <div>
            {videos.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                No videos yet. Upload your first video.
              </div>
            )}
            {videos.map(v => (
              <div key={v.id} style={row}>
                <span style={{ fontSize: 16 }}>🎬</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === v.id
                    ? <InlineEdit value={v.title} onSave={t => renameVideo(v.id, t)} onCancel={() => setEditingId(null)} />
                    : (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{v.genre ?? "—"} · {v.viewCount} views · {fmtDate(v.createdAt)}</div>
                      </div>
                    )}
                </div>
                {editingId !== v.id && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setEditingId(v.id)} style={actionBtn("#00FFFF")}>EDIT</button>
                    <ShareBar url={`${typeof window !== "undefined" ? window.location.origin : ""}/video/${v.id}`} />
                    <button onClick={() => deleteVideo(v.id)} style={actionBtn("#FF4444")}>DELETE</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PLAYLISTS */}
        {!loading && tab === "playlists" && (
          <div>
            {/* Create new playlist */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8 }}>
              <input
                value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="New playlist name…"
                onKeyDown={e => { if (e.key === "Enter") void createPlaylist(); }}
                style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 12px", color: "#fff", fontSize: 12, fontFamily: "inherit" }}
              />
              <button onClick={() => void createPlaylist()} disabled={creating || !newPlaylistName.trim()}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: accentColor, color: "#000", fontWeight: 800, fontSize: 10, cursor: "pointer", opacity: creating ? 0.6 : 1 }}>
                {creating ? "…" : "+ CREATE"}
              </button>
            </div>

            {playlists.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No playlists yet. Create your first one above.</div>
            )}
            {playlists.map(p => (
              <div key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", minHeight: 48 }}>
                  <span style={{ fontSize: 16 }}>{p.isMixtape ? "📼" : "🎵"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingId === p.id
                      ? <InlineEdit value={p.name} onSave={n => renamePlaylist(p.id, n)} onCancel={() => setEditingId(null)} />
                      : (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>{p.name}{p.isMixtape ? " 📼" : ""}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{p._count.items} tracks · {fmtDate(p.createdAt)}</div>
                        </div>
                      )}
                  </div>
                  {editingId !== p.id && (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button onClick={() => setExpandedPlaylistId(expandedPlaylistId === p.id ? null : p.id)} style={actionBtn(expandedPlaylistId === p.id ? accentColor : "rgba(255,255,255,0.4)")}>
                        {expandedPlaylistId === p.id ? "▲ TRACKS" : "▼ TRACKS"}
                      </button>
                      <button onClick={() => togglePlaylistPrivacy(p)} style={actionBtn(p.isPublic ? "#00FF88" : "#FF8800")}>{p.isPublic ? "PUBLIC" : "PRIVATE"}</button>
                      <button onClick={() => toggleMixtape(p)} style={actionBtn(p.isMixtape ? "#FFD700" : "rgba(255,255,255,0.3)")}>{p.isMixtape ? "MIXTAPE ✓" : "MIXTAPE"}</button>
                      <button onClick={() => setEditingId(p.id)} style={actionBtn("#00FFFF")}>RENAME</button>
                      {p.shareToken && <ShareBar url={`${typeof window !== "undefined" ? window.location.origin : ""}/playlist/share/${p.shareToken}`} />}
                      <button onClick={() => deletePlaylist(p.id)} style={actionBtn("#FF4444")}>DELETE</button>
                    </div>
                  )}
                </div>
                {expandedPlaylistId === p.id && <PlaylistTracksPanel playlistId={p.id} userSongs={songs} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
