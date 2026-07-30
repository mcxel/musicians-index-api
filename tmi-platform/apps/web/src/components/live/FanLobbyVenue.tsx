"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFanLobbyPresence,
  useLobbyPresenceSync,
  type LobbyParticipant,
} from "@/lib/lobby/useLobbyPresenceSync";
import { useLocalMicLevel } from "@/lib/lobby/useLocalMicLevel";
import { LobbyFreeRoamAvatars } from "@/components/lobbies/LobbyFreeRoamAvatars";
import { LobbyEnvironmentToys } from "@/components/lobbies/LobbyEnvironmentToys";
import { LobbyInventoryTray } from "@/components/lobbies/LobbyInventoryTray";
import {
  DEFAULT_FAN_LOBBY_SKIN_ID,
  getFanLobbySkinCanon,
  getFanLobbySkinDressing,
  getPersistedFanLobbySkinId,
  listSwitchableFanLobbySkins,
  persistFanLobbySkinId,
  type FanLobbySkinId,
  type SeatAnchor,
} from "@/lib/lobby/FanLobbySkinRegistry";
import {
  assignOpenSeat,
  nearestOpenSeat,
  occupiedSeatIds,
  seatAtPoint,
} from "@/lib/lobby/FanLobbySeatAssigner";
import { getPresenceFrameById } from "@/registries/presence/PresenceFrameRegistry";
import MemoryCaptureButton from "@/components/memory/MemoryCaptureButton";
import QuickReportPanel, { type QuickReportTarget } from "@/components/trustSafety/QuickReportPanel";
import {
  blockUserLocal,
  getBlockedUserIds,
  getMutedUserIds,
  muteUserLocal,
} from "@/lib/trustSafety/localBlocks";

const AVATAR_EMOJIS = ["🎧", "🔥", "🌊", "👑", "✨", "🎵", "🎶", "🎤"];

function getOrCreateLocalId(roomId: string) {
  if (typeof window === "undefined") return "fan-" + Math.random().toString(36).slice(2, 8);
  const key = `tmi-fan-lobby-id:${roomId}`;
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = "fan-" + Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(key, id);
  }
  return id;
}

interface FanLobbyVenueProps {
  roomId?: string;
  userName?: string;
  /** Store-ready skin id from FanLobbySkinRegistry (default: cinema) */
  initialSkinId?: string;
  /** @deprecated Prefer initialSkinId — legacy LobbyThemeRegistry ids ignored */
  initialTheme?: string;
  /** Dashboard drawer / embed: fill parent, no full-page chrome */
  embedded?: boolean;
}

/**
 * Fan Lobby — free-roam 2D social floor + conversation chair anchors.
 * Not a 3D bobblehead engine / AvatarSeatUI grid (Rule 18/20).
 * Sit snaps to SeatAnchor; Stand frees seat; floor-tap walks (mix seated + roam).
 * Local cam bubble real; peer WebRTC Phase B.
 *
 * Phase A.5 Presence Certification: authoritative participant shape is
 * FanLobbyPresence (via useLobbyPresenceSync + getFanLobbyPresence).
 * Phase B binds media (head panels / SFU tracks) TO this presence — never
 * the reverse (do not invent presence from WebRTC).
 */
