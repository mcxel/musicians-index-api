"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type MessageTier = "FREE_BACK_ROW" | "MID_ROW" | "VIP_FRONT_ROW";

export interface HudMessage {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  tier: MessageTier;
  isTip?: boolean;
  tipAmount?: number;
  hasCam?: boolean;
  timestamp: number;
}

export interface RetinalHudChatProps {
  messages?: HudMessage[];
  maxVisible?: number;
}

const TIER_GLOW: Record<MessageTier, string> = {
  FREE_BACK_ROW: "rgba(255,255,255,0.12)",
  MID_ROW: "rgba(0,255,255,0.35)",
  VIP_FRONT_ROW: "rgba(255,213,0,0.55)",
};

const TIER_BORDER: Record<MessageTier, string> = {
  FREE_BACK_ROW: "rgba(255,255,255,0.08)",
  MID_ROW: "rgba(0,255,255,0.25)",
  VIP_FRONT_ROW: "rgba(255,213,0,0.4)",
};

const TIER_LABEL: Record<MessageTier, string> = {
  FREE_BACK_ROW: "",
  MID_ROW: "",
  VIP_FRONT_ROW: "💎",
};

const DEMO_MESSAGES: HudMessage[] = [
  { id: "d1", userId: "u1", displayName: "Kreach", content: "This beat is 🔥🔥🔥", tier: "VIP_FRONT_ROW", timestamp: Date.now() - 3000 },
  { id: "d2", userId: "u2", displayName: "KGBeats", content: "Lets go! 🙌", tier: "MID_ROW", timestamp: Date.now() - 6000 },
  { id: "d3", userId: "u3", displayName: "SavageGuns", content: "tipped $5 🎤", tier: "VIP_FRONT_ROW", isTip: true, tipAmount: 5, timestamp: Date.now() - 9000 },
  { id: "d4", userId: "u4", displayName: "fan_123", content: "great vibes", tier: "FREE_BACK_ROW", timestamp: Date.now() - 12000 },
];

function initials(name: string) {
  return name.split(" ").map(s => s[0] ?? "").join("").toUpperCase().slice(0, 2);
}

export default function RetinalHudChat({
  messages = DEMO_MESSAGES,
  maxVisible = 4,
}: RetinalHudChatProps) {
  const [visible, setVisible] = useState<HudMessage[]>([]);
  const queueRef = useRef<HudMessage[]>([...messages]);
  const prevLenRef = useRef(messages.length);

  // Append newly arriving messages
  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      const newMsgs = messages.slice(prevLenRef.current);
      queueRef.current = [...queueRef.current, ...newMsgs];
    }
    prevLenRef.current = messages.length;
  }, [messages]);

  // Rolling display — show last `maxVisible`
  useEffect(() => {
    const allMsgs = messages.slice(-maxVisible);
    setVisible(allMsgs);
  }, [messages, maxVisible]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: 240,
        userSelect: "none",
      }}
    >
      <div style={{ fontSize: 8, letterSpacing: "0.18em", fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
        HUD CHAT
      </div>

      <AnimatePresence initial={false}>
        {visible.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: 24, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.92 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              borderRadius: 10,
              border: `1px solid ${TIER_BORDER[msg.tier]}`,
              background: "rgba(4,6,20,0.82)",
              backdropFilter: "blur(8px)",
              boxShadow: `0 0 12px ${TIER_GLOW[msg.tier]}`,
              padding: "7px 10px",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            {/* Avatar / cam preview */}
            <div
              style={{
                width: msg.hasCam ? 28 : 22,
                height: msg.hasCam ? 28 : 22,
                borderRadius: "50%",
                flexShrink: 0,
                background: msg.tier === "VIP_FRONT_ROW"
                  ? "linear-gradient(135deg, #FFD700, #AA2DFF)"
                  : msg.tier === "MID_ROW"
                  ? "linear-gradient(135deg, #00FFFF, #0088AA)"
                  : "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 800,
                color: "#000",
                border: msg.hasCam ? "1.5px solid rgba(0,255,255,0.5)" : "none",
              }}
            >
              {initials(msg.displayName)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: msg.tier === "VIP_FRONT_ROW" ? "#FFD700" : msg.tier === "MID_ROW" ? "#00FFFF" : "rgba(255,255,255,0.6)" }}>
                  {TIER_LABEL[msg.tier]}{msg.displayName}
                </span>
                {msg.isTip && (
                  <span style={{ fontSize: 8, fontWeight: 900, color: "#00FF88", background: "rgba(0,255,136,0.12)", borderRadius: 4, padding: "1px 5px" }}>
                    TIP ${msg.tipAmount}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {msg.content}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
