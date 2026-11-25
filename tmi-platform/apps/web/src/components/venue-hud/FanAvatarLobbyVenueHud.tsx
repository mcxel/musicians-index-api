"use client";

/**
 * FanAvatarLobbyVenueHud.tsx — Canonical In-Venue Control Plane for Fan Avatar Lobby.
 *
 * Laws:
 *   1. Two Independent Authorities:
 *      - Lobby Session: ACTIVE vs INACTIVE
 *      - Publication: PRIVATE vs PUBLIC
 *   2. Presence Control:
 *      - When private: [ GO PUBLIC ]
 *      - When public: [ PUBLIC • ON ] / [ GO PRIVATE ]
 *      - GO PRIVATE unpublishes without ending the avatar lobby session!
 *   3. Experiences / Warp Control:
 *      - Opens discovery overlay / experiences menu
 *      - WATCH IN MY LOBBY: binds experience to lobby monitor fabric
 *      - ENTER / WARP: starfield teleport sequence -> moves to destination
 *   4. Show UI / Fullscreen:
 *      - Fullscreen is presentation-only
 *      - BACK / SHOW UI restores workstation WITHOUT leaving the room (BACK ≠ LEAVE)
 *   5. End Session:
 *      - [ END AVATAR LOBBY ]: distinct termination action returning to Fan Hub.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useFanAvatarLobbyStore,
  type TraveledDestinationInfo,
  type WatchedExperienceInfo,
} from "@/lib/avatars/FanAvatarLobbyStore";
import StarTravelTransition from "@/components/travel/StarTravelTransition";
import { liveDiscoveryOverlayStore } from "@/lib/discovery/liveDiscoveryOverlayStore";
import { HudCommandBus } from "@/lib/venue-hud/TMIExperienceHudRuntime";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";
const GREEN = "#00FF88";
const RED = "#FF4466";

export interface FanAvatarLobbyVenueHudProps {
  roomId: string;
  userId: string;
  displayName?: string;
  onEmoteTrigger?: (emote: string) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export default function FanAvatarLobbyVenueHud({
  roomId,
  userId,
  displayName = "Fan",
  onEmoteTrigger,
  onToggleFullscreen,
  isFullscreen = false,
}: FanAvatarLobbyVenueHudProps) {
  const router = useRouter();
  const {
    lobbySessionState,
    publicationState,
    experienceState,
    watchedExperience,
    isTeleporting,
    teleportTargetName,
    hudAutoHide,
    hudKeepOn,
    startAvatarLobby,
    goPublic,
    goPrivate,
    endAvatarLobby,
    watchInLobby,
    clearWatchedExperience,
    beginWarp,
    completeWarp,
    toggleHudAutoHide,
  } = useFanAvatarLobbyStore();

  const [experiencesOpen, setExperiencesOpen] = useState(false);
  const [emotesOpen, setEmotesOpen] = useState(false);
  const [monitorsOpen, setMonitorsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [hudMinimized, setHudMinimized] = useState(false);

  // Initialize lobby session on mount if not active
  useEffect(() => {
    if (lobbySessionState !== "ACTIVE") {
      startAvatarLobby(userId, { roomId });
    }
  }, [lobbySessionState, userId, roomId, startAvatarLobby]);

  // Flash status message
  const flashStatus = useCallback((msg: string) => {
    setStatusNotice(msg);
    const t = setTimeout(() => setStatusNotice(null), 3000);
    return () => clearTimeout(t);
  }, []);

  // Public / Private Toggle Handler
  const handleTogglePublish = async () => {
    if (publicationState === "PRIVATE") {
      const ok = await goPublic();
      if (ok) {
        flashStatus("Lobby is now PUBLIC · Discoverable on Fan Live Wall");
      } else {
        flashStatus("Failed to publish lobby");
      }
    } else {
      // GO PRIVATE: keeps session active, unpublishes presence
      goPrivate();
      flashStatus("Lobby is now PRIVATE · Hidden from public discovery");
    }
  };

  // Warp Handler
  const handleWarp = (dest: TraveledDestinationInfo) => {
    setExperiencesOpen(false);
    beginWarp(dest);
  };

  // Complete travel transition
  const handleTravelComplete = () => {
    completeWarp();
    const dest = useFanAvatarLobbyStore.getState().traveledDestination;
    if (dest) {
      router.push(`/live/rooms/${encodeURIComponent(dest.roomId)}?from=fan-avatar-lobby`);
    }
  };

  // Watch In Lobby Handler
  const handleWatchInLobby = (exp: WatchedExperienceInfo) => {
    setExperiencesOpen(false);
    watchInLobby(exp);
    flashStatus(`Watching "${exp.title}" on lobby monitor`);
  };

  // QR Destination Resolution
  const handleQrResolve = () => {
    const target = qrInput.trim();
    if (!target) return;
    setQrOpen(false);
    setQrInput("");
    handleWarp({
      roomId: target,
      title: `Room ${target}`,
      experienceType: "room",
    });
  };

  // End Session Handler
  const handleEndSession = () => {
    endAvatarLobby();
    router.push("/dashboard/fan");
  };

  // Standard sample experiences available for warp / watch
  const sampleExperiences: TraveledDestinationInfo[] = useMemo(
    () => [
      { roomId: "monday-night-stage", title: "Monday Night Stage", experienceType: "MONDAY_NIGHT_STAGE" },
      { roomId: "world-dance-party", title: "World Dance Party", experienceType: "WORLD_DANCE_PARTY" },
      { roomId: "anchor-thunder-dome-battle", title: "Thunder Dome Battle", experienceType: "BATTLE" },
      { roomId: "anchor-freestyle-cypher", title: "Multi-Style Cypher", experienceType: "CYPHER" },
      { roomId: "anchor-song-challenge-lab", title: "Song Challenge Lab", experienceType: "CHALLENGE" },
      { roomId: "anchor-science-lounge", title: "Science Lounge", experienceType: "LOUNGE" },
      { roomId: "anchor-music-lounge", title: "Music Lounge", experienceType: "LOUNGE" },
      { roomId: "anchor-dating-lounge", title: "Dating Lounge (21+)", experienceType: "LOUNGE" },
    ],
    [],
  );

  return (
    <>
      {/* Starfield Teleport Transition Animation */}
      {isTeleporting && (
        <StarTravelTransition
          isTraveling={isTeleporting}
          destinationName={teleportTargetName ?? "Destination Venue"}
          onTravelComplete={handleTravelComplete}
        />
      )}

      {/* Top Status & Controls Bar */}
      <header
        data-fan-venue-hud="header"
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          right: 12,
          zIndex: 45,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {/* Left: Room Badge & Public/Private State */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <div
            style={{
              padding: "4px 10px",
              background: "rgba(5,5,16,0.88)",
              border: "1px solid rgba(0,255,255,0.3)",
              borderRadius: 6,
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 10 }}>👥</span>
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 10,
                fontWeight: 900,
                color: CYAN,
                letterSpacing: "0.08em",
              }}
            >
              FAN AVATAR LOBBY
            </span>
          </div>

          {/* PUBLIC / PRIVATE TOGGLE BUTTON */}
          <button
            type="button"
            data-testid="hud-public-private-toggle"
            onClick={handleTogglePublish}
            style={{
              padding: "5px 12px",
              background: publicationState === "PUBLIC" ? "rgba(0,255,136,0.2)" : "rgba(255,45,170,0.15)",
              border: `1.5px solid ${publicationState === "PUBLIC" ? GREEN : FUCHSIA}`,
              borderRadius: 6,
              color: publicationState === "PUBLIC" ? GREEN : FUCHSIA,
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: publicationState === "PUBLIC" ? `0 0 12px ${GREEN}44` : `0 0 8px ${FUCHSIA}33`,
              transition: "all 0.2s ease",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: publicationState === "PUBLIC" ? GREEN : FUCHSIA,
                boxShadow: `0 0 6px ${publicationState === "PUBLIC" ? GREEN : FUCHSIA}`,
                display: "inline-block",
              }}
            />
            {publicationState === "PUBLIC" ? "PUBLIC • ON (GO PRIVATE)" : "PRIVATE (GO PUBLIC)"}
          </button>
        </div>

        {/* Right: Quick actions (Experiences, QR, Back/UI, End Session) */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, pointerEvents: "auto" }}>
          {/* Find Room / Experiences */}
          <button
            type="button"
            data-testid="hud-experiences-button"
            onClick={() => setExperiencesOpen((p) => !p)}
            style={{
              padding: "5px 10px",
              background: "rgba(0,229,255,0.15)",
              border: `1px solid ${CYAN}`,
              borderRadius: 6,
              color: CYAN,
              fontSize: 9,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>🌐</span>
            <span>EXPERIENCES / WARP</span>
          </button>

          {/* QR Panel Entry */}
          <button
            type="button"
            data-testid="hud-qr-entry-button"
            onClick={() => setQrOpen((p) => !p)}
            style={{
              padding: "5px 9px",
              background: "rgba(255,215,0,0.15)",
              border: `1px solid ${GOLD}`,
              borderRadius: 6,
              color: GOLD,
              fontSize: 9,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            📱 QR ENTRY
          </button>

          {/* Fullscreen / Back UI */}
          {onToggleFullscreen && (
            <button
              type="button"
              data-testid="hud-fullscreen-button"
              onClick={onToggleFullscreen}
              style={{
                padding: "5px 9px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 6,
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isFullscreen ? "SHOW UI (BACK)" : "FULLSCREEN"}
            </button>
          )}

          {/* END AVATAR LOBBY (distinct from GO PRIVATE!) */}
          <button
            type="button"
            data-testid="hud-end-avatar-lobby-button"
            onClick={handleEndSession}
            style={{
              padding: "5px 10px",
              background: "rgba(255,68,102,0.15)",
              border: `1px solid ${RED}`,
              borderRadius: 6,
              color: RED,
              fontSize: 9,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            END AVATAR LOBBY
          </button>
        </div>
      </header>

      {/* Status Notice Toast */}
      {statusNotice && (
        <div
          data-testid="hud-status-notice"
          style={{
            position: "absolute",
            top: 52,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            background: "rgba(5,5,16,0.92)",
            border: `1px solid ${CYAN}`,
            borderRadius: 8,
            padding: "6px 16px",
            color: CYAN,
            fontSize: 11,
            fontWeight: 800,
            boxShadow: "0 0 16px rgba(0,255,255,0.3)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {statusNotice}
        </div>
      )}

      {/* Currently Watched Experience Bar in Lobby */}
      {experienceState === "WATCHING_IN_LOBBY" && watchedExperience && (
        <div
          data-testid="hud-watched-experience-bar"
          style={{
            position: "absolute",
            top: 50,
            right: 12,
            zIndex: 44,
            background: "rgba(5,5,16,0.9)",
            border: `1px solid ${GOLD}`,
            borderRadius: 8,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 8, color: GOLD, fontWeight: 900 }}>📺 ON MONITOR:</span>
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>{watchedExperience.title}</span>
          <button
            type="button"
            onClick={clearWatchedExperience}
            style={{
              background: "transparent",
              border: `1px solid ${RED}`,
              borderRadius: 4,
              color: RED,
              fontSize: 8,
              padding: "2px 6px",
              cursor: "pointer",
            }}
          >
            ✕ STOP
          </button>
        </div>
      )}

      {/* Bottom Main Venue HUD Rail */}
      <footer
        data-fan-venue-hud="dock"
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 45,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(5,5,16,0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,255,255,0.25)",
          borderRadius: 14,
          padding: "6px 10px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Emotes button */}
        <button
          type="button"
          data-testid="hud-emotes-button"
          onClick={() => setEmotesOpen((p) => !p)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "4px 8px",
            background: emotesOpen ? "rgba(0,255,255,0.2)" : "transparent",
            border: `1px solid ${emotesOpen ? CYAN : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6,
            color: emotesOpen ? CYAN : "rgba(255,255,255,0.7)",
            fontSize: 8,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14 }}>🕺</span>
          <span>EMOTES</span>
        </button>

        {/* Monitors button */}
        <button
          type="button"
          data-testid="hud-monitors-button"
          onClick={() => setMonitorsOpen((p) => !p)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "4px 8px",
            background: monitorsOpen ? "rgba(255,215,0,0.2)" : "transparent",
            border: `1px solid ${monitorsOpen ? GOLD : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6,
            color: monitorsOpen ? GOLD : "rgba(255,255,255,0.7)",
            fontSize: 8,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14 }}>📺</span>
          <span>MONITORS</span>
        </button>

        {/* Global Live Lobby Wall button */}
        <button
          type="button"
          data-testid="hud-open-lobby-wall"
          onClick={() => liveDiscoveryOverlayStore.open()}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "4px 8px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            color: "rgba(255,255,255,0.7)",
            fontSize: 8,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14 }}>🌐</span>
          <span>LOBBY WALL</span>
        </button>

        {/* Auto-Hide / Keep On Preference */}
        <button
          type="button"
          data-testid="hud-keep-on-toggle"
          onClick={toggleHudAutoHide}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "4px 8px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            color: hudAutoHide ? "rgba(255,255,255,0.4)" : GREEN,
            fontSize: 8,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14 }}>{hudAutoHide ? "⏱" : "📌"}</span>
          <span>{hudAutoHide ? "AUTO-HIDE" : "KEEP ON"}</span>
        </button>
      </footer>

      {/* Emotes Dropdown / Drawer */}
      {emotesOpen && (
        <div
          data-testid="hud-emotes-drawer"
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 46,
            background: "rgba(5,5,16,0.96)",
            border: `1px solid ${CYAN}`,
            borderRadius: 10,
            padding: 10,
            display: "flex",
            gap: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {[
            { id: "dance", label: "Dance", icon: "🕺" },
            { id: "wave", label: "Wave", icon: "👋" },
            { id: "cheer", label: "Cheer", icon: "🎉" },
            { id: "clap", label: "Clap", icon: "👏" },
            { id: "hype", label: "Hype", icon: "🔥" },
            { id: "hands_up", label: "Hands Up", icon: "🙌" },
          ].map((em) => (
            <button
              key={em.id}
              type="button"
              onClick={() => {
                onEmoteTrigger?.(em.id);
                flashStatus(`Emote: ${em.label}`);
                setEmotesOpen(false);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18 }}>{em.icon}</span>
              <span>{em.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Experiences / Warp Drawer */}
      {experiencesOpen && (
        <div
          data-testid="hud-experiences-drawer"
          style={{
            position: "absolute",
            top: 50,
            right: 12,
            width: 340,
            maxHeight: 480,
            overflowY: "auto",
            zIndex: 48,
            background: "rgba(8,8,22,0.97)",
            border: `1.5px solid ${CYAN}`,
            borderRadius: 12,
            padding: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 900, color: CYAN }}>
              🌐 EXPERIENCES / WARP
            </span>
            <button
              type="button"
              onClick={() => setExperiencesOpen(false)}
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {sampleExperiences.map((exp) => (
              <div
                key={exp.roomId}
                style={{
                  padding: "8px 10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{exp.title}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
                    {exp.experienceType}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4 }}>
                  {/* Watch in Lobby button */}
                  <button
                    type="button"
                    onClick={() => handleWatchInLobby({ roomId: exp.roomId, title: exp.title, experienceType: exp.experienceType })}
                    style={{
                      padding: "4px 8px",
                      background: "rgba(255,215,0,0.15)",
                      border: `1px solid ${GOLD}`,
                      borderRadius: 4,
                      color: GOLD,
                      fontSize: 8,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    WATCH
                  </button>

                  {/* Enter / Warp button */}
                  <button
                    type="button"
                    onClick={() => handleWarp(exp)}
                    style={{
                      padding: "4px 8px",
                      background: "rgba(0,255,255,0.2)",
                      border: `1px solid ${CYAN}`,
                      borderRadius: 4,
                      color: CYAN,
                      fontSize: 8,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    WARP →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Entry Modal */}
      {qrOpen && (
        <div
          data-testid="hud-qr-modal"
          style={{
            position: "absolute",
            top: 50,
            right: 12,
            width: 280,
            zIndex: 48,
            background: "rgba(8,8,22,0.97)",
            border: `1.5px solid ${GOLD}`,
            borderRadius: 12,
            padding: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 900, color: GOLD }}>
              📱 SCAN QR / ENTER ROOM
            </span>
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
            Scan a QR code or enter an exact destination room ID to travel.
          </p>

          <input
            type="text"
            data-testid="hud-qr-input"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="e.g. anchor-thunder-dome-battle"
            style={{
              width: "100%",
              padding: "6px 8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,215,0,0.4)",
              borderRadius: 6,
              color: "#fff",
              fontSize: 10,
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            data-testid="hud-qr-submit"
            onClick={handleQrResolve}
            style={{
              width: "100%",
              padding: "6px",
              background: GOLD,
              border: "none",
              borderRadius: 6,
              color: "#000",
              fontWeight: 900,
              fontSize: 9,
              cursor: "pointer",
            }}
          >
            ENTER DESTINATION →
          </button>
        </div>
      )}
    </>
  );
}
