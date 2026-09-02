"use client";

/**
 * LiveLobbyMosaicScrollRail — thumb-scroll horizontal mosaic of live WebRTC tiles.
 * Product law (Marcel 2026-09-01): Fan + Performer sessions on one rail;
 * tap → Universal Media Player watch (`/hub/{role}?watch=`), not siloed room routes.
 * Self-discovery: live broadcaster sees + scrolls to their own tile.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import LobbyPreviewWindow from "@/components/lobby/LobbyPreviewWindow";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { discoveryToLobbyRoom } from "@/lib/discovery/discoveryToLobbyRoom";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import {
  buildLobbyPreviewTile,
  subscribePreviewVisibility,
  unsubscribePreview,
} from "@/lib/lobby/LobbyPreviewRuntime";
import { useLobbyPreviewBind } from "@/lib/lobby/useLobbyPreviewBind";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";

export type LiveLobbyMosaicScrollRailProps = {
  role: "fan" | "performer";
  viewerUserId?: string | null;
  /** Max tiles rendered (performance budget on hub). */
  maxTiles?: number;
  accentColor?: string;
};

function MosaicTile({
  record,
  isSelf,
  accent,
  onSelect,
}: {
  record: LiveDiscoveryRecord;
  isSelf: boolean;
  accent: string;
  onSelect: (record: LiveDiscoveryRecord) => void;
}) {
  const lobbyRoom = discoveryToLobbyRoom(record);
  const hostLabel = sanitizeWallHostLabel(record.hostName, { hostUserId: record.hostUserId });
  const preview = buildLobbyPreviewTile({
    roomId: record.roomId,
    kind: lobbyRoom.type === "battle" ? "battle" : lobbyRoom.type === "cypher" ? "cypher" : "live",
    href: lobbyRoom.href,
    isLive: record.isLive,
    hasActivePerformer: record.isLive,
    isGauntlet: false,
  });
  const { mediaStream } = useLobbyPreviewBind(record.roomId, {
    subscribed: preview.subscribed,
    focused: isSelf,
    isLive: record.isLive,
    quality: isSelf ? "medium" : "low",
  });
  const cellRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = cellRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      subscribePreviewVisibility(record.roomId, true);
      return () => unsubscribePreview(record.roomId);
    }
    const io = new IntersectionObserver(
      ([entry]) => subscribePreviewVisibility(record.roomId, Boolean(entry?.isIntersecting)),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      unsubscribePreview(record.roomId);
    };
  }, [record.roomId]);

  return (
    <button
      ref={cellRef}
      type="button"
      data-live-mosaic-tile={record.roomId}
      data-live-mosaic-self={isSelf ? "1" : undefined}
      onClick={() => onSelect(record)}
      style={{
        position: "relative",
        flex: "0 0 148px",
        width: 148,
        height: 96,
        borderRadius: 12,
        overflow: "hidden",
        border: isSelf ? `2px solid ${accent}` : "1px solid rgba(255,255,255,0.14)",
        boxShadow: isSelf ? `0 0 18px ${accent}55` : "0 4px 16px rgba(0,0,0,0.45)",
        background: "#050510",
        cursor: "pointer",
        padding: 0,
        scrollSnapAlign: "start",
      }}
      title={isSelf ? "You are live — tap to open in media player" : `${record.title} · Watch`}
    >
      <LobbyPreviewWindow
        roomId={record.roomId}
        preview={{ ...preview, focused: isSelf, muted: true }}
        accent={record.accentColor ?? accent}
        performerInitial={hostLabel}
        mediaStream={mediaStream}
        previewUrl={record.previewUrl}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(transparent 35%, rgba(0,0,0,0.88))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          display: "flex",
          gap: 4,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: "#fff",
            background: "rgba(230,48,0,0.92)",
            padding: "2px 6px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />
          LIVE
        </span>
        {isSelf ? (
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              color: "#050510",
              background: accent,
              padding: "2px 5px",
              borderRadius: 999,
            }}
          >
            YOU
          </span>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 6,
          right: 6,
          bottom: 6,
          pointerEvents: "none",
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {record.title}
        </div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>
          {hostLabel}
        </div>
      </div>
    </button>
  );
}

export default function LiveLobbyMosaicScrollRail({
  role,
  viewerUserId = null,
  maxTiles = 24,
  accentColor = "#00FFFF",
}: LiveLobbyMosaicScrollRailProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const records = useDiscoveryBus(viewerUserId);
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);

  const liveTiles = useMemo(
    () => records.filter((r) => r.isLive).slice(0, maxTiles),
    [records, maxTiles],
  );

  const selfRoomId = useMemo(() => {
    if (!isLivePublished || !publishedRoomId) return null;
    const match = liveTiles.find(
      (r) =>
        r.roomId === publishedRoomId ||
        (viewerUserId && r.hostUserId === viewerUserId),
    );
    return match?.roomId ?? publishedRoomId;
  }, [isLivePublished, publishedRoomId, liveTiles, viewerUserId]);

  useEffect(() => {
    if (!selfRoomId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-live-mosaic-tile="${selfRoomId}"]`);
    if (el && "scrollIntoView" in el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selfRoomId, liveTiles.length]);

  const openWatch = useCallback(
    (record: LiveDiscoveryRecord) => {
      const hubRole = role === "performer" ? "performer" : "fan";
      router.push(
        `/hub/${hubRole}?watch=${encodeURIComponent(record.roomId)}&from=live-mosaic-rail`,
      );
    },
    [role, router],
  );

  return (
    <section
      data-live-lobby-mosaic-rail="1"
      data-testid="tmi-live-mosaic-scroll-rail"
      style={{
        flexShrink: 0,
        marginBottom: 10,
        borderRadius: 12,
        border: "1px solid rgba(0,255,255,0.22)",
        background: "rgba(0,255,255,0.04)",
        padding: "8px 10px 10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: accentColor,
            }}
          >
            LIVE LOBBY WALL · MOSAIC
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)", marginTop: 2 }}>
            {liveTiles.length === 0
              ? "No live sessions — GO LIVE to appear here"
              : `${liveTiles.length} live · scroll · tap opens media player`}
          </div>
        </div>
        {selfRoomId ? (
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: "#050510",
              background: accentColor,
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            YOU ARE LIVE
          </span>
        ) : null}
      </div>

      {liveTiles.length === 0 ? (
        <div
          style={{
            padding: "18px 12px",
            textAlign: "center",
            fontSize: 9,
            color: "rgba(255,255,255,0.38)",
            fontWeight: 700,
          }}
        >
          Waiting for live broadcasts…
        </div>
      ) : (
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 4,
            scrollbarWidth: "thin",
          }}
        >
          {liveTiles.map((record) => (
            <MosaicTile
              key={record.id}
              record={record}
              isSelf={
                Boolean(
                  selfRoomId &&
                    (record.roomId === selfRoomId ||
                      (viewerUserId && record.hostUserId === viewerUserId)),
                )
              }
              accent={accentColor}
              onSelect={openWatch}
            />
          ))}
        </div>
      )}
    </section>
  );
}
