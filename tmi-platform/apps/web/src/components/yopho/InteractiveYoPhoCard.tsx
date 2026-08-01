"use client";

/**
 * Interactive YoPho Card player — canonical share artifact (motor card).
 * Shorts-style motion loop (2–7s hook) + Now Playing audio + pause reactions.
 * NOT a dumb flat MP4 — tap enlarge, next track, tip/profile/live.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import YoPhoStudioStyleOverlay from "@/components/yopho/YoPhoStudioStyleOverlay";
import YoPhoMagicEffectOverlay from "@/components/yopho/YoPhoMagicEffectOverlay";
import YoPhoBrandingFooter from "@/components/yopho/YoPhoBrandingFooter";
import { getScenePack } from "@/lib/yopho/YoPhoScenePack";
import { getStudioStylePreset } from "@/lib/yopho/YoPhoStudioStylePresets";
import type { PublishedYoPhoCard } from "@/lib/yopho/YoPhoCardRegistry";
import { defaultMotionClip } from "@/lib/yopho/YoPhoCardComposition";
import { DEFAULT_BRANDING_FOOTER, getActiveMagicEffects } from "@/lib/yopho/YoPhoCardDocument";
import { getPlaylist, getTrack } from "@/lib/playlists/PlaylistEngine";
import {
  castPlaylistToMonitor,
  publishPlaylistNowPlaying,
} from "@/lib/playlists/PlaylistMonitorCast";
import {
  getActiveSessions,
  onSessionsChanged,
  type LiveSession,
} from "@/lib/broadcast/GlobalLiveSessionRegistry";

interface Props {
  card: PublishedYoPhoCard;
}

type MotorPhase = "playing" | "paused_react";

const LOOP_CSS = `
@keyframes yopho-kenburns {
  0% { transform: scale(1) translate(0,0); }
  50% { transform: scale(1.08) translate(-1.5%, 1%); }
  100% { transform: scale(1) translate(0,0); }
}
@keyframes yopho-foil {
  0% { background-position: 0% 40%; opacity: 0.4; }
  50% { background-position: 100% 60%; opacity: 0.85; }
  100% { background-position: 0% 40%; opacity: 0.4; }
}
@keyframes yopho-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,255,0.35); }
  50% { box-shadow: 0 0 24px 4px rgba(255,45,170,0.35); }
}
@keyframes yopho-pause-shimmer {
  0% { opacity: 0.2; }
  50% { opacity: 0.9; }
  100% { opacity: 0.2; }
}
@keyframes yopho-beam {
  0%, 100% { opacity: 0.35; transform: scaleY(1); }
  50% { opacity: 0.7; transform: scaleY(1.06); }
}
`;

function findLive(sessions: LiveSession[], slug?: string, name?: string): LiveSession | null {
  const s = slug?.toLowerCase();
  const n = name?.toLowerCase();
  for (const sess of sessions) {
    if (s && (sess.userId.toLowerCase() === s || sess.roomId.toLowerCase().includes(s))) return sess;
    if (n && sess.displayName.toLowerCase() === n) return sess;
  }
  return null;
}

export default function InteractiveYoPhoCard({ card }: Props) {
  const scene = getScenePack(card.sceneId);
  const stylePreset = getStudioStylePreset(card.styleId);
  const motion = card.motion ?? defaultMotionClip();
  const hasMotion = Boolean(motion.sourceUrl);
  const magicEffects = useMemo(() => {
    if (card.documentJson) return getActiveMagicEffects(card.documentJson);
    return card.magicEffects ?? [];
  }, [card.documentJson, card.magicEffects]);
  const branding = useMemo(
    () =>
      card.documentJson?.brandingFooter ?? {
        ...DEFAULT_BRANDING_FOOTER,
        rarity: card.rarity ?? "STANDARD",
        editionBadge: card.isCanonical
          ? "CANONICAL"
          : card.editionTitle ?? card.momentTag ?? null,
      },
    [card.documentJson, card.rarity, card.isCanonical, card.editionTitle, card.momentTag],
  );
  const footerPct = Math.min(0.12, Math.max(0.08, branding.heightPct ?? 0.1));
  const profilePathForQr =
    card.role === "performer" && card.slug
      ? `/performers/${card.slug}`
      : card.role === "fan"
        ? "/hub/fan"
        : "/performers";

  const [enlarged, setEnlarged] = useState(false);
  const [phase, setPhase] = useState<MotorPhase>("playing");
  const [trackIndex, setTrackIndex] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [sessions, setSessions] = useState<LiveSession[]>(() => getActiveSessions());
  useEffect(() => onSessionsChanged(setSessions), []);
  const live = findLive(sessions, card.slug, card.displayName);

  const playlist = useMemo(() => {
    const id = card.nowPlaying?.playlistId ?? card.playlistId;
    return id ? getPlaylist(id) ?? null : null;
  }, [card.nowPlaying?.playlistId, card.playlistId]);

  const playlistTracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.entries
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((e) => getTrack(e.trackId))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
  }, [playlist]);

  const currentTrack = useMemo(() => {
    if (playlistTracks.length > 0) {
      return playlistTracks[trackIndex % playlistTracks.length]!;
    }
    const np = card.nowPlaying;
    if (np?.audioUrl || np?.title) {
      return {
        id: np.trackId ?? "now",
        title: np.title ?? "My song right now",
        artistName: np.artist ?? card.displayName,
        audioUrl: np.audioUrl ?? null,
        coverUrl: np.coverUrl ?? null,
      };
    }
    return null;
  }, [playlistTracks, trackIndex, card.nowPlaying, card.displayName]);

  const audioUrl = useMemo(() => {
    if (!currentTrack) return null;
    if ("audioUrl" in currentTrack && currentTrack.audioUrl) return currentTrack.audioUrl as string;
    const t = currentTrack as ReturnType<typeof getTrack>;
    if (t && "platforms" in t) return t.platforms?.tmi ?? null;
    return card.nowPlaying?.audioUrl ?? null;
  }, [currentTrack, card.nowPlaying?.audioUrl]);

  // Hook loop: seek to hookStart and restart when past hookStart+duration
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !hasMotion || !motion.sourceUrl) return;
    v.src = motion.sourceUrl;
    v.muted = true;
    v.playsInline = true;
    const start = Math.max(0, motion.hookStartSec);
    const end = start + motion.durationSec;

    const onMeta = () => {
      v.currentTime = start;
      if (phase === "playing") void v.play().catch(() => {});
    };
    const onTime = () => {
      if (phase !== "playing") return;
      if (v.currentTime >= end || v.ended) {
        v.currentTime = start;
        void v.play().catch(() => {});
      }
    };
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    v.load();
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [hasMotion, motion.sourceUrl, motion.hookStartSec, motion.durationSec, phase]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    el.loop = !playlistTracks.length;
    el.src = audioUrl;
    if (phase === "playing") {
      void el.play().then(() => setAudioPlaying(true)).catch(() => {
        setAudioError("Tap ▶ to start song (browser blocked autoplay)");
        setAudioPlaying(false);
      });
    }
  }, [audioUrl, playlistTracks.length, phase]);

  const onAudioEnded = useCallback(() => {
    if (playlistTracks.length > 1) {
      setTrackIndex((i) => (i + 1) % playlistTracks.length);
    }
  }, [playlistTracks.length]);

  const nextTrack = useCallback(() => {
    if (playlistTracks.length === 0) {
      setAudioError(card.nowPlaying?.title ? "Single song — looping" : "No playlist attached");
      return;
    }
    setTrackIndex((i) => (i + 1) % playlistTracks.length);
    setAudioError(null);
  }, [playlistTracks.length, card.nowPlaying?.title]);

  const enterPauseReaction = useCallback(() => {
    setPhase("paused_react");
    const v = videoRef.current;
    if (v) v.pause();
    // Soft: keep song playing unless user paused audio; advance playlist beat on pause
    if (playlistTracks.length > 1) {
      setTrackIndex((i) => (i + 1) % playlistTracks.length);
    }
  }, [playlistTracks.length]);

  const resumeMotor = useCallback(() => {
    setPhase("playing");
    const v = videoRef.current;
    if (v && hasMotion) {
      const start = Math.max(0, motion.hookStartSec);
      if (v.currentTime < start || v.currentTime >= start + motion.durationSec) {
        v.currentTime = start;
      }
      void v.play().catch(() => {});
    }
    const a = audioRef.current;
    if (a && audioUrl) {
      void a.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  }, [hasMotion, motion.hookStartSec, motion.durationSec, audioUrl]);

  useEffect(() => {
    if (!currentTrack) return;
    const payload = {
      playlistId: card.nowPlaying?.playlistId ?? card.playlistId ?? "yopho-card",
      trackId: "id" in currentTrack ? String(currentTrack.id) : undefined,
      title: "title" in currentTrack ? String(currentTrack.title) : "Track",
      artist:
        "artistName" in currentTrack
          ? String((currentTrack as { artistName?: string }).artistName)
          : card.displayName,
      audioUrl,
      coverUrl: card.nowPlaying?.coverUrl ?? card.subjectUrl,
    };
    castPlaylistToMonitor(payload);
    publishPlaylistNowPlaying({ ...payload, isPlaying: audioPlaying && phase === "playing" });
  }, [currentTrack, audioUrl, audioPlaying, phase, card]);

  const tipHref = card.slug ? `/tip/${card.slug}` : null;
  const profileHref =
    card.role === "performer" && card.slug
      ? `/performers/${card.slug}`
      : card.role === "fan"
        ? "/hub/fan"
        : "/performers";
  const liveHref = live ? `/live/rooms/${encodeURIComponent(live.roomId)}` : null;

  const textPos =
    card.textOverlay.position === "top"
      ? { top: 16 }
      : card.textOverlay.position === "center"
        ? { top: "44%" }
        : { bottom: `${Math.round(footerPct * 100) + 8}%` };

  const paused = phase === "paused_react";
  const isAbductedScene = card.sceneId === "abducted_by_ufo";

  const stage = (
    <div
      role="button"
      tabIndex={0}
      aria-label="Tap to enlarge YoPho card"
      onClick={() => setEnlarged(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEnlarged(true);
        }
      }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: enlarged ? "min(92vw, 520px)" : 380,
        aspectRatio: "9 / 16",
        margin: "0 auto",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "zoom-in",
        border: paused ? "2px solid rgba(255,215,0,0.85)" : "2px solid rgba(255,215,0,0.45)",
        animation: paused ? undefined : "yopho-pulse 3s ease-in-out infinite",
        background: "#050510",
        transform: paused ? "scale(1.02)" : undefined,
        transition: "transform 0.35s ease, border-color 0.35s ease",
      }}
    >
      {/* ENVIRONMENT / BACKGROUND layers (z 0–3) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: card.customBgUrl
            ? undefined
            : scene.backdropCss === "transparent"
              ? "#050510"
              : scene.backdropCss,
        }}
      >
        {card.customBgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.customBgUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              animation: paused ? undefined : "yopho-kenburns 8s ease-in-out infinite",
            }}
          />
        ) : scene.assetUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scene.assetUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.5,
              animation: paused ? undefined : "yopho-kenburns 10s ease-in-out infinite",
            }}
          />
        ) : null}
      </div>

      {/* ENVIRONMENT novelty — Abducted by a UFO scene pack */}
      {isAbductedScene ? (
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "6%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "42%",
              height: 18,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, #c0c0c0 0%, #555 60%, transparent 70%)",
              boxShadow: "0 0 20px rgba(0,255,136,0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "48px solid transparent",
              borderRight: "48px solid transparent",
              borderTop: "55% solid rgba(0,255,136,0.18)",
              animation: "yopho-beam 2.4s ease-in-out infinite",
              transformOrigin: "top center",
            }}
          />
        </div>
      ) : null}

      {/* PERSON_CUTOUT — motion hook OR still + ken burns */}
      {hasMotion && motion.sourceUrl ? (
        <video
          ref={videoRef}
          muted
          playsInline
          poster={card.subjectUrl}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 20,
            filter: paused ? "saturate(1.15) contrast(1.08)" : undefined,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.subjectUrl}
          alt={card.displayName}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 20,
            animation: paused ? undefined : "yopho-kenburns 7s ease-in-out infinite",
            filter: paused ? "saturate(1.1)" : undefined,
          }}
        />
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 25,
          background:
            "linear-gradient(120deg, transparent 25%, rgba(0,229,255,0.2) 45%, rgba(255,45,170,0.22) 60%, transparent 80%)",
          backgroundSize: "220% 220%",
          animation: paused ? "yopho-pause-shimmer 1.2s ease-in-out infinite" : "yopho-foil 5s ease-in-out infinite",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <YoPhoMagicEffectOverlay effects={magicEffects} paused={paused} style={{ zIndex: 40 }} />

      {paused ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 45,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,16,0.72) 100%)",
            pointerEvents: "none",
          }}
        />
      ) : null}

      <div style={{ position: "absolute", inset: 0, zIndex: 48, pointerEvents: "none" }}>
        <YoPhoStudioStyleOverlay kind={stylePreset.overlay} displayName={card.displayName} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#050510",
            background: "linear-gradient(90deg,#00E5FF,#FFD700)",
            borderRadius: 999,
            padding: "4px 10px",
            width: "fit-content",
          }}
        >
          ✦ INTERACTIVE YOPHO
        </span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 800,
            color: "#00E5FF",
            letterSpacing: "0.08em",
          }}
        >
          MOTOR · {motion.durationSec}s LOOP
        </span>
        {card.momentTag ? (
          <span style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {card.momentTag}
          </span>
        ) : null}
        {paused ? (
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              color: "#FFD700",
              letterSpacing: "0.1em",
              textShadow: "0 0 8px rgba(255,215,0,0.6)",
            }}
          >
            WHO I AM RIGHT NOW
          </span>
        ) : null}
        {live ? (
          <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", background: "#E63000", borderRadius: 999, padding: "3px 8px", width: "fit-content" }}>
            ● LIVE
          </span>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 12,
          fontSize: 9,
          fontWeight: 800,
          color: "rgba(255,255,255,0.75)",
          textAlign: "right",
          maxWidth: 140,
          lineHeight: 1.35,
          textShadow: "0 1px 4px #000",
        }}
      >
        Tap to enlarge
        <br />
        Pause → react
      </div>

      {(card.textOverlay.text || paused) ? (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            zIndex: 11,
            textAlign: "center",
            pointerEvents: "none",
            ...textPos,
            opacity: paused || card.textOverlay.text ? 1 : 0,
            transform: paused ? "scale(1.06)" : undefined,
            transition: "transform 0.35s ease",
          }}
        >
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: paused ? card.textOverlay.fontSize + 4 : card.textOverlay.fontSize,
              fontWeight: 900,
              color: card.textOverlay.color,
              textShadow: card.textOverlay.outline ? "0 0 2px #000, 0 2px 0 #000" : undefined,
            }}
          >
            {card.textOverlay.text || "This is me right now"}
          </span>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: `${Math.round(footerPct * 100)}%`,
          zIndex: 12,
          padding: "16px 14px 10px",
          background: "linear-gradient(transparent, rgba(5,5,16,0.92))",
        }}
      >
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px #000" }}>
          {card.displayName}
        </div>
        {card.moodTitle ? (
          <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 700, marginTop: 2 }}>{card.moodTitle}</div>
        ) : (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Who I am right now</div>
        )}
        {currentTrack ? (
          <div style={{ fontSize: 11, color: "#00E5FF", marginTop: 6, fontWeight: 700 }}>
            ♪ {String((currentTrack as { title?: string }).title ?? "Now playing")}
            {"artistName" in currentTrack && (currentTrack as { artistName?: string }).artistName
              ? ` — ${(currentTrack as { artistName?: string }).artistName}`
              : ""}
          </div>
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>No song attached</div>
        )}
      </div>

      <YoPhoBrandingFooter
        cardId={card.cardId}
        profilePath={profilePathForQr}
        config={branding}
        heightPct={footerPct}
      />
    </div>
  );

  return (
    <div style={{ width: "100%", color: "#fff" }}>
      <style>{LOOP_CSS}</style>
      <audio ref={audioRef} onEnded={onAudioEnded} preload="auto" />

      {enlarged ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(5,5,16,0.94)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            gap: 16,
          }}
        >
          <button type="button" onClick={() => setEnlarged(false)} style={{ ...btn("#fff"), position: "absolute", top: 16, right: 16 }}>
            CLOSE
          </button>
          <div onClick={(e) => e.stopPropagation()}>{stage}</div>
        </div>
      ) : (
        stage
      )}

      <div style={{ maxWidth: 380, margin: "14px auto 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {phase === "playing" ? (
            <button type="button" onClick={enterPauseReaction} style={btn("#FFD700")}>
              ⏸ PAUSE · REACT
            </button>
          ) : (
            <button type="button" onClick={resumeMotor} style={btn("#00FF88")}>
              ▶ RESUME LOOP
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const el = audioRef.current;
              if (!el || !audioUrl) {
                setAudioError("No audio URL on this song yet");
                return;
              }
              if (el.paused) {
                void el.play().then(() => {
                  setAudioPlaying(true);
                  setAudioError(null);
                });
              } else {
                el.pause();
                setAudioPlaying(false);
              }
            }}
            style={btn("#00E5FF")}
          >
            {audioPlaying ? "⏸ PAUSE SONG" : "▶ PLAY SONG"}
          </button>
          <button type="button" onClick={nextTrack} style={btn("#FF2DAA")}>
            ⏭ NEXT IN PLAYLIST
          </button>
          <button type="button" onClick={() => setEnlarged(true)} style={btn("#AA2DFF")}>
            🔍 ENLARGE
          </button>
        </div>
        {audioError ? (
          <div style={{ textAlign: "center", fontSize: 11, color: "#FFD700" }}>{audioError}</div>
        ) : null}
        {!hasMotion ? (
          <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            No motion clip — still + ken-burns. Upload a motion hook in the editor.
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {tipHref && card.role === "performer" ? (
            <Link href={tipHref} style={btn("#FF2DAA")}>💸 TIP</Link>
          ) : null}
          <Link href={profileHref} style={btn("#00FFFF")}>PROFILE</Link>
          {liveHref ? <Link href={liveHref} style={btn("#E63000")}>🔴 JOIN LIVE</Link> : null}
          {card.role === "performer" && card.slug ? (
            <Link href={`/fan-club/${card.slug}`} style={btn("#AA2DFF")}>FAN CLUB</Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function btn(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color,
    background: `${color}18`,
    border: `1px solid ${color}55`,
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "inherit",
  };
}
