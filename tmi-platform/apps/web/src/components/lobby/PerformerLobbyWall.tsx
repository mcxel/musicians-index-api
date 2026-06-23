"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MaskedVideoTile } from "@/components/live/MaskedVideoTile";

interface LiveEntry {
  userId: string;
  displayName: string;
  genre: string;
  avatarUrl?: string;
  startedAt: number;
  viewerCount: number;
  roomId?: string;
}

type PerformerIconId = "🎤" | "🔥" | "🎛️" | "👑" | "💃" | "😂";

interface PerformerTile {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  genre: string;
  category: string;
  lookingToCollab: boolean;
  viewers: number;
  accentColor: string;
  roomId: string;
  iconId: PerformerIconId;
}

const SEED_PERFORMERS: PerformerTile[] = [
  { id: "p1", name: "Astra Nova",   slug: "astra-nova", avatarUrl: "/tmi-curated/mag-22.jpg", iconId: "🎤", genre: "R&B",       category: "Singer",       lookingToCollab: true,  viewers: 847,  accentColor: "#FF2DAA", roomId: "room-astra-nova" },
  { id: "p2", name: "Lagos Burst",  slug: "lagos-burst", avatarUrl: "/tmi-curated/mag-27.jpg", iconId: "🔥", genre: "Afrobeat",  category: "Performer",    lookingToCollab: false, viewers: 563,  accentColor: "#FF6B35", roomId: "room-lagos-burst" },
  { id: "p3", name: "Prism Vex",    slug: "prism-vex", avatarUrl: "/tmi-curated/mag-31.jpg", iconId: "🎛️", genre: "EDM",       category: "DJ/Producer",  lookingToCollab: true,  viewers: 701,  accentColor: "#00FFFF", roomId: "room-prism-vex" },
  { id: "p4", name: "Zion Freq",    slug: "zion-freq", avatarUrl: "/tmi-curated/mag-53.jpg", iconId: "👑", genre: "Gospel",    category: "Singer",       lookingToCollab: true,  viewers: 1204, accentColor: "#FFD700", roomId: "room-zion-freq" },
  { id: "p5", name: "Flex King",    slug: "flex-king", avatarUrl: "/tmi-curated/mag-42.jpg", iconId: "💃", genre: "Dance",     category: "Dancer",       lookingToCollab: false, viewers: 389,  accentColor: "#AA2DFF", roomId: "room-flex-king" },
  { id: "p6", name: "Nova Laugh",   slug: "nova-laugh", avatarUrl: "/tmi-curated/mag-58.jpg", iconId: "😂", genre: "Comedy",    category: "Comedian",     lookingToCollab: true,  viewers: 512,  accentColor: "#39FF14", roomId: "room-nova-laugh" },
];

interface Props {
  compact?: boolean;
}

const ACCENT_POOL = ['#FF2DAA', '#00FFFF', '#FFD700', '#AA2DFF', '#FF6B35', '#00FF88'];