export default function FanLobbyVenue({
  roomId = "fan-lobby",
  userName = "Fan",
  initialSkinId = DEFAULT_FAN_LOBBY_SKIN_ID,
  embedded = false,
}: FanLobbyVenueProps) {
  const userId = useMemo(() => getOrCreateLocalId(roomId), [roomId]);
  const emoji = useMemo(() => AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)], []);
  const selfFrame = getPresenceFrameById("frame-obsidian-free");
  const switchableSkins = useMemo(() => listSwitchableFanLobbySkins(), []);

  const [skinId, setSkinId] = useState<FanLobbySkinId>(() => {
    const persisted = typeof window !== "undefined" ? getPersistedFanLobbySkinId() : null;
    const canon = getFanLobbySkinCanon(persisted ?? initialSkinId);
    return (canon?.id ?? DEFAULT_FAN_LOBBY_SKIN_ID) as FanLobbySkinId;
  });
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [rejoinBlocked, setRejoinBlocked] = useState(false);
  const [isStaffHost, setIsStaffHost] = useState(false);
  const [safetyTarget, setSafetyTarget] = useState<LobbyParticipant | null>(null);
  const [reportTarget, setReportTarget] = useState<QuickReportTarget | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const joinedRef = useRef(false);

  const dressing = getFanLobbySkinDressing(skinId);
  const skinLabel = getFanLobbySkinCanon(skinId)?.label ?? "Fan Lobby";
  const { isSpeaking } = useLocalMicLevel(micEnabled);
  const sync = useLobbyPresenceSync({
    roomId,
    venueId: roomId,
    userId,
    userName,
    emoji,
    theme: skinId,
  });

  const occupied = useMemo(
    () => occupiedSeatIds(sync.participants),
    [sync.participants],
  );

  useEffect(() => {
    sync.setIsSpeaking(isSpeaking);
  }, [isSpeaking, sync]);

  useEffect(() => {
    sync.setMicEnabled(micEnabled);
  }, [micEnabled, sync]);

  useEffect(() => {
    setHiddenIds(new Set([...getBlockedUserIds(), ...getMutedUserIds()]));
  }, []);

  // On join: spawn at entrance, then auto-claim first open chair (conversation hangout).
  // Stand frees the seat so others can roam/sit mix. Not a spreadsheet seat picker.
  useEffect(() => {
    if (joinedRef.current) return;
    joinedRef.current = true;
    sync.stand(dressing.entrance);
    const t = window.setTimeout(() => {
      const open = assignOpenSeat(dressing.seats, occupiedSeatIds(sync.participants));
      if (open) {
        sync.sit(open);
        setToast(`Seated · ${open.id} — Stand to walk & use props`);
      } else {
        setToast("Lobby full of seated fans — roam free or wait for a chair");
      }
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSitNearest = useCallback(() => {
    const open =
      nearestOpenSeat(dressing.seats, occupied, sync.position.x, sync.position.y) ??
      assignOpenSeat(dressing.seats, occupied);
    if (!open) {
      setToast("No open chairs right now");
      return;
    }
    sync.sit(open);
    setToast(`Seated · ${open.id}`);
  }, [dressing.seats, occupied, sync]);

  const handleStand = useCallback(() => {
    sync.stand();
    setToast("Standing — tap floor to walk, tap a chair to sit");
  }, [sync]);

  const handleFloorTap = useCallback(
    (x: number, y: number) => {
      const hit = seatAtPoint(dressing.seats, x, y, 7);
      if (hit && !occupied.has(hit.id)) {
        sync.sit(hit);
        setToast(`Seated · ${hit.id}`);
        return;
      }
      // Floor walk — auto-stand if seated so roam + seated mix works
      if (sync.isSeated) sync.stand();
      sync.move(x, y);
    },
    [dressing.seats, occupied, sync],
  );

  const handleSeatTap = useCallback(
    (anchor: SeatAnchor) => {
      if (occupied.has(anchor.id) && sync.seatId !== anchor.id) {
        setToast("That chair is taken");
        return;
      }
      sync.sit(anchor);
      setToast(`Seated · ${anchor.id}`);
    },
    [occupied, sync],
  );

  // Rejoin restriction check (Postgres-backed protections).
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/trust-safety/rejoin-check?roomId=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(userId)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d: { blocked?: boolean }) => {
        if (!cancelled) setRejoinBlocked(Boolean(d.blocked));
      })
      .catch(() => {
        /* fail open */
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, userId]);

  // Staff/host gate for remove + rejoin restrict (session role ADMIN/STAFF).
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: { role?: string } | null }) => {
        const role = (d.user?.role ?? "").toUpperCase();
        setIsStaffHost(role === "ADMIN" || role === "STAFF");
      })
      .catch(() => setIsStaffHost(false));
  }, []);

  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    if (!cameraEnabled) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setLocalStream(null);
      sync.setHasCameraOn(false);
      return;
    }
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ video: true }).then((stream) => {
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setLocalStream(stream);
      sync.setHasCameraOn(true);
    }).catch(() => setCameraEnabled(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraEnabled]);

  const refreshHidden = useCallback(() => {
    setHiddenIds(new Set([...getBlockedUserIds(), ...getMutedUserIds()]));
  }, []);

  const openReport = useCallback(
    (p: LobbyParticipant) => {
      // Thin accessor — same certified snapshot sync publishes (no parallel machine).
      const certified = getFanLobbyPresence(p.userId) ?? p;
      setReportTarget({
        accusedId: certified.userId,
        accusedLabel: certified.userName,
        surface: "fan_lobby",
        roomId,
        contentSnapshot: JSON.stringify({
          presence: {
            venueId: certified.venueId,
            roomId: certified.roomId,
            userId: certified.userId,
            avatarId: certified.avatarId,
            seatAnchorId: certified.seatAnchorId,
            navigationState: certified.navigationState,
            conversationGroupId: certified.conversationGroupId,
            micEnabled: certified.micEnabled,
            cameraEnabled: certified.cameraEnabled,
            isSpeaking: certified.isSpeaking,
            activeSpeaker: certified.activeSpeaker,
            x: certified.x,
            y: certified.y,
          },
          at: new Date().toISOString(),
        }),
        presenceSnapshot: {
          roomId,
          reporterLocalId: userId,
          accused: certified,
          peers: sync.participants.map((x) => ({ userId: x.userId, userName: x.userName })),
        },
        // Fan Lobby has no chat transport yet — honest empty; checkbox still offered.
        recentMessages: [],
      });
      setReportOpen(true);
      setSafetyTarget(null);
    },
    [roomId, userId, sync.participants],
  );

  const hostRemove = useCallback(
    async (p: LobbyParticipant) => {
      // File a restrict case so EvidenceVault + rejoin block persist (staff session required for action API).
      try {
        const reportRes = await fetch("/api/trust-safety/report", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accusedId: p.userId,
            reasons: ["harassment"],
            surface: "fan_lobby",
            roomId,
            detail: `Host remove from ${roomId}`,
            blockImmediate: true,
            presenceSnapshot: { hostRemove: true, accused: p, roomId },
          }),
        });
        const reportData = (await reportRes.json()) as { caseId?: string; error?: string };
        if (reportRes.ok && reportData.caseId) {
          await fetch(`/api/trust-safety/cases/${encodeURIComponent(reportData.caseId)}/action`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "remove_from_room", note: "Fan Lobby host remove" }),
          });
          blockUserLocal(p.userId);
          refreshHidden();
          setToast(`Removed ${p.userName} · case ${reportData.caseId} · rejoin restricted`);
        } else {
          setToast(reportData.error ?? "Host remove requires signed-in staff session");
        }
      } catch {
        setToast("Host remove failed — network error");
      }
      setSafetyTarget(null);
    },
    [roomId, refreshHidden],
  );

  const totalOnline = sync.participants.filter((p) => !hiddenIds.has(p.userId)).length + 1;

  if (rejoinBlocked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050510", color: "#fff", padding: 24, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#FF4444", letterSpacing: "0.14em" }}>TRUST & SAFETY</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>Rejoin restricted</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8, maxWidth: 360 }}>
            You cannot re-enter this Fan Lobby right now. Contact support if you believe this is an error.
          </p>
          <Link href="/live/lobby/fans" style={{ display: "inline-block", marginTop: 16, color: "#00FFFF", fontWeight: 800 }}>
            ← Back to Fan Lobbies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: embedded ? "100%" : "100vh",
        height: embedded ? "100%" : undefined,
        overflow: "hidden",
        background: dressing.background,
        transition: "background 0.6s ease",
      }}
    >
      {dressing.backdropImageUrl ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${dressing.backdropImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.28,
            pointerEvents: "none",
            filter: "saturate(0.85) contrast(1.05)",
          }}
        />
      ) : null}

      <header
        style={{
          position: "relative",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: embedded ? "8px 14px" : "12px 20px",
          background: "rgba(0,0,0,0.55)",
          borderBottom: `1px solid ${dressing.accent}33`,
          backdropFilter: "blur(6px)",
        }}
      >
        {!embedded ? (
          <Link href="/live/lobby/fans" style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textDecoration: "none", letterSpacing: "0.1em" }}>
            ← BACK
          </Link>
        ) : null}
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: dressing.accent }}>
          {skinLabel.toUpperCase()} · {totalOnline} HERE
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {isStaffHost ? (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.35)", borderRadius: 999, padding: "4px 8px" }}>
              HOST SAFETY
            </span>
          ) : null}
          <PillToggle
            active={sync.isSeated}
            label={sync.isSeated ? "🚶 Stand" : "🪑 Sit"}
            accent={dressing.accent}
            onClick={() => (sync.isSeated ? handleStand() : handleSitNearest())}
          />
          <PillToggle active={micEnabled} label={micEnabled ? "🎙️ Mic On" : "🎙️ Mic Off"} accent="#00FF88" onClick={() => setMicEnabled((v) => !v)} />
          <PillToggle active={cameraEnabled} label={cameraEnabled ? "📹 Cam On" : "📹 Cam Off"} accent="#00FFFF" onClick={() => setCameraEnabled((v) => !v)} />
          <PillToggle active={themePanelOpen} label="🎨 Skin" accent={dressing.accent} onClick={() => setThemePanelOpen((v) => !v)} />
        </div>
      </header>

      <div style={{ position: "absolute", top: embedded ? 48 : 60, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24, opacity: 0.25, fontSize: 26, zIndex: 1, pointerEvents: "none" }}>
        {dressing.ambientIcons.map((icon, i) => (
          <span key={i}>{icon}</span>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          height: embedded ? "calc(100% - 44px)" : "calc(100vh - 52px)",
          zIndex: 10,
          background: dressing.floorTint,
        }}
      >
        <LobbyEnvironmentToys state={"FREE_ROAM" as never} onUseToy={(toyId) => sync.triggerProp(toyMapsToProp(toyId))} />
        <LobbyFreeRoamAvatars
          self={{
            userId,
            userName,
            emoji,
            x: sync.position.x,
            y: sync.position.y,
            propTrigger: sync.propTrigger,
            isSpeaking,
            hasCameraOn: cameraEnabled,
            localStream,
            frameGlowColor: selfFrame.glowColor,
            isSeated: sync.isSeated,
            seatId: sync.seatId,
            seatAnchorId: sync.seatAnchorId,
            locomotion: sync.locomotion,
            navigationState: sync.navigationState,
          }}
          participants={sync.participants}
          seats={dressing.seats}
          occupiedSeatIds={occupied}
          accentColor={dressing.accent}
          onFloorTap={handleFloorTap}
          onSeatTap={handleSeatTap}
          onAvatarSelect={(p) => setSafetyTarget(p)}
          hiddenUserIds={hiddenIds}
        />
        <LobbyInventoryTray state={"FREE_ROAM" as never} onUseProp={(propId) => sync.triggerProp(propId)} />

        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 45 }}>
          <MemoryCaptureButton userId={userId} roomId={roomId} />
        </div>
      </div>

      <AnimatePresence>
        {themePanelOpen && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            style={{
              position: "absolute",
              bottom: 76,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              maxWidth: "92%",
              justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 10,
              backdropFilter: "blur(8px)",
            }}
          >
            {switchableSkins.map((s) => {
              const d = getFanLobbySkinDressing(s.id);
              const active = s.id === skinId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSkinId(s.id);
                    persistFanLobbySkinId(s.id);
                    setThemePanelOpen(false);
                    // New skin = new chair layout; stand at that skin's entrance
                    const next = getFanLobbySkinDressing(s.id);
                    sync.stand(next.entrance);
                  }}
                  style={{
                    borderRadius: 10,
                    border: `1.5px solid ${active ? d.accent : "rgba(255,255,255,0.15)"}`,
                    background: active ? `${d.accent}22` : "rgba(255,255,255,0.04)",
                    color: d.accent,
                    padding: "8px 12px",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                  title={s.tagline}
                >
                  {s.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {safetyTarget && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            style={{
              position: "absolute",
              bottom: 90,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 55,
              background: "rgba(5,5,16,0.92)",
              border: "1.5px solid rgba(255,45,170,0.4)",
              borderRadius: 14,
              padding: 12,
              minWidth: 220,
              boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.12em", marginBottom: 6 }}>SAFETY · {safetyTarget.userName}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SafetyBtn label="⚑ Report" onClick={() => openReport(safetyTarget)} accent="#FF2DAA" />
              <SafetyBtn
                label="🚫 Block"
                onClick={() => {
                  blockUserLocal(safetyTarget.userId);
                  refreshHidden();
                  setToast(`Blocked ${safetyTarget.userName}`);
                  setSafetyTarget(null);
                }}
                accent="#FF4444"
              />
              <SafetyBtn
                label="🔇 Mute"
                onClick={() => {
                  muteUserLocal(safetyTarget.userId);
                  refreshHidden();
                  setToast(`Muted ${safetyTarget.userName}`);
                  setSafetyTarget(null);
                }}
                accent="#FFD700"
              />
              {isStaffHost ? (
                <SafetyBtn label="⛔ Host remove + restrict rejoin" onClick={() => hostRemove(safetyTarget)} accent="#00FFFF" />
              ) : null}
              <SafetyBtn label="Close" onClick={() => setSafetyTarget(null)} accent="rgba(255,255,255,0.4)" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast ? (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 70, background: "rgba(0,0,0,0.85)", border: "1px solid rgba(0,255,255,0.35)", color: "#00FFFF", padding: "8px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
          {toast}
          <button type="button" onClick={() => setToast(null)} style={{ marginLeft: 10, background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>×</button>
        </div>
      ) : null}

      <QuickReportPanel
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportTarget(null); }}
        target={reportTarget}
        onBlockLocal={(id) => {
          blockUserLocal(id);
          refreshHidden();
        }}
        onSubmitted={(caseId) => setToast(`Case ${caseId} filed · evidence preserved`)}
      />
    </div>
  );
}

function toyMapsToProp(toyId: string): string {
  const map: Record<string, string> = {
    mic_stand: "mic",
    popcorn_machine: "confetti",
    arcade_cabinet: "fire",
    jukebox: "hearts",
    disco_ball: "confetti",
  };
  return map[toyId] ?? "confetti";
}

function PillToggle({ active, label, accent, onClick }: { active: boolean; label: string; accent: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        borderRadius: 999, border: `1.5px solid ${active ? accent : "rgba(255,255,255,0.18)"}`,
        background: active ? `${accent}22` : "rgba(255,255,255,0.05)",
        color: active ? accent : "rgba(255,255,255,0.5)",
        padding: "6px 12px", fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.06em",
      }}
    >
      {label}
    </motion.button>
  );
}

function SafetyBtn({ label, onClick, accent }: { label: string; onClick: () => void; accent: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 8,
        border: `1px solid ${accent}66`,
        background: `${accent}18`,
        color: accent,
        padding: "8px 10px",
        fontSize: 11,
        fontWeight: 800,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {label}
    </button>
  );
}
