/**
 * GlobalLiveDiscoveryOverlay — Live Lobby Walls (human name).
 * Non-modal floating discovery panel. Does not replace page or resize Overseer monitors.
 * Real published rooms only (Rule 20). Instant join via LobbyEntryFlow.
 */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import LobbyDiscoveryCard from "@/components/discovery/LobbyDiscoveryCard";
import { DiscoveryBus } from "@/lib/discovery/DiscoveryBus";
import { startDiscoveryPoll } from "@/lib/discovery/DiscoveryPublisher";
import { filterDiscoverableRecords } from "@/lib/discovery/discoveryVisibility";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import {
  LIVE_DISCOVERY_CATEGORY_LABELS,
  LIVE_DISCOVERY_RAIL_ORDER,
  type LiveDiscoveryCategory,
  type LiveDiscoveryRecord,
} from "@/lib/discovery/LiveDiscoveryRecord";
import { useLiveDiscoveryOverlay } from "@/lib/discovery/liveDiscoveryOverlayStore";

const RIM_KEYFRAMES = `
@keyframes tmiLobbyRimSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

function useDiscoveryRecords(viewerUserId?: string | null) {
  const [raw, setRaw] = useState<LiveDiscoveryRecord[]>(() => DiscoveryBus.getAll());

  useEffect(() => {
    const unsub = DiscoveryBus.subscribe(setRaw);
    const stopPoll = startDiscoveryPoll({ intervalMs: 4000 });
    return () => {
      unsub();
      stopPoll();
    };
  }, []);

  return useMemo(
    () =>
      filterDiscoverableRecords(raw, {
        userId: viewerUserId,
        isStaff: false,
      }),
    [raw, viewerUserId],
  );
}

function DiscoveryRail({
  category,
  records,
  focusedId,
  highlightId,
  onJoin,
  onFocus,
}: {
  category: LiveDiscoveryCategory;
  records: LiveDiscoveryRecord[];
  focusedId: string | null;
  highlightId: string | null;
  onJoin: (r: LiveDiscoveryRecord) => void;
  onFocus: (id: string | null) => void;
}) {
  if (records.length === 0) return null;
  const label = LIVE_DISCOVERY_CATEGORY_LABELS[category];

  return (
    <section style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
          padding: "0 4px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#00FFFF",
            textTransform: "uppercase",
          }}
        >
          {label}
        </h3>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
          {records.length}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 6,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {records.map((r) => (
          <div
            key={r.id}
            style={{ scrollSnapAlign: "start" }}
            onMouseEnter={() => onFocus(r.id)}
            onMouseLeave={() => onFocus(null)}
            onFocus={() => onFocus(r.id)}
            onBlur={() => onFocus(null)}
          >
            <LobbyDiscoveryCard
              record={r}
              focused={focusedId === r.id}
              highlighted={highlightId === r.id}
              onJoin={onJoin}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export interface GlobalLiveDiscoveryOverlayProps {
  /** Optional session user id for private/friends entitlement */
  viewerUserId?: string | null;
  viewerRole?: string | null;
}

export default function GlobalLiveDiscoveryOverlay({
  viewerUserId: viewerUserIdProp = null,
  viewerRole: viewerRoleProp,
}: GlobalLiveDiscoveryOverlayProps) {
  const {
    isOpen,
    lockedCategory,
    tvMode,
    tvHighlightId,
    close,
    setTvMode,
    setTvHighlightId,
    setLockedCategory,
  } = useLiveDiscoveryOverlay();

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionRole, setSessionRole] = useState<string>("FAN");
  const viewerUserId = viewerUserIdProp ?? sessionUserId;
  const viewerRole = viewerRoleProp ?? sessionRole;

  const records = useDiscoveryRecords(viewerUserId);
  const [mounted, setMounted] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [joinRoom, setJoinRoom] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || viewerUserIdProp) return;
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: { id?: string; role?: string } }) => {
        if (cancelled || !data?.authenticated) return;
        setSessionUserId(data.user?.id ?? null);
        setSessionRole((data.user?.role ?? "FAN").toUpperCase());
      })
      .catch(() => {
        /* public wall still works */
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, viewerUserIdProp]);

  // Inject rim keyframes once
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "tmi-lobby-rim-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = RIM_KEYFRAMES;
    document.head.appendChild(style);
  }, []);

  const rails = useMemo(() => {
    const order = lockedCategory
      ? ([lockedCategory] as LiveDiscoveryCategory[])
      : LIVE_DISCOVERY_RAIL_ORDER;

    return order
      .map((cat) => ({
        category: cat,
        records: records.filter(
          (r) => r.category === cat || r.categories.includes(cat),
        ),
      }))
      .filter((rail) => rail.records.length > 0 || Boolean(lockedCategory));
  }, [records, lockedCategory]);

  // TV Mode — shuffle highlight only; panel position never auto-moves
  useEffect(() => {
    if (!isOpen || !tvMode || records.length === 0) {
      if (!tvMode) setTvHighlightId(null);
      return;
    }
    const pick = () => {
      const i = Math.floor(Math.random() * records.length);
      setTvHighlightId(records[i]?.id ?? null);
    };
    pick();
    const id = window.setInterval(pick, 4500);
    return () => window.clearInterval(id);
  }, [isOpen, tvMode, records, setTvHighlightId]);

  const handleJoin = useCallback(
    (record: LiveDiscoveryRecord) => {
      const decision = resolveInstantJoin(record, { role: viewerRole });
      setJoinRoom(decision);
    },
    [viewerRole],
  );

  const emptyMessage = lockedCategory
    ? "No live events in your filters"
    : "No live rooms right now";

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="live-lobby-walls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 92000,
              pointerEvents: "none",
            }}
          >
            {/* Soft dim — clicks outside close; does not block entire app chrome permanently */}
            <div
              role="presentation"
              onClick={close}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5,5,16,0.35)",
                pointerEvents: "auto",
              }}
            />

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-label="Live Lobby Walls"
              aria-modal="false"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.17, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                position: "absolute",
                left: "50%",
                top: "8%",
                transform: "translateX(-50%)",
                width: "min(920px, calc(100vw - 32px))",
                maxHeight: "min(78vh, 720px)",
                display: "flex",
                flexDirection: "column",
                background: "rgba(8, 8, 22, 0.94)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(0,255,255,0.35)",
                borderRadius: 18,
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.85), 0 0 40px rgba(0,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.22em",
                      color: "#00FFFF",
                      fontWeight: 900,
                    }}
                  >
                    LIVE LOBBY WALLS
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>
                    Discover &amp; Instant Join
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setTvMode(!tvMode)}
                    title="TV Mode auto-highlights rooms; panel stays put"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: tvMode
                        ? "1px solid #FFD700"
                        : "1px solid rgba(255,255,255,0.15)",
                      background: tvMode
                        ? "rgba(255,215,0,0.18)"
                        : "rgba(255,255,255,0.04)",
                      color: tvMode ? "#FFD700" : "rgba(255,255,255,0.7)",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                    }}
                  >
                    TV MODE {tvMode ? "ON" : "OFF"}
                  </button>
                  {lockedCategory && (
                    <button
                      type="button"
                      onClick={() => setLockedCategory(null)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,45,170,0.5)",
                        background: "rgba(255,45,170,0.15)",
                        color: "#FF2DAA",
                        fontSize: 9,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      UNLOCK CHANNEL
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close Live Lobby Walls"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Category chips — lock channel on double intent via click+hold alternate: single click filters */}
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  gap: 6,
                  padding: "10px 14px",
                  overflowX: "auto",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLockedCategory(null)}
                  style={chipStyle(!lockedCategory)}
                >
                  ALL
                </button>
                {LIVE_DISCOVERY_RAIL_ORDER.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLockedCategory(cat)}
                    style={chipStyle(lockedCategory === cat)}
                  >
                    {LIVE_DISCOVERY_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Rails — user scrolls vertically; horizontal swipe per rail */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "14px 16px 20px",
                }}
              >
                {records.length === 0 ? (
                  <div
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {emptyMessage}
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      Go live publicly to appear here. Counts show real humans only.
                    </div>
                  </div>
                ) : (
                  rails.map((rail) =>
                    rail.records.length === 0 && lockedCategory ? (
                      <div
                        key={rail.category}
                        style={{
                          padding: "40px 16px",
                          textAlign: "center",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        No live events in your filters
                      </div>
                    ) : (
                      <DiscoveryRail
                        key={rail.category}
                        category={rail.category}
                        records={rail.records}
                        focusedId={focusedId}
                        highlightId={tvHighlightId}
                        onJoin={handleJoin}
                        onFocus={setFocusedId}
                      />
                    ),
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {joinRoom && (
        <LobbyEntryFlow
          room={joinRoom.room}
          instant={joinRoom.instant}
          onClose={() => {
            setJoinRoom(null);
            close();
          }}
        />
      )}
    </>,
    document.body,
  );
}

function chipStyle(active: boolean): CSSProperties {
  return {
    flexShrink: 0,
    padding: "5px 11px",
    borderRadius: 14,
    border: active ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.03)",
    color: active ? "#00FFFF" : "rgba(255,255,255,0.6)",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.04em",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
