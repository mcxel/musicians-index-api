/**
 * HomeFeaturedChannelPanels — Home 1 CH Featured (CH1/CH2/CH3).
 * DiscoveryBus subscriber. Poster → focused low-res preview → InstantJoin.
 * Rotates 20–30s only while user is not interacting. No fake rooms (Rule 20).
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import {
  filterForHomepageSurface,
  HOMEPAGE_SURFACE_COPY,
  pickFeaturedChannelSlots,
} from "@/lib/discovery/homepageDiscoveryFilters";
import {
  getGovernedIdleFallbackPolicy,
  LIVE_LOBBY_WALL_CONTRACT_ID,
  useAdaptiveWorldRuntime,
} from "@/lib/adaptiveWorldRuntime";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import {
  isoCountryToFlag,
  type LiveDiscoveryRecord,
} from "@/lib/discovery/LiveDiscoveryRecord";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";

const RIM_KEYFRAMES = `
@keyframes tmiLobbyRimSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

import { HOME_BROADCAST_ROTATION_MS } from "@/lib/broadcast/BroadcastRotationEngine";
const CHANNEL_ACCENTS = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF"] as const;

function ensureRimKeyframes() {
  if (typeof document === "undefined") return;
  const id = "tmi-lobby-rim-keyframes";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = RIM_KEYFRAMES;
  document.head.appendChild(style);
}

function FeaturedChannelPanel({
  record,
  channelNum,
  accent,
  focused,
  onFocus,
  onJoin,
}: {
  record: LiveDiscoveryRecord | null;
  channelNum: number;
  accent: string;
  focused: boolean;
  onFocus: (id: string | null) => void;
  onJoin: (r: LiveDiscoveryRecord) => void;
}) {
  const showLowRes =
    focused &&
    record &&
    record.previewMode === "low_res" &&
    Boolean(record.previewUrl);

  if (!record) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 140,
          borderRadius: 10,
          border: `1px solid ${accent}44`,
          background: "rgba(5,8,21,0.92)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 12,
        }}
      >
        <div
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: accent,
          }}
        >
          CH-{channelNum} FEATURED
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
          Waiting for featured live…
        </div>
        <Link
          href="/live/go"
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#050510",
            background: accent,
            padding: "6px 12px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          GO LIVE
        </Link>
      </div>
    );
  }

  const flag = isoCountryToFlag(record.countryCode);

  return (
    <button
      type="button"
      onClick={() => onJoin(record)}
      onMouseEnter={() => onFocus(record.id)}
      onMouseLeave={() => onFocus(null)}
      onFocus={() => onFocus(record.id)}
      onBlur={() => onFocus(null)}
      aria-label={`Join ${record.title} — ${record.humanViewerCount} watching`}
      style={{
        flex: 1,
        minHeight: 140,
        padding: 0,
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        background: "transparent",
        textAlign: "left",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-40%",
          background: `conic-gradient(${accent}, #FF2DAA, #FFD700, #AA2DFF, #00FFFF, ${accent})`,
          animation: "tmiLobbyRimSpin 3.5s linear infinite",
          opacity: focused ? 1 : 0.75,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: 8,
          overflow: "hidden",
          background: "#050510",
          zIndex: 1,
        }}
      >
        {showLowRes ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={record.previewUrl!}
            alt=""
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : record.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={record.posterUrl}
            alt=""
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(145deg, ${accent}22, #050510)`,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,5,16,0.2) 0%, rgba(5,5,16,0.9) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            right: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: accent,
              background: "rgba(5,5,16,0.75)",
              padding: "2px 6px",
              borderRadius: 4,
              border: `1px solid ${accent}55`,
            }}
          >
            CH-{channelNum} LIVE
          </span>
          <span style={{ fontSize: 12 }} title={record.countryCode}>
            {flag}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 8,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {record.title}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.65)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sanitizeWallHostLabel(record.hostName, { hostUserId: record.hostUserId })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 8,
              fontWeight: 800,
              color: "#00FF88",
              marginTop: 2,
            }}
          >
            <span style={{ color: accent }}>JOIN</span>
            <span>👤 {record.humanViewerCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export interface HomeFeaturedChannelPanelsProps {
  slotCount?: 3 | 4;
  viewerUserId?: string | null;
}

export default function HomeFeaturedChannelPanels({
  slotCount = 3,
  viewerUserId = null,
}: HomeFeaturedChannelPanelsProps) {
  const records = useDiscoveryBus(viewerUserId);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [joinRoom, setJoinRoom] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);
  const [role, setRole] = useState("FAN");
  const interactTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = HOMEPAGE_SURFACE_COPY.home1_featured;
  useAdaptiveWorldRuntime(LIVE_LOBBY_WALL_CONTRACT_ID);

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

  // Rotate only when not interacting (and pool is larger than visible slots)
  useEffect(() => {
    if (interacting || focusedId) return;
    const pool = filterForHomepageSurface(records, "home1_featured");
    if (pool.length <= slotCount) return;
    const rotateMs = Math.max(
      getGovernedIdleFallbackPolicy().rotationIntervalMs,
      HOME_BROADCAST_ROTATION_MS,
    );
    const id = window.setInterval(() => {
      setRotationOffset((o) => o + 1);
    }, rotateMs);
    return () => window.clearInterval(id);
  }, [interacting, focusedId, records, slotCount]);

  const markInteracting = useCallback(() => {
    setInteracting(true);
    if (interactTimer.current) clearTimeout(interactTimer.current);
    interactTimer.current = setTimeout(() => setInteracting(false), 8000);
  }, []);

  const handleJoin = useCallback(
    (record: LiveDiscoveryRecord) => {
      markInteracting();
      setJoinRoom(resolveInstantJoin(record, { role }));
    },
    [markInteracting, role],
  );

  const slots = pickFeaturedChannelSlots(records, slotCount, rotationOffset);

  return (
    <>
      <div
        style={{ width: "100%", maxWidth: 900, padding: "12px 10px 0" }}
        onPointerDown={markInteracting}
        onMouseEnter={markInteracting}
      >
        <div
          style={{
            fontSize: 8,
            letterSpacing: "0.2em",
            color: copy.accent,
            fontWeight: 900,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {copy.title}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {slots.map((rec, i) => (
            <FeaturedChannelPanel
              key={`ch-${i}-${rec?.id ?? "empty"}`}
              record={rec}
              channelNum={i + 1}
              accent={CHANNEL_ACCENTS[i % CHANNEL_ACCENTS.length]!}
              focused={Boolean(rec && focusedId === rec.id)}
              onFocus={setFocusedId}
              onJoin={handleJoin}
            />
          ))}
        </div>
      </div>

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
