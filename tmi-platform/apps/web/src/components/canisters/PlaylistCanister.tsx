"use client";

/**
 * PlaylistCanister — Phase 5.4 High-Fidelity Cyberpunk Music Player
 * 3-Column Glassmorphic Deck:
 *   Left: Glowing Neon Turntable / Visualizer & Transport Controls
 *   Center: Playlist Library Grid (real playlists via /api/user/content)
 *   Right: Now Playing Tracklist + Equalizer
 *
 * All playlist/track data is real (Prisma Playlist/PlaylistItem/Song via
 * /api/user/content + /api/user/playlists/[id]/songs) — no fabricated
 * "Hustle & Flow / MarcelID" now-playing state (Rule 20). Honest empty
 * states when the user has no playlists or a selected playlist is empty.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { sanitizePublicDisplayLabel } from "@/lib/auth/resolveSessionIdentity";
import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";
import {
  sendPlaybackCommand,
  subscribePlaybackCommands,
  syncNowPlaying,
  syncPlaylistQueue,
} from "@/lib/playlists/commandCenterPlaybackBus";
import { resolvePlaylistLibraryHeader } from "@/lib/playlists/playlistLibraryDisplayName";
import { useAudio } from "@/components/AudioProvider";
import { resolveDurablePlayableSrc } from "@/lib/media/durablePlayableUrl";
import { officialSunoEmbedUrl, parseSunoShareUrl } from "@/lib/media/MediaIngestionService";
import { classifySongRealm, songRealmCompetitionHref } from "@/lib/challenge/SongRealmAuthority";
import SpatialAlbumReleaseViewport from "@/components/media/SpatialAlbumReleaseViewport";
import AdRail from "@/components/monetization/AdRail";
import MediaUrlImporter from "@/components/media/MediaUrlImporter";
import MediaImportComposer from "@/components/media/MediaImportComposer";
import MusicCollectionLibrary, {
  type MusicCollectionCard,
} from "@/components/media/MusicCollectionLibrary";
import PlaylistSharePanel from "@/components/playlists/PlaylistSharePanel";
import PlaylistArtworkPicker from "@/components/playlists/PlaylistArtworkPicker";
import Link from "next/link";
import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  canEquipChassis,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  equipChassisApi,
  ensureDefaultMediaPlayer,
  getEquippedChassisId,
  getOwnedChassisIds,
  hydrateMediaPlayerOwnership,
  subscribeMediaPlayerInventory,
  unequipChassisApi,
} from "@/lib/artifacts/MediaPlayerInventory";
import { normalizeMembershipTier } from "@/registries/eos/MembershipRegistry";

const FREE_SKIN_IDS: MediaPlayerChassisId[] = [
  FREE_DEFAULT_CHASSIS_ID,
  "tmi_classic",
  "tmi_dark",
  "tmi_neon",
];

interface ApiPlaylistSummary {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  shareToken?: string | null;
  isPublic?: boolean;
  isMixtape?: boolean;
  _count?: { items: number };
}

interface ApiSong {
  id: string;
  title: string;
  audioUrl?: string | null;
  coverUrl?: string | null;
  genre?: string | null;
  bpm?: number | null;
}

interface UserLibrarySong {
  id: string;
  title: string;
  genre?: string | null;
  audioUrl?: string | null;
}

interface PlaylistCanisterProps {
  entityId: string;
  entityName?: string;
  accentColor?: string;
  isOwner?: boolean;
  role?: "fan" | "performer";
  initialPlaylistId?: string | null;
  /** compact = under-dock library strip; full = 3-column canister deck */
  layout?: "compact" | "full";
}

