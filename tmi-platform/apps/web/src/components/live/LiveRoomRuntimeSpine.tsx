"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RoomChatEngine, type ChatRoomId, type RoomChatMessage } from "@/lib/chat/RoomChatEngine";
import { joinRoom, listRoomMembers } from "@/lib/rooms/RoomJoinEngine";
import { assignSeat } from "@/lib/rooms/SeatAssignmentEngine";
import { getRoomPresence } from "@/lib/rooms/RoomPresenceEngine";
import { getRoomPopulation, tickPopulation } from "@/lib/rooms/RoomPopulationEngine";
import { applyIntentToRoom, getIntentSummary, pushIntentEvent } from "@/lib/rooms/CrowdIntentEngine";
import { enqueueLobbyUser, getLobbyQueue } from "@/lib/lobby/LobbyQueueRuntime";
import { getLobbyPreviewRuntime } from "@/lib/lobby/LobbyPreviewRuntime";
import { getRoomTipTotal, listTipsByRoom, sendLiveTip } from "@/lib/live/LiveTipEngine";
import LobbyStageViewport from "@/components/lobbies/LobbyStageViewport";
import { startGhostForceV1 } from "@/lib/bots/BotDripEmitter";
import { runSentinelCheck } from "@/lib/sentinels/ShadowSentinelDiagnosticRegistry";
import JuliusMascot from "@/components/mascot/JuliusMascot";
import { useJulius } from "@/hooks/useJulius";

const BOT_NAMES = ["Jay", "Nova", "Rico", "Luna", "Ace", "Kreach", "Zuri", "Dex"];
const BOT_MESSAGES = [
  "🔥 that beat is crazy",
  "who next?",
  "yo run that back",
  "crowd going crazy rn",
  "let's goooo",
  "bars on bars 🎤",
  "drop it already",
  "this is the one fr",
  "aye that's hard",
  "not ready for this level 😤",
  "🎵 vibes immaculate",
  "need that in my playlist",
];

const TIP_CROWD_REACTIONS = [
  "YOOO 🔥🔥 they really tipped",
  "that tip tho 💸 keep going",
  "crowd showing love 💰",
  "FIYAAA 🎤 tipped and everything",
  "ok they went in fr 🔥🔥",
];

const SCARCITY_ROOM_CAPACITY = 12;
const PULL_FORCE_CONFIG = {
  waveTriggerThreshold: 8,
  waveResetThreshold: 5,
  waveDurationMs: 1500,
  tickerMsBase: 2000,
  tickerMsWarm: 1500,
  tickerMsHot: 1200,
  tickerMsWave: 1000,
  tickerMsMomentum: 1300,
  postWaveNudgeMs: 6000,
  momentumTriggerWindowMs: 8000,
  momentumWindowMinMs: 15000,
  momentumWindowMaxMs: 20000,
  momentumCooldownMs: 4000,
  momentumBotReactionsMin: 1,
  momentumBotReactionsMax: 2,
} as const;

const PERFORMER_META: Record<string, { performerName: string; countryFlag: string; membershipTier: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'STANDARD' }> = {
  "monthly-idol": { performerName: "JAY PAUL", countryFlag: "🇺🇸", membershipTier: "DIAMOND" },
  "monday-night-stage": { performerName: "NOVA REED", countryFlag: "🇬🇧", membershipTier: "PLATINUM" },
  "deal-or-feud": { performerName: "RIO SPARK", countryFlag: "🇧🇷", membershipTier: "GOLD" },
  "name-that-tune": { performerName: "AKI WAVE", countryFlag: "🇯🇵", membershipTier: "PLATINUM" },
  "circle-squares": { performerName: "LUNA VEX", countryFlag: "🇨🇦", membershipTier: "GOLD" },
  "cypher-arena": { performerName: "ACE KROWN", countryFlag: "🇺🇸", membershipTier: "DIAMOND" },
  "venue-room": { performerName: "LIVE PERFORMER", countryFlag: "🌐", membershipTier: "STANDARD" },
};

function randomBot() { return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]!; }
function randomMsg() { return BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)]!; }
function readableName(rawId: string): string {
  if (!rawId.startsWith("viewer-")) return rawId;
  return BOT_NAMES[rawId.charCodeAt(rawId.length - 1) % BOT_NAMES.length]!;
}

