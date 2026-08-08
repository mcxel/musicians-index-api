/**
 * HomeLiveLobbyWall — homepage DiscoveryBus surface for Live Lobby Walls.
 * Variants: home3_mosaic (social) · home5_arena (competitions) · home1_featured (rail).
 * Reuses LobbyDiscoveryCard + InstantJoinRuntime. Honest empty states (Rule 20).
 */

"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import LobbyDiscoveryCard from "@/components/discovery/LobbyDiscoveryCard";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import {
  filterForHomepageSurface,
  HOMEPAGE_SURFACE_COPY,
  type HomepageDiscoverySurface,
} from "@/lib/discovery/homepageDiscoveryFilters";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import {
  computeLiveSurfaceDiscoveryScore,
  projectDiscoveryRecordToSurfaceCard,
} from "@/lib/discovery/LiveSurfaceCard";
import { useLiveDiscoveryOverlay } from "@/lib/discovery/liveDiscoveryOverlayStore";
import {
  LIVE_LOBBY_WALL_CONTRACT_ID,
  useAdaptiveWorldRuntime,
} from "@/lib/adaptiveWorldRuntime";

const RIM_KEYFRAMES = `
@keyframes tmiLobbyRimSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

function ensureRimKeyframes() {
  if (typeof document === "undefined") return;
  const id = "tmi-lobby-rim-keyframes";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = RIM_KEYFRAMES;
  document.head.appendChild(style);
}

export interface HomeLiveLobbyWallProps {
  surface: HomepageDiscoverySurface;
  /** Max cards shown in the grid (mosaic/arena). Featured uses channel panels elsewhere. */
  maxTiles?: number;
  viewerUserId?: string | null;
  title?: string;
  style?: CSSProperties;
  /** Show "Open Live Lobby Walls" control */
  showOpenOverlay?: boolean;
}

export default function HomeLiveLobbyWall({
  surface,
  maxTiles = 12,
  viewerUserId = null,
  title,
  style,
  showOpenOverlay = true,
}: HomeLiveLobbyWallProps) {
  const records = useDiscoveryBus(viewerUserId);
  const filtered = filterForHomepageSurface(records, surface)
    .slice()
    .sort((a, b) => {
      const ca = projectDiscoveryRecordToSurfaceCard(a);
      const cb = projectDiscoveryRecordToSurfaceCard(b);
      const sa = ca ? (ca.discoveryScore ?? computeLiveSurfaceDiscoveryScore(ca)) : 0;
      const sb = cb ? (cb.discoveryScore ?? computeLiveSurfaceDiscoveryScore(cb)) : 0;
      return sb - sa;
    })
    .slice(0, maxTiles);
  const copy = HOMEPAGE_SURFACE_COPY[surface];
  const label = title ?? copy.title;
  const { open: openOverlay } = useLiveDiscoveryOverlay();
  useAdaptiveWorldRuntime(LIVE_LOBBY_WALL_CONTRACT_ID);

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [joinRoom, setJoinRoom] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);
  const [role, setRole] = useState("FAN");

  useEffect(() => {
    ensureRimKeyframes();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: { role?: string } }) => {
        if (!cancelled && data?.authenticated) {
          setRole((data.user?.role ?? "FAN").toUpperCase());
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleJoin = useCallback(
    (record: LiveDiscoveryRecord) => {
      setJoinRoom(resolveInstantJoin(record, { role }));
    },
    [role],
  );

  const mosaicAccent = copy.accent;
  const isArena = surface === "home5_arena";
  const isMosaic = surface === "home3_mosaic";

  return (
    <>
      <section
        data-home-live-lobby-wall={surface}
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px 28px",
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                fontWeight: 900,
                color: mosaicAccent,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              {filtered.length === 0
                ? "No live rooms in this wall right now"
                : `${filtered.length} live · real humans only`}
            </div>
          </div>
          {showOpenOverlay && (
            <button
              type="button"
              onClick={() =>
                openOverlay({
                  lockedCategory: isArena
                    ? "battles"
                    : isMosaic
                      ? "live_now"
                      : null,
                })
              }
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${mosaicAccent}66`,
                background: `${mosaicAccent}18`,
                color: mosaicAccent,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              ALL LIVE LOBBY WALLS →
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${mosaicAccent}33`,
              background: isMosaic
                ? "linear-gradient(145deg, rgba(0,255,136,0.08), rgba(5,5,16,0.9))"
                : isArena
                  ? "linear-gradient(145deg, rgba(255,45,170,0.1), rgba(5,5,16,0.9))"
                  : "rgba(5,5,16,0.85)",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
              }}
            >
              {copy.emptyTitle}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 16,
                maxWidth: 360,
                marginInline: "auto",
              }}
            >
              {copy.emptyHint}
            </div>
            <Link
              href={copy.goLiveHref}
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: 8,
                background: mosaicAccent,
                color: "#050510",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              {isArena ? "ENTER ARENA" : "GO LIVE"}
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "flex-start",
            }}
          >
            {filtered.map((r) => (
              <div
                key={r.id}
                onMouseEnter={() => setFocusedId(r.id)}
                onMouseLeave={() => setFocusedId(null)}
                onFocus={() => setFocusedId(r.id)}
                onBlur={() => setFocusedId(null)}
              >
                <LobbyDiscoveryCard
                  record={r}
                  focused={focusedId === r.id}
                  onJoin={handleJoin}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {joinRoom && (
        <LobbyEntryFlow
          room={joinRoom.room}
          instant={joinRoom.instant}
          onClose={() => setJoinRoom(null)}
        />
      )}
    </>
  );
}
