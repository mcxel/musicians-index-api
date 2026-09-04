"use client";

/**
 * Native YoPho card player chassis — visual layer only.
 * Playback goes through AudioProvider / GlobalAudioPlaybackGuard.
 * Skin / position changes must not restart the source session.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useAudio } from "@/components/AudioProvider";
import {
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import { resolveDurablePlayableSrc } from "@/lib/media/durablePlayableUrl";
import {
  isYoPhoMediaPlayable,
  yophoMediaPlaybackKey,
  type YoPhoMediaModule,
} from "@/lib/yopho/YoPhoMediaModule";

interface PlaylistSong {
  id: string;
  title: string;
  audioUrl?: string | null;
  coverUrl?: string | null;
}

interface Props {
  modules: YoPhoMediaModule[];
  displayName: string;
  /** When false, chassis is visual-only (editor preview still shows skin). */
  interactive?: boolean;
}

function positionStyle(mod: YoPhoMediaModule): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    zIndex: 70,
    pointerEvents: "auto",
  };
  switch (mod.position) {
    case "top":
      return { ...base, top: "8%", left: "8%", right: "8%" };
    case "center":
      return { ...base, top: "42%", left: "10%", right: "10%", transform: "translateY(-50%)" };
    case "left":
      return { ...base, left: "4%", top: "38%", width: "46%" };
    case "right":
      return { ...base, right: "4%", top: "38%", width: "46%" };
    default:
      return { ...base, bottom: "12%", left: "8%", right: "8%" };
  }
}

