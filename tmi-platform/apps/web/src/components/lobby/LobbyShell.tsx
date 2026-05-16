"use client";

import { useEffect, useMemo, useState } from "react";
import BubbleQueueHUD from "@/components/admin/mc/BubbleQueueHUD";
import LiveBubbleFeed from "@/components/live/LiveBubbleFeed";
import LiveViewerHud from "@/components/live/LiveViewerHud";
import LobbyChatRail from "@/components/lobby/LobbyChatRail";
import LobbyCountdownRail from "@/components/lobby/LobbyCountdownRail";
import LobbyPresenceRail from "@/components/lobby/LobbyPresenceRail";
import LobbyReactionRail from "@/components/lobby/LobbyReactionRail";
import LobbyScreen from "@/components/lobby/LobbyScreen";
import LobbySeatGrid from "@/components/lobby/LobbySeatGrid";
import LobbySeatSelector from "@/components/lobby/LobbySeatSelector";
import LobbyTipRail from "@/components/lobby/LobbyTipRail";
import { getReactionWeight, type ReactionType } from "@/components/live/ReactionEngine";
import {
  claimSeat,
  createSeatMap,
  releaseSeat,
  switchSeat,
  type LobbySeatMap,
} from "@/lib/lobby/lobbySeatEngine";
import {
  createInitialPresence,
  sendReaction,
  sendTip,
  startCountdown,
} from "@/lib/lobby/lobbyPresenceEngine";
import { enqueueBubble, pruneExpiredBubbles, type BubbleMessage } from "@/lib/live/bubbleQueueEngine";

type LobbyShellProps = {
  slug: string;
};

export default function LobbyShell({ slug }: LobbyShellProps) {
  const [map, setMap] = useState<LobbySeatMap>(() => createSeatMap(slug));
  const [presence, setPresence] = useState(() => createInitialPresence());
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState<BubbleMessage[]>([]);
  const [safetyBlocks, setSafetyBlocks] = useState<string[]>([]);

  const roomName = useMemo(() => slug.replace(/-/g, " ").toUpperCase(), [slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBubbles((prev) => pruneExpiredBubbles(prev));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    if (!selectedSeatId) return;
    setMap((prev) => claimSeat(prev, selectedSeatId, "MC Charlie"));
  };

  const handleRelease = () => {
    if (!selectedSeatId) return;
    setMap((prev) => releaseSeat(prev, selectedSeatId));
  };

  const handleSwitch = () => {
    const occupied = map.seats.find((seat) => seat.state === "occupied" && seat.occupantName === "MC Charlie");
    if (!occupied || !selectedSeatId) return;
    setMap((prev) => switchSeat(prev, occupied.id, selectedSeatId));
  };

  const pushBubble = (text: string, type: BubbleMessage["type"]) => {
    setBubbles((prev) => enqueueBubble(prev, { text, type }));
  };

  const handleReaction = (type: ReactionType) => {
    setPresence((prev) => sendReaction(prev, type));
    pushBubble(`Reaction ${type} +${getReactionWeight(type)}`, type === "fire" ? "fire" : "praise");
  };

  const handleTip = (amount: number) => {
    setPresence((prev) => sendTip(prev, amount));
    pushBubble(`Tip received: $${amount}`, "tip");
  };

  const handlePost = (message: string) => {
    setChatLog((prev) => [message, ...prev].slice(0, 8));
    pushBubble(`Chat: ${message}`, "praise");
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ source: string; reason: string }>).detail;
      if (!detail || detail.source !== "lobby:chat-shell") return;
      setSafetyBlocks((prev) => [`${detail.reason}`, ...prev].slice(0, 4));
    };

    window.addEventListener("tmi:safety-violation", handler as EventListener);
    return () => window.removeEventListener("tmi:safety-violation", handler as EventListener);
  }, []);

  const handleTick = () => {
    setPresence((prev) => startCountdown(prev));
  };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0c0813, #201338 48%, #0b0813)", padding: 20 }}>
      <header style={{ maxWidth: 1300, margin: "0 auto 16px", color: "#f0e5ff" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#9e7ed0" }}>Phase C3</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 30 }}>Lobby Shell: {roomName}</h1>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14, maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <LobbyScreen roomName={roomName} headline="Show starts soon. Claim your seat now." />
          <LobbySeatGrid seats={map.seats} selectedSeatId={selectedSeatId} onSelectSeat={setSelectedSeatId} />
          <LobbySeatSelector
            selectedSeatId={selectedSeatId}
            onClaim={handleClaim}
            onRelease={handleRelease}
            onSwitch={handleSwitch}
          />
          <LiveViewerHud onReaction={handleReaction} onTip={handleTip} />
          <LiveBubbleFeed bubbles={bubbles} />
        </div>

        <aside style={{ display: "grid", gap: 10 }}>
          <LobbyPresenceRail presence={presence} />
          <LobbyCountdownRail countdownSeconds={presence.countdownSeconds} onStartTick={handleTick} />
          <LobbyReactionRail onReaction={handleReaction} />
          <LobbyTipRail onTip={handleTip} />
          <LobbyChatRail onPost={handlePost} sourceId="lobby:chat-shell" />
          {safetyBlocks.length > 0 ? (
            <section style={{ borderRadius: 14, border: "1px solid #7f1d1d", background: "#2a0e14", padding: 14 }}>
              <h3 style={{ color: "#fecaca", marginTop: 0, marginBottom: 8 }}>Teen Safety Blocks</h3>
              <div style={{ display: "grid", gap: 6 }}>
                {safetyBlocks.map((entry, index) => (
                  <div key={`${entry}-${index}`} style={{ borderRadius: 8, border: "1px solid #b91c1c", color: "#fecaca", background: "#3f0f16", padding: "6px 8px", fontSize: 12 }}>
                    {entry}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
            <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Recent Chat</h3>
            <div style={{ display: "grid", gap: 6 }}>
              {chatLog.length === 0 ? <div style={{ color: "#9d87bf", fontSize: 12 }}>No chat yet.</div> : null}
              {chatLog.map((entry, index) => (
                <div key={`${entry}-${index}`} style={{ borderRadius: 8, border: "1px solid #66488f", color: "#d9cbef", background: "#120a1d", padding: "6px 8px", fontSize: 12 }}>
                  {entry}
                </div>
              ))}
            </div>
          </section>
          <BubbleQueueHUD bubbles={bubbles} />
        </aside>
      </div>
    </main>
  );
}