const CHAT_ROOM_MAP: Record<string, ChatRoomId> = {
  "monthly-idol": "monthly-idol",
  "monday-night-stage": "monday-night-stage",
  "deal-or-feud": "deal-or-feud",
  "name-that-tune": "name-that-tune",
  "circle-squares": "circle-squares",
  "cypher-arena": "cypher-arena",
  "venue-room": "venue-room",
};

function toChatRoomId(raw: string): ChatRoomId {
  return CHAT_ROOM_MAP[raw] ?? "venue-room";
}

function getViewerId(roomId: string): string {
  if (typeof window === "undefined") return `viewer-${roomId}`;
  const key = `tmi.viewer.${roomId}`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = `viewer-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

export default function LiveRoomRuntimeSpine({
  roomId,
  onHype,
  onTip,
  onMessage,
}: Readonly<{
  roomId: string;
  onHype?: () => void;
  onTip?: () => void;
  onMessage?: (msg: string) => void;
}>) {
  const normalizedRoomId = toChatRoomId(roomId);
  const viewerIdRef = useRef<string>("guest-viewer");
  const [seat, setSeat] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [presence, setPresence] = useState(() => getRoomPresence(normalizedRoomId));
  const [members, setMembers] = useState(() => listRoomMembers(normalizedRoomId));
  const [queueCount, setQueueCount] = useState(() => getLobbyQueue(normalizedRoomId).length);
  const [tipTotalCents, setTipTotalCents] = useState(() => getRoomTipTotal(normalizedRoomId));
  const [tipsCount, setTipsCount] = useState(() => listTipsByRoom(normalizedRoomId, 20).length);
  const [intentSummary, setIntentSummary] = useState(() => getIntentSummary(normalizedRoomId, Date.now()));
  const [population, setPopulation] = useState(() => getRoomPopulation(normalizedRoomId));
  const [tipFlash, setTipFlash] = useState(false);
  const [hypeFlash, setHypeFlash] = useState(false);
  const [heatPulseId, setHeatPulseId] = useState(0);
  const [tipWavePulseId, setTipWavePulseId] = useState(0);
  const [tipWaveActive, setTipWaveActive] = useState(false);
  const [momentumWindowActive, setMomentumWindowActive] = useState(false);
  const [momentumPulseId, setMomentumPulseId] = useState(0);
  const [postWaveNudgeActive, setPostWaveNudgeActive] = useState(false);
  const [tippingNow, setTippingNow] = useState(1);
  const [perceivedOccupied, setPerceivedOccupied] = useState(0);
  const [seatPressurePulse, setSeatPressurePulse] = useState(false);
  const [tipHistory, setTipHistory] = useState<{ name: string; amount: number }[]>([
    { name: "Jay", amount: 1 },
    { name: "Nova", amount: 2 },
    { name: "Ace", amount: 1 },
  ]);
  const [tipTickerIdx, setTipTickerIdx] = useState(0);
  const [topTippers, setTopTippers] = useState<{ name: string; count: number }[]>([
    { name: "Jay", count: 3 },
    { name: "Nova", count: 2 },
    { name: "Ace", count: 1 },
  ]);
  const [userTipCount, setUserTipCount] = useState(0);
  const [sentinelState, setSentinelState] = useState<{ label: string; color: string }>({
    label: "🟢 Systems Nominal",
    color: "rgba(0,255,136,0.7)",
  });
  const tipWaveArmedRef = useRef(true);
  const momentumCooldownRef = useRef(false);
  const { juliusState, triggerJulius, dismissJulius } = useJulius();
  const recentTipTimesRef = useRef<number[]>([]);
  const recentHypeTimesRef = useRef<number[]>([]);
  const momentumTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const chatEngine = useMemo(() => new RoomChatEngine(normalizedRoomId, "LIVE_SHOW"), [normalizedRoomId]);

  useEffect(() => {
    const viewerId = getViewerId(normalizedRoomId);
    viewerIdRef.current = viewerId;

    joinRoom(normalizedRoomId, viewerId);
    const nextSeat = assignSeat(normalizedRoomId, viewerId);
    setSeat(nextSeat ?? null);
    enqueueLobbyUser(normalizedRoomId, viewerId);

    setPresence(getRoomPresence(normalizedRoomId));
    setMembers(listRoomMembers(normalizedRoomId));
    setQueueCount(getLobbyQueue(normalizedRoomId).length);
    setPopulation(getRoomPopulation(normalizedRoomId));
  }, [normalizedRoomId]);

  // Seed 4 bot messages immediately on entry so the room never feels empty
  useEffect(() => {
    const delays = [120, 420, 780, 1200];
    const timers = delays.map((ms) =>
      setTimeout(() => {
        try {
          chatEngine.pushMessage({
            userId: `bot-${randomBot()}`,
            displayName: randomBot(),
            role: "audience",
            text: randomMsg(),
          });
          setMessages(chatEngine.getMessages(40));
        } catch { /* safety filter */ }
      }, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [chatEngine]);

  // Light activity loop — every 2.5–4s adds chat or bumps heat
  useEffect(() => {
    function tick() {
      const action = Math.random();
      if (action < 0.65) {
        try {
          chatEngine.pushMessage({
            userId: `bot-${randomBot()}`,
            displayName: randomBot(),
            role: "audience",
            text: randomMsg(),
          });
          setMessages(chatEngine.getMessages(40));
        } catch { /* safety filter */ }
      } else {
        pushIntentEvent(normalizedRoomId, `bot-${randomBot()}`, "hype", 55, Date.now());
        applyIntentToRoom(normalizedRoomId, "hype", 55);
        tickPopulation(normalizedRoomId);
        setIntentSummary(getIntentSummary(normalizedRoomId, Date.now()));
        setPopulation(getRoomPopulation(normalizedRoomId));
        if (Math.random() < 0.3) {
          const botName = randomBot();
          const amt = Math.random() < 0.7 ? 1 : 2;
          setTipHistory((prev) => [...prev.slice(-4), { name: botName, amount: amt }]);
          setTopTippers((prev) => {
            const idx = prev.findIndex((t) => t.name === botName);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { name: botName, count: updated[idx]!.count + 1 };
              return updated.sort((a, b) => b.count - a.count).slice(0, 3);
            }
            return [...prev, { name: botName, count: 1 }].sort((a, b) => b.count - a.count).slice(0, 3);
          });
        }
      }
    }

    const id = setInterval(tick, 2500 + Math.random() * 1500);
    return () => clearInterval(id);
  }, [chatEngine, normalizedRoomId]);

  useEffect(() => {
    setPerceivedOccupied((prev) => Math.max(prev, members.length));
  }, [members.length]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tickFill = () => {
      const delayMs = Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;
      timer = setTimeout(() => {
        if (!active) return;
        setPerceivedOccupied((prev) => {
          const next = Math.min(SCARCITY_ROOM_CAPACITY, Math.max(prev, members.length) + 1);
          if (next > prev) {
            setSeatPressurePulse(true);
            setTimeout(() => setSeatPressurePulse(false), 700);
          }
          return next;
        });
        tickFill();
      }, delayMs);
    };

    tickFill();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [members.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setTippingNow((prev) => Math.max(1, prev - 1));
    }, 9000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const speedMs = tipWaveActive
      ? PULL_FORCE_CONFIG.tickerMsWave
      : momentumWindowActive
        ? PULL_FORCE_CONFIG.tickerMsMomentum
      : tippingNow >= PULL_FORCE_CONFIG.waveTriggerThreshold
        ? PULL_FORCE_CONFIG.tickerMsHot
        : tippingNow >= 5
          ? PULL_FORCE_CONFIG.tickerMsWarm
          : PULL_FORCE_CONFIG.tickerMsBase;
    const id = setInterval(() => {
      setTipTickerIdx((prev) => prev + 1);
    }, speedMs);
    return () => clearInterval(id);
  }, [tippingNow, tipWaveActive, momentumWindowActive]);

  useEffect(() => {
    return () => {
      momentumTimersRef.current.forEach(clearTimeout);
      momentumTimersRef.current = [];
    };
  }, []);

  function activateMomentumWindow(): void {
    if (momentumCooldownRef.current || momentumWindowActive) return;
    momentumCooldownRef.current = true;
    setMomentumWindowActive(true);
    setMomentumPulseId((n) => n + 1);

    const reactionsCount =
      PULL_FORCE_CONFIG.momentumBotReactionsMin +
      Math.floor(
        Math.random() *
          (PULL_FORCE_CONFIG.momentumBotReactionsMax - PULL_FORCE_CONFIG.momentumBotReactionsMin + 1)
      );

    for (let i = 0; i < reactionsCount; i += 1) {
      const reactionDelay = 1200 + Math.floor(Math.random() * 4200);
      const reactionTimer = setTimeout(() => {
        try {
          const botName = randomBot();
          chatEngine.pushMessage({
            userId: `bot-${botName}`,
            displayName: botName,
            role: "audience",
            text: i % 2 === 0 ? "momentum rising ⚡ keep it moving" : "crowd still climbing 🔥",
          });
          setMessages(chatEngine.getMessages(40));
        } catch {
          // safety filter
        }
      }, reactionDelay);
      momentumTimersRef.current.push(reactionTimer);
    }

    const durationMs =
      PULL_FORCE_CONFIG.momentumWindowMinMs +
      Math.floor(
        Math.random() *
          (PULL_FORCE_CONFIG.momentumWindowMaxMs - PULL_FORCE_CONFIG.momentumWindowMinMs + 1)
      );

    const endTimer = setTimeout(() => {
      setMomentumWindowActive(false);
      const cooldownTimer = setTimeout(() => {
        momentumCooldownRef.current = false;
      }, PULL_FORCE_CONFIG.momentumCooldownMs);
      momentumTimersRef.current.push(cooldownTimer);
    }, durationMs);
    momentumTimersRef.current.push(endTimer);
  }

  function registerMomentumSignal(kind: "tip" | "hype"): void {
    const now = Date.now();
    const cutoff = now - PULL_FORCE_CONFIG.momentumTriggerWindowMs;

    if (kind === "tip") {
      recentTipTimesRef.current = [...recentTipTimesRef.current.filter((t) => t >= cutoff), now];
      recentHypeTimesRef.current = recentHypeTimesRef.current.filter((t) => t >= cutoff);
    } else {
      recentHypeTimesRef.current = [...recentHypeTimesRef.current.filter((t) => t >= cutoff), now];
      recentTipTimesRef.current = recentTipTimesRef.current.filter((t) => t >= cutoff);
    }

    const tipsInWindow = recentTipTimesRef.current.length;
    const hasTipAndHype = recentTipTimesRef.current.length >= 1 && recentHypeTimesRef.current.length >= 1;

    if (tipsInWindow >= 3 || hasTipAndHype) {
      activateMomentumWindow();
    }
  }

  useEffect(() => {
    let waveTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let nudgeTimeoutId: ReturnType<typeof setTimeout> | null = null;

    if (tippingNow >= PULL_FORCE_CONFIG.waveTriggerThreshold && tipWaveArmedRef.current) {
      tipWaveArmedRef.current = false;
      setTipWaveActive(true);
      setPostWaveNudgeActive(false);
      setTipWavePulseId((n) => n + 1);
      waveTimeoutId = setTimeout(() => {
        setTipWaveActive(false);
        setPostWaveNudgeActive(true);
        nudgeTimeoutId = setTimeout(() => setPostWaveNudgeActive(false), PULL_FORCE_CONFIG.postWaveNudgeMs);
      }, PULL_FORCE_CONFIG.waveDurationMs);
    }
    if (tippingNow <= PULL_FORCE_CONFIG.waveResetThreshold) {
      tipWaveArmedRef.current = true;
    }

    return () => {
      if (waveTimeoutId) clearTimeout(waveTimeoutId);
      if (nudgeTimeoutId) clearTimeout(nudgeTimeoutId);
    };
  }, [tippingNow]);

  // Ghost Force V1 — drip-feed confidence bots, max 3 per room
  useEffect(() => {
    const stop = startGhostForceV1(normalizedRoomId, {
      onChat: (botName, text) => {
        try {
          chatEngine.pushMessage({
            userId: `ghost-${botName.toLowerCase()}`,
            displayName: botName,
            role: "audience",
            text,
          });
          setMessages(chatEngine.getMessages(40));
        } catch { /* safety filter */ }
      },
      onHype: (botName) => {
        pushIntentEvent(normalizedRoomId, `ghost-${botName.toLowerCase()}`, "hype", 65, Date.now());
        applyIntentToRoom(normalizedRoomId, "hype", 65);
        tickPopulation(normalizedRoomId);
        setPopulation(getRoomPopulation(normalizedRoomId));
      },
      onTip: (botName) => {
        registerMomentumSignal("tip");
        setTipHistory((prev) => [...prev.slice(-4), { name: botName, amount: 1 }]);
        setTopTippers((prev) => {
          const idx = prev.findIndex((t) => t.name === botName);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { name: botName, count: updated[idx]!.count + 1 };
            return updated.sort((a, b) => b.count - a.count).slice(0, 3);
          }
          return [...prev, { name: botName, count: 1 }].sort((a, b) => b.count - a.count).slice(0, 3);
        });
        setTippingNow((prev) => Math.min(14, prev + 1));
      },
      onDiag: (msg) => {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log(msg);
        }
      },
    });
    return stop;
  }, [chatEngine, normalizedRoomId]);

  // Shadow Sentinel — 30s log-only health observer (V1)
  useEffect(() => {
    const id = setInterval(() => {
      const msgs = chatEngine.getMessages(40);
      const lastTs = msgs.length > 0 ? msgs[msgs.length - 1]?.timestampMs ?? null : null;
      const result = runSentinelCheck({
        roomId: normalizedRoomId,
        messageCount: msgs.length,
        lastMessageTs: lastTs,
        tipTotalCents: getRoomTipTotal(normalizedRoomId),
        tipsCount: listTipsByRoom(normalizedRoomId, 20).length,
      });
      // Surface minimal UI indicator
      if (result.visualAuthority === "dead-link" || result.commerceBridge === "broken") {
        setSentinelState({ label: "🔴 Stream Error", color: "rgba(255,51,51,0.8)" });
      } else if (result.chatHealth === "deadlocked" || result.audioSync === "drifting") {
        setSentinelState({ label: "🟡 Audio Sync Issue", color: "rgba(255,215,0,0.8)" });
      } else if (result.chatHealth === "stale") {
        setSentinelState({ label: "⚠️ Chat Stale", color: "rgba(255,179,71,0.8)" });
      } else {
        setSentinelState({ label: "🟢 Systems Nominal", color: "rgba(0,255,136,0.7)" });
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [chatEngine, normalizedRoomId]);

  function refreshSignals(): void {
    setPresence(getRoomPresence(normalizedRoomId));
    setMembers(listRoomMembers(normalizedRoomId));
    setQueueCount(getLobbyQueue(normalizedRoomId).length);
    setTipTotalCents(getRoomTipTotal(normalizedRoomId));
    setTipsCount(listTipsByRoom(normalizedRoomId, 20).length);
    setIntentSummary(getIntentSummary(normalizedRoomId, Date.now()));
    setPopulation(getRoomPopulation(normalizedRoomId));
  }

  function triggerInteract(): void {
    registerMomentumSignal("hype");
    pushIntentEvent(normalizedRoomId, viewerIdRef.current, "hype", 72, Date.now());
    applyIntentToRoom(normalizedRoomId, "hype", 72);
    tickPopulation(normalizedRoomId);
    refreshSignals();
    setHypeFlash(true);
    setHeatPulseId((n) => n + 1);
    setPerceivedOccupied((prev) => {
      const next = Math.min(SCARCITY_ROOM_CAPACITY, Math.max(prev, members.length) + 1);
      if (next > prev) {
        setSeatPressurePulse(true);
        setTimeout(() => setSeatPressurePulse(false), 700);
      }
      return next;
    });
    setTippingNow((prev) => Math.min(14, prev + 1));
    setTimeout(() => setHypeFlash(false), 900);
    onHype?.();
  }

  function triggerTip(): void {
    registerMomentumSignal("tip");
    sendLiveTip({
      roomId: normalizedRoomId,
      fromFanId: viewerIdRef.current,
      fromDisplayName: "You",
      toPerformerId: `performer-${normalizedRoomId}`,
      toDisplayName: "Live Performer",
      amountCents: 100,
      message: "Keep going",
    });
    pushIntentEvent(normalizedRoomId, viewerIdRef.current, "tip", 80, Date.now());
    applyIntentToRoom(normalizedRoomId, "tip", 80);
    tickPopulation(normalizedRoomId);
    refreshSignals();
    // Crowd reacts to the tip in chat
    try {
      chatEngine.pushMessage({
        userId: `bot-${randomBot()}`,
        displayName: randomBot(),
        role: "audience",
        text: TIP_CROWD_REACTIONS[Math.floor(Math.random() * TIP_CROWD_REACTIONS.length)]!,
      });
      setMessages(chatEngine.getMessages(40));
    } catch { /* safety filter */ }
    setTipFlash(true);
    setHeatPulseId((n) => n + 1);
    setPerceivedOccupied((prev) => {
      const next = Math.min(SCARCITY_ROOM_CAPACITY, Math.max(prev, members.length) + 1);
      if (next > prev) {
        setSeatPressurePulse(true);
        setTimeout(() => setSeatPressurePulse(false), 700);
      }
      return next;
    });
    setTippingNow((prev) => Math.min(18, prev + 2));
    setTimeout(() => setTipFlash(false), 2000);
    onTip?.();
    setUserTipCount((n) => n + 1);
    setTipHistory((prev) => [...prev.slice(-4), { name: "You", amount: 1 }]);
    setTopTippers((prev) => {
      const idx = prev.findIndex((t) => t.name === "You");
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { name: "You", count: updated[idx]!.count + 1 };
        return updated.sort((a, b) => b.count - a.count).slice(0, 3);
      }
      return [...prev, { name: "You", count: 1 }].sort((a, b) => b.count - a.count).slice(0, 3);
    });
  }

  function sendChat(): void {
    const text = chatInput.trim();
    if (!text) return;

    try {
      chatEngine.pushMessage({
        userId: viewerIdRef.current,
        displayName: "You",
        role: "audience",
        text,
      });
      setMessages(chatEngine.getMessages(40));
      onMessage?.(text);
      setChatInput("");
      tickPopulation(normalizedRoomId);
      refreshSignals();
    } catch {
      // Ignore blocked messages from safety engines.
    }
  }

  const previewUsers = getLobbyPreviewRuntime([normalizedRoomId])[0]?.users.length ?? 0;
  const performerMeta = PERFORMER_META[normalizedRoomId] ?? PERFORMER_META["venue-room"];
  const fanCount = Math.max(0, members.length + previewUsers);
  const baseStageAccentColor = performerMeta.membershipTier === 'DIAMOND'
    ? '#00FFFF'
    : performerMeta.membershipTier === 'PLATINUM'
      ? '#FFD700'
      : '#FF2DAA';
  const stageAccentColor = tipWaveActive
    ? baseStageAccentColor
    : momentumWindowActive
      ? performerMeta.membershipTier === 'DIAMOND'
        ? '#66FFFF'
        : performerMeta.membershipTier === 'PLATINUM'
          ? '#FFE58A'
          : '#FF66C4'
      : baseStageAccentColor;
  const remainingSeats = Math.max(0, SCARCITY_ROOM_CAPACITY - perceivedOccupied);
  const yourTipRankCount = topTippers.find((entry) => entry.name === "You")?.count ?? userTipCount;
  const thirdPlaceCount = topTippers[2]?.count ?? 1;
  const rawTipsToTop3 = Math.max(0, thirdPlaceCount - yourTipRankCount + 1);
  const tipsToTop3 = rawTipsToTop3 === 0 ? 0 : Math.min(3, Math.max(1, rawTipsToTop3));
  const roomStateLine = remainingSeats === 0
    ? "🔥 MAIN ROOM SOLD OUT"
    : remainingSeats <= 2
      ? `${remainingSeats} seats left`
      : "";

  return (
    <>
      <div style={{ marginTop: 18 }}>
        <LobbyStageViewport
          roomName={roomId}
          performerName={performerMeta.performerName}
          countryFlag={performerMeta.countryFlag}
          membershipTier={performerMeta.membershipTier}
          fanCount={fanCount}
          activeUsers={presence.occupancy}
          vipUsers={Math.max(1, Math.floor(fanCount / 6))}
          occupancyPercent={Math.min(100, Math.round((perceivedOccupied / SCARCITY_ROOM_CAPACITY) * 100))}
          queueDepth={queueCount}
          isLive={members.length > 0}
          reactionPulseId={tipFlash ? heatPulseId : 0}
          hypePulseId={Math.max(hypeFlash ? heatPulseId : 0, tipWavePulseId, momentumPulseId)}
          accentColor={stageAccentColor}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 18 }}>
        <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, padding: "10px 12px" }}>Seat: {seat ?? "pending"}</div>
        <div style={{ border: "1px solid rgba(255,45,170,0.35)", borderRadius: 10, padding: "10px 12px" }}>Occupancy: {presence.occupancy}</div>
        <div style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: "10px 12px" }}>Queue: {queueCount}</div>
        <div style={{ border: "1px solid rgba(170,45,255,0.35)", borderRadius: 10, padding: "10px 12px" }}>Preview Users: {previewUsers}</div>
        <div
          key={heatPulseId}
          style={{
            border: `1px solid ${hypeFlash || tipFlash ? "rgba(0,255,136,0.85)" : "rgba(0,255,136,0.35)"}`,
            borderRadius: 10,
            padding: "10px 12px",
            color: hypeFlash || tipFlash ? "#00FF88" : "inherit",
            textShadow: hypeFlash || tipFlash ? "0 0 14px rgba(0,255,136,0.9)" : "none",
            transition: "border-color 0.2s ease, color 0.2s ease, text-shadow 0.2s ease",
          }}
        >
          Heat: {population.heatLevel}
        </div>
      </div>

      {/* Sentinel status pill */}
      <div style={{
        marginTop: 8,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.35)",
        border: `1px solid ${sentinelState.color}`,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: sentinelState.color,
        textTransform: "uppercase",
      }}>
        {sentinelState.label}
      </div>

      {/* Tip flash banner */}
      {tipFlash && (
        <div style={{
          marginTop: 10,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(255,215,0,0.12)",
          border: "1px solid rgba(255,215,0,0.65)",
          color: "#FFD700",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.04em",
          textShadow: "0 0 18px rgba(255,215,0,0.85)",
          animation: "pulse 0.5s ease",
        }}>
          🔥 Tip $1.00 sent · crowd reacting
        </div>
      )}

      {tipWaveActive && (
        <div style={{
          marginTop: 8,
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgba(255,45,170,0.15)",
          border: "1px solid rgba(255,45,170,0.7)",
          color: "#FF9BDB",
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          textShadow: "0 0 14px rgba(255,45,170,0.7)",
          transform: "scale(1.01)",
        }}>
          🔥 Tip wave activated
        </div>
      )}

      {momentumWindowActive && !tipWaveActive && (
        <div style={{
          marginTop: 8,
          padding: "8px 12px",
          borderRadius: 8,
          background: "rgba(0,255,255,0.13)",
          border: "1px solid rgba(0,255,255,0.55)",
          color: "#B7FFFF",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          ⚡ Momentum window live
        </div>
      )}

      <div style={{
        marginTop: 8,
        padding: "8px 12px",
        borderRadius: 8,
        background: tipWaveActive ? "rgba(255,45,170,0.2)" : momentumWindowActive ? "rgba(255,45,170,0.16)" : "rgba(255,45,170,0.12)",
        border: tipWaveActive ? "1px solid rgba(255,45,170,0.85)" : momentumWindowActive ? "1px solid rgba(255,45,170,0.7)" : "1px solid rgba(255,45,170,0.55)",
        color: tipWaveActive ? "#FFD1F0" : momentumWindowActive ? "#FFC2E8" : "#FF8AD4",
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        boxShadow: tipWaveActive ? "0 0 20px rgba(255,45,170,0.35)" : momentumWindowActive ? "0 0 12px rgba(255,45,170,0.2)" : "none",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
      }}>
        ⚡ {tippingNow} people tipping right now
      </div>

      <div style={{
        marginTop: 6,
        padding: "8px 12px",
        borderRadius: 8,
        background: "rgba(0,255,255,0.1)",
        border: "1px solid rgba(0,255,255,0.42)",
        color: "#A8FFFF",
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: "0.04em",
      }}>
        {userTipCount > 0 ? "You are part of the tipping wave" : "Tip once to enter the tipping wave"}
        {tipsToTop3 > 0 ? ` · +${tipsToTop3} more tip${tipsToTop3 === 1 ? "" : "s"} to break top 3` : " · You are in the top 3"}
      </div>

      {postWaveNudgeActive && userTipCount > 0 && (
        <div style={{
          marginTop: 6,
          padding: "8px 12px",
          borderRadius: 8,
          background: "rgba(255,215,0,0.1)",
          border: "1px solid rgba(255,215,0,0.42)",
          color: "#FFE28B",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          ⚡ Wave cooling · +1 tip keeps momentum
        </div>
      )}

      {/* Persistent tip feed ticker */}
      <div style={{
        marginTop: 8,
        padding: "8px 12px",
        borderRadius: 8,
        background: "rgba(255,215,0,0.07)",
        border: "1px solid rgba(255,215,0,0.28)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 11,
        overflow: "hidden",
      }}>
        <span style={{ color: "rgba(255,255,255,0.38)", textTransform: "uppercase", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
          Recent Tips
        </span>
        <span style={{ fontWeight: 800, color: "rgba(255,215,0,0.9)", letterSpacing: "0.04em" }}>
          💸 {tipHistory[tipTickerIdx % tipHistory.length]?.name ?? "—"} tipped ${tipHistory[tipTickerIdx % tipHistory.length]?.amount ?? 1}
        </span>
      </div>

      {roomStateLine ? (
        <div style={{
          marginTop: 8,
          padding: "9px 12px",
          borderRadius: 8,
          background: "rgba(255,215,0,0.11)",
          border: "1px solid rgba(255,215,0,0.6)",
          color: "#FFD700",
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(255,215,0,0.45)",
          transform: seatPressurePulse ? "scale(1.02)" : "scale(1)",
          transition: "transform 0.2s ease",
        }}>
          {roomStateLine}
        </div>
      ) : null}

      {remainingSeats === 0 ? (
        <div style={{
          marginTop: 6,
          padding: "8px 12px",
          borderRadius: 8,
          background: "rgba(255,179,71,0.12)",
          border: "1px solid rgba(255,179,71,0.55)",
          color: "#FFB347",
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
          ➡ Overflow Stage Open
        </div>
      ) : null}

      {/* Micro leaderboard */}
      {topTippers.length > 0 && (
        <div style={{
          marginTop: 10,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid rgba(170,45,255,0.4)",
          background: "rgba(170,45,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap" }}>
            Top Tippers
          </span>
          {topTippers.slice(0, 3).map((t, i) => (
            <span key={t.name} style={{
              fontSize: 11,
              fontWeight: 800,
              color: i === 0 ? "#FFD700" : i === 1 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.52)",
            }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {t.name} {"🔥".repeat(Math.min(t.count, 5))}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={triggerInteract}
          style={{
            padding: "9px 12px",
            borderRadius: 8,
            border: `1px solid ${hypeFlash ? "rgba(0,255,255,0.9)" : "rgba(0,255,255,0.5)"}`,
            background: hypeFlash ? "rgba(0,255,255,0.28)" : "rgba(0,255,255,0.14)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: hypeFlash ? "0 0 18px rgba(0,255,255,0.55)" : "none",
            transition: "box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease",
          }}
        >
          Hype
        </button>
        <button
          type="button"
          onClick={triggerTip}
          style={{
            padding: "9px 12px",
            borderRadius: 8,
            border: `1px solid ${tipFlash ? "rgba(255,215,0,0.9)" : "rgba(255,215,0,0.55)"}`,
            background: tipFlash ? "rgba(255,215,0,0.28)" : "rgba(255,215,0,0.14)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: tipFlash ? "0 0 18px rgba(255,215,0,0.55)" : "none",
            transition: "box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease",
          }}
        >
          {userTipCount === 0 ? "Tip $1" : "🔥 KEEP IT GOING"}
        </button>
        <Link
          href="/home/3"
          style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)", color: "#fff", textDecoration: "none", fontWeight: 700 }}
        >
          Return Home 3
        </Link>
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => triggerJulius("poll", { pollPrompt: "Who takes this round?" })}
          style={{
            padding: "7px 10px",
            borderRadius: 8,
            border: "1px solid rgba(0,255,255,0.5)",
            background: "rgba(0,255,255,0.12)",
            color: "#BFFFFF",
            fontWeight: 700,
            fontSize: 11,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Julius Poll
        </button>
        <button
          type="button"
          onClick={() => triggerJulius("celebrate")}
          style={{
            padding: "7px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,215,0,0.5)",
            background: "rgba(255,215,0,0.12)",
            color: "#FFE28B",
            fontWeight: 700,
            fontSize: 11,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Julius Celebrate
        </button>
        <button
          type="button"
          onClick={() => triggerJulius("nudge", { nudgeText: "wave cooling — keep it alive" })}
          style={{
            padding: "7px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,45,170,0.5)",
            background: "rgba(255,45,170,0.12)",
            color: "#FFB8E6",
            fontWeight: 700,
            fontSize: 11,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Julius Nudge
        </button>
      </div>

      <div style={{ marginTop: 12, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 700 }}>
          <span>Chat Activity</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Intent: {intentSummary.dominantIntent}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Say something to trigger room activity"
            style={{ flex: 1, minWidth: 220, borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)", color: "#fff", padding: "9px 10px" }}
          />
          <button
            type="button"
            onClick={sendChat}
            style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,45,170,0.5)", background: "rgba(255,45,170,0.14)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Send
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
          Messages: {messages.length} | Tips: {tipsCount} (${(tipTotalCents / 100).toFixed(2)})
        </div>
      </div>

      <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Members in Room</div>
        {members.length === 0 ? (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>No members yet.</div>
        ) : (
          members.map((entry) => (
            <div key={`${entry.roomId}-${entry.userId}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.74)", marginBottom: 4 }}>
              {readableName(entry.userId)}
            </div>
          ))
        )}
      </div>

      {/* Julius mascot — fixed bottom-right, manual poll / celebrate / nudge triggers only */}
      <JuliusMascot
        mode={juliusState.mode}
        visible={juliusState.visible}
        pollPrompt={juliusState.pollPrompt}
        nudgeText={juliusState.nudgeText}
        onDismiss={dismissJulius}
      />
    </>
  );
}
