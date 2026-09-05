"use client";

/**
 * MediaPlayerGoLiveControl — CANONICAL GO LIVE affordance on the media player.
 *
 * Product law (Marcel 2026-08-31): publication lives on the media-player surface
 * (monitor/bezel/stage frame), not orphan hub chrome. Hub may dispatch
 * `tmi:media-player-golive-intent`; this control owns the publish path:
 * presentInstantGoLiveInPlace → auth → POST /api/live/go → registry → Lobby Wall.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { endInstantGoLiveSession } from "@/lib/dock/executeInstantGoLive";
import { presentInstantGoLiveInPlace } from "@/lib/dock/presentInstantGoLiveInPlace";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";

export const MEDIA_PLAYER_GO_LIVE_INTENT = "tmi:media-player-golive-intent";

export type MediaPlayerGoLiveControlProps = {
  role?: "performer" | "fan";
  /** Visual density for bezel vs monitor overlay */
  compact?: boolean;
};

export default function MediaPlayerGoLiveControl({
  role = "performer",
  compact = false,
}: MediaPlayerGoLiveControlProps) {
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const hubRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const [phase, setPhase] = useState<"idle" | "launching" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inFlightRef = useRef(false);

  const runPublish = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (useLivePrivacyState.getState().isLivePublished) {
      setPhase("launching");
      setErrorMsg("");
      try {
        const rid =
          useGoLiveTransition.getState().inPlace?.roomId ??
          useLivePrivacyState.getState().publishedRoomId;
        await endInstantGoLiveSession(rid);
        setPhase("idle");
      } catch (err) {
        setPhase("error");
        setErrorMsg(err instanceof Error ? err.message : "End live failed.");
      } finally {
        inFlightRef.current = false;
      }
      return;
    }

    setPhase("launching");
    setErrorMsg("");
    try {
      const roomId =
        useGoLiveTransition.getState().inPlace?.roomId ??
        useLivePrivacyState.getState().publishedRoomId ??
        undefined;
      const result = await presentInstantGoLiveInPlace({
        role: role === "performer" ? "PERFORMER" : "FAN",
        preferredExperience: "live",
        roomId,
        publishSession: true,
      });
      if (!result.ok) {
        setPhase("error");
        setErrorMsg(result.error ?? "Go Live failed.");
        return;
      }
      setPhase("idle");
      if (result.error) setErrorMsg(result.error);
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Go Live failed.");
    } finally {
      inFlightRef.current = false;
    }
  }, [role]);

  // Hub strip / nav deep-link → same media-player publication authority
  useEffect(() => {
    const onIntent = () => {
      void runPublish();
    };
    window.addEventListener(MEDIA_PLAYER_GO_LIVE_INTENT, onIntent);
    return () => window.removeEventListener(MEDIA_PLAYER_GO_LIVE_INTENT, onIntent);
  }, [runPublish]);

  const label = isLivePublished
    ? compact
      ? "● LIVE · END"
      : "● LIVE · END BROADCAST"
    : phase === "launching"
      ? "● GOING LIVE…"
      : "🔴 GO LIVE";

  const btnStyle: CSSProperties = {
    borderRadius: 8,
    border: isLivePublished ? "1px solid #FF2DAA" : "1px solid rgba(255,45,170,0.65)",
    background: isLivePublished
      ? "linear-gradient(135deg, rgba(255,45,170,0.35), rgba(170,45,255,0.28))"
      : "linear-gradient(135deg, #AA2DFF, #FF2DAA)",
    color: "#fff",
    padding: compact ? "7px 10px" : "8px 14px",
    fontSize: compact ? 9 : 10,
    fontWeight: 900,
    letterSpacing: "0.1em",
    cursor: phase === "launching" ? "wait" : "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    boxShadow: isLivePublished ? "0 0 16px rgba(255,45,170,0.35)" : "0 0 12px rgba(170,45,255,0.25)",
    opacity: phase === "launching" ? 0.75 : 1,
  };

  return (
    <div
      data-media-player-go-live-host="1"
      data-media-player-surface="command-center-media-stack"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "stretch",
      }}
    >
      <span
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.38)",
        }}
      >
        MEDIA PLAYER · LIVE
      </span>
      <button
        type="button"
        data-media-player-go-live="1"
        data-testid="tmi-media-player-go-live"
        disabled={phase === "launching"}
        onClick={() => void runPublish()}
        style={btnStyle}
        title="Publish from media player → registry → Live Lobby Wall"
      >
        {label}
      </button>
      {(phase === "error" && errorMsg) || (errorMsg && !isLivePublished) ? (
        <span
          data-media-player-go-live-error="1"
          style={{
            fontSize: 9,
            color: "#FF6B9A",
            maxWidth: 220,
            lineHeight: 1.3,
          }}
        >
          {errorMsg}
        </span>
      ) : null}
    </div>
  );
}

/** Hub chrome deep-link — does not publish; media player owns publication. */
export function dispatchMediaPlayerGoLiveIntent(): void {
  if (typeof window === "undefined") return;
  const host = document.querySelector("[data-media-player-go-live-host]");
  host?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  window.dispatchEvent(new CustomEvent(MEDIA_PLAYER_GO_LIVE_INTENT));
}
