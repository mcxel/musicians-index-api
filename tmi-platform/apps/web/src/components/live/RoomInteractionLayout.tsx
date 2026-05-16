"use client";

import { useState } from "react";
import Link from "next/link";
import LiveRoomRuntimeSpine from "./LiveRoomRuntimeSpine";
import PresenceStrip from "./PresenceStrip";
import AutoChat from "./AutoChat";
import EnergyBar from "./EnergyBar";
import LobbyStageViewport from "@/components/lobbies/LobbyStageViewport";
import { recordProfileLoopAction } from "@/lib/profile/ProfileSessionStore";

interface RoomInteractionLayoutProps {
  roomId: string;
  sessionId?: string;
}

export default function RoomInteractionLayout({ roomId, sessionId }: RoomInteractionLayoutProps) {
  const [energy, setEnergy] = useState(50);
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string>("");
  const [balance, setBalance] = useState(10);
  const [tipPulseId, setTipPulseId] = useState(0);
  const [hypePulseId, setHypePulseId] = useState(0);

  function handleUserAction(message: string) {
    setUserMessages((prev) => [...prev, message]);
    setActionFeedback("");
  }

  function handleHype() {
    setEnergy((e) => Math.min(100, e + 10));
    if (sessionId) {
      recordProfileLoopAction(sessionId, { type: 'reaction', value: 1 });
    }
    setHypePulseId((n) => n + 1);
    setActionFeedback("🔥 You hyped up the room!");
    setTimeout(() => setActionFeedback(""), 2000);
  }

  function handleTip() {
    if (balance <= 0) {
      setActionFeedback("💰 Insufficient balance");
      setTimeout(() => setActionFeedback(""), 2000);
      return;
    }
    setBalance((b) => b - 1);
    setEnergy((e) => Math.min(100, e + 8));
    if (sessionId) {
      recordProfileLoopAction(sessionId, { type: 'tip', value: 1 });
    }
    setTipPulseId((n) => n + 1);
    setActionFeedback("💸 You tipped $1");
    setTimeout(() => setActionFeedback(""), 2000);
  }

  return (
    <>
      {/* ── Stage viewport — performer presence layer ── */}
      <div style={{ marginBottom: 16 }}>
        <LobbyStageViewport
          roomName={roomId}
          activeUsers={Math.round(40 + energy * 0.6)}
          occupancyPercent={Math.min(100, Math.round(energy))}
          performerName="Live Performer"
          isLive
          accentColor={energy >= 70 ? "#FF2DAA" : energy >= 40 ? "#FFD700" : "#00FFFF"}
          reactionPulseId={tipPulseId}
          hypePulseId={hypePulseId}
        />
      </div>

      <div style={{ marginBottom: 20, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>
        <PresenceStrip currentUser="You" />
        <EnergyBar energy={energy} />
        <AutoChat userMessages={userMessages} />
        {actionFeedback && (
          <div
            style={{
              padding: "8px 12px",
              fontSize: 12,
              color: "#FF2DAA",
              fontWeight: 600,
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {actionFeedback}
          </div>
        )}
        <div
          style={{
            padding: "8px 12px",
            fontSize: 12,
            color: "rgba(255,215,0,0.9)",
            fontWeight: 600,
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          💰 Balance: ${balance}
        </div>
      </div>

      <LiveRoomRuntimeSpine roomId={roomId} onHype={handleHype} onTip={handleTip} onMessage={handleUserAction} />
    </>
  );
}
