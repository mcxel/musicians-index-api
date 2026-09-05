"use client";

/**
 * LiveDistributionBezel — external simulcast strip ABOVE Monitor A/B.
 * Order: OUT · YT · IG · FB · KK · TW · +
 * Phone: YT IG FB KK TW + (no horizontal overflow; + expands tray)
 * NO TMI light on this strip. ● live only after verified ingest ack.
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  destinationStatusGlyph,
  ensureBroadcastDestinationSeed,
  getBroadcastDestinations,
  subscribeBroadcastDestinations,
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

const OTHER_PROVIDERS: BroadcastProvider[] = ["other"];

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

  const primary = useMemo(
    () =>
      destinations.filter((d) =>
        ["youtube", "instagram", "facebook", "kick", "twitch"].includes(d.provider),
      ),
    [destinations],
  );

  const liveCount = destinations.filter((d) => d.connectionStatus === "live").length;
  const connectingCount = destinations.filter((d) => d.connectionStatus === "connecting").length;

  const onTapDestination = useCallback(
    async (dest: BroadcastDestinationPublic) => {
      if (dest.authState === "unlinked" || dest.connectionStatus === "locked") {
        setLinkTarget(dest);
        setLinkMessage("");
        return;
      }
      if (!isLivePublished) {
        // Pre-live: select / deselect only
        const nextEnabled = !dest.enabled;
        const { patchBroadcastDestination } = await import(
          "@/lib/broadcast/BroadcastDestinationRegistry"
        );
        patchBroadcastDestination(dest.destinationId, {
          enabled: nextEnabled,
          connectionStatus: nextEnabled ? "selected_off" : "off",
          statusLine: nextEnabled ? "Selected — goes out on GO LIVE" : "Off",
        });
        return;
      }
      // Post-live: health toggle without camera/venue restart
      await toggleExternalDestination(dest.destinationId);
    },
    [isLivePublished],
  );

  // When going live, start any pre-selected destinations (non-blocking fan-out)
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
          ? "Provider OAuth / stream key not configured on this deploy. Stay locked until keys exist."
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

  const chipStyle = (dest: BroadcastDestinationPublic): CSSProperties => {
    const live = dest.connectionStatus === "live";
    const connecting = dest.connectionStatus === "connecting" || dest.connectionStatus === "retry";
    const err = dest.connectionStatus === "error";
    const locked = dest.connectionStatus === "locked" || dest.authState === "unlinked";
    const selected = dest.enabled || dest.connectionStatus === "selected_off";
    return {
      flex: phoneMode ? "1 1 0" : "0 0 auto",
      minWidth: phoneMode ? 0 : 44,
      maxWidth: phoneMode ? undefined : 56,
      padding: phoneMode ? "6px 2px" : "6px 8px",
      borderRadius: 8,
      border: live
        ? "1px solid #FF2DAA"
        : err
          ? "1px solid #FF6B35"
          : locked
            ? "1px solid rgba(255,255,255,0.12)"
            : selected
              ? "1px solid rgba(0,255,255,0.45)"
              : "1px solid rgba(255,255,255,0.14)",
      background: live
        ? "rgba(255,45,170,0.18)"
        : connecting
          ? "rgba(255,215,0,0.12)"
          : "rgba(0,0,0,0.35)",
      color: live ? "#FF2DAA" : err ? "#FF6B35" : "#E8F7FF",
      fontSize: phoneMode ? 9 : 10,
      fontWeight: 900,
      letterSpacing: "0.06em",
      cursor: "pointer",
      fontFamily: "inherit",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      animation: connecting ? "tmi-bdest-pulse 1.2s ease-in-out infinite" : undefined,
    };
  };

  return (
    <div
      data-tmi-live-distribution-bezel="1"
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
          overflow: "hidden",
        }}
      >
        {!phoneMode ? (
          <button
            type="button"
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

        {primary.map((dest) => (
          <button
            key={dest.destinationId}
            type="button"
            title={`${dest.label}: ${dest.statusLine ?? dest.connectionStatus}`}
            onClick={() => void onTapDestination(dest)}
            style={chipStyle(dest)}
          >
            <span style={{ fontSize: phoneMode ? 11 : 12, lineHeight: 1 }}>
              {destinationStatusGlyph(dest.connectionStatus)}
            </span>
            <span>{dest.shortCode}</span>
          </button>
        ))}

        <button
          type="button"
          title="More destinations"
          onClick={() => setTrayOpen((v) => !v)}
          style={{
            flex: phoneMode ? "0 0 auto" : "0 0 auto",
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

      {trayOpen ? (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            borderRadius: 8,
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <div style={{ fontWeight: 800, letterSpacing: "0.1em", color: "#00D4FF", marginBottom: 6 }}>
            EXTERNAL DISTRIBUTION
          </div>
          <div style={{ marginBottom: 8, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            TMI stays live on failure. Red ● only after verified ingest — never faked.
          </div>
          {destinations.map((d) => (
            <div
              key={d.destinationId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "4px 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span>
                {destinationStatusGlyph(d.connectionStatus)} {d.label}{" "}
                <span style={{ color: "rgba(255,255,255,0.4)" }}>({d.shortCode})</span>
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                {d.statusLine ?? d.connectionStatus}
              </span>
            </div>
          ))}
          {OTHER_PROVIDERS.map((provider) => {
            const existing = destinations.find((d) => d.provider === provider);
            return (
              <button
                key={provider}
                type="button"
                onClick={() => {
                  if (existing) void onTapDestination(existing);
                  else
                    setLinkTarget({
                      destinationId: `pending-${provider}`,
                      provider,
                      label: "Other RTMP",
                      shortCode: "+",
                      connectionStatus: "locked",
                      authState: "unlinked",
                      ingestType: "rtmp",
                      enabled: false,
                      health: "unknown",
                      retryState: { attempts: 0, nextRetryAt: null },
                      latencyMs: null,
                    });
                }}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px dashed rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Other RTMP destination
              </button>
            );
          })}
          {isLivePublished
            ? primary
                .filter((d) => d.connectionStatus === "live" || d.connectionStatus === "connecting")
                .map((d) => (
                  <button
                    key={`stop-${d.destinationId}`}
                    type="button"
                    onClick={() => void stopExternalDestination(d.destinationId)}
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      color: "#FF6B35",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Stop {d.shortCode}
                  </button>
                ))
            : null}
        </div>
      ) : null}

      {linkTarget ? (
        <div
          role="dialog"
          aria-label="Link account"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            background: "rgba(0,0,0,0.65)",
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
              maxWidth: 360,
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
              LINK ACCOUNT
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              {linkTarget.label}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>
              Connect once. While you are LIVE you can toggle this destination on/off without
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
