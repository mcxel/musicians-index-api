"use client";

/**
 * UniversalLobbyEntry
 *
 * The single entry pattern for EVERY room, game, battle, cypher, venue, and
 * live broadcast on TMI. One component — five steps — all surfaces.
 *
 * SHAPES:  circle | hex | oct | ticket | diamond | cinema | ribbon | torn
 * FLOW:    Discovery → Preview → Lobby → Seat → AudienceScene → Participate
 *
 * Usage:
 *   <UniversalLobbyCard {...room} />                 ← standalone card
 *   <LobbyEntryFlow room={room} onClose={fn} />      ← modal flow overlay
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type React from "react";
import { playSound } from "@/lib/sound/playSound";
import { useWatchSession } from "@/lib/presence/WatchSessionContext";
import { useSeatSession } from "@/lib/seats/useSeatSession";
import { getGuestId } from "@/lib/identity/getGuestId";
import RoomEnvironmentLayer from "@/components/live/RoomEnvironmentLayer";
import SeatArrivalTransition from "@/components/live/SeatArrivalTransition";
import { slugToVenueType } from "@/lib/venues/VenueAssetRegistry";

// ── AudienceScene (loaded only at step 4) ────────────────────────────────────
type AudienceSceneProps = { view?: string; venue?: number; onReaction?: () => void; occupancyRatio?: number };
const AudienceSceneLazy = dynamic(
  () => (import("@/components/live/AudienceScene") as Promise<{ default: React.ComponentType<AudienceSceneProps> }>),
  { ssr: false },
);

// ── AvatarMiniDisplay (loaded at seat step, shows user bobblehead) ────────────
const AvatarMiniDisplayLazy = dynamic(
  () => import("@/components/canisters/AvatarMiniDisplay"),
  { ssr: false },
);

// ── Types ─────────────────────────────────────────────────────────────────────
export type CardShape = "circle" | "hex" | "oct" | "ticket" | "diamond" | "cinema" | "ribbon" | "torn";
export type RoomStatus = "live" | "starting-soon" | "full" | "vip" | "upcoming";
export type EntryAccess = "free" | "vip" | "paid" | "diamond";
export type VenueIndex = 0 | 1 | 2 | 3 | 4; // Theater | Arena | Club | Outdoor | Boardroom

export interface UniversalRoom {
  id: string;
  title: string;
  subtitle?: string;
  hostName?: string;
  hostEmoji?: string;
  genre?: string;
  viewers: number;
  seatsOpen?: number;
  status: RoomStatus;
  access: EntryAccess;
  entryPriceUsd?: number;
  accentColor: string;
  thumbnailUrl?: string;
  xpReward?: number;
  prizeLabel?: string;
  roomRoute: string;       // navigate here on confirmed entry
  venueIndex?: VenueIndex; // AudienceScene venue (0=Theater default)
  shape?: CardShape;
}

// ── Step enum ─────────────────────────────────────────────────────────────────
type Step = "idle" | "preview" | "access" | "seat" | "audience" | "enter";

const STEP_LABELS: Record<Step, string> = {
  idle:     "",
  preview:  "PREVIEW",
  access:   "ACCESS CHECK",
  seat:     "FINDING SEAT…",
  audience: "VENUE LOADED",
  enter:    "ENTERING ROOM",
};

// ── Shape clip-paths ──────────────────────────────────────────────────────────
const CLIP: Record<CardShape, string | undefined> = {
  circle:  undefined,
  hex:     "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
  oct:     "polygon(25% 0%,75% 0%,100% 25%,100% 75%,75% 100%,25% 100%,0% 75%,0% 25%)",
  ticket:  "polygon(0 10%,5% 0,95% 0,100% 10%,100% 90%,95% 100%,5% 100%,0 90%)",
  diamond: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
  cinema:  undefined,
  ribbon:  undefined,
  torn:    "polygon(0 0,100% 0,100% 85%,95% 90%,90% 85%,85% 90%,80% 85%,75% 90%,70% 85%,65% 90%,60% 85%,55% 90%,50% 85%,45% 90%,40% 85%,35% 90%,30% 85%,25% 90%,20% 85%,15% 90%,10% 85%,5% 90%,0 85%)",
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<RoomStatus, { bg: string; label: string }> = {
  live:          { bg: "#E63000", label: "LIVE"         },
  "starting-soon":{ bg: "#FFD700", label: "STARTING SOON"},
  full:          { bg: "#888",    label: "FULL"         },
  vip:           { bg: "#AA2DFF", label: "VIP"          },
  upcoming:      { bg: "#555",    label: "UPCOMING"     },
};

// ── Inline styles helper ──────────────────────────────────────────────────────
const s = (styles: React.CSSProperties): React.CSSProperties => styles;

// Real, deterministic row/seat label derived from the actual assigned seatId
// (e.g. "seat-23") — never randomized.
function formatSeatLabel(seatId: string): string {
  const m = /^seat-(\d+)$/.exec(seatId);
  if (!m) return seatId;
  const n = parseInt(m[1]!, 10);
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const rowIdx = Math.floor((n - 1) / 10) % rows.length;
  const seatInRow = ((n - 1) % 10) + 1;
  return `Row ${rows[rowIdx]}, Seat ${seatInRow}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LobbyEntryFlow — the 5-step overlay
// ─────────────────────────────────────────────────────────────────────────────
interface LobbyEntryFlowProps {
  room: UniversalRoom;
  onClose: () => void;
  /**
   * When true, skip preview + access steps and jump directly to seat
   * assignment. Venue backdrop is shown immediately.
   * Used by Join buttons that should feel instantaneous (Rule 21).
   */
  instant?: boolean;
}

