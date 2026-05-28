"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MaskedVideoTile from "@/components/media/MaskedVideoTile";

type TileRole = "fan" | "performer" | "artist" | "host";
type SelfViewState = "preview" | "syncing" | "live-on-wall";

interface WallTile {
  id: string;
  name: string;
  role: TileRole;
  genre: string;
  isLive: boolean;
  viewerCount: number;
  avatarUrl?: string;
  avatarEmoji?: string;
  accentColor: string;
  source: "live" | "active-fan" | "featured" | "pending";
  vibeState?: {
    underlay: string;
    overlay: string;
    strobeIntensity: number;
    spotlightMode: boolean;
    shaderQuality: "low" | "medium" | "high";
  };
}

interface LiveApiEntry {
  userId: string;
  displayName: string;
  genre: string;
  role?: "fan" | "performer" | "artist" | "host" | "admin";
  viewerCount: number;
  avatarUrl?: string;
  vibeState?: {
    underlay: string;
    overlay: string;
    strobeIntensity: number;
    spotlightMode: boolean;
    shaderQuality: "low" | "medium" | "high";
  };
}

interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
}

interface SubmissionActivity {
  id: string;
  title: string;
  type: string;
  submitterId: string;
  createdAt: number;
}

const ACTIVE_FANS: WallTile[] = [
  { id: "fan-active-1", name: "Nova Fan", role: "fan", genre: "Hip-Hop", isLive: false, viewerCount: 0, avatarUrl: "/tmi-curated/mag-58.jpg", accentColor: "#00FFFF", source: "active-fan" },
  { id: "fan-active-2", name: "Crown Fam", role: "fan", genre: "Trap", isLive: false, viewerCount: 0, avatarUrl: "/tmi-curated/mag-66.jpg", accentColor: "#00FFFF", source: "active-fan" },
  { id: "fan-active-3", name: "Wave Rider", role: "fan", genre: "EDM", isLive: false, viewerCount: 0, avatarUrl: "/tmi-curated/mag-74.jpg", accentColor: "#00FFFF", source: "active-fan" },
];

const FEATURED_AVATARS: WallTile[] = [
  { id: "featured-1", name: "Astra Nova", role: "performer", genre: "R&B",    isLive: false, viewerCount: 0, avatarUrl: "/tmi-curated/mag-22.jpg", accentColor: "#FF2DAA", source: "featured" },
  { id: "featured-2", name: "Prism Vex",  role: "artist",   genre: "EDM",    isLive: false, viewerCount: 0, avatarUrl: "/tmi-curated/mag-31.jpg", accentColor: "#AA2DFF", source: "featured" },
  { id: "featured-3", name: "Host Ray",   role: "host",     genre: "Live",   isLive: false, viewerCount: 0, avatarUrl: "/tmi-curated/mag-42.jpg", accentColor: "#FFD700", source: "featured" },
  { id: "featured-4", name: "Zion Freq",  role: "performer", genre: "Gospel", isLive: false, viewerCount: 0, avatarUrl: "/tmi-curated/mag-53.jpg", accentColor: "#FF2DAA", source: "featured" },
];

const ROLE_COLOR: Record<TileRole, string> = {
  fan: "#00FFFF",
  performer: "#FF2DAA",
  artist: "#AA2DFF",
  host: "#FFD700",
};

const ROLE_LABEL: Record<TileRole, string> = {
  fan: "FAN",
  performer: "PERFORMER",
  artist: "ARTIST",
  host: "HOST",
};

function normalizeRole(role?: string): TileRole {
  const normalized = (role ?? "fan").toLowerCase();
  if (normalized === "performer") return "performer";
  if (normalized === "artist") return "artist";
  if (normalized === "host" || normalized === "admin") return "host";
  return "fan";
}

