/**
 * Media Player Studio — mounts MediaPlayerChassis + PlaylistArtifact.
 * Stage 2: durable ownership, equip/unequip, preview unowned + purchase CTA.
 * Runtime renders equipped chassis only (preview selection is non-persistent).
 */

"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { personalPlaylistEngine } from "@/lib/studio/PersonalPlaylistEngine";
import { getAllPlaylists, getAllTracks, getTrack } from "@/lib/playlists/PlaylistEngine";
import type { WorkspaceContext } from "@/lib/workspace/universal/types";
import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  MEDIA_PLAYER_STORE_SKUS,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  equipChassisApi,
  ensureDefaultMediaPlayer,
  getEquippedChassisId,
  hydrateMediaPlayerOwnership,
  ownsChassis,
  purchaseChassisWithPointsApi,
  purchaseChassisWithStripe,
  unequipChassisApi,
} from "@/lib/artifacts/MediaPlayerInventory";
import { spendTmiPoints } from "@/lib/progression/ProgressionEngine";
import DualLayerCrossfade from "@/components/media/DualLayerCrossfade";
import TrackFlipTransition from "@/components/media/TrackFlipTransition";
import MediaPlayerChassisPreview from "@/components/media/MediaPlayerChassisPreview";

export interface PlaylistStudioContentProps {
  context: WorkspaceContext;
  userId?: string;
}

type PlayerScreenMode = "artwork" | "video" | "visualizer";