export function LobbyEntryFlow({ room, onClose, instant = false }: LobbyEntryFlowProps) {
  // instant=true → Star Wars hyperspace covers seat claim + scene preload (no black screen)
  const [step, setStep] = useState<Step>(instant ? "seat" : "preview");
  const [seatRow, setSeatRow] = useState<string | null>(null);
  const [seatId, setSeatId] = useState<string | null>(null);
  const [occupancyRatio, setOccupancyRatio] = useState(0);
  const [showStarBurst, setShowStarBurst] = useState(false);
  /** Instant path: hyperspace overlay active until seated reveal */
  const [hyperspaceActive, setHyperspaceActive] = useState(instant);
  const [seatReady, setSeatReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fillTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { startWatching } = useWatchSession();
  const router = useRouter();
  // Phase 3A — Seat Persistence Convergence (2026-06-20): inherited from
  // SeatingMeshEngine's reclaim-on-return capability. Real seat-claim memory
  // across visits, not a new seat system — the canonical /api/live/audience
  // engine already reuses a given seatId, it just was never given one before.
  const seatSession = useSeatSession(room.id, getGuestId());

  // Derive venue type for RoomEnvironmentLayer backdrop
  const venueType = slugToVenueType(room.id);

  // Register the Universal Presence System's watch session the moment the
  // fan commits to entering — this is what lets the mini player bring them
  // back to THIS room later instead of a generic lobby.
  useEffect(() => {
    if (step !== "enter") return;
    startWatching({ roomId: room.id, title: room.title, accentColor: room.accentColor, viewers: room.viewers, venueIndex: room.venueIndex, seatId: seatId ?? undefined });
  }, [step, room.id, room.title, room.accentColor, room.viewers, room.venueIndex, seatId, startWatching]);

  // Progressive stadium-fill — starts during hyperspace (instant) or on audience step
  useEffect(() => {
    const shouldFill = instant ? step === "seat" || step === "audience" : step === "audience";
    if (!shouldFill) return;
    if (!instant) {
      setShowStarBurst(true);
      const burst = setTimeout(() => setShowStarBurst(false), 1200);
      // non-instant cleanup via return
      setOccupancyRatio(0.12);
      fillTimerRef.current = setInterval(() => {
        setOccupancyRatio(prev => {
          const next = prev + 0.06;
          if (next >= 0.92) {
            if (fillTimerRef.current) clearInterval(fillTimerRef.current);
            return 0.92;
          }
          return next;
        });
      }, 250);
      return () => {
        clearTimeout(burst);
        if (fillTimerRef.current) clearInterval(fillTimerRef.current);
      };
    }
    // Instant: fill audience behind Star Wars so seated reveal is ready
    setOccupancyRatio(0.12);
    fillTimerRef.current = setInterval(() => {
      setOccupancyRatio(prev => {
        const next = prev + 0.06;
        if (next >= 0.92) {
          if (fillTimerRef.current) clearInterval(fillTimerRef.current);
          return 0.92;
        }
        return next;
      });
    }, 250);
    return () => {
      if (fillTimerRef.current) clearInterval(fillTimerRef.current);
    };
  }, [step, instant]);

  // Auto-navigate when "enter" step is reached — no extra click required
  useEffect(() => {
    if (step !== "enter") return;
    const dest = `${room.roomRoute}${room.roomRoute.includes("?") ? "&" : "?"}from=lobby-wall`;
    const t = setTimeout(() => router.push(dest), instant ? 220 : 400);
    return () => clearTimeout(t);
  }, [step, room.roomRoute, router, instant]);

  // Crowd-reaction sound on entering the audience step for concert-type rooms —
  // the anticipation moment right before a performer comes on.
  useEffect(() => {
    if (step !== "audience") return;
    if ((room.genre ?? "").toLowerCase() !== "concert") return;
    playSound(room.venueIndex === 1 ? "crowd_cheering_stadium" : "crowd_cheer_auditorium");
  }, [step, room.genre, room.venueIndex]);

  const ac = room.accentColor;
  const statusCfg = STATUS_COLORS[room.status];

  const advance = useCallback((to: Step, delay = 0) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (delay > 0) {
      timerRef.current = setTimeout(() => setStep(to), delay);
    } else {
      setStep(to);
    }
  }, []);

  /**
   * Seat claim starts immediately on seat step — runs UNDER hyperspace so when
   * stars clear the user is already seated (Marcel: buy render time).
   */
  useEffect(() => {
    if (step !== "seat") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/live/audience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            venueSlug: room.id,
            member: { userId: getGuestId(), displayName: "Fan", role: "fan", seatId: seatSession.seatId },
          }),
        });
        const data = await res.json();
        const assigned = typeof data?.assignedSeatId === "string" ? data.assignedSeatId : null;
        if (!cancelled) {
          setSeatId(assigned);
          setSeatRow(assigned ? formatSeatLabel(assigned) : "General Admission");
          if (assigned) seatSession.claim(assigned);
          setSeatReady(true);
        }
      } catch {
        if (!cancelled) {
          setSeatRow("General Admission");
          setSeatReady(true);
        }
      } finally {
        // Non-instant: classic timed advance. Instant: wait for SeatArrivalTransition onComplete.
        if (!cancelled && !instant) advance("audience", 1600);
      }
    })();
    return () => { cancelled = true; };
  }, [step, advance, room.id, instant, seatSession.seatId, seatSession.claim]);

  /** Hyperspace complete → reveal seated audience, then enter room */
  const onHyperspaceComplete = useCallback(() => {
    setHyperspaceActive(false);
    setStep("audience");
    // Brief seated reveal, then navigate (no black screen — venue already painted)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStep("enter"), seatReady ? 650 : 900);
  }, [seatReady]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Venue shell under hyperspace — never a black empty room during travel
  const isVenueMode = step === "seat" || step === "audience" || step === "enter";
  const showSeatedAudience = instant
    ? step === "seat" || step === "audience" || step === "enter"
    : step === "audience";

  const overlay = s({
    position: "fixed", inset: 0, zIndex: 9000,
    background: isVenueMode ? "transparent" : "rgba(5,5,16,0.88)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: isVenueMode ? 0 : 20,
  });

  const panel = s({
    width: "100%", maxWidth: 680,
    ...(isVenueMode ? {
      position: "absolute" as const,
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      borderRadius: "16px 16px 0 0",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      background: "rgba(8,9,26,0.82)",
    } : {
      background: "#08091a",
      borderRadius: 16,
    }),
    border: `1px solid ${ac}44`,
    overflow: "hidden",
    boxShadow: `0 0 40px ${ac}22`,
  });

  // ── Step indicator ──────────────────────────────────────────────────────────
  const STEPS: Step[] = ["preview", "access", "seat", "audience", "enter"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div style={overlay} onClick={e => { if (!isVenueMode && e.target === e.currentTarget) onClose(); }}>

      {/* ── Venue + audience preload UNDER hyperspace (buys render time) ── */}
      {isVenueMode && (
        <div style={s({ position: "absolute", inset: 0, zIndex: 0 })}>
          <RoomEnvironmentLayer
            venueType={venueType}
            mode="audience"
            energyLevel={showSeatedAudience ? 0.8 : 0.45}
            style={{ width: "100%", height: "100%" }}
          />
          {showSeatedAudience && (
            <div style={s({
              position: "absolute",
              inset: instant && hyperspaceActive ? 0 : undefined,
              bottom: instant && !hyperspaceActive ? 120 : 0,
              left: 0, right: 0,
              top: instant ? 0 : undefined,
              zIndex: 1,
              opacity: hyperspaceActive ? 0.01 : 1, // keep mounted/painting while covered
              pointerEvents: "none",
            })}>
              <AudienceSceneLazy
                view="fan"
                venue={room.venueIndex ?? 0}
                occupancyRatio={occupancyRatio}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Star Wars hyperspace → slow-down → big stars → seated (instant path) ── */}
      {instant && (
        <SeatArrivalTransition
          active={hyperspaceActive}
          onComplete={onHyperspaceComplete}
          destinationLabel={room.title}
        />
      )}

      {/* ── Legacy star burst (non-instant audience step only) ── */}
      {showStarBurst && !instant && (
        <div style={s({ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none", overflow: "hidden" })}>
          <style>{`
            @keyframes starBurst {
              0%   { transform: scale(0) rotate(0deg);   opacity: 1; }
              60%  { transform: scale(1.6) rotate(120deg); opacity: 0.8; }
              100% { transform: scale(2.8) rotate(240deg); opacity: 0; }
            }
            @keyframes starParticle {
              0%   { transform: translate(0,0) scale(1);   opacity: 1; }
              100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
            }
          `}</style>
          {/* Central ring */}
          <div style={s({
            position: "absolute",
            top: "50%", left: "50%",
            width: 120, height: 120,
            marginLeft: -60, marginTop: -60,
            borderRadius: "50%",
            border: `3px solid ${ac}`,
            boxShadow: `0 0 40px ${ac}, inset 0 0 40px ${ac}44`,
            animation: "starBurst 1.1s ease-out forwards",
          })} />
          {/* Particle rays */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * 360;
            const dist = 140 + Math.random() * 60;
            const dx = Math.round(Math.cos((angle * Math.PI) / 180) * dist);
            const dy = Math.round(Math.sin((angle * Math.PI) / 180) * dist);
            return (
              <div
                key={i}
                style={s({
                  position: "absolute",
                  top: "50%", left: "50%",
                  width: 6, height: 6,
                  marginLeft: -3, marginTop: -3,
                  borderRadius: "50%",
                  background: i % 3 === 0 ? ac : i % 3 === 1 ? "#00FFFF" : "#FFD700",
                  boxShadow: `0 0 8px ${ac}`,
                  // CSS custom properties for animation direction
                  ...({ "--dx": `${dx}px`, "--dy": `${dy}px` } as React.CSSProperties),
                  animation: `starParticle 1s ${i * 0.04}s ease-out forwards`,
                })}
              />
            );
          })}
          {/* Avatar arrival glow */}
          <div style={s({
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 48,
            animation: "starBurst 1.1s ease-out forwards",
          })}>🎭</div>
        </div>
      )}

      {/* ── Card panel — hidden during hyperspace so stars own the frame ── */}
      {!(instant && hyperspaceActive) && (
      <div style={{
        ...panel,
        ...(isVenueMode ? {
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: 480,
          background: "rgba(5,5,16,0.82)",
          backdropFilter: "blur(16px)",
          zIndex: 10,
        } : {}),
      }}>

        {/* Header */}
        <div style={s({ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" })}>
          <div>
            <div style={s({ fontSize: 13, fontWeight: 900, color: "#fff" })}>{room.title}</div>
            <div style={s({ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", marginTop: 2 })}>{STEP_LABELS[step]}</div>
          </div>
          <button onClick={onClose} style={s({ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 18 })}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={s({ display: "flex", padding: "10px 20px 0", gap: 4 })}>
          {STEPS.map((st, i) => (
            <div key={st} style={s({ flex: 1, height: 3, borderRadius: 2, background: i <= stepIdx ? ac : "rgba(255,255,255,0.08)", transition: "background 0.4s ease" })} />
          ))}
        </div>

        <div style={s({ padding: "20px" })}>

          {/* ── STEP: PREVIEW ── */}
          {step === "preview" && (
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              {/* Room stats */}
              <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 })}>
                {[
                  { label: "WATCHING",   value: room.viewers.toLocaleString(), color: ac      },
                  { label: "SEATS OPEN", value: (room.seatsOpen ?? "∞").toString(), color: "#00FF88" },
                  { label: "ACCESS",     value: room.access.toUpperCase(),  color: room.access === "free" ? "#00FF88" : "#FFD700" },
                ].map(stat => (
                  <div key={stat.label} style={s({ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px", textAlign: "center" })}>
                    <div style={s({ fontSize: 16, fontWeight: 900, color: stat.color })}>{stat.value}</div>
                    <div style={s({ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", marginTop: 3 })}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Room details */}
              <div style={s({ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.5)" })}>
                {room.hostName   && <div>🎤 Hosted by <span style={{ color: "#fff", fontWeight: 700 }}>{room.hostName}</span></div>}
                {room.genre      && <div>🎵 Genre: {room.genre}</div>}
                {room.xpReward   && <div>⭐ +{room.xpReward} XP on entry</div>}
                {room.prizeLabel && <div>🏆 {room.prizeLabel}</div>}
                {room.entryPriceUsd && <div>💳 ${room.entryPriceUsd.toFixed(2)} entry</div>}
              </div>

              {/* What happens inside */}
              <div style={s({ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px" })}>
                <div style={s({ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 8 })}>ONCE INSIDE</div>
                {["Chat activates", "Reactions live", "Avatar appears", "Battles / Cyphers / Challenges available", "Tip · Book · Purchase"].map(item => (
                  <div key={item} style={s({ fontSize: 10, color: "rgba(255,255,255,0.45)", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" })}>{item}</div>
                ))}
              </div>

              <button
                onClick={() => advance("access")}
                style={s({ padding: "13px", background: ac, color: "#050310", borderRadius: 10, fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", cursor: "pointer", border: "none", boxShadow: `0 0 20px ${ac}44` })}
              >
                JOIN LOBBY →
              </button>
            </div>
          )}

          {/* ── STEP: ACCESS CHECK ── */}
          {step === "access" && (
            <div style={s({ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" })}>
              <div style={s({ fontSize: 32 })}>🔑</div>
              <div style={s({ fontSize: 14, fontWeight: 900, color: "#fff" })}>Access Check</div>
              <div style={s({ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 })}>
                {[
                  { label: "Membership",   pass: true,  value: room.access === "free" ? "Free Entry" : room.access.toUpperCase() },
                  { label: "Age Gate",     pass: true,  value: "Verified"   },
                  { label: "Room Status",  pass: room.status !== "full", value: room.status === "full" ? "FULL — join queue" : "Available" },
                ].map(row => (
                  <div key={row.label} style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8 })}>
                    <span style={s({ fontSize: 10, color: "rgba(255,255,255,0.5)" })}>{row.label}</span>
                    <span style={s({ fontSize: 10, fontWeight: 800, color: row.pass ? "#00FF88" : "#E63000" })}>{row.pass ? "✓" : "✗"} {row.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => advance("seat")}
                style={s({ marginTop: 8, padding: "11px 32px", background: `${ac}22`, border: `1px solid ${ac}55`, color: ac, borderRadius: 10, fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer" })}
              >
                CLEAR — FIND MY SEAT →
              </button>
            </div>
          )}

          {/* ── STEP: SEAT ASSIGNMENT ── */}
          {step === "seat" && (
            <div style={s({ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" })}>
              <AvatarMiniDisplayLazy size={64} fallback={<div style={{ fontSize: 32 }}>🎭</div>} showLabel />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={s({ fontSize: 13, fontWeight: 900, color: "#fff" })}>Finding Your Seat…</div>
              {seatRow && <div style={s({ fontSize: 11, color: ac, fontWeight: 800, letterSpacing: "0.1em" })}>Assigned: {seatRow}</div>}
              <div style={s({ width: "100%", maxWidth: 300, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" })}>
                <div style={s({ height: 4, background: ac, borderRadius: 2, animation: "fillBar 1.5s ease-out forwards", width: "0%" })} />
                <style>{`@keyframes fillBar{to{width:100%}}`}</style>
              </div>
            </div>
          )}

          {/* ── STEP: AUDIENCE SCENE — instant: already seated after Star Wars ── */}
          {step === "audience" && (
            <div style={s({ display: "flex", flexDirection: "column", gap: 12 })}>
              <div style={s({ fontSize: 9, fontWeight: 800, color: ac, letterSpacing: "0.15em" })}>
                {instant ? "YOU'RE SEATED — " : "VENUE LOADED — "}{seatRow ?? "GENERAL ADMISSION"}
              </div>
              {!instant && (
                <div style={s({ borderRadius: 10, overflow: "hidden", border: `1px solid ${ac}33` })}>
                  <AudienceSceneLazy view="fan" venue={room.venueIndex ?? 0} occupancyRatio={occupancyRatio} />
                </div>
              )}
              {instant ? (
                <div style={s({ fontSize: 11, color: "rgba(255,255,255,0.55)", textAlign: "center", fontWeight: 700 })}>
                  Seat locked. Entering live room…
                </div>
              ) : (
                <button
                  onClick={() => advance("enter")}
                  style={s({ padding: "13px", background: ac, color: "#050310", borderRadius: 10, fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", cursor: "pointer", border: "none", boxShadow: `0 0 20px ${ac}44` })}
                >
                  ▶ ENTER ROOM
                </button>
              )}
            </div>
          )}

          {/* ── STEP: ENTERING ── */}
          {step === "enter" && (
            <div style={s({ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0", cursor: "pointer" })}>
              <div style={s({ fontSize: 32 })}>💺</div>
              <div style={s({ fontSize: 14, fontWeight: 900, color: "#fff" })}>
                {instant ? "Seated — joining room…" : "Entering Room…"}
              </div>
              <div style={s({ fontSize: 11, color: "rgba(255,255,255,0.4)" })}>
                {seatRow ? `${seatRow} · ` : ""}Navigating automatically…
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UniversalLobbyCard — the discovery card, all surfaces
// ─────────────────────────────────────────────────────────────────────────────
interface UniversalLobbyCardProps extends UniversalRoom {
  /** Override card min-width for layout contexts */
  minWidth?: number;
  /** Show expanded host bar */
  showHost?: boolean;
  children?: ReactNode;
}

export function UniversalLobbyCard({
  minWidth = 220,
  showHost = false,
  children,
  ...room
}: UniversalLobbyCardProps) {
  const [flowOpen, setFlowOpen] = useState(false);

  const shape   = room.shape ?? "oct";
  const clip    = CLIP[shape];
  const ac      = room.accentColor;
  const status  = STATUS_COLORS[room.status];
  const isLive  = room.status === "live";

  const cardStyle = s({
    position: "relative",
    minWidth,
    cursor: "pointer",
    overflow: "hidden",
    borderRadius: shape === "circle" ? "50%" : shape === "cinema" ? 6 : 10,
    aspectRatio: shape === "cinema" ? "21/9" : shape === "circle" || shape === "diamond" ? "1" : undefined,
    background: `linear-gradient(135deg, ${ac}14, #08091a)`,
    border: `1px solid ${ac}${isLive ? "55" : "22"}`,
    clipPath: clip,
    transition: "transform .18s, box-shadow .18s",
    boxShadow: isLive ? `0 0 12px ${ac}33` : "none",
  });

  const ribbonStyle = shape === "ribbon"
    ? s({ borderLeft: `4px solid ${ac}`, borderRadius: 6 })
    : {};

  return (
    <>
      {flowOpen && <LobbyEntryFlow room={room} onClose={() => setFlowOpen(false)} instant />}

      <div style={{ ...cardStyle, ...ribbonStyle }} onClick={() => setFlowOpen(true)}>
        {/* Scan-line overlay for live rooms */}
        {isLive && (
          <div style={s({ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: `rgba(0,220,255,0.18)`, animation: "scanBar 3s linear infinite", zIndex: 3, pointerEvents: "none" })} />
        )}
        <style>{`@keyframes scanBar{0%{top:0}100%{top:100%}} @keyframes blinkBadge{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

        <div style={s({ padding: shape === "circle" ? 8 : "12px 14px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" })}>
          {/* Top row: LIVE badge + viewer count */}
          <div style={s({ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 })}>
            <span style={s({ background: status.bg, color: "#fff", fontSize: 7, fontWeight: 800, padding: "2px 5px", borderRadius: 3, letterSpacing: "0.08em", animation: isLive ? "blinkBadge 1.4s ease-in-out infinite" : "none" })}>
              {status.label}
            </span>
            <span style={s({ background: "rgba(0,0,0,0.6)", color: ac, fontSize: 8, padding: "1px 5px", borderRadius: 3 })}>
              👁 {room.viewers.toLocaleString()}
            </span>
          </div>

          {/* Middle: title, host, genre */}
          <div style={s({ flex: 1 })}>
            {room.hostEmoji && <div style={s({ fontSize: 22, marginBottom: 4 })}>{room.hostEmoji}</div>}
            <div style={s({ fontSize: 11, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 2 })}>{room.title}</div>
            {room.subtitle && <div style={s({ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" })}>{room.subtitle}</div>}
            {showHost && room.hostName && <div style={s({ fontSize: 8, color: ac, fontWeight: 700, marginTop: 2 })}>{room.hostName}</div>}
            {children}
          </div>

          {/* Bottom: prize + join */}
          <div style={s({ marginTop: 8 })}>
            {room.prizeLabel && <div style={s({ fontSize: 8, color: ac, fontWeight: 700, marginBottom: 6 })}>🏆 {room.prizeLabel}</div>}
            <div style={s({ display: "flex", gap: 5 })}>
              <button
                onClick={e => { e.stopPropagation(); setFlowOpen(true); }}
                style={s({
                  flex: 1, padding: "6px 0", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em",
                  background: ac, color: "#050310", border: "none", borderRadius: 6, cursor: "pointer",
                })}
              >
                JOIN LOBBY
              </button>
              <Link
                href={`${room.roomRoute}?mode=watch`}
                onClick={e => e.stopPropagation()}
                style={s({
                  padding: "6px 10px", fontSize: 9, color: "rgba(255,255,255,0.45)",
                  background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, textDecoration: "none",
                })}
              >
                Watch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UniversalLobbyWall — renders a grid of UniversalLobbyCards
// ─────────────────────────────────────────────────────────────────────────────
interface UniversalLobbyWallProps {
  rooms: UniversalRoom[];
  columns?: number;
  title?: string;
  accentColor?: string;
}

export function UniversalLobbyWall({ rooms, columns = 3, title, accentColor = "#00E5FF" }: UniversalLobbyWallProps) {
  return (
    <div>
      {title && (
        <div style={s({ fontSize: 9, fontWeight: 800, color: accentColor, letterSpacing: "0.2em", marginBottom: 12 })}>
          {title}
        </div>
      )}
      <div style={s({ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 })}>
        {rooms.map(room => (
          <UniversalLobbyCard key={room.id} {...room} />
        ))}
      </div>
    </div>
  );
}

export default UniversalLobbyCard;