export default function YoPhoCardMediaPlayer({
  modules,
  displayName,
  interactive = true,
}: Props) {
  const playable = modules.filter((m) => isYoPhoMediaPlayable(m));
  const { play, pause, seek, currentTrack, isPlaying, currentTime, isMuted, toggleMute } = useAudio();
  const [audibleId, setAudibleId] = useState<string | null>(playable[0]?.id ?? null);
  const [tapToHear, setTapToHear] = useState(false);
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistSong[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const lastKeyRef = useRef<string | null>(null);

  const audible = playable.find((m) => m.id === audibleId) ?? playable[0] ?? null;

  useEffect(() => {
    if (!audibleId && playable[0]) setAudibleId(playable[0].id);
  }, [audibleId, playable]);

  useEffect(() => {
    if (!audible || (audible.type !== "playlist" && audible.type !== "album") || !audible.sourceId) {
      setPlaylistTracks([]);
      setTrackIndex(0);
      return;
    }
    let cancelled = false;
    fetch(`/api/user/playlists/${encodeURIComponent(audible.sourceId)}/songs`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items?: { song?: PlaylistSong }[] }) => {
        if (cancelled) return;
        const tracks = (data.items ?? [])
          .map((i) => i.song)
          .filter((s): s is PlaylistSong => Boolean(s?.id));
        setPlaylistTracks(tracks);
        setTrackIndex(0);
      })
      .catch(() => {
        if (!cancelled) setPlaylistTracks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [audible?.id, audible?.sourceId, audible?.type]);

  const resolvedUrl = (() => {
    if (!audible) return null;
    if (playlistTracks.length > 0) {
      const t = playlistTracks[trackIndex % playlistTracks.length];
      return resolveDurablePlayableSrc(t?.audioUrl ?? audible.audioUrl ?? null);
    }
    return resolveDurablePlayableSrc(audible.audioUrl ?? null);
  })();

  const playbackKey = audible
    ? `${yophoMediaPlaybackKey(audible)}|${resolvedUrl ?? ""}|${trackIndex}`
    : "";

  const startAudible = useCallback(
    async (opts?: { forceMuted?: boolean }) => {
      if (!interactive || !audible || !resolvedUrl) return;
      const track = playlistTracks[trackIndex % Math.max(playlistTracks.length, 1)];
      const ok = await play(
        {
          id: track?.id ?? audible.sourceId ?? audible.id,
          title: track?.title ?? audible.title ?? "YoPho",
          artist: audible.artist ?? displayName,
          duration: 0,
          url: resolvedUrl,
          artwork: audible.coverUrl ?? track?.coverUrl ?? undefined,
        },
        {
          loop: audible.loop && playlistTracks.length <= 1,
          muted: opts?.forceMuted ?? false,
          startSec: audible.startSec,
        },
      );
      lastKeyRef.current = playbackKey;
      if (!ok && !opts?.forceMuted && audible.autoplayPolicy !== "off") {
        const mutedOk = await play(
          {
            id: track?.id ?? audible.sourceId ?? audible.id,
            title: track?.title ?? audible.title ?? "YoPho",
            artist: audible.artist ?? displayName,
            duration: 0,
            url: resolvedUrl,
            artwork: audible.coverUrl ?? track?.coverUrl ?? undefined,
          },
          { loop: audible.loop && playlistTracks.length <= 1, muted: true, startSec: audible.startSec },
        );
        setTapToHear(Boolean(mutedOk) || audible.autoplayPolicy === "muted_until_tap");
      } else if (ok) {
        setTapToHear(false);
      } else {
        setTapToHear(true);
      }
    },
    [interactive, audible, resolvedUrl, playlistTracks, trackIndex, play, displayName, playbackKey],
  );

  useEffect(() => {
    if (!interactive || !audible || !resolvedUrl) return;
    if (audible.autoplayPolicy === "off") return;
    if (lastKeyRef.current === playbackKey) return;
    void startAudible({ forceMuted: audible.autoplayPolicy === "muted_until_tap" });
  }, [playbackKey, interactive, audible, resolvedUrl, startAudible]);

  useEffect(() => {
    if (!audible || !isPlaying) return;
    const start = audible.startSec ?? 0;
    const end = audible.endSec;
    if (end != null && currentTime >= end) {
      if (audible.loop) seek(start);
      else pause();
    }
  }, [audible, isPlaying, currentTime, seek, pause]);

  const thisIsAudible =
    Boolean(audible && currentTrack && resolvedUrl && currentTrack.url === resolvedUrl);

  if (playable.length === 0) return null;

  return (
    <>
      {playable.map((mod) => {
        const chassis =
          MEDIA_PLAYER_CHASSIS_REGISTRY[mod.skinId as MediaPlayerChassisId] ??
          MEDIA_PLAYER_CHASSIS_REGISTRY.standard;
        const isAudibleMod = audible?.id === mod.id;
        const playingHere = isAudibleMod && thisIsAudible && isPlaying;
        return (
          <div key={mod.id} style={positionStyle(mod)}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!interactive) return;
                if (!isAudibleMod) {
                  setAudibleId(mod.id);
                  lastKeyRef.current = null;
                  return;
                }
                if (tapToHear && isMuted) {
                  toggleMute();
                  setTapToHear(false);
                  return;
                }
                if (playingHere) {
                  pause();
                  return;
                }
                void startAudible({ forceMuted: false });
                setTapToHear(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                border: `1px solid ${chassis.accent}66`,
                background: `linear-gradient(145deg, ${chassis.theme}ee, #050510cc)`,
                color: "#fff",
                cursor: interactive ? "pointer" : "default",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 16 }}>{chassis.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 800,
                    color: chassis.accent,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {mod.title ?? chassis.label}
                </span>
                <span style={{ display: "block", fontSize: 8, color: "rgba(255,255,255,0.45)" }}>
                  {isAudibleMod
                    ? tapToHear
                      ? "Tap to hear — autoplay blocked"
                      : playingHere
                        ? "Playing"
                        : "Paused"
                    : "Tap to play (one audible source)"}
                </span>
              </span>
              <span style={{ fontSize: 12 }}>{playingHere ? "⏸" : "▶"}</span>
            </button>
          </div>
        );
      })}
    </>
  );
}