function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "—:—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlaylistStudioContent({
  context,
  userId: userIdProp = "local-user",
}: PlaylistStudioContentProps) {
  const [tick, setTick] = useState(0);
  const [eq, setEq] = useState({ low: 50, mid: 50, high: 50 });
  const [selectedId, setSelectedId] = useState<string | null>(context.trackId ?? null);
  const [screenMode, setScreenMode] = useState<PlayerScreenMode>("artwork");
  const [userId, setUserId] = useState(userIdProp);
  const [equippedId, setEquippedId] = useState(FREE_DEFAULT_CHASSIS_ID);
  /** Preview selection for unowned chassis — does not change runtime equip. */
  const [previewId, setPreviewId] = useState<MediaPlayerChassisId | null>(null);
  const [studioMsg, setStudioMsg] = useState<string | null>(null);
  const [ownedTick, setOwnedTick] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: { id?: string } | null }) => {
        if (!active) return;
        if (d.user?.id) setUserId(d.user.id);
        else setUserId(userIdProp);
      })
      .catch(() => {
        if (active) setUserId(userIdProp);
      });
    return () => {
      active = false;
    };
  }, [userIdProp]);

  useEffect(() => {
    let active = true;
    ensureDefaultMediaPlayer(userId);
    hydrateMediaPlayerOwnership(userId).then((state) => {
      if (!active) return;
      setEquippedId(state.equippedChassisId);
      setPreviewId(null);
    });
    return () => {
      active = false;
    };
  }, [userId, ownedTick]);

  const runtimeChassisId = equippedId;
  const displayChassisId = previewId ?? runtimeChassisId;
  const chassis =
    MEDIA_PLAYER_CHASSIS_REGISTRY[displayChassisId] ?? MEDIA_PLAYER_CHASSIS_REGISTRY.standard;
  const isPreviewingUnowned =
    !!previewId && !ownsChassis(userId, previewId);

  const chassisChoices = useMemo(() => {
    const freeIds: MediaPlayerChassisId[] = [
      FREE_DEFAULT_CHASSIS_ID,
      "tmi_classic",
      "tmi_dark",
      "tmi_neon",
    ];
    const ids = Array.from(new Set([...freeIds, ...MEDIA_PLAYER_STORE_SKUS]));
    return ids.map((id) => MEDIA_PLAYER_CHASSIS_REGISTRY[id]).filter(Boolean);
  }, []);

  const personal = useMemo(() => {
    void context.playlistId;
    void context.trackId;
    return personalPlaylistEngine.listSongs(userId);
  }, [userId, context.playlistId, context.trackId]);

  const catalogTracks = useMemo(() => getAllTracks().filter((t) => t.isActive), []);
  const playlists = useMemo(() => getAllPlaylists(), []);

  const libraryRows = useMemo(() => {
    if (personal.length > 0) {
      return personal.map((s) => ({
        id: s.songId,
        title: s.title,
        artist: s.artistName,
        duration: formatDuration(s.duration),
        artworkUrl: (s as { artworkUrl?: string; coverUrl?: string }).artworkUrl
          ?? (s as { coverUrl?: string }).coverUrl,
        videoUrl: (s as { videoUrl?: string }).videoUrl,
        audioUrl: (s as { audioUrl?: string }).audioUrl,
        source: "library" as const,
      }));
    }
    if (catalogTracks.length > 0) {
      return catalogTracks.slice(0, 40).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artistName,
        duration: "—:—",
        artworkUrl: (t as { coverArtUrl?: string; artworkUrl?: string }).coverArtUrl
          ?? (t as { artworkUrl?: string }).artworkUrl,
        videoUrl: (t as { videoUrl?: string }).videoUrl,
        audioUrl: (t as { audioUrl?: string; streamUrl?: string }).audioUrl ?? (t as { streamUrl?: string }).streamUrl,
        source: "catalog" as const,
      }));
    }
    return [];
  }, [personal, catalogTracks]);

  const queueRows = useMemo(() => {
    const pl = playlists[0];
    if (!pl?.entries?.length) return libraryRows.slice(0, 8);
    return pl.entries.slice(0, 12).map((e) => {
      const t = getTrack(e.trackId);
      return {
        id: e.trackId,
        title: t?.title ?? e.trackId,
        artist: t?.artistName ?? "—",
        duration: "—:—",
      };
    });
  }, [playlists, libraryRows]);

  const active =
    libraryRows.find((r) => r.id === selectedId) ??
    (context.trackTitle
      ? {
          id: context.trackId ?? "context",
          title: context.trackTitle,
          artist: context.artistName ?? "—",
          duration: "—:—",
          artworkUrl: context.artworkUrl,
          videoUrl: context.videoUrl,
        }
      : null);

  const artworkSrc = active?.artworkUrl ?? null;
  const videoSrc = active?.videoUrl ?? null;
  const audioSrc = (active as { audioUrl?: string | null } | null)?.audioUrl ?? null;
  const activeTrackIndex = selectedId ? libraryRows.findIndex((row) => row.id === selectedId) : -1;

  const selectRelativeTrack = (direction: -1 | 1) => {
    if (libraryRows.length === 0) return;
    const currentIndex = activeTrackIndex >= 0 ? activeTrackIndex : 0;
    const nextIndex = (currentIndex + direction + libraryRows.length) % libraryRows.length;
    setSelectedId(libraryRows[nextIndex]?.id ?? null);
  };

  const col: CSSProperties = {
    ...(isMobile
      ? { flexShrink: 0, width: "100%", boxSizing: "border-box" }
      : { flex: 1 }),
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    background: "rgba(0,0,0,0.28)",
    overflow: "hidden",
  };

  const playerSection = (
    <section
      style={{
        ...col,
        background: "linear-gradient(180deg, rgba(170,45,255,0.16), rgba(4,6,14,0.96))",
        borderColor: `${chassis.accent}44`,
      }}
    >
      <header style={sectionHeader}>
        NOW PLAYING
        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
          {screenMode === "visualizer"
            ? "Visualizer"
            : screenMode === "video"
              ? "Video screen"
              : "Artwork focus"}
        </span>
      </header>
      <div style={{ padding: isMobile ? 12 : 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            minHeight: isMobile ? 260 : 220,
            borderRadius: 14,
            overflow: "hidden",
            border: `1px solid ${chassis.accent}33`,
            background: "rgba(0,0,0,0.35)",
            position: "relative",
          }}
        >
          {screenMode === "artwork" ? (
            <DualLayerCrossfade
              src={artworkSrc}
              alt={active ? `${active.title} artwork` : "Artwork"}
              fallbackLabel="No artwork"
              accent={chassis.accent}
              style={{ borderRadius: 0 }}
            />
          ) : null}
          {screenMode === "video" ? (
            videoSrc ? (
              <video
                src={videoSrc}
                controls
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
              />
            ) : (
              <div style={{ ...emptyBox, margin: 16, height: "calc(100% - 32px)" }}>
                No video URL for this track. Switch to Artwork or Visualizer.
              </div>
            )
          ) : null}
          {screenMode === "visualizer" ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 3,
                padding: 16,
              }}
              aria-label="CSS visualizer stub — real FFT not connected"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const h = 8 + ((Math.sin(tick * 0.55 + i * 0.55) + 1) * 0.5) * 70;
                return (
                  <span
                    key={i}
                    style={{
                      width: 6,
                      height: h,
                      borderRadius: 2,
                      background: `linear-gradient(180deg, ${chassis.accent}, #AA2DFF)`,
                      boxShadow: `0 0 8px ${chassis.accent}73`,
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <TrackFlipTransition
            transitionKey={active?.id ?? "none"}
            neonSweep
            accent={chassis.accent}
          >
            {active ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{active.title}</div>
                <div style={{ fontSize: 12, color: chassis.accent, fontWeight: 700 }}>{active.artist}</div>
              </>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>No track selected</div>
            )}
          </TrackFlipTransition>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            {active ? `Track ${Math.max(activeTrackIndex + 1, 1)} of ${libraryRows.length || 1}` : "Choose a track below to focus the player."}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={() => selectRelativeTrack(-1)} style={transportBtn(chassis.accent)}>
            ◀ PREV
          </button>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {(
              [
                { id: "artwork" as const, label: "ARTWORK" },
                { id: "video" as const, label: "VIDEO" },
                { id: "visualizer" as const, label: "FX" },
              ] as const
            ).map((m) => {
              const on = screenMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setScreenMode(m.id)}
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    padding: "6px 8px",
                    borderRadius: 999,
                    cursor: "pointer",
                    border: on ? `1px solid ${chassis.accent}` : "1px solid rgba(255,255,255,0.12)",
                    background: on ? `${chassis.accent}22` : "transparent",
                    color: on ? chassis.accent : "rgba(255,255,255,0.45)",
                    fontFamily: "inherit",
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => selectRelativeTrack(1)} style={transportBtn(chassis.accent)}>
            NEXT ▶
          </button>
        </div>

        {audioSrc ? (
          <audio
            key={audioSrc}
            src={audioSrc}
            controls
            preload="metadata"
            style={{ width: "100%", height: 34 }}
          />
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            No direct audio URL on this selection. Use the persistent player if this track is already cast elsewhere.
          </div>
        )}
      </div>
    </section>
  );

  const librarySection = (
    <section style={col}>
      <header style={sectionHeader}>TRACK SELECTOR</header>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {libraryRows.length === 0 ? (
          <div style={emptyBox}>
            No songs in your playlist artifact yet. Upload or add tracks to your library.
          </div>
        ) : (
          libraryRows.map((row, index) => {
            const activeRow = row.id === selectedId;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "10px 12px",
                  marginBottom: 6,
                  borderRadius: 10,
                  border: activeRow
                    ? `1px solid ${chassis.accent}b3`
                    : "1px solid rgba(255,255,255,0.08)",
                  background: activeRow
                    ? `${chassis.accent}26`
                    : "rgba(255,255,255,0.03)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{String(index + 1).padStart(2, "0")}</span>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: 18 }}>{row.artist}</div>
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                  {row.duration}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );

  const queueSection = (
    <section style={col}>
      <header style={sectionHeader}>QUEUE</header>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {queueRows.length === 0 ? (
          <div style={emptyBox}>Queue empty — select tracks from Library.</div>
        ) : (
          <TrackFlipTransition
            transitionKey={selectedId ?? queueRows[0]?.id ?? "queue"}
            mode="slide"
            neonSweep
            accent={chassis.accent}
          >
            {queueRows.map((row, idx) => (
              <div
                key={`${row.id}-${idx}`}
                style={{
                  padding: "8px 10px",
                  marginBottom: 4,
                  borderRadius: 8,
                  background: row.id === selectedId ? `${chassis.accent}22` : "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 11,
                }}
              >
                <div style={{ fontWeight: 700 }}>{row.title}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>{row.artist}</div>
              </div>
            ))}
          </TrackFlipTransition>
        )}
      </div>
    </section>
  );

  const playlistToolsSection = (
    <section style={col}>
      <header style={sectionHeader}>PLAYLIST TOOLS</header>
      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {[
            { label: "SHARE", accent: "#00FFFF" },
            { label: "SAVE", accent: "#00FF88" },
            { label: "EDIT", accent: "#FF2DAA" },
            { label: "PRIVACY", accent: "#FFD700" },
          ].map((tool) => (
            <button
              key={tool.label}
              type="button"
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "7px 10px",
                borderRadius: 999,
                border: `1px solid ${tool.accent}66`,
                background: `${tool.accent}14`,
                color: tool.accent,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {tool.label}
            </button>
          ))}
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 8,
          }}
        >
          EQ (UI only — not wired to audio output)
        </div>
        {(["low", "mid", "high"] as const).map((band) => (
          <label
            key={band}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              fontSize: 10,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <span style={{ width: 36 }}>{band}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={eq[band]}
              onChange={(e) =>
                setEq((prev) => ({ ...prev, [band]: Number(e.target.value) }))
              }
              style={{ flex: 1 }}
            />
          </label>
        ))}
      </div>
    </section>
  );

  const chassisSection = (
    <div
      style={{
        padding: "8px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#FF2DAA" }}>
        CHASSIS · EQUIP / PREVIEW / PURCHASE
      </div>
      {studioMsg ? (
        <div style={{ fontSize: 11, color: studioMsg.includes("Not enough") || studioMsg.includes("Cannot") ? "#ffb0b0" : "#9dffc8" }}>
          {studioMsg}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
          gap: 8,
          maxHeight: isMobile ? 220 : 168,
          overflowY: "auto",
        }}
      >
        {chassisChoices.map((c) => {
          const owned = ownsChassis(userId, c.id);
          const equipped = equippedId === c.id;
          const previewing = previewId === c.id;
          return (
            <MediaPlayerChassisPreview
              key={c.id}
              chassis={c}
              owned={owned}
              equipped={equipped}
              previewOnly={!owned}
              onClick={() => {
                if (owned) {
                  setPreviewId(null);
                  void (async () => {
                    if (equipped) {
                      await unequipChassisApi(userId);
                      setStudioMsg(`Unequipped ${c.label} · Standard active.`);
                    } else {
                      const r = await equipChassisApi(userId, c.id);
                      setStudioMsg(r.ok ? `Equipped ${c.label}.` : r.message ?? "Cannot equip");
                    }
                    setOwnedTick((n) => n + 1);
                    setEquippedId(getEquippedChassisId(userId));
                  })();
                } else {
                  setPreviewId(previewing ? null : c.id);
                  setStudioMsg(
                    previewing
                      ? null
                      : `Previewing ${c.label}. Purchase to own — runtime stays on equipped chassis.`,
                  );
                }
              }}
              footer={
                !owned ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void (async () => {
                          const cost = c.pricePoints ?? 299;
                          const r = await purchaseChassisWithPointsApi(userId, c.id, () =>
                            spendTmiPoints(userId, cost, `media_player_${c.id}`),
                          );
                          setStudioMsg(r.message);
                          if (r.ok) {
                            setPreviewId(null);
                            setOwnedTick((n) => n + 1);
                          }
                        })();
                      }}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "5px 6px",
                        borderRadius: 5,
                        border: `1px solid ${c.accent}88`,
                        background: `${c.accent}22`,
                        color: c.accent,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      BUY {c.pricePoints ?? 299} PTS
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void (async () => {
                          const r = await purchaseChassisWithStripe(c.id);
                          if (r.ok && r.url) window.location.href = r.url;
                          else setStudioMsg(r.message ?? "Stripe unavailable");
                        })();
                      }}
                      style={{
                        fontSize: 8,
                        fontWeight: 900,
                        padding: "5px 6px",
                        borderRadius: 5,
                        border: "1px solid #FFD70088",
                        background: "#FFD70022",
                        color: "#FFD700",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      BUY ${((c.priceUsdCents ?? 299) / 100).toFixed(2)}
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    Tap to {equipped ? "unequip" : "equip"}
                  </div>
                )
              }
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(170,45,255,0.08)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#AA2DFF" }}>
            MEDIA PLAYER STUDIO
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Runtime: {MEDIA_PLAYER_CHASSIS_REGISTRY[runtimeChassisId]?.icon}{" "}
            {MEDIA_PLAYER_CHASSIS_REGISTRY[runtimeChassisId]?.label ?? "Standard"}
            {isPreviewingUnowned ? (
              <>
                <span style={{ margin: "0 6px", opacity: 0.35 }}>·</span>
                <span style={{ color: "#FFD700" }}>Previewing {chassis.label}</span>
              </>
            ) : null}
            <span style={{ margin: "0 6px", opacity: 0.35 }}>·</span>
            Playlist Artifact package (separate from chassis ownership)
          </div>
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
          {isMobile ? "PLAYER FIRST" : "STUDIO GRID"}
        </div>
      </div>
      {isMobile ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            minHeight: 0,
            padding: 10,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {playerSection}
          {librarySection}
          {queueSection}
          {playlistToolsSection}
          {chassisSection}
        </div>
      ) : (
        <>
          {chassisSection}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: 10,
              flex: 1,
              minHeight: 0,
              padding: 10,
            }}
          >
            {playerSection}
            {librarySection}
            {queueSection}
            {playlistToolsSection}
          </div>
        </>
      )}
    </div>
  );
}

function transportBtn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    border: `1px solid ${color}88`,
    background: `${color}18`,
    color,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

const sectionHeader: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "10px 12px",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.7)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const emptyBox: CSSProperties = {
  padding: 16,
  borderRadius: 10,
  border: "1px dashed rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.5)",
  fontSize: 12,
  lineHeight: 1.45,
};
