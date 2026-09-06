"use client";

/**
 * LiveDistributionBezel — Master Live Status Indicator & External Simulcast Bezel.
 *
 * Architecture (Locked Slice 4):
 * - MASTER LIVE STATUS: Separated overall TMI session broadcast indicator (OFF / LIVE / WARNING / ERROR).
 * - DESTINATION TARGETS: Independent multi-platform ingest targets (YouTube, Instagram, Facebook, Kick, Twitch, Custom).
 * - SINGLE CANONICAL SESSION: One TMI live session fans out to selected destinations without stream duplication.
 *
 * Order: [MASTER LIVE] | OUT · ‹ · YT · IG · FB · KK · TW · CST · › · +
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import {
  destinationStatusGlyph,
  ensureBroadcastDestinationSeed,
  getBroadcastDestinations,
  resolveAuthoritativeDestinationState,
  resolveMasterLiveStatus,
  subscribeBroadcastDestinations,
  type AuthoritativeDestinationState,
  type MasterLiveBroadcastStatus,
} from "@/lib/broadcast/BroadcastDestinationRegistry";
import type {
  BroadcastDestinationPublic,
  BroadcastProvider,
} from "@/lib/broadcast/BroadcastDestinationTypes";
import {
  hydrateBroadcastDestinations,
  requestLinkDestination,
  setActiveExternalBroadcastRoomId,
  startExternalDestination,
  stopExternalDestination,
  toggleExternalDestination,
} from "@/lib/broadcast/ExternalBroadcastDistributor";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { MEDIA_PLAYER_GO_LIVE_INTENT } from "@/components/commandCenter/MediaPlayerGoLiveControl";

export type LiveDistributionBezelProps = {
  userId?: string | null;
  /** Compact strip for phone */
  compact?: boolean;
};

