"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RoomChatBubbleLayer } from "@/components/chat/RoomChatBubbleLayer";
import { PerformerFeedbackPanel } from "@/components/chat/PerformerFeedbackPanel";
import { CrowdChatOverflowPanel } from "@/components/chat/CrowdChatOverflowPanel";
import { ModeratorShield } from "@/components/chat/ModeratorShield";
import { RoomChatEngine } from "@/lib/chat/RoomChatEngine";
import type { RoomChatMessage, RoomRuntimeState, ChatRoomId } from "@/lib/chat/RoomChatEngine";
import type { OverflowRailEntry } from "@/lib/chat/ChatOverflowRailEngine";
import {
  claimSeat as claimSeatEngine,
  createSeatMap,
  releaseSeat as releaseSeatEngine,
  type LobbySeat,
  type LobbySeatMap,
} from "@/lib/lobby/lobbySeatEngine";
import {
  createInitialPresence,
  sendReaction as sendReactionEngine,
  sendTip as sendTipEngine,
  startCountdown,
} from "@/lib/lobby/lobbyPresenceEngine";
import {
  advanceQueue,
  getQueueSnapshot,
  joinQueue as joinQueueEngine,
  removeFromQueue,
  type QueueSlot,
} from "@/lib/live/queueEngine";
import LobbyPreviewBillboard from "@/components/lobbies/LobbyPreviewBillboard";
import LobbyQueueRail, { type LobbyQueueEntry } from "@/components/lobbies/LobbyQueueRail";
import LobbyReactionRail, { type LobbyReactionType } from "@/components/lobbies/LobbyReactionRail";
import LobbySeatGrid, { type TheaterSeat } from "@/components/lobbies/LobbySeatGrid";
import LobbyStageViewport from "@/components/lobbies/LobbyStageViewport";
import LobbyTipRail from "@/components/lobbies/LobbyTipRail";
import { getLobbyIdleInteraction, summarizeLobbyIdleInteractions } from "@/lib/lobby/LobbyIdleInteractionEngine";
import LobbyBillboardSurface from "@/components/lobbies/LobbyBillboardSurface";
import { emitLobbyFeedState, type LobbyBillboardStatus } from "@/lib/lobby/LobbyFeedBus";

type LobbyTheaterShellProps = {
  slug: string;
  mode?: "directory" | "room";
};

function slugToChatRoomId(slug: string): ChatRoomId {
  const MAP: Record<string, ChatRoomId> = {
    "monthly-idol": "monthly-idol",
    "monday-night-stage": "monday-night-stage",
    "cypher-drop": "cypher-arena",
    "cypher-arena": "cypher-arena",
  };
  return MAP[slug] ?? "venue-room";
}

function slugToRoomType(slug: string): string {
  if (slug.includes("arena"))    return "arena";
  if (slug.includes("cypher"))   return "cypher";
  if (slug.includes("producer")) return "producer";
  if (slug.includes("battle"))   return "battle";
  if (slug.includes("vip"))      return "vip";
  if (slug.includes("listening") || slug.includes("party")) return "listening";
  if (slug.includes("idol"))     return "gameshow";
  return "lobby";
}

const CHAT_RUNTIME_STATE: RoomRuntimeState = "LIVE_SHOW";

const SEED_CHAT: Omit<RoomChatMessage, "id" | "timestampMs" | "roomId">[] = [
  { userId: "u-host",  displayName: "Kira",        role: "host",      text: "Welcome to the room! 👑" },
  { userId: "u-perf",  displayName: "Nova Cipher",  role: "performer", text: "Let's get it 🔥" },
  { userId: "u-a01",   displayName: "fan_42",       role: "audience",  text: "That bar was cold 🎤" },
  { userId: "u-a02",   displayName: "fan_88",       role: "audience",  text: "W performer no cap" },
  { userId: "u-spon",  displayName: "BeatCo",       role: "sponsor",   text: "Powered by BeatCo 🎧" },
  { userId: "u-judge", displayName: "Judge_1",      role: "judge",     text: "Flow rating: 9.2 / 10" },
  { userId: "u-a03",   displayName: "fan_99",       role: "audience",  text: "goated fr" },
  { userId: "u-sys",   displayName: "System",       role: "system",    text: "🔴 LIVE — Round 2 starting" },
];

const VIEWER_ID = "fan-demo-001";
const VIEWER_NAME = "MC Charlie";

function mapSeatState(seat: LobbySeat): TheaterSeat["visualState"] {
  if (seat.state === "reserved" && seat.occupantName?.toLowerCase().includes("host")) return "host";
  if (seat.state === "bot-held") return "speaker";
  if (seat.state === "reserved") return "reserved";
  if (seat.zone === "vip" && seat.state === "empty") return "vip";
  if (seat.state === "occupied") return "occupied";
  return "open";
}