const CARD_ACCENTS = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#00FF88", "#FF0055"];

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || !Number.isFinite(seconds)) return "—:—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PlaylistCanister({
  entityId,
  entityName,
  accentColor = "#FF5500",
  isOwner = false,
  role = "fan",
  initialPlaylistId = null,
  layout = "full",
}: PlaylistCanisterProps) {
  const isCompact = layout === "compact";
  const [isMobile, setIsMobile] = useState(true); // mobile-first: avoids 3-column overflow on phones
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialPlaylistId);
  const [tracks, setTracks] = useState<ApiSong[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [sunoEmbedUrl, setSunoEmbedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [eqGains, setEqGains] = useState<number[]>(new Array(9).fill(50));
  const [shareOpen, setShareOpen] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [userLibrarySongs, setUserLibrarySongs] = useState<UserLibrarySong[]>([]);
  const [addingSongId, setAddingSongId] = useState("");
  const [addingSong, setAddingSong] = useState(false);
  const [linkImportOpen, setLinkImportOpen] = useState(false);
  const [addComposerOpen, setAddComposerOpen] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [artworkPickerOpen, setArtworkPickerOpen] = useState(false);
  const [playlistActionMsg, setPlaylistActionMsg] = useState<string | null>(null);
  const [sessionUsername, setSessionUsername] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [ownerLabel, setOwnerLabel] = useState<string | null>(null);
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [accountTier, setAccountTier] = useState("FREE");
  const [ownedChassisIds, setOwnedChassisIds] = useState<MediaPlayerChassisId[]>([...FREE_SKIN_IDS]);
  const [equippedChassisId, setEquippedChassisId] = useState<MediaPlayerChassisId>(FREE_DEFAULT_CHASSIS_ID);
  const [skinOwnedTick, setSkinOwnedTick] = useState(0);
  const [skinActionMsg, setSkinActionMsg] = useState<string | null>(null);
  const [libraryView, setLibraryView] = useState<"playlists" | "library" | "yoAlbums">("playlists");
  const [librarySongs, setLibrarySongs] = useState<ApiSong[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const skinsSectionRef = useRef<HTMLDivElement | null>(null);
  const {
    pause: pauseGlobal,
    seek: seekGlobal,
    setVolume: setVolumeGlobal,
    toggleMute: toggleMuteGlobal,
    loadQueue: loadQueueGlobal,
    addToPlaylist: addToQueueGlobal,
  } = useAudio();

  const selectedPlaylist = useMemo(
    () => playlists.find((p) => p.id === selectedId) ?? null,
    [playlists, selectedId],
  );

  const libraryHeader = useMemo(
    () =>
      resolvePlaylistLibraryHeader({
        activePlaylistName: selectedPlaylist?.name,
        role,
      }),
    [selectedPlaylist?.name, role],
  );

  const publicOwnerName = useMemo(() => {
    const base = ownerLabel ?? entityName;
    return sanitizePublicDisplayLabel(base, { email: sessionEmail, userId: entityId });
  }, [ownerLabel, entityName, sessionEmail, entityId]);

  // Mobile detection — matchMedia is immune to layout-overflow inflating window.innerWidth
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const check = () => setIsMobile(mql.matches);
    check();
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;
    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
        if (!sessionRes.ok || cancelled) return;
        const sessionData = (await sessionRes.json()) as {
          user?: { id?: string; name?: string; email?: string; tier?: string };
          tier?: string;
        };
        const email = sessionData.user?.email ?? null;
        if (!cancelled) {
          setSessionEmail(email);
          setAccountTier(sessionData.user?.tier ?? sessionData.tier ?? "FREE");
        }

        let profileName: string | null = sessionData.user?.name?.trim() ?? null;
        let username: string | null = null;
        const profileRes = await fetch("/api/user/profile", { credentials: "include", cache: "no-store" });
        if (profileRes.ok) {
          const profileData = (await profileRes.json()) as {
            profile?: { displayName?: string | null; username?: string | null; handle?: string | null };
            username?: string | null;
            handle?: string | null;
          };
          profileName = profileData.profile?.displayName?.trim() ?? profileName;
          username =
            profileData.profile?.username?.trim() ||
            profileData.profile?.handle?.trim() ||
            profileData.username?.trim() ||
            profileData.handle?.trim() ||
            null;
        }
        if (!cancelled && profileName) setOwnerLabel(profileName);
        if (!cancelled) setSessionUsername(username);
      } catch {
        /* keep prop fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOwner]);

  // Media-player skins (chassis) — same inventory as PlaylistStudioContent MY PLAYLIST SKINS
  useEffect(() => {
    if (!isOwner) return;
    return subscribeMediaPlayerInventory(() => {
      setOwnedChassisIds(getOwnedChassisIds(entityId));
      setEquippedChassisId(getEquippedChassisId(entityId));
    });
  }, [isOwner, entityId]);

  useEffect(() => {
    if (!isOwner) return;
    let active = true;
    ensureDefaultMediaPlayer(entityId);
    void hydrateMediaPlayerOwnership(entityId).then((state) => {
      if (!active) return;
      setEquippedChassisId(state.equippedChassisId);
      setOwnedChassisIds(state.ownedChassisIds);
    });
    return () => {
      active = false;
    };
  }, [isOwner, entityId, skinOwnedTick]);

  const loadLibrarySongs = useCallback(async () => {
    setLoadingLibrary(true);
    setLibraryError(null);
    try {
      const res = await fetch(`/api/media/library?ownerId=${encodeURIComponent(entityId)}&type=song`, { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("library_unavailable");
      const data = (await res.json()) as { ok?: boolean; assets?: Array<{ id: string; title: string; url?: string | null; genre?: string | null; metadata?: { coverUrl?: string | null } }> };
      const songs: ApiSong[] = (data.assets ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        audioUrl: a.url ?? null,
        coverUrl: a.metadata?.coverUrl ?? null,
        genre: a.genre ?? null,
        bpm: null,
      }));
      setLibrarySongs(songs);
    } catch {
      setLibraryError("Could not load your media library right now.");
    } finally {
      setLoadingLibrary(false);
    }
  }, [entityId]);

  useEffect(() => {
    void loadLibrarySongs();
  }, [loadLibrarySongs]);

  const playLibrarySong = useCallback(
    (clickedIndex: number) => {
      const song = librarySongs[clickedIndex];
      const suno = parseSunoShareUrl(song?.audioUrl);
      if (suno) {
        setSunoEmbedUrl(suno.officialEmbedUrl);
        return;
      }
      const asTracks = librarySongs
        .map((item) => {
          const url = resolveDurablePlayableSrc(item.audioUrl ?? null);
          return url ? { id: item.id, title: item.title, artist: libraryHeader, duration: 0, url, artwork: item.coverUrl ?? undefined } : null;
        })
        .filter((t): t is NonNullable<typeof t> => t !== null);
      void loadQueueGlobal(asTracks, clickedIndex);
    },
    [librarySongs, libraryHeader, loadQueueGlobal],
  );

  const addLibrarySongToQueue = useCallback(
    (song: ApiSong) => {
      const url = resolveDurablePlayableSrc(song.audioUrl ?? null);
      if (!url) return;
      addToQueueGlobal({ id: song.id, title: song.title, artist: libraryHeader, duration: 0, url, artwork: song.coverUrl ?? undefined });
    },
    [libraryHeader, addToQueueGlobal],
  );

  const membershipTier = useMemo(() => normalizeMembershipTier(accountTier), [accountTier]);

  const equippableSkins = useMemo(() => {
    void skinOwnedTick;
    const ids = (Object.keys(MEDIA_PLAYER_CHASSIS_REGISTRY) as MediaPlayerChassisId[]).filter((id) =>
      canEquipChassis(id, membershipTier as Parameters<typeof canEquipChassis>[1], ownedChassisIds),
    );
    return ids.map((id) => MEDIA_PLAYER_CHASSIS_REGISTRY[id]).filter(Boolean);
  }, [membershipTier, ownedChassisIds, skinOwnedTick]);

  const equipOwnedSkin = useCallback(
    (skinId: MediaPlayerChassisId) => {
      const c = MEDIA_PLAYER_CHASSIS_REGISTRY[skinId];
      if (!c) return;
      const equipped = equippedChassisId === skinId;
      void (async () => {
        if (equipped) {
          await unequipChassisApi(entityId);
          setSkinActionMsg(`Unequipped ${c.label} · Standard active.`);
        } else {
          const r = await equipChassisApi(entityId, skinId);
          setSkinActionMsg(r.ok ? `Equipped ${c.label}.` : r.message ?? "Cannot equip");
        }
        setSkinOwnedTick((n) => n + 1);
        setEquippedChassisId(getEquippedChassisId(entityId));
      })();
    },
    [entityId, equippedChassisId],
  );

  useEffect(() => {
    const onFocus = (e: Event) => {
      const section = (e as CustomEvent<{ section?: string }>).detail?.section;
      if (section === "skins") {
        window.setTimeout(() => {
          skinsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 120);
      }
    };
    window.addEventListener("tmi:playlist-studio-focus", onFocus);
    return () => window.removeEventListener("tmi:playlist-studio-focus", onFocus);
  }, []);

  const editDisplayName = async () => {
    const next = window.prompt("Your display name on playlists and casts:", publicOwnerName);
    if (!next?.trim() || next.trim() === publicOwnerName) return;
    setSavingDisplayName(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName: next.trim() }),
      });
      if (res.ok) {
        setOwnerLabel(next.trim());
        window.dispatchEvent(
          new CustomEvent("tmi:display-name-updated", { detail: { name: next.trim() } }),
        );
      }
    } finally {
      setSavingDisplayName(false);
    }
  };

  const activeTrack = tracks[currentTrackIndex] ?? null;
  const playableUrl = resolveDurablePlayableSrc(activeTrack?.audioUrl ?? null);

  useEffect(() => {
    if (!activeTrack || !playableUrl) {
      if (isPlaying) setIsPlaying(false);
      return;
    }
    if (isPlaying) {
      // Converge onto the canonical AudioProvider queue instead of only handing it one
      // track at a time — other useAudio() consumers (TmiMusicMiniPlayer, RemoteQuickPanel)
      // see this playlist as the real shared queue, not an empty/stale one.
      // Playback context attaches atomically with this exact play command (owner
      // correction 2026-10-29) — this IS a real saved user playlist
      // (/api/user/playlists/:id/songs), not a bare DIRECT play, so discoverySource
      // is PLAYLIST with the real playlistId, and mediaId is the real Song.id.
      void loadQueueGlobal(
        tracks
          .map((song) => {
            const url = resolveDurablePlayableSrc(song.audioUrl ?? null);
            return url
              ? { id: song.id, title: song.title, artist: libraryHeader, duration: 0, url, artwork: song.coverUrl ?? undefined }
              : null;
          })
          .filter((t): t is NonNullable<typeof t> => t !== null),
        currentTrackIndex,
        activeTrack
          ? { mediaId: activeTrack.id, mediaType: 'SONG', discoverySource: 'PLAYLIST', playlistId: selectedId ?? undefined }
          : undefined,
      );
    }
  }, [isPlaying, playableUrl, activeTrack, libraryHeader, tracks, currentTrackIndex, loadQueueGlobal]);

  const togglePlayback = useCallback(() => {
    setIsPlaying((p) => {
      if (p) pauseGlobal();
      return !p;
    });
  }, [pauseGlobal]);

  useEffect(() => {
    return subscribePlaybackCommands((payload) => {
      const { command } = payload;
      if (command === "toggle") togglePlayback();
      else if (command === "play") setIsPlaying(true);
      else if (command === "pause") {
        pauseGlobal();
        setIsPlaying(false);
      } else if (command === "prev") setCurrentTrackIndex((prev) => Math.max(0, prev - 1));
      else if (command === "next") {
        setCurrentTrackIndex((prev) => Math.min(Math.max(tracks.length - 1, 0), prev + 1));
      } else if (command === "select-playlist" && payload.playlistId) {
        setSelectedId(payload.playlistId);
      } else if (command === "select-track") {
        if (payload.trackIndex != null) setCurrentTrackIndex(payload.trackIndex);
        else if (payload.trackId) {
          const idx = tracks.findIndex((t) => t.id === payload.trackId);
          if (idx >= 0) setCurrentTrackIndex(idx);
        }
        setIsPlaying(true);
      } else if (command === "seek" && payload.seekRatio != null) {
        seekGlobal(payload.seekRatio * 240);
      } else if (command === "rewind" && payload.seekDeltaSec != null) {
        seekGlobal(Math.max(0, (payload.seekRatio ?? 0) - payload.seekDeltaSec));
      } else if (command === "forward" && payload.seekDeltaSec != null) {
        seekGlobal((payload.seekRatio ?? 0) + payload.seekDeltaSec);
      } else if (command === "volume" && payload.volume != null) {
        setVolumeGlobal(payload.volume);
      } else if (command === "mute") {
        toggleMuteGlobal();
      } else if (command === "unmute") {
        setVolumeGlobal(0.7);
      }
    });
  }, [tracks, togglePlayback, pauseGlobal, seekGlobal, setVolumeGlobal, toggleMuteGlobal]);

  useEffect(() => {
    if (!selectedId) return;
    if (!activeTrack) {
      syncNowPlaying({
        playlistId: selectedId,
        title: "",
        artist: libraryHeader,
        isPlaying: false,
      });
      return;
    }
    syncNowPlaying({
      playlistId: selectedId,
      trackId: activeTrack.id,
      title: activeTrack.title,
      artist: libraryHeader,
      coverUrl: activeTrack.coverUrl,
      audioUrl: playableUrl,
      isPlaying,
    });
    castPlaylistToMonitor({
      playlistId: selectedId,
      trackId: activeTrack.id,
      title: activeTrack.title,
      artist: libraryHeader,
      coverUrl: activeTrack.coverUrl,
      audioUrl: playableUrl,
      targetMonitorId: "mon-a",
    });
  }, [selectedId, activeTrack, isPlaying, libraryHeader, playableUrl]);

  useEffect(() => {
    syncPlaylistQueue({
      playlists: playlists.map((p) => ({
        id: p.id,
        name: p.name,
        trackCount: p._count?.items ?? 0,
      })),
      selectedPlaylistId: selectedId,
      tracks: tracks.map((t) => ({ id: t.id, title: t.title, artist: libraryHeader })),
      currentTrackIndex,
      isPlaying,
    });
  }, [playlists, selectedId, tracks, currentTrackIndex, isPlaying, libraryHeader]);

  const filteredPlaylists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter((p) => p.name.toLowerCase().includes(q));
  }, [playlists, searchQuery]);

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tracks, searchQuery]);
  const loadPlaylists = useCallback(async () => {
    setLoadingPlaylists(true);
    try {
      const res = await fetch("/api/user/content", { cache: "no-store", credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { playlists?: ApiPlaylistSummary[]; songs?: UserLibrarySong[] };
        const list = data.playlists ?? [];
        setPlaylists(list);
        setSelectedId((prev) => prev ?? list[0]?.id ?? null);
        if (isOwner) setUserLibrarySongs(data.songs ?? []);
      }
    } catch {
      /* honest fallback: empty playlist state */
    } finally {
      setLoadingPlaylists(false);
    }
  }, [isOwner]);

  useEffect(() => {
    void loadPlaylists();
  }, [loadPlaylists]);

  // ── Load real tracks for the selected playlist ────────────────────────
  useEffect(() => {
    if (!selectedId) {
      setTracks([]);
      setCurrentTrackIndex(0);
      return;
    }
    let cancelled = false;
    setLoadingTracks(true);
    (async () => {
      try {
        const res = await fetch(`/api/user/playlists/${selectedId}/songs`, { cache: "no-store", credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as { items?: { song: ApiSong }[] };
        setTracks((data.items ?? []).map((i) => i.song));
        setCurrentTrackIndex(0);
      } catch {
        if (!cancelled) setTracks([]);
      } finally {
        if (!cancelled) setLoadingTracks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const reloadSelectedTracks = useCallback(async () => {
    if (!selectedId) return;
    setLoadingTracks(true);
    try {
      const res = await fetch(`/api/user/playlists/${selectedId}/songs`, { cache: "no-store", credentials: "include" });
      if (!res.ok) return;
      const data = await res.json() as { items?: { song: ApiSong }[] };
      setTracks((data.items ?? []).map((i) => i.song));
    } catch {
      setTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  }, [selectedId]);

  const createPlaylist = async (nameOverride?: string) => {
    const name = (nameOverride ?? newPlaylistName).trim();
    if (!name) {
      setPlaylistActionMsg("Enter a playlist name first.");
      return;
    }
    setCreatingPlaylist(true);
    setPlaylistActionMsg(null);
    try {
      const res = await fetch("/api/user/content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json() as { playlist: { id: string; name: string } };
        await loadPlaylists();
        setSelectedId(data.playlist.id);
        setNewPlaylistName("");
        setPlaylistActionMsg(`Created playlist "${data.playlist.name}". Add songs below.`);
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setPlaylistActionMsg(err.error ?? "Could not create playlist. Sign in and try again.");
      }
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const addSongToSelectedPlaylist = async (songIdOverride?: string) => {
    const songId = songIdOverride ?? addingSongId;
    if (!songId) return;
    if (!selectedId) {
      setAddingSongId(songId);
      setLibraryView("playlists");
      setPlaylistActionMsg("Choose a playlist, then add this library item. The song stays in your Library either way.");
      return;
    }
    setAddingSong(true);
    setPlaylistActionMsg(null);
    try {
      const res = await fetch(`/api/user/playlists/${selectedId}/songs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ songId }),
      });
      if (res.ok) {
        const added =
          userLibrarySongs.find((s) => s.id === songId) ??
          librarySongs.find((s) => s.id === songId);
        await reloadSelectedTracks();
        await loadPlaylists();
        await loadLibrarySongs();
        setAddingSongId("");
        setPlaylistActionMsg(added ? `Added "${added.title}" to this playlist. Still in your Library.` : "Song added to playlist. Still in your Library.");
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setPlaylistActionMsg(err.error ?? "Could not add song to playlist.");
      }
    } finally {
      setAddingSong(false);
    }
  };

  const addableLibrarySongs = useMemo(() => {
    const byId = new Map<string, UserLibrarySong>();
    for (const s of userLibrarySongs) byId.set(s.id, s);
    for (const s of librarySongs) {
      if (!byId.has(s.id)) byId.set(s.id, { id: s.id, title: s.title, genre: s.genre, audioUrl: s.audioUrl });
    }
    return [...byId.values()].filter((s) => !tracks.some((t) => t.id === s.id));
  }, [userLibrarySongs, librarySongs, tracks]);

  const skinsSection = isOwner ? (
    <div
      ref={skinsSectionRef}
      data-playlist-skins-section
      style={{
        background: "rgba(10,5,25,0.65)",
        border: "1px solid rgba(170,45,255,0.35)",
        borderRadius: 12,
        padding: isCompact ? 10 : 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontSize: isCompact ? 9 : 10,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#AA2DFF",
          }}
        >
          MY PLAYLIST SKINS
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          Player appearance — not playlist content. Switching skins never resets your playlists.
        </div>
      </div>
      {equippableSkins.length === 0 ? (
        <div
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.45)",
            padding: "10px 8px",
            borderRadius: 8,
            border: "1px dashed rgba(255,255,255,0.15)",
            lineHeight: 1.45,
          }}
        >
          No player styles unlocked yet. Free styles appear after sign-in.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {equippableSkins.map((c) => {
            const equipped = equippedChassisId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => equipOwnedSkin(c.id)}
                style={{
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  padding: "6px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                  border: equipped ? `1px solid ${c.accent}` : "1px solid rgba(255,255,255,0.12)",
                  background: equipped ? `${c.accent}22` : "rgba(255,255,255,0.03)",
                  color: equipped ? c.accent : "rgba(255,255,255,0.55)",
                  fontFamily: "inherit",
                }}
              >
                {c.icon} {c.label.replace(/^TMI /, "")}
                {equipped ? " · ACTIVE" : ""}
              </button>
            );
          })}
        </div>
      )}
      {skinActionMsg ? (
        <div
          style={{
            fontSize: 10,
            color:
              skinActionMsg.includes("Cannot") || skinActionMsg.includes("Not enough")
                ? "#ffb0b0"
                : "#9dffc8",
            lineHeight: 1.4,
          }}
        >
          {skinActionMsg}
        </div>
      ) : null}
    </div>
  ) : null;

  const openShare = () => {
    if (!selectedId) {
      setPlaylistActionMsg("Select a playlist to share.");
      return;
    }
    setShareOpen(true);
  };

  const patchPlaylistMeta = async (patch: { coverUrl?: string; isPublic?: boolean; name?: string }) => {
    if (!selectedId || !isOwner) return;
    const res = await fetch(`/api/playlists/${selectedId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? "Could not update playlist.");
    }
    await loadPlaylists();
  };

  const openArtworkPicker = (playlistId?: string) => {
    if (!isOwner) return;
    if (playlistId) setSelectedId(playlistId);
    else if (!selectedId) {
      setPlaylistActionMsg("Select a playlist to set cover art.");
      return;
    }
    setArtworkPickerOpen(true);
  };

  const savePlaylistArtwork = async (coverUrl: string) => {
    if (!selectedId || !isOwner) return;
    setCoverBusy(true);
    setPlaylistActionMsg(null);
    try {
      await patchPlaylistMeta({ coverUrl });
      setPlaylistActionMsg("Playlist cover updated.");
      setArtworkPickerOpen(false);
    } catch (e) {
      setPlaylistActionMsg(e instanceof Error ? e.message : "Cover update failed.");
      throw e;
    } finally {
      setCoverBusy(false);
    }
  };

  const saveSharedPlaylistToLibrary = async () => {
    if (!selectedId) return;
    const res = await fetch(`/api/playlists/${selectedId}/save`, {
      method: "POST",
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; playlist?: { id: string; name: string } };
    if (!res.ok) throw new Error(data.error ?? "Could not save playlist.");
    await loadPlaylists();
    if (data.playlist?.id) setSelectedId(data.playlist.id);
    setPlaylistActionMsg(data.playlist ? `Saved "${data.playlist.name}" to My Library.` : "Saved to My Library.");
  };

  const castSelected = () => {
    if (!selectedId || !activeTrack) return;
    castPlaylistToMonitor({
      playlistId: selectedId,
      trackId: activeTrack.id,
      title: activeTrack.title,
      artist: libraryHeader,
      targetMonitorId: "mon-a",
    });
  };

  if (isCompact) {
    return (
      <div
        data-playlist-canister-compact
        style={{
          background: "rgba(5,3,16,0.88)",
          border: `1px solid ${accentColor}55`,
          borderRadius: 10,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
        }}
      >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: accentColor }}>
            {libraryHeader}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {isOwner ? (
              <button type="button" data-testid="playlist-add-open-compact" onClick={() => setAddComposerOpen(true)} style={actionBtn("#00FF88")}>
                + ADD
              </button>
            ) : null}
            <button type="button" onClick={() => void openShare()} disabled={!selectedId} style={actionBtn("#00FFFF")}>
              ↗ SHARE
            </button>
            <button type="button" onClick={() => sendPlaybackCommand("open-full")} style={actionBtn("#FFD700")}>
              EXPAND ⛶
            </button>
          </div>
        </div>
        {isOwner && addComposerOpen ? (
          <MediaImportComposer
            role={role}
            accentColor={accentColor}
            playlists={playlists.map((p) => ({
              id: p.id,
              name: p.name,
              trackCount: p._count?.items,
              isMixtape: p.isMixtape,
            }))}
            libraryTracks={[...userLibrarySongs, ...librarySongs].filter(
              (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i,
            )}
            defaultPlaylistId={selectedId}
            onClose={() => setAddComposerOpen(false)}
            onRefreshLibrary={() => {
              void loadLibrarySongs();
              void loadPlaylists();
            }}
            onRefreshPlaylists={() => void loadPlaylists()}
            onCompleted={(result) => {
              if (result.playlistId) setSelectedId(result.playlistId);
              setPlaylistActionMsg(
                result.destination === "single"
                  ? "Saved as Single in Media Library."
                  : `Saved to ${result.playlistName ?? result.destination}.`,
              );
              void reloadSelectedTracks();
            }}
          />
        ) : null}
        {isOwner ? (
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name…"
              onKeyDown={(e) => { if (e.key === "Enter") void createPlaylist(); }}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "6px 8px",
                borderRadius: 6,
                border: `1px solid ${accentColor}44`,
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
                fontSize: 9,
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
        ) : null}
        {playlistActionMsg ? (
          <div style={{ fontSize: 9, color: playlistActionMsg.includes("Could not") ? "#ffb0b0" : "#9dffc8", lineHeight: 1.4 }}>
            {playlistActionMsg}
          </div>
        ) : null}
        <input
          type="search"
          placeholder="Search songs / playlists…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            border: `1px solid ${accentColor}44`,
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 9,
            boxSizing: "border-box",
          }}
        />
        {searchQuery.trim() && filteredPlaylists.length === 0 && filteredTracks.length === 0 ? (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
            {`No results for '${searchQuery.trim()}'`}
          </div>
        ) : null}
        {loadingPlaylists ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "8px 0" }}>Loading playlists…</div>
        ) : playlists.length === 0 ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "8px 0" }}>
            No playlists yet. Create one to start playback in the mini player above.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {(searchQuery.trim() ? filteredPlaylists : playlists).map((pl, i) => {
              const active = pl.id === selectedId;
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedId(pl.id)}
                  style={{
                    flexShrink: 0,
                    minWidth: 120,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
                    background: active ? `${accent}22` : "rgba(255,255,255,0.03)",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {pl.name}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {pl._count?.items ?? 0} tracks
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
          {loadingTracks ? (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Loading tracks…</div>
          ) : tracks.length === 0 ? (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Select a playlist with tracks to play.</div>
          ) : (
            tracks.slice(0, 8).map((track, idx) => (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setIsPlaying(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "5px 8px",
                  borderRadius: 6,
                  border:
                    idx === currentTrackIndex
                      ? `1px solid ${accentColor}88`
                      : "1px solid rgba(255,255,255,0.06)",
                  background: idx === currentTrackIndex ? `${accentColor}18` : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {track.title}
                </span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
                  {idx === currentTrackIndex && isPlaying ? "▶" : ""}
                </span>
              </button>
            ))
          )}
        </div>
        {isOwner && selectedId ? (
          addableLibrarySongs.length > 0 ? (
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <select
                value={addingSongId}
                onChange={(e) => setAddingSongId(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "rgba(255,255,255,0.07)",
                  border: `1px solid ${accentColor}44`,
                  borderRadius: 6,
                  padding: "5px 8px",
                  color: "#fff",
                  fontSize: 9,
                  fontFamily: "inherit",
                }}
              >
                <option value="">— add a song —</option>
                {addableLibrarySongs.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void addSongToSelectedPlaylist()}
                disabled={addingSong || !addingSongId}
                style={actionBtn("#AA2DFF")}
              >
                {addingSong ? "…" : "ADD"}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.4 }}>
              {userLibrarySongs.length === 0
                ? role === "performer"
                  ? "Use UPLOAD FILE or PASTE LINK above, then add from your library here."
                  : "Use 1 · UPLOAD FILE or 2 · PASTE LINK above, then 3 · ADD FROM YOUR LIBRARY."
                : "All your uploaded songs are already in this playlist."}
            </div>
          )
        ) : null}
        {skinsSection}
        {activeTrack && !playableUrl && parseSunoShareUrl(activeTrack.audioUrl) ? (
          <iframe
            title="Suno official player"
            src={officialSunoEmbedUrl(parseSunoShareUrl(activeTrack.audioUrl)!.trackId)}
            width="100%"
            height="140"
            style={{ border: 0, borderRadius: 8 }}
            allow="autoplay; encrypted-media; fullscreen"
          />
        ) : activeTrack && !playableUrl ? (
          <div style={{ fontSize: 9, color: "rgba(255,180,180,0.8)", padding: "4px 0" }}>
            No playable audio for this track.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      data-playlist-canister-full="true"
      style={{
        background: "rgba(5,3,16,0.92)",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 14,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 0 30px ${accentColor}33`,
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${accentColor}, #AA2DFF)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🎵
          </div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>NOW PLAYING</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>
              {activeTrack ? (
                <>
                  {activeTrack.title}
                  <span style={{ color: "#00FFFF", fontSize: 11 }}> · {libraryHeader}</span>
                </>
              ) : (
                <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>No track selected</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button type="button" onClick={() => void openShare()} disabled={!selectedId} style={actionBtn("#00FFFF")}>
                ↗ SHARE
              </button>
          <button type="button" onClick={castSelected} disabled={!activeTrack} style={actionBtn("#FFD700")}>
            📺 CAST TO MONITOR
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
            Library: <strong style={{ color: "#00FF88" }}>{libraryHeader}</strong>
            {isOwner && publicOwnerName ? (
              <>
                <span style={{ opacity: 0.35 }}>·</span>
                <span style={{ fontSize: 9 }}>Curator: {publicOwnerName}</span>
                <button
                  type="button"
                  disabled={savingDisplayName}
                  onClick={() => void editDisplayName()}
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: "1px solid rgba(0,255,255,0.35)",
                    background: "transparent",
                    color: "#00FFFF",
                    cursor: savingDisplayName ? "wait" : "pointer",
                  }}
                >
                  {savingDisplayName ? "…" : "EDIT NAME"}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* 3-Column Main Content Deck — stacks to single column on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "320px minmax(0, 1fr) 300px",
          gap: 12,
          minHeight: isMobile ? undefined : 440,
        }}
      >
        {/* LEFT COLUMN: Glowing Neon Vinyl Turntable & Transport */}
        <div
          style={{
            background: "rgba(10,5,25,0.7)",
            border: `1px solid ${accentColor}4d`,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tier 2 Spatial 3D Release Object — Inspectable Album Viewport */}
          <div style={{ width: "100%", marginBottom: 6 }}>
            <SpatialAlbumReleaseViewport
              title={activeTrack?.title}
              artist={libraryHeader}
              coverUrl={activeTrack?.coverUrl}
              isPlaying={isPlaying}
              accentColor={accentColor}
            />
          </div>

          <div style={{ width: "100%", textAlign: "center", marginTop: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{activeTrack?.title ?? "—"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{libraryHeader}</div>

            <div style={{ display: "flex", gap: 3, height: 24, alignItems: "center", justifyContent: "center", margin: "12px 0 6px" }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: isPlaying ? `${Math.sin(i + Date.now() / 200) * 10 + 14}px` : "6px",
                    background: i % 2 === 0 ? "#00FFFF" : accentColor,
                    borderRadius: 2,
                    transition: "height 0.1s ease",
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              {activeTrack ? formatDuration(null) : "—:— / —:—"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 10 }}>
            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={() => setCurrentTrackIndex((prev) => Math.max(0, prev - 1))}
              style={transportBtn()}
            >
              ⏮
            </button>
            <button
              type="button"
              disabled={!activeTrack}
              onClick={togglePlayback}
              style={transportMainBtn()}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={() => setCurrentTrackIndex((prev) => Math.min(tracks.length - 1, prev + 1))}
              style={transportBtn()}
            >
              ⏭
            </button>
          </div>
          {activeTrack && !playableUrl && parseSunoShareUrl(activeTrack.audioUrl) ? (
            <iframe
              title="Suno official player"
              src={officialSunoEmbedUrl(parseSunoShareUrl(activeTrack.audioUrl)!.trackId)}
              width="100%"
              height="140"
              style={{ border: 0, borderRadius: 8, marginTop: 8 }}
              allow="autoplay; encrypted-media; fullscreen"
            />
          ) : activeTrack && !playableUrl ? (
            <div style={{ fontSize: 9, color: "rgba(255,180,180,0.8)" }}>
              No playable audio for this track.
            </div>
          ) : null}
        </div>

        {/* CENTER COLUMN: Playlist Library Cards Grid */}
        <div
          style={{
            background: "rgba(10,5,25,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {(libraryView === "playlists" || libraryView === "yoAlbums") && !loadingPlaylists ? (
            <MusicCollectionLibrary
              accentColor="#7DD3FC"
              isOwner={isOwner}
              selectedId={selectedId}
              playlists={playlists
                .filter((p) => !p.isMixtape)
                .map(
                  (p): MusicCollectionCard => ({
                    id: p.id,
                    title: p.name,
                    kind: "playlist",
                    coverUrl: p.coverUrl,
                    trackCount: p._count?.items ?? 0,
                    creatorLabel: publicOwnerName ?? undefined,
                  }),
                )}
              albums={playlists
                .filter((p) => p.isMixtape)
                .map(
                  (p): MusicCollectionCard => ({
                    id: p.id,
                    title: p.name,
                    kind: "album",
                    coverUrl: p.coverUrl,
                    trackCount: p._count?.items ?? 0,
                    creatorLabel: publicOwnerName ?? undefined,
                  }),
                )}
              singles={librarySongs.map(
                (s): MusicCollectionCard => ({
                  id: s.id,
                  title: s.title,
                  kind: "single",
                  coverUrl: s.coverUrl,
                  trackCount: 1,
                  creatorLabel: publicOwnerName ?? undefined,
                }),
              )}
              onAdd={isOwner ? () => setAddComposerOpen(true) : undefined}
              onSelect={(card) => {
                if (card.kind === "single") {
                  setLibraryView("library");
                  const idx = librarySongs.findIndex((s) => s.id === card.id);
                  if (idx >= 0) playLibrarySong(idx);
                  return;
                }
                setLibraryView("playlists");
                setSelectedId(card.id);
              }}
              onPlay={(card) => {
                if (card.kind === "single") {
                  const idx = librarySongs.findIndex((s) => s.id === card.id);
                  if (idx >= 0) playLibrarySong(idx);
                  return;
                }
                setSelectedId(card.id);
                setIsPlaying(true);
              }}
              onShare={(card) => {
                if (card.kind === "single") return;
                setSelectedId(card.id);
                openShare();
              }}
              onEditCover={
                isOwner
                  ? (card) => {
                      if (card.kind === "single") return;
                      openArtworkPicker(card.id);
                    }
                  : undefined
              }
              onAddTracks={
                isOwner
                  ? (card) => {
                      setSelectedId(card.id);
                      setAddComposerOpen(true);
                    }
                  : undefined
              }
            />
          ) : null}

          {libraryView === "playlists" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {isOwner ? (
                <button
                  type="button"
                  data-testid="playlist-add-open"
                  onClick={() => setAddComposerOpen(true)}
                  style={actionBtn("#00FF88")}
                >
                  + ADD
                </button>
              ) : null}
              <button
                type="button"
                data-testid="playlist-share-open"
                onClick={() => void openShare()}
                disabled={!selectedId}
                style={actionBtn("#00FFFF")}
              >
                ↗ SHARE
              </button>
              {!isOwner && selectedId ? (
                <button
                  type="button"
                  data-testid="playlist-save-shared"
                  onClick={() => {
                    void saveSharedPlaylistToLibrary().catch((e: unknown) => {
                      setPlaylistActionMsg(e instanceof Error ? e.message : "Could not save playlist.");
                    });
                  }}
                  style={actionBtn("#FFD700")}
                >
                  SAVE TO LIBRARY
                </button>
              ) : null}
            </div>
          </div>
          ) : null}

          {libraryView === "playlists" && isOwner && addComposerOpen ? (
            <MediaImportComposer
              role={role}
              accentColor={accentColor}
              playlists={playlists.map((p) => ({
                id: p.id,
                name: p.name,
                trackCount: p._count?.items,
                isMixtape: p.isMixtape,
              }))}
              libraryTracks={[...userLibrarySongs, ...librarySongs].filter(
                (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i,
              )}
              defaultPlaylistId={selectedId}
              onClose={() => setAddComposerOpen(false)}
              onRefreshLibrary={() => {
                void loadLibrarySongs();
                void loadPlaylists();
              }}
              onRefreshPlaylists={() => void loadPlaylists()}
              onCompleted={(result) => {
                if (result.playlistId) setSelectedId(result.playlistId);
                setPlaylistActionMsg(
                  result.destination === "single"
                    ? "Saved as Single in Media Library."
                    : `Saved to ${result.playlistName ?? result.destination}.`,
                );
                void reloadSelectedTracks();
                setShareOpen(Boolean(result.playlistId));
              }}
            />
          ) : null}

          {libraryView === "playlists" && isOwner && artworkPickerOpen && selectedId ? (
            <div
              data-testid="playlist-artwork-picker-host"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 12000,
                display: "grid",
                placeItems: "center",
                padding: 16,
                background: "rgba(0,0,0,0.72)",
              }}
            >
              <PlaylistArtworkPicker
                accentColor={accentColor}
                entitySlug={sessionUsername}
                currentCoverUrl={selectedPlaylist?.coverUrl ?? null}
                onClose={() => setArtworkPickerOpen(false)}
                onSave={(url) => savePlaylistArtwork(url)}
              />
            </div>
          ) : null}

          {libraryView === "playlists" && isOwner && selectedId ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                data-testid="playlist-change-cover"
                disabled={coverBusy}
                onClick={() => openArtworkPicker()}
                style={actionBtn("#FF2DAA")}
              >
                {coverBusy ? "…" : selectedPlaylist?.coverUrl ? "CHANGE COVER" : "ADD COVER"}
              </button>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Or type a blank playlist name…"
                onKeyDown={(e) => { if (e.key === "Enter") void createPlaylist(); }}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => void createPlaylist()}
                disabled={creatingPlaylist || !newPlaylistName.trim()}
                style={actionBtn("#AA2DFF")}
              >
                {creatingPlaylist ? "…" : "CREATE EMPTY"}
              </button>
            </div>
          ) : null}

          {libraryView === "playlists" && isOwner && !selectedId ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="New playlist name…"
                onKeyDown={(e) => { if (e.key === "Enter") void createPlaylist(); }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => void createPlaylist()}
                disabled={creatingPlaylist || !newPlaylistName.trim()}
                style={actionBtn("#00FF88")}
              >
                {creatingPlaylist ? "…" : "CREATE"}
              </button>
            </div>
          ) : null}
          {playlistActionMsg ? (
            <div style={{ fontSize: 10, color: playlistActionMsg.includes("Could not") ? "#ffb0b0" : "#9dffc8", lineHeight: 1.4 }}>
              {playlistActionMsg}
            </div>
          ) : null}

          {loadingPlaylists && (libraryView === "playlists" || libraryView === "yoAlbums") ? (
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, padding: "12px 0" }}>
              Loading music library…
            </div>
          ) : null}

          {libraryView === "library" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
                YOUR LIBRARY
              </div>
              {sunoEmbedUrl ? (
                <iframe
                  title="Suno official player"
                  src={sunoEmbedUrl}
                  width="100%"
                  height="160"
                  style={{ border: 0, borderRadius: 8 }}
                  allow="autoplay; encrypted-media; fullscreen"
                />
              ) : null}
              {loadingLibrary ? (
                <div role="status" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, padding: "24px 0", textAlign: "center" }}>
                  Loading your media library…
                </div>
              ) : libraryError ? (
                <div role="alert" style={{ color: "#ffb0b0", fontSize: 11, padding: "12px 0" }}>{libraryError}</div>
              ) : librarySongs.length === 0 ? (
                <div
                  data-testid="library-empty"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.35)", fontSize: 11, textAlign: "center", padding: 24 }}
                >
                  <span style={{ fontSize: 24 }}>🎵</span>
                  No songs in your library yet. Upload audio, paste a URL, or add a Suno link — a playlist is not required.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {librarySongs.map((song, idx) => (
                    <div
                      key={song.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {song.title}
                        </div>
                        {song.genre ? <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{song.genre}</div> : null}
                        {parseSunoShareUrl(song.audioUrl) ? (
                          <div data-testid="suno-source-badge" style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "#C4B5FD", marginTop: 3 }}>SUNO</div>
                        ) : null}
                      </div>
                      <button type="button" onClick={() => playLibrarySong(idx)} disabled={!resolveDurablePlayableSrc(song.audioUrl) && !parseSunoShareUrl(song.audioUrl)} style={actionBtn(accentColor)}>
                        ▶ PLAY
                      </button>
                      <button type="button" onClick={() => addLibrarySongToQueue(song)} disabled={!resolveDurablePlayableSrc(song.audioUrl)} style={actionBtn("#AA2DFF")}>
                        + QUEUE
                      </button>
                      {isOwner ? (
                        <button
                          type="button"
                          data-testid="library-add-to-playlist"
                          onClick={() => void addSongToSelectedPlaylist(song.id)}
                          disabled={addingSong}
                          style={actionBtn("#00FF88")}
                        >
                          ADD TO PLAYLIST
                        </button>
                      ) : null}
                      {(() => {
                        const realm = classifySongRealm({ audioUrl: song.audioUrl, genre: song.genre, madeWithAi: Boolean(parseSunoShareUrl(song.audioUrl) || song.genre === "suno") });
                        const href = songRealmCompetitionHref(realm);
                        return href ? (
                          <Link href={href} style={{ ...actionBtn("#7C3AED"), textDecoration: "none" }}>
                            {realm.realm === "AI" ? "AI CONTEST" : "SONG REALM"}
                          </Link>
                        ) : null;
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {libraryView === "yoAlbums" ? (
            <div
              data-testid="yo-albums-tab"
              style={{ display: "flex", flexDirection: "column", gap: 10, padding: 8 }}
            >
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
                ALBUM COLLECTIONS
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
                Album collections reuse the playlist authority with mixtape flag. Commercial release publishing stays on Performer release tools — not fabricated here.
              </div>
              {isOwner ? (
                <button type="button" data-testid="yo-albums-add" onClick={() => setAddComposerOpen(true)} style={actionBtn("#00FF88")}>
                  + ADD TO ALBUM
                </button>
              ) : null}
              {playlists.filter((p) => p.isMixtape).length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textAlign: "center", padding: 16 }}>
                  No album collections yet. Use ADD → Album destination.
                </div>
              ) : (
                playlists.filter((p) => p.isMixtape).map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setLibraryView("playlists");
                      setSelectedId(card.id);
                    }}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderRadius: 10,
                      border: selectedId === card.id ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.03)",
                      color: "#fff",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{card.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                      {card._count?.items ?? 0} tracks · album collection
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        {/* RIGHT COLUMN: Now Playing Tracklist + Equalizer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Natural content height — a tracklist of 1 or 100 songs grows the drawer/page
              instead of being trapped in a fixed-height nested scrollbox (no maxHeight/overflowY here). */}
          <div
            style={{
              background: "rgba(10,5,25,0.6)",
              border: "1px solid rgba(170,45,255,0.3)",
              borderRadius: 12,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: "#AA2DFF", letterSpacing: "0.12em" }}>
              {activeTrack ? `NOW PLAYING: ${activeTrack.title}` : "TRACKLIST"}
            </div>
            {loadingTracks ? (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "12px 4px", textAlign: "center" }}>
                Loading tracks…
              </div>
            ) : tracks.length === 0 ? (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "12px 4px", textAlign: "center" }}>
                {selectedId ? "No tracks in this playlist yet — add one below." : "Select a playlist to see its tracks."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tracks.map((t, idx) => {
                  const active = idx === currentTrackIndex;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "4px 6px",
                        borderRadius: 6,
                        background: active ? "rgba(0,255,255,0.15)" : "transparent",
                        border: active ? "1px solid #00FFFF" : "1px solid transparent",
                        color: active ? "#00FFFF" : "rgba(255,255,255,0.7)",
                        fontSize: 10,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontWeight: active ? 900 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {idx + 1}. {t.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {isOwner && (selectedId || libraryView === "library") ? (
              <div data-mm06-add-actions="1" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
                  ADD TO LIBRARY{selectedId && libraryView === "playlists" ? " + THIS PLAYLIST" : " — NO PLAYLIST REQUIRED"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <Link
                    href="/media/upload"
                    data-testid="playlist-mm06-upload"
                    style={{
                      padding: "8px 12px",
                      minHeight: 36,
                      borderRadius: 8,
                      border: "1px solid #00FFFF88",
                      background: "rgba(0,255,255,0.12)",
                      color: "#00FFFF",
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    1 · UPLOAD FILE
                  </Link>
                  <button
                    type="button"
                    data-testid="playlist-mm06-paste-link"
                    onClick={() => setLinkImportOpen((v) => !v)}
                    style={{
                      padding: "8px 12px",
                      minHeight: 36,
                      borderRadius: 8,
                      border: "1px solid #FFD70088",
                      background: linkImportOpen ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.1)",
                      color: "#FFD700",
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {linkImportOpen ? "CLOSE LINK PANEL" : "2 · PASTE LINK / SUNO"}
                  </button>
                </div>
                {linkImportOpen ? (
                  <div data-testid="playlist-mm06-link-panel" style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.06)" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", marginBottom: 6, lineHeight: 1.4 }}>
                      Paste YouTube, SoundCloud, Spotify, or a Suno share link. Saves to your Library first. If a playlist is selected, it also gets a membership — not a second file.
                    </div>
                    <MediaUrlImporter
                      compact
                      defaultPlaylistId={libraryView === "playlists" ? selectedId ?? undefined : undefined}
                      onImported={(track) => {
                        setPlaylistActionMsg(`Saved "${track.title}"${track.addedToPlaylist ? " to library + this playlist" : " to your library"}.`);
                        setLinkImportOpen(false);
                        void loadLibrarySongs();
                        void loadPlaylists();
                        if (selectedId) void reloadSelectedTracks();
                      }}
                    />
                  </div>
                ) : null}
                <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(170,45,255,0.85)" }}>
                  3 · ADD FROM YOUR LIBRARY (below)
                </div>
              </div>
            ) : null}
            {isOwner && selectedId ? (
              addableLibrarySongs.length > 0 ? (
                <div style={{ display: "flex", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <select
                    data-mm06-library-select="1"
                    value={addingSongId}
                    onChange={(e) => setAddingSongId(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 6,
                      padding: "6px 8px",
                      color: "#fff",
                      fontSize: 10,
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">— add a song from your library —</option>
                    {addableLibrarySongs.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}{s.genre ? ` · ${s.genre}` : ""}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void addSongToSelectedPlaylist()}
                    disabled={addingSong || !addingSongId}
                    style={actionBtn("#AA2DFF")}
                  >
                    {addingSong ? "…" : "ADD TO PLAYLIST"}
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 8, lineHeight: 1.45 }}>
                  {userLibrarySongs.length === 0
                    ? role === "performer"
                      ? "Use UPLOAD FILE or PASTE LINK above, then add from your library here."
                      : "Use 1 · UPLOAD FILE or 2 · PASTE LINK above, then 3 · ADD FROM YOUR LIBRARY."
                    : "Every song in your library is already in this playlist."}
                </div>
              )
            ) : null}
          </div>

          {/* 9-BAND FREQUENCY MONITOR (HONEST NON-PROCESSING UI DISPLAY) */}
          <div
            style={{
              background: "rgba(10,5,25,0.8)",
              border: "1px solid rgba(255,215,0,0.35)",
              borderRadius: 12,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em" }}>
                  FREQUENCY MONITOR (9-BAND)
                </div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>
                  Visual monitor display · Non-processing UI
                </div>
              </div>
              <button type="button" onClick={() => setEqGains(new Array(9).fill(50))} style={eqModeBtn("#00FFFF")}>
                RESET
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 90, justifyContent: "space-between", padding: "0 4px" }}>
              {["60", "170", "310", "600", "1K", "3K", "6K", "12K", "14K"].map((freq, i) => {
                const val = eqGains[i] ?? 50;
                return (
                  <div key={freq} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = Math.round(100 - ((e.clientY - rect.top) / rect.height) * 100);
                        setEqGains((prev) => prev.map((g, gi) => (gi === i ? Math.max(0, Math.min(100, pct)) : g)));
                      }}
                      style={{ height: 70, width: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, position: "relative", cursor: "pointer" }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          width: "100%",
                          height: `${val}%`,
                          background: "linear-gradient(0deg, #FF5500, #FFD700)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>{freq}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {skinsSection}

      {/* Share Modal Overlay — §20995-W1 */}
      {shareOpen && selectedId ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShareOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PlaylistSharePanel
              playlistId={selectedId}
              playlistTitle={selectedPlaylist?.name ?? "Playlist"}
              isPublic={selectedPlaylist?.isPublic !== false}
              trackId={activeTrack?.id}
              trackTitle={activeTrack?.title}
              portableItems={tracks.map((t) => {
                const suno = parseSunoShareUrl(t.audioUrl);
                return {
                  mediaAssetId: t.id,
                  title: t.title,
                  sourceUrl: suno?.shareUrl ?? t.audioUrl ?? null,
                  provider: suno ? "SUNO" : null,
                  provenance: suno ? ("SUNO" as const) : ("NATIVE" as const),
                  playbackKind: suno ? ("official_embed" as const) : ("native" as const),
                };
              })}
              accentColor="#00FFFF"
              canSaveToLibrary={!isOwner}
              onSaveToLibrary={saveSharedPlaylistToLibrary}
              onPrivacyChange={
                isOwner
                  ? async (next) => {
                      await patchPlaylistMeta({ isPublic: next });
                    }
                  : undefined
              }
              onClose={() => setShareOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* Monetization companion rail: Free tier allocation; Reclaimed for Diamond/Platinum */}
      {!isMobile && (accountTier === "FREE" || accountTier === "free" || accountTier === "pro") ? (
        <div
          data-playlist-ad-rail
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
            SPONSOR & ADVERTISING PARTNERS · REGISTERED INVENTORY
          </div>
          <AdRail
            placement={role === "performer" ? "performer-cc-bottom" : "fan-cc-bottom"}
            role={role}
            reserve="medium-rectangle"
            experienceMode="workspace"
          />
        </div>
      ) : null}
    </div>
  );
}

function actionBtn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    border: `1px solid ${color}66`,
    borderRadius: 6,
    padding: "5px 12px",
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function transportBtn(): CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function transportMainBtn(): CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF5500, #AA2DFF)",
    border: "2px solid #00FFFF",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 15px rgba(0,255,255,0.5)",
  };
}

function eqModeBtn(color: string): CSSProperties {
  return {
    fontSize: 7,
    fontWeight: 900,
    padding: "2px 6px",
    borderRadius: 4,
    border: `1px solid ${color}44`,
    background: `${color}15`,
    color,
    cursor: "pointer",
  };
}