function toWallTile(entry: LiveApiEntry): WallTile {
  const role = normalizeRole(entry.role);
  const fanAvatarUrl = role === "fan" ? entry.avatarUrl : undefined;
  return {
    id: entry.userId,
    name: entry.displayName,
    role,
    genre: entry.genre,
    isLive: true,
    viewerCount: entry.viewerCount,
    avatarUrl: fanAvatarUrl,
    avatarEmoji: role === "fan" ? "🎧" : role === "host" ? "🎙️" : "🎤",
    accentColor: ROLE_COLOR[role],
    source: "live",
    vibeState: entry.vibeState,
  };
}

interface Props {
  compact?: boolean;
}

export default function MixedLobbyWall({ compact = false }: Props) {
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [liveEntries, setLiveEntries] = useState<LiveApiEntry[]>([]);
  const [pendingTile, setPendingTile] = useState<WallTile | null>(null);
  const [selfViewState, setSelfViewState] = useState<SelfViewState>("preview");
  const [selfStream, setSelfStream] = useState<MediaStream | null>(null);
  const [banner, setBanner] = useState<string>("");
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionActivity[]>([]);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: SessionUser }) => {
        if (data.authenticated && data.user) setSessionUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;

    navigator.mediaDevices
      .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        setSelfStream(stream);
        if (selfVideoRef.current) {
          selfVideoRef.current.srcObject = stream;
          selfVideoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
      setSelfStream((previous) => {
        previous?.getTracks().forEach((track) => track.stop());
        return null;
      });
    };
  }, []);

  useEffect(() => {
    if (!selfVideoRef.current || !selfStream) return;
    selfVideoRef.current.srcObject = selfStream;
    selfVideoRef.current.play().catch(() => {});
  }, [selfStream]);

  useEffect(() => {
    let mounted = true;
    const refreshLive = async () => {
      try {
        const response = await fetch("/api/live/go", { credentials: "include", cache: "no-store" });
        if (!response.ok) return;
        const data: { live?: LiveApiEntry[] } = await response.json();
        if (mounted) setLiveEntries(data.live ?? []);
      } catch {
        if (mounted) setLiveEntries([]);
      }
    };

    void refreshLive();
    const interval = window.setInterval(() => void refreshLive(), 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onSyncing = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string; displayName?: string; role?: string; genre?: string }>).detail;
      if (!detail?.userId) return;
      const role = normalizeRole(detail.role);
      setPendingTile({
        id: detail.userId,
        name: detail.displayName ?? "You",
        role,
        genre: detail.genre ?? "Live",
        isLive: true,
        viewerCount: 0,
        avatarEmoji: role === "fan" ? "🎧" : "🎤",
        accentColor: ROLE_COLOR[role],
        source: "pending",
      });
      setSelfViewState("syncing");
      setBanner("Syncing your live tile to the wall...");
    };

    const onGoLive = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && pendingTile && pendingTile.id === detail.userId) {
        setPendingTile(null);
      }
      setSelfViewState("live-on-wall");
      setBanner("You are now on the Lobby Wall");
      fetch("/api/live/go", { credentials: "include", cache: "no-store" })
        .then((r) => r.json())
        .then((data: { live?: LiveApiEntry[] }) => setLiveEntries(data.live ?? []))
        .catch(() => {});
    };

    const onEndBroadcast = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (!detail?.userId) return;
      setPendingTile((previous) => (previous?.id === detail.userId ? null : previous));
      setSelfViewState("preview");
      setBanner("Broadcast ended. You are back in preview mode.");
      fetch("/api/live/go", { credentials: "include", cache: "no-store" })
        .then((r) => r.json())
        .then((data: { live?: LiveApiEntry[] }) => setLiveEntries(data.live ?? []))
        .catch(() => {});
    };

    window.addEventListener("tmi:live-syncing", onSyncing);
    window.addEventListener("tmi:golive", onGoLive);
    window.addEventListener("tmi:endbroadcast", onEndBroadcast);

    return () => {
      window.removeEventListener("tmi:live-syncing", onSyncing);
      window.removeEventListener("tmi:golive", onGoLive);
      window.removeEventListener("tmi:endbroadcast", onEndBroadcast);
    };
  }, [pendingTile]);

  useEffect(() => {
    const syncSubmissionFeed = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("tmi_submission_feed") ?? "[]") as SubmissionActivity[];
        const normalized = Array.isArray(stored)
          ? stored
              .filter((entry) => entry && typeof entry.id === "string" && typeof entry.title === "string")
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 6)
          : [];
        setRecentSubmissions(normalized);
      } catch {
        setRecentSubmissions([]);
      }
    };

    syncSubmissionFeed();

    const onSubmissionCreated = (event: Event) => {
      const detail = (event as CustomEvent<SubmissionActivity>).detail;
      if (!detail?.id) return;
      setBanner(`Uploaded: ${detail.title} is now in rotation.`);
      syncSubmissionFeed();
    };

    window.addEventListener("storage", syncSubmissionFeed);
    window.addEventListener("tmi:submission-created", onSubmissionCreated);

    return () => {
      window.removeEventListener("storage", syncSubmissionFeed);
      window.removeEventListener("tmi:submission-created", onSubmissionCreated);
    };
  }, []);

  const prioritizedTiles = useMemo(() => {
    const liveTiles = liveEntries.map(toWallTile);

    if (pendingTile && !liveTiles.some((entry) => entry.id === pendingTile.id)) {
      liveTiles.unshift(pendingTile);
    }

    const livePerformers = liveTiles
      .filter((tile) => tile.role !== "fan")
      .sort((a, b) => b.viewerCount - a.viewerCount);
    const liveFans = liveTiles
      .filter((tile) => tile.role === "fan")
      .sort((a, b) => b.viewerCount - a.viewerCount);

    const merged: WallTile[] = [];
    const seen = new Set<string>();

    const pushUnique = (tile: WallTile) => {
      if (seen.has(tile.id)) return;
      seen.add(tile.id);
      merged.push(tile);
    };

    livePerformers.forEach(pushUnique);
    liveFans.forEach(pushUnique);
    ACTIVE_FANS.forEach(pushUnique);
    FEATURED_AVATARS.forEach(pushUnique);

    return compact ? merged.slice(0, 6) : merged;
  }, [compact, liveEntries, pendingTile]);

  const selfRole = normalizeRole(sessionUser?.role);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#AA2DFF" }}>
          MIXED LOBBY WALL · {prioritizedTiles.length} ACTIVE TILES
        </div>
        <Link href="/live/lobby" style={{ fontSize: 8, color: "#AA2DFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          VIEW ALL →
        </Link>
      </div>

      {banner && (
        <div
          style={{
            marginBottom: 10,
            borderRadius: 8,
            border: "1px solid rgba(255,45,170,0.35)",
            background: "linear-gradient(90deg, rgba(255,45,170,0.14), rgba(170,45,255,0.14))",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            padding: "8px 10px",
          }}
        >
          {banner}
        </div>
      )}

      {!compact && (
        <section
          style={{
            marginBottom: 14,
            borderRadius: 12,
            border: "1px solid rgba(0,255,255,0.26)",
            background: "linear-gradient(135deg, rgba(0,255,255,0.06), rgba(170,45,255,0.08))",
            padding: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.14em", marginBottom: 6 }}>
              VIDEO TOWER
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              {sessionUser?.name ?? sessionUser?.email ?? "Guest"}
            </div>
            <div style={{ display: "inline-flex", gap: 6, alignItems: "center", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", padding: "4px 10px", fontSize: 8, letterSpacing: "0.1em", fontWeight: 900, color: "#fff" }}>
              {selfViewState === "preview" && "PREVIEW"}
              {selfViewState === "syncing" && "SYNCING"}
              {selfViewState === "live-on-wall" && "LIVE ON WALL"}
            </div>
            <div style={{ marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.6)" }}>
              Role: {ROLE_LABEL[selfRole]} · No relog required to switch persona.
            </div>
          </div>

          <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", minHeight: 148, background: "rgba(5,5,16,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {selfStream ? (
              <video ref={selfVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 148 }} />
            ) : (
              <div style={{ minHeight: 148, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(0,255,255,0.18), rgba(170,45,255,0.22))" }}>
                <img src="/tmi-curated/mag-50.jpg" alt="Self preview fallback" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
        </section>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 7, color: "#FF2DAA", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 4, padding: "3px 8px", fontWeight: 900 }}>
          LIVE PERFORMERS FIRST
        </div>
        <div style={{ fontSize: 7, color: "#00FFFF", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 4, padding: "3px 8px", fontWeight: 900 }}>
          ACTIVE FANS NEXT
        </div>
        <div style={{ fontSize: 7, color: "#FFD700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 4, padding: "3px 8px", fontWeight: 900 }}>
          PREMIUM AVATAR FILL
        </div>
      </div>

      {!compact && recentSubmissions.length > 0 && (
        <section style={{ marginBottom: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: 12 }}>
          <div style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.14em", marginBottom: 10 }}>
            JUST UPLOADED
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {recentSubmissions.slice(0, 4).map((entry) => (
              <Link
                key={entry.id}
                href={`/submit/confirm?id=${encodeURIComponent(entry.id)}&title=${encodeURIComponent(entry.title)}&type=${encodeURIComponent(entry.type)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(5,5,16,0.55)",
                  padding: "8px 10px",
                }}
              >
                <div>
                  <div style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>{entry.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {entry.type} · {entry.submitterId}
                  </div>
                </div>
                <div style={{ color: "#FF2DAA", fontSize: 9, fontWeight: 900, letterSpacing: "0.1em" }}>LIVE FEED ↗</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {prioritizedTiles.map((tile) => {
          const isSelfTile = !!sessionUser && tile.id === sessionUser.id;
          const badgeColor = ROLE_COLOR[tile.role];
          const mediaStream = isSelfTile && selfViewState !== "preview" ? selfStream : null;
          const intensityLabel = tile.vibeState
            ? tile.vibeState.strobeIntensity >= 70
              ? "HIGH"
              : tile.vibeState.strobeIntensity >= 40
                ? "MID"
                : "LOW"
            : null;
          return (
            <div key={tile.id} style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 30,
                  borderRadius: 6,
                  border: `1px solid ${badgeColor}55`,
                  background: `${badgeColor}22`,
                  color: badgeColor,
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  padding: "3px 6px",
                }}
              >
                {ROLE_LABEL[tile.role]}
              </div>

              <MaskedVideoTile
                shape="octagon"
                mediaStream={mediaStream}
                performerName={tile.name}
                isLive={tile.isLive}
                viewerCount={tile.viewerCount}
                genre={tile.genre}
                accentColor={tile.accentColor}
                size={compact ? 140 : 168}
                avatarUrl={tile.avatarUrl}
                avatarEmoji={tile.avatarEmoji ?? "🎤"}
                role={tile.role}
                allowAudioPreview
              />

              {tile.vibeState && (
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    right: 8,
                    bottom: 8,
                    zIndex: 35,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 7, fontWeight: 900, color: "#00FFFF", borderRadius: 999, border: "1px solid rgba(0,255,255,0.35)", background: "rgba(0,255,255,0.14)", padding: "2px 6px", letterSpacing: "0.08em" }}>
                    {tile.vibeState.underlay.toUpperCase()}
                  </span>
                  {tile.vibeState.overlay !== "none" && (
                    <span style={{ fontSize: 7, fontWeight: 900, color: "#FF2DAA", borderRadius: 999, border: "1px solid rgba(255,45,170,0.35)", background: "rgba(255,45,170,0.14)", padding: "2px 6px", letterSpacing: "0.08em" }}>
                      {tile.vibeState.overlay.toUpperCase()}
                    </span>
                  )}
                  {intensityLabel && (
                    <span style={{ fontSize: 7, fontWeight: 900, color: "#FFD700", borderRadius: 999, border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.14)", padding: "2px 6px", letterSpacing: "0.08em" }}>
                      {intensityLabel} ENERGY
                    </span>
                  )}
                  {tile.vibeState.spotlightMode && (
                    <span style={{ fontSize: 7, fontWeight: 900, color: "#fff", borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.14)", padding: "2px 6px", letterSpacing: "0.08em" }}>
                      SPOTLIGHT
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