export default function PerformerLobbyWall({ compact = false }: Props) {
  const router = useRouter();
  const [connecting,  setConnecting]  = useState<Set<string>>(new Set());
  const [accepted,    setAccepted]    = useState<Set<string>>(new Set());
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [liveUsers,   setLiveUsers]   = useState<LiveEntry[]>([]);

  // Poll real live users from LiveRegistry every 10s
  useEffect(() => {
    async function fetchLive() {
      try {
        const res  = await fetch('/api/live/go');
        const data = await res.json() as { live: LiveEntry[] };
        if (Array.isArray(data.live)) setLiveUsers(data.live);
      } catch { /* no-op */ }
    }
    fetchLive();
    const t = setInterval(fetchLive, 10_000);
    return () => clearInterval(t);
  }, []);

  function connect(id: string) {
    setConnecting((prev) => new Set(prev).add(id));
  }

  function decline(id: string) {
    setConnecting((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function acceptAndJoin(performer: PerformerTile) {
    setAccepted((prev) => new Set(prev).add(performer.id));
    setJoiningRoomId(performer.id);
    router.push(`/live/rooms/collab-${performer.slug}?from=live-lobby`);
  }

  function joinRoom(performer: PerformerTile) {
    setJoiningRoomId(performer.id);
    router.push(`/live/rooms/${performer.roomId}?from=live-lobby`);
  }

  // Build real tiles from live users (deterministic accent color from userId hash)
  const realTiles: PerformerTile[] = liveUsers.map((u, i) => ({
    id: `live-${u.userId}`,
    name: u.displayName,
    slug: u.userId,
    avatarUrl: u.avatarUrl,
    genre: u.genre,
    category: 'Performer',
    lookingToCollab: false,
    viewers: u.viewerCount,
    accentColor: ACCENT_POOL[i % ACCENT_POOL.length] ?? '#FF2DAA',
    roomId: u.roomId ?? `room-${u.userId}`,
    iconId: '🎤',
  }));

  const seedTiles  = compact ? SEED_PERFORMERS.slice(0, 3) : SEED_PERFORMERS;
  const mergedTiles = realTiles.length > 0
    ? [...realTiles, ...seedTiles.slice(0, Math.max(0, 6 - realTiles.length))]
    : seedTiles;
  const tiles = compact ? mergedTiles.slice(0, 3) : mergedTiles;
  const cols = compact ? 3 : 3;
  const totalOnline = realTiles.length > 0 ? realTiles.length : tiles.length;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#FF2DAA" }}>
            PERFORMER CONNECT · {totalOnline} ONLINE
          </div>
          {realTiles.length > 0 && (
            <span style={{ fontSize: 7, fontWeight: 900, background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.35)", color: "#FF2DAA", borderRadius: 4, padding: "2px 6px", letterSpacing: "0.1em" }}>
              🔴 LIVE
            </span>
          )}
        </div>
        <Link href="/live/lobby/performers" style={{ fontSize: 8, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.1em" }}>
          VIEW ALL →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {tiles.map((p) => {
          const sent = connecting.has(p.id);
          return (
            <div
              key={p.id}
              style={{
                borderRadius: 14,
                border: `1.5px solid ${p.accentColor}44`,
                background: `linear-gradient(145deg, ${p.accentColor}09, rgba(5,5,16,0.9))`,
                padding: "14px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                position: "relative",
              }}
            >
              {/* Live badge */}
              <div style={{ position: "absolute", top: 8, right: 8, background: "#FF2DAA", borderRadius: 4, padding: "2px 5px", fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>
                ● LIVE
              </div>

              {/* Camera frame */}
              <div style={{ marginBottom: 8, display: "grid", placeItems: "center" }}>
                <MaskedVideoTile
                  shape="octagon"
                  performerName={p.name}
                  performerSlug={p.slug}
                  isLive
                  viewerCount={p.viewers}
                  genre={p.genre}
                  accentColor={p.accentColor}
                  avatarUrl={p.avatarUrl}
                  size={compact ? 120 : 156}
                />
              </div>

              {/* Name */}
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{p.name}</div>

              {/* Genre + category */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <span style={{ fontSize: 7, background: `${p.accentColor}22`, border: `1px solid ${p.accentColor}44`, color: p.accentColor, borderRadius: 4, padding: "2px 6px", fontWeight: 900, letterSpacing: "0.1em" }}>
                  {p.genre}
                </span>
                <span style={{ fontSize: 7, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", borderRadius: 4, padding: "2px 6px" }}>
                  {p.category}
                </span>
              </div>

              {/* Collab indicator */}
              {p.lookingToCollab && (
                <div style={{ fontSize: 7, color: "#00FF88", fontWeight: 900, letterSpacing: "0.1em" }}>
                  ✦ LOOKING TO COLLAB
                </div>
              )}

              {/* Connect button */}
              {!compact && (
                <div style={{ display: "grid", gap: 6, marginTop: 2 }}>
                  {!sent ? (
                    <button
                      onClick={() => connect(p.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: `1px solid ${p.accentColor}66`,
                        background: `${p.accentColor}18`,
                        color: p.accentColor,
                        fontSize: 8,
                        fontWeight: 900,
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      INVITE TO COLLABORATE
                    </button>
                  ) : (
                    <div style={{
                      fontSize: 8,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: accepted.has(p.id) ? "#00FF88" : "#FFD700",
                      textAlign: "center",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.06)",
                    }}>
                      {accepted.has(p.id) ? "COLLAB ACCEPTED ✓" : "PENDING · ACCEPT OR DECLINE"}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 6 }}>
                    <Link href={`/messages/new?to=${p.slug}`} style={{ textAlign: "center", textDecoration: "none", padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(0,255,255,0.35)", color: "#00FFFF", fontSize: 8, fontWeight: 900, letterSpacing: "0.08em" }}>
                      MESSAGE
                    </Link>
                    <Link href={`/performers/${p.slug}`} style={{ textAlign: "center", textDecoration: "none", padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.24)", color: "#fff", fontSize: 8, fontWeight: 900, letterSpacing: "0.08em" }}>
                      VIEW PROFILE
                    </Link>
                    <button
                      onClick={() => joinRoom(p)}
                      disabled={joiningRoomId !== null}
                      style={{ textAlign: "center", textDecoration: "none", padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(255,45,170,0.35)", color: "#FF2DAA", fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", background: "transparent", cursor: joiningRoomId !== null ? "not-allowed" : "pointer", opacity: joiningRoomId !== null ? 0.65 : 1 }}
                    >
                      {joiningRoomId === p.id ? "JOINING..." : "JOIN ROOM"}
                    </button>
                    {sent && !accepted.has(p.id) ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        <button onClick={() => acceptAndJoin(p)} disabled={joiningRoomId !== null} style={{ borderRadius: 6, border: "1px solid rgba(0,255,136,0.45)", background: "rgba(0,255,136,0.12)", color: "#00FF88", fontSize: 7, fontWeight: 900, letterSpacing: "0.08em", cursor: joiningRoomId !== null ? "not-allowed" : "pointer", padding: "6px 4px", opacity: joiningRoomId !== null ? 0.65 : 1 }}>
                          ACCEPT
                        </button>
                        <button onClick={() => decline(p.id)} disabled={joiningRoomId !== null} style={{ borderRadius: 6, border: "1px solid rgba(255,107,107,0.45)", background: "rgba(255,107,107,0.12)", color: "#FF6B6B", fontSize: 7, fontWeight: 900, letterSpacing: "0.08em", cursor: joiningRoomId !== null ? "not-allowed" : "pointer", padding: "6px 4px", opacity: joiningRoomId !== null ? 0.65 : 1 }}>
                          DECLINE
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(255,215,0,0.24)", color: "#FFD700", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em" }}>
                        READY
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Go Live CTA slot */}
        {!compact && (
          <Link
            href="/live/go"
            style={{
              borderRadius: 14,
              border: '1.5px dashed rgba(255,45,170,0.35)',
              background: 'rgba(255,45,170,0.04)',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: 200,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,45,170,0.10)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,45,170,0.7)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,45,170,0.04)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,45,170,0.35)';
            }}
          >
            <div style={{ fontSize: 32 }}>🎤</div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: '#FF2DAA', textAlign: 'center' }}>
              GO PUBLIC<br />APPEAR ON THIS WALL
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: '0.06em', lineHeight: 1.5 }}>
              Start broadcasting and your<br />profile shows up here instantly.
            </div>
            <div style={{
              padding: '7px 16px',
              background: '#FF2DAA',
              color: '#050510',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.12em',
              borderRadius: 6,
              marginTop: 4,
            }}>
              🔴 GO PUBLIC NOW
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