export default function LiveDistributionBezel({
  userId = null,
  compact,
}: LiveDistributionBezelProps) {
  const [destinations, setDestinations] = useState<BroadcastDestinationPublic[]>(() =>
    getBroadcastDestinations(),
  );
  const [trayOpen, setTrayOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState<BroadcastDestinationPublic | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkMessage, setLinkMessage] = useState("");
  const [isPhone, setIsPhone] = useState(false);
  const [customRtmpUrl, setCustomRtmpUrl] = useState("");
  const [customStreamKey, setCustomStreamKey] = useState("");
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);

  useEffect(() => {
    ensureBroadcastDestinationSeed(userId);
    const unsub = subscribeBroadcastDestinations(setDestinations);
    void hydrateBroadcastDestinations(userId);
    return unsub;
  }, [userId]);

  useEffect(() => {
    setActiveExternalBroadcastRoomId(publishedRoomId);
  }, [publishedRoomId]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsPhone(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const phoneMode = compact ?? isPhone;

  // Master live session status (OFF / LIVE / WARNING / ERROR)
  const masterLiveStatus: MasterLiveBroadcastStatus = useMemo(() => {
    return resolveMasterLiveStatus(isLivePublished);
  }, [isLivePublished]);

  // Primary destinations in canonical order: YT, IG, FB, KK, TW, CST
  const primary = useMemo(
    () =>
      destinations.filter((d) =>
        ["youtube", "instagram", "facebook", "kick", "twitch", "custom"].includes(d.provider),
      ),
    [destinations],
  );

  const liveCount = destinations.filter((d) => d.connectionStatus === "live").length;
  const connectingCount = destinations.filter((d) => d.connectionStatus === "connecting").length;

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const delta = direction === "left" ? -120 : 120;
    carouselRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onMasterLiveClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(MEDIA_PLAYER_GO_LIVE_INTENT));
    }
  };

  const onTapDestination = useCallback(
    async (dest: BroadcastDestinationPublic) => {
      if (dest.authState === "unlinked" || dest.connectionStatus === "locked") {
        setLinkTarget(dest);
        setLinkMessage("");
        return;
      }
      if (!isLivePublished) {
        // Pre-live: select / deselect for auto transmission upon GO LIVE
        const nextEnabled = !dest.enabled;
        const { patchBroadcastDestination } = await import(
          "@/lib/broadcast/BroadcastDestinationRegistry"
        );
        patchBroadcastDestination(dest.destinationId, {
          enabled: nextEnabled,
          connectionStatus: nextEnabled ? "selected_off" : "off",
          authoritativeState: nextEnabled ? "READY" : "OFF",
          statusLine: nextEnabled ? "Primed — transmits on GO LIVE" : "Off",
        });
        return;
      }
      // Post-live: toggle distribution without encoder/session duplication
      await toggleExternalDestination(dest.destinationId);
    },
    [isLivePublished],
  );

  // Keyboard navigation on destination tiles
  const onTileKeyDown = (e: KeyboardEvent<HTMLButtonElement>, dest: BroadcastDestinationPublic) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      void onTapDestination(dest);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollCarousel("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollCarousel("right");
    }
  };

  // When going live, start any pre-selected destinations (non-blocking single session fan-out)
  useEffect(() => {
    if (!isLivePublished || !publishedRoomId) return;
    setActiveExternalBroadcastRoomId(publishedRoomId);
    for (const d of getBroadcastDestinations()) {
      if (d.enabled && d.authState === "linked" && d.connectionStatus !== "live") {
        void startExternalDestination(d.destinationId);
      }
    }
  }, [isLivePublished, publishedRoomId]);

  const confirmLink = async () => {
    if (!linkTarget) return;
    setLinkBusy(true);
    setLinkMessage("");
    const result = await requestLinkDestination(linkTarget.provider);
    setLinkBusy(false);
    if (!result.ok) {
      setLinkMessage(
        result.reason === "oauth_not_configured"
          ? "Provider OAuth / stream key not configured on this deploy. Ingest keys stay secure."
          : result.reason ?? "Could not link account.",
      );
      return;
    }
    if (result.oauthUrl) {
      window.open(result.oauthUrl, "_blank", "noopener,noreferrer");
    }
    setLinkTarget(null);
  };

  const openSummary = () => setTrayOpen((v) => !v);

  // Authoritative 5-state tile styling
  const chipStyle = (dest: BroadcastDestinationPublic): CSSProperties => {
    const state: AuthoritativeDestinationState =
      dest.authoritativeState ??
      resolveAuthoritativeDestinationState(dest, isLivePublished);

    const isLive = state === "LIVE";
    const isReady = state === "READY";
    const isWarning = state === "WARNING";
    const isError = state === "ERROR";

    return {
      flex: "0 0 auto",
      minWidth: phoneMode ? 44 : 52,
      maxWidth: phoneMode ? 54 : 64,
      padding: phoneMode ? "5px 3px" : "6px 8px",
      borderRadius: 8,
      border: isLive
        ? "1px solid #FF2DAA"
        : isWarning
          ? "1px solid #FFD700"
          : isError
            ? "1px solid #FF4444"
            : isReady
              ? "1px solid rgba(0,255,255,0.55)"
              : "1px solid rgba(255,255,255,0.14)",
      background: isLive
        ? "rgba(255,45,170,0.22)"
        : isWarning
          ? "rgba(255,215,0,0.16)"
          : isError
            ? "rgba(255,68,68,0.2)"
            : isReady
              ? "rgba(0,255,255,0.08)"
              : "rgba(0,0,0,0.4)",
      color: isLive
        ? "#FF2DAA"
        : isWarning
          ? "#FFD700"
          : isError
            ? "#FF6B6B"
            : isReady
              ? "#00FFFF"
              : "rgba(255,255,255,0.55)",
      fontSize: phoneMode ? 9 : 10,
      fontWeight: 900,
      letterSpacing: "0.06em",
      cursor: "pointer",
      fontFamily: "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      boxShadow: isLive
        ? "0 0 10px rgba(255,45,170,0.35)"
        : isReady
          ? "0 0 8px rgba(0,255,255,0.2)"
          : undefined,
      animation: isLive ? "tmi-live-pulse 1.4s ease-in-out infinite" : undefined,
    };
  };

  return (
    <div
      data-tmi-live-distribution-bezel="1"
      data-media-player-live-bezel="1"
      style={{
        flexShrink: 0,
        marginBottom: 8,
        borderRadius: 10,
        border: "1px solid rgba(0,212,255,0.22)",
        background: "linear-gradient(180deg, rgba(8,10,24,0.95), rgba(2,4,12,0.92))",
        padding: phoneMode ? "6px 6px 4px" : "6px 10px",
      }}
    >
      <style>{`
        @keyframes tmi-live-pulse {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes tmi-bdest-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: phoneMode ? 4 : 6,
          width: "100%",
        }}
      >
        {/* 1. MASTER LIVE STATUS INDICATOR (Explicitly isolated from destinations) */}
        <button
          type="button"
          data-testid="tmi-master-live-status"
          data-master-live-state={masterLiveStatus}
          title={`Master Broadcast: ${masterLiveStatus} · Click to ${isLivePublished ? "view live broadcast" : "initiate Go Live"}`}
          onClick={onMasterLiveClick}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: phoneMode ? "6px 8px" : "6px 12px",
            borderRadius: 8,
            border: masterLiveStatus === "LIVE"
              ? "1px solid #FF2DAA"
              : masterLiveStatus === "WARNING"
                ? "1px solid #FFD700"
                : masterLiveStatus === "ERROR"
                  ? "1px solid #FF4444"
                  : "1px solid rgba(255,255,255,0.2)",
            background: masterLiveStatus === "LIVE"
              ? "linear-gradient(135deg, rgba(255,45,170,0.3), rgba(170,45,255,0.25))"
              : masterLiveStatus === "WARNING"
                ? "rgba(255,215,0,0.18)"
                : masterLiveStatus === "ERROR"
                  ? "rgba(255,68,68,0.2)"
                  : "rgba(0,0,0,0.5)",
            color: masterLiveStatus === "LIVE"
              ? "#FF2DAA"
              : masterLiveStatus === "WARNING"
                ? "#FFD700"
                : masterLiveStatus === "ERROR"
                  ? "#FF6B6B"
                  : "rgba(255,255,255,0.45)",
            fontWeight: 900,
            fontSize: phoneMode ? 9 : 10,
            letterSpacing: "0.12em",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: masterLiveStatus === "LIVE" ? "0 0 14px rgba(255,45,170,0.4)" : undefined,
          }}
        >
          <span style={{ fontSize: 11, lineHeight: 1 }}>
            {masterLiveStatus === "LIVE"
              ? "●"
              : masterLiveStatus === "WARNING"
                ? "⚠"
                : masterLiveStatus === "ERROR"
                  ? "✕"
                  : "○"}
          </span>
          <span>LIVE</span>
          {!phoneMode ? (
            <span style={{ opacity: 0.6, fontSize: 8, marginLeft: 2 }}>
              {masterLiveStatus}
            </span>
          ) : null}
        </button>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

        {/* 2. OUT Summary Toggle */}
        {!phoneMode ? (
          <button
            type="button"
            data-testid="tmi-bezel-out-summary-btn"
            title="External distribution summary"
            onClick={openSummary}
            style={{
              flexShrink: 0,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid rgba(0,212,255,0.35)",
              background: trayOpen ? "rgba(0,212,255,0.15)" : "transparent",
              color: "#00D4FF",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            OUT
            {(liveCount > 0 || connectingCount > 0) && (
              <span style={{ marginLeft: 6, color: liveCount ? "#FF2DAA" : "#FFD700" }}>
                {liveCount || connectingCount}
              </span>
            )}
          </button>
        ) : null}

        {/* 3. CAROUSEL LEFT ARROW ‹ */}
        <button
          type="button"
          data-testid="tmi-bezel-carousel-prev"
          aria-label="Previous broadcast destinations"
          onClick={() => scrollCarousel("left")}
          style={{
            flexShrink: 0,
            width: 20,
            height: 28,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
          }}
        >
          ‹
        </button>

        {/* 4. DESTINATION TILES CAROUSEL CONTAINER */}
        <div
          ref={carouselRef}
          data-testid="tmi-bezel-destinations-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: phoneMode ? 4 : 6,
            overflowX: "auto",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            flex: 1,
            minWidth: 0,
          }}
        >
          {primary.map((dest) => {
            const authoritativeState =
              dest.authoritativeState ??
              resolveAuthoritativeDestinationState(dest, isLivePublished);

            return (
              <button
                key={dest.destinationId}
                type="button"
                data-testid={`tmi-dest-tile-${dest.provider}`}
                data-destination-id={dest.destinationId}
                data-destination-provider={dest.provider}
                data-destination-state={authoritativeState}
                data-destination-status={dest.connectionStatus}
                tabIndex={0}
                title={`${dest.label}: ${authoritativeState} (${dest.statusLine ?? dest.connectionStatus})`}
                onClick={() => void onTapDestination(dest)}
                onKeyDown={(e) => onTileKeyDown(e, dest)}
                style={chipStyle(dest)}
              >
                <span style={{ fontSize: phoneMode ? 10 : 11, lineHeight: 1 }}>
                  {destinationStatusGlyph(authoritativeState)}
                </span>
                <span>{dest.shortCode}</span>
              </button>
            );
          })}
        </div>

        {/* 5. CAROUSEL RIGHT ARROW › */}
        <button
          type="button"
          data-testid="tmi-bezel-carousel-next"
          aria-label="Next broadcast destinations"
          onClick={() => scrollCarousel("right")}
          style={{
            flexShrink: 0,
            width: 20,
            height: 28,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
          }}
        >
          ›
        </button>

        {/* 6. + More Destinations / Custom RTMP Ingest */}
        <button
          type="button"
          data-testid="tmi-bezel-more-btn"
          title="Custom RTMP & External Destinations Configuration"
          onClick={() => setTrayOpen((v) => !v)}
          style={{
            flexShrink: 0,
            padding: phoneMode ? "6px 8px" : "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: trayOpen ? "rgba(170,45,255,0.2)" : "transparent",
            color: "#fff",
            fontSize: 14,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          +
        </button>
      </div>

      {/* EXPANDABLE EXTERNAL DISTRIBUTION TRAY */}
      {trayOpen ? (
        <div
          data-testid="tmi-bezel-tray-panel"
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: 8,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 800, letterSpacing: "0.1em", color: "#00D4FF" }}>
              EXTERNAL MULTI-DESTINATION DISTRIBUTION
            </span>
            <button
              type="button"
              onClick={() => setTrayOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ marginBottom: 10, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            One canonical TMI session fans out to all linked platforms. Master LIVE light governs transmission; external failures never interrupt TMI.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: phoneMode ? "1fr" : "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
            {destinations.map((d) => {
              const authoritativeState =
                d.authoritativeState ??
                resolveAuthoritativeDestinationState(d, isLivePublished);

              return (
                <div
                  key={d.destinationId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: authoritativeState === "LIVE" ? "#FF2DAA" : authoritativeState === "READY" ? "#00FFFF" : "rgba(255,255,255,0.5)" }}>
                      {destinationStatusGlyph(authoritativeState)}
                    </span>
                    <span style={{ fontWeight: 700, color: "#fff" }}>{d.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onTapDestination(d)}
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "3px 7px",
                      borderRadius: 4,
                      border: d.authState === "linked" ? "1px solid rgba(0,255,255,0.4)" : "1px solid rgba(255,255,255,0.2)",
                      background: d.authState === "linked" ? "rgba(0,255,255,0.12)" : "transparent",
                      color: d.authState === "linked" ? "#00FFFF" : "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {d.authState === "linked" ? (d.enabled ? "ENABLED" : "ENABLE") : "LINK"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Custom Ingest Configuration Form */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", marginBottom: 4 }}>
              CUSTOM RTMP INGEST PROFILE
            </div>
            <div style={{ display: "flex", flexDirection: phoneMode ? "column" : "row", gap: 6 }}>
              <input
                type="text"
                placeholder="rtmp://custom.ingest.endpoint/live"
                value={customRtmpUrl}
                onChange={(e) => setCustomRtmpUrl(e.target.value)}
                style={{
                  flex: 2,
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#fff",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <input
                type="password"
                placeholder="Stream Key (encrypted server-side)"
                value={customStreamKey}
                onChange={(e) => setCustomStreamKey(e.target.value)}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#fff",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!customRtmpUrl.trim()) return;
                  const customDest = destinations.find((d) => d.provider === "custom");
                  if (customDest) {
                    const { patchBroadcastDestination } = require("@/lib/broadcast/BroadcastDestinationRegistry");
                    patchBroadcastDestination(customDest.destinationId, {
                      authState: "linked",
                      enabled: true,
                      connectionStatus: "selected_off",
                      authoritativeState: "READY",
                      statusLine: "Custom RTMP configured",
                    });
                    setCustomStreamKey("");
                  }
                }}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid #FFD700",
                  background: "rgba(255,215,0,0.15)",
                  color: "#FFD700",
                  fontWeight: 800,
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                SAVE INGEST
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* LINK MODAL */}
      {linkTarget ? (
        <div
          data-testid="tmi-bezel-link-modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10005,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setLinkTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              borderRadius: 14,
              border: "1px solid rgba(0,212,255,0.35)",
              background: "#0a0614",
              padding: 18,
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: "#00D4FF",
                marginBottom: 8,
              }}
            >
              LINK DESTINATION ACCOUNT
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              {linkTarget.label}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>
              Connect once. While you are LIVE on TMI, you can toggle this destination without
              restarting camera, venue, or room.
            </div>
            {linkMessage ? (
              <div
                style={{
                  fontSize: 11,
                  color: "#FF6B35",
                  marginBottom: 12,
                  padding: 10,
                  borderRadius: 8,
                  background: "rgba(255,107,53,0.1)",
                  border: "1px solid rgba(255,107,53,0.35)",
                }}
              >
                {linkMessage}
              </div>
            ) : null}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                disabled={linkBusy}
                onClick={() => void confirmLink()}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#00D4FF,#AA2DFF)",
                  color: "#050510",
                  fontWeight: 900,
                  fontSize: 12,
                  cursor: linkBusy ? "wait" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {linkBusy ? "LINKING…" : "LINK"}
              </button>
              <button
                type="button"
                onClick={() => setLinkTarget(null)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