function mapQueueState(slot: QueueSlot): LobbyQueueEntry["state"] {
  if (slot.status === "done") return "complete";
  if (slot.status === "on-stage") return "live";
  if (slot.status === "next-up" || slot.status === "staging") return "onDeck";
  return "waiting";
}

export default function LobbyTheaterShell({ slug, mode = "room" }: LobbyTheaterShellProps) {
  const [seatMap, setSeatMap] = useState<LobbySeatMap>(() => createSeatMap(slug));
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [presence, setPresence] = useState(() => createInitialPresence());
  const [reactionCount, setReactionCount] = useState(0);
  const [tipTotal, setTipTotal] = useState(0);
  const [queueVersion, setQueueVersion] = useState(0);
  const [idleBeat, setIdleBeat] = useState(0);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const chatEngine = useMemo(() => new RoomChatEngine(slugToChatRoomId(slug), CHAT_RUNTIME_STATE), [slug]);
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [overflowOpen, setOverflowOpen] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    SEED_CHAT.forEach(s => {
      try { chatEngine.pushMessage(s); } catch { /* safety blocker */ }
    });
    setChatMessages(chatEngine.getMessages());
  }, [chatEngine]);

  const overflowEntries = useMemo<OverflowRailEntry[]>(() =>
    chatMessages.map(m => ({
      id: m.id, message: m, role: m.role, displayName: m.displayName,
      text: m.text, timestamp: m.timestampMs, isNew: false,
    })), [chatMessages]);

  const historyByUser = useMemo(() =>
    chatMessages.reduce<Record<string, RoomChatMessage[]>>((acc, m) => {
      acc[m.userId] = [...(acc[m.userId] ?? []), m]; return acc;
    }, {}), [chatMessages]);

  const handleChatSubmit = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    try {
      chatEngine.pushMessage({ userId: "viewer-local", displayName: "You", role: "audience", text });
      setChatMessages(chatEngine.getMessages());
    } catch { /* safety blocker */ }
    setChatInput("");
    chatInputRef.current?.focus();
  }, [chatEngine, chatInput]);

  useEffect(() => {
    setSeatMap(createSeatMap(slug));
    setSelectedSeatId(null);
  }, [slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPresence((prev) => startCountdown(prev));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdleBeat((prev) => prev + 1);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const snapshot = getQueueSnapshot(slug);
    if (snapshot.count > 0) {
      return;
    }

    joinQueueEngine(slug, "perf-mc-charlie", "MC Charlie", 1);
    joinQueueEngine(slug, "perf-dj-nova", "DJ Nova", 2);
    joinQueueEngine(slug, "perf-crown-rae", "Crown Rae", 3);
    setQueueVersion((prev) => prev + 1);
  }, [slug]);

  const queueSnapshot = useMemo(() => getQueueSnapshot(slug), [slug, queueVersion]);

  const seats = useMemo<TheaterSeat[]>(
    () =>
      seatMap.seats.map((seat) => ({
        id: seat.id,
        row: seat.row,
        index: seat.index,
        occupantName: seat.occupantName,
        visualState: mapSeatState(seat),
      })),
    [seatMap],
  );

  const queueEntries = useMemo<LobbyQueueEntry[]>(
    () =>
      queueSnapshot.slots.map((slot) => ({
        slotId: slot.slotId,
        performerId: slot.performerId,
        performerName: slot.performerName,
        state: mapQueueState(slot),
        readyTimerLabel: slot.status === "next-up" ? "ready now" : undefined,
        failedEntryCount: 0,
      })),
    [queueSnapshot],
  );

  const occupancyCount = useMemo(
    () => seats.filter((seat) => seat.visualState === "occupied" || seat.visualState === "host" || seat.visualState === "speaker").length,
    [seats],
  );
  const occupancyPercent = useMemo(() => Math.round((occupancyCount / Math.max(1, seats.length)) * 100), [occupancyCount, seats.length]);
  const shareCount = Math.round(reactionCount * 0.4);
  const attendanceRetention = Math.max(0, Math.min(100, occupancyPercent));
  const roomHeat = (presence.activeUsers + reactionCount + tipTotal + shareCount + attendanceRetention) / 5;

  const queueDepth = queueEntries.filter((entry) => entry.state !== "complete").length;

  // ── LobbyFeedBus — single-source state for all billboard surfaces ─────────
  const roomName = slug.replace(/-/g, " ").toUpperCase();
  const liveEntry = useMemo(() => queueEntries.find((e) => e.state === "live"), [queueEntries]);
  const activePerformer = useMemo(
    () => liveEntry?.performerName ?? queueEntries.find((e) => e.state === "onDeck")?.performerName ?? "—",
    [liveEntry, queueEntries],
  );
  const lobbyStatus = useMemo<LobbyBillboardStatus>(
    () => (liveEntry ? "LIVE" : presence.countdownSeconds > 0 ? "PRE-SHOW" : "QUEUE OPEN"),
    [liveEntry, presence.countdownSeconds],
  );
  const currentEvent = useMemo(
    () =>
      liveEntry
        ? `${liveEntry.performerName} — LIVE`
        : presence.countdownSeconds > 0
          ? `SHOW IN ${presence.countdownSeconds}s`
          : queueEntries.length > 0
            ? `Next: ${queueEntries[0].performerName}`
            : "PRE-SHOW",
    [liveEntry, presence.countdownSeconds, queueEntries],
  );
  const roomRanking = useMemo(() => Math.max(1, Math.round(roomHeat / 10)), [roomHeat]);

  useEffect(() => {
    emitLobbyFeedState({
      slug,
      title: roomName,
      performer: activePerformer,
      occupancy: occupancyCount,
      occupancyPct: occupancyPercent,
      currentEvent,
      status: lobbyStatus,
      ranking: roomRanking,
      roomType: slugToRoomType(slug),
      heat: roomHeat,
    });
  }, [slug, roomName, activePerformer, occupancyCount, occupancyPercent, currentEvent, lobbyStatus, roomRanking, roomHeat]);

  function claimSeat(seatId: string) {
    setSeatMap((prev) => claimSeatEngine(prev, seatId, VIEWER_NAME));
  }

  function releaseSeat(seatId: string) {
    setSeatMap((prev) => releaseSeatEngine(prev, seatId));
  }

  function joinQueue(performerId: string, performerName: string) {
    if (!performerId || !performerName) return;
    joinQueueEngine(slug, performerId, performerName, 5);
    setQueueVersion((prev) => prev + 1);
  }

  function leaveQueue(performerId: string) {
    if (!performerId) return;
    removeFromQueue(slug, performerId);
    setQueueVersion((prev) => prev + 1);
  }

  function nextPerformer() {
    advanceQueue(slug);
    setQueueVersion((prev) => prev + 1);
  }

  function hostOverride() {
    advanceQueue(slug);
    setQueueVersion((prev) => prev + 1);
  }

  function failedEntry(performerId: string) {
    removeFromQueue(slug, performerId);
    setQueueVersion((prev) => prev + 1);
  }

  function sendReaction(type: LobbyReactionType) {
    const mappedType =
      type === "mic" ? "heart" : type === "crown" ? "star" : type === "shock" ? "fire" : type;
    setPresence((prev) => sendReactionEngine(prev, mappedType));
    setReactionCount((prev) => prev + 1);
  }

  function sendTip(amount: number) {
    setPresence((prev) => sendTipEngine(prev, amount));
    setTipTotal((prev) => prev + amount);
  }

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId) ?? null;
  const selectedSeatInteraction = selectedSeat ? getLobbyIdleInteraction(selectedSeat, idleBeat) : null;
  const idleSummary = useMemo(() => summarizeLobbyIdleInteractions(seats, idleBeat), [idleBeat, seats]);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080410, #201237 50%, #090512)", padding: 20 }}>
      <header style={{ maxWidth: 1360, margin: "0 auto 14px", color: "#f1e8ff" }}>
        <div style={{ fontSize: 11, color: "#9f7dd6", letterSpacing: 2, textTransform: "uppercase" }}>V2 Lobby Theater Canon</div>
        <h1 style={{ margin: "6px 0 8px", fontSize: 31 }}>Lobby Theater Shell</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/lobbies" style={{ color: "#b8e9ff", textDecoration: "underline", fontSize: 12 }}>Lobby Directory</Link>
          {mode === "room" ? <span style={{ color: "#dbcdf2", fontSize: 12 }}>Room: {roomName}</span> : null}
          <span style={{ color: "#dbcdf2", fontSize: 12 }}>Viewer: {VIEWER_ID}</span>
        </div>
        {/* Billboard: entrance — mirrors live state across full header width */}
        <div style={{ marginTop: 8 }}>
          <LobbyBillboardSurface variant="entrance" slug={slug} />
        </div>
      </header>

      <div style={{ maxWidth: 1360, margin: "0 auto", display: "grid", gap: 12 }}>
        {/* Billboard: hanging screen — strip above stage viewport */}
        <LobbyBillboardSurface variant="hanging" slug={slug} />

        {/* Stage + chat bubble overlay */}
        <div style={{ position: "relative" }}>
          <LobbyStageViewport
            roomName={roomName}
            countdownSeconds={presence.countdownSeconds}
            activeUsers={presence.activeUsers}
            vipUsers={presence.vipUsers}
            queueDepth={queueDepth}
            occupancyPercent={occupancyPercent}
          />
          <RoomChatBubbleLayer messages={chatMessages} state={CHAT_RUNTIME_STATE} viewerDistance="mid" seed={7} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 0.9fr) minmax(420px, 1.4fr) minmax(300px, 0.9fr)", gap: 12, alignItems: "start" }}>
          {/* Left column: wall monitor billboard above queue rail */}
          <div style={{ display: "grid", gap: 12 }}>
            <LobbyBillboardSurface variant="wall" slug={slug} />
            <LobbyQueueRail
              entries={queueEntries}
              onJoinQueue={joinQueue}
              onLeaveQueue={leaveQueue}
              onNextPerformer={nextPerformer}
              onHostOverride={hostOverride}
              onFailedEntry={failedEntry}
              showAdminControls
            />
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <LobbySeatGrid seats={seats} selectedSeatId={selectedSeatId} onSelectSeat={setSelectedSeatId} />
            <section style={{ borderRadius: 14, border: "1px solid #624590", background: "#160d25", padding: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#9f7dd6", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2 }}>Selected Seat</div>
                <div style={{ color: "#f1e8ff", fontSize: 18, fontWeight: 800, marginTop: 4 }}>{selectedSeat?.id ?? "None"}</div>
                <div style={{ color: "#cdb9eb", fontSize: 12, marginTop: 2 }}>{selectedSeat?.occupantName ?? "Choose a seat to claim or release."}</div>
                <div style={{ color: "#8ef3d7", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 8 }}>
                  {selectedSeatInteraction ? `${selectedSeatInteraction.emoji} ${selectedSeatInteraction.label}` : idleSummary.headline}
                </div>
                <div style={{ color: "#a7f3d0", fontSize: 11, marginTop: 2 }}>
                  {selectedSeatInteraction ? selectedSeatInteraction.detail : idleSummary.detail}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => (selectedSeatId ? claimSeat(selectedSeatId) : undefined)}
                  disabled={!selectedSeatId || selectedSeat?.visualState !== "open"}
                  style={{ borderRadius: 10, border: "1px solid #74c8ff", background: "#173b59", color: "#d7efff", padding: "8px 12px", cursor: !selectedSeatId || selectedSeat?.visualState !== "open" ? "not-allowed" : "pointer", opacity: !selectedSeatId || selectedSeat?.visualState !== "open" ? 0.45 : 1 }}
                >
                  Claim Seat
                </button>
                <button
                  onClick={() => (selectedSeatId ? releaseSeat(selectedSeatId) : undefined)}
                  disabled={!selectedSeatId || selectedSeat?.visualState === "open" || selectedSeat?.visualState === "host"}
                  style={{ borderRadius: 10, border: "1px solid #b9839f", background: "#4d2034", color: "#ffd8e6", padding: "8px 12px", cursor: !selectedSeatId || selectedSeat?.visualState === "open" || selectedSeat?.visualState === "host" ? "not-allowed" : "pointer", opacity: !selectedSeatId || selectedSeat?.visualState === "open" || selectedSeat?.visualState === "host" ? 0.45 : 1 }}
                >
                  Release Seat
                </button>
              </div>
            </section>
            <LobbyPreviewBillboard
              roomHeat={roomHeat}
              occupancyPercent={occupancyPercent}
              queueDepth={queueDepth}
              reactionCount={reactionCount}
              tipTotal={tipTotal}
            />
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {/* Billboard: side — compact right-column panel */}
            <LobbyBillboardSurface variant="side" slug={slug} />
            <LobbyTipRail onSendTip={sendTip} tipTotal={tipTotal} />
            <LobbyReactionRail onSendReaction={sendReaction} reactionCount={reactionCount} />
            <PerformerFeedbackPanel messages={chatMessages} state={CHAT_RUNTIME_STATE} />
            <ModeratorShield incoming={chatMessages.slice(-20)} historyByUser={historyByUser} />
          </div>
        </div>

        {/* Overflow rail */}
        <CrowdChatOverflowPanel
          entries={overflowEntries}
          unreadCount={0}
          isOpen={overflowOpen}
          onToggle={() => setOverflowOpen(v => !v)}
          density={chatMessages.length}
        />

        {/* Chat input */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            ref={chatInputRef}
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); } }}
            placeholder="Say something..."
            maxLength={240}
            style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#f1e8ff", fontSize: 13, outline: "none" }}
          />
          <button
            type="button"
            onClick={handleChatSubmit}
            style={{ padding: "10px 20px", background: "rgba(159,125,214,0.18)", border: "1px solid #9f7dd6", borderRadius: 10, color: "#c9b6f0", fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", cursor: "pointer" }}
          >
            SEND
          </button>
        </div>
      </div>
    </main>
  );
}
