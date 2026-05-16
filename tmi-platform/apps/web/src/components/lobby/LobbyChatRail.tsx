"use client";

import { useState } from "react";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

type LobbyChatRailProps = {
  onPost: (message: string) => void;
  sourceId?: string;
};

export default function LobbyChatRail({ onPost, sourceId = "lobby:chat-rail" }: LobbyChatRailProps) {
  const [input, setInput] = useState("");
  const [actorAgeClass, setActorAgeClass] = useState<SafetyAgeClass>("unknown");
  const [targetAgeClass, setTargetAgeClass] = useState<SafetyAgeClass>("unknown");
  const [safetyReason, setSafetyReason] = useState<string | null>(null);

  return (
    <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Lobby Chat Rail</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <select value={actorAgeClass} onChange={(event) => setActorAgeClass(event.target.value as SafetyAgeClass)} style={{ borderRadius: 8, border: "1px solid #5d427f", background: "#120b1d", color: "#eadbff", padding: "7px 9px" }}>
          <option value="unknown">Sender age: unknown</option>
          <option value="minor">Sender age: minor</option>
          <option value="adult">Sender age: adult</option>
          <option value="test_minor">Sender age: test_minor</option>
          <option value="test_adult">Sender age: test_adult</option>
        </select>
        <select value={targetAgeClass} onChange={(event) => setTargetAgeClass(event.target.value as SafetyAgeClass)} style={{ borderRadius: 8, border: "1px solid #5d427f", background: "#120b1d", color: "#eadbff", padding: "7px 9px" }}>
          <option value="unknown">Room age class: unknown</option>
          <option value="minor">Room age class: minor</option>
          <option value="adult">Room age class: adult</option>
          <option value="test_minor">Room age class: test_minor</option>
          <option value="test_adult">Room age class: test_adult</option>
        </select>
      </div>
      {safetyReason ? <div style={{ color: "#fca5a5", fontSize: 11, marginBottom: 8 }}>Blocked by P0 teen safety: {safetyReason}</div> : null}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Send room message"
          style={{
            flex: 1,
            borderRadius: 8,
            border: "1px solid #5d427f",
            background: "#120b1d",
            color: "#eadbff",
            padding: "7px 9px",
          }}
        />
        <button
          onClick={() => {
            if (!input.trim()) return;

            const decision = enforceAdultTeenContactBlock({
              source: sourceId,
              channel: "lobby_chat",
              actor: {
                userId: "lobby-local-user",
                ageClass: actorAgeClass,
              },
              target: {
                userId: "lobby-room",
                ageClass: targetAgeClass,
              },
            });

            if (!decision.allowed) {
              setSafetyReason(decision.reason);
              return;
            }

            setSafetyReason(null);
            onPost(input.trim());
            setInput("");
          }}
          style={{ borderRadius: 8, border: "1px solid #83d7ff", background: "#184a6c", color: "#c7ecff", padding: "7px 10px", cursor: "pointer" }}
        >
          Post
        </button>
      </div>
    </section>
  );
}
