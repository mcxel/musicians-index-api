"use client";

import { useState } from "react";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

type VenueLiveChatShellProps = {
  moderationState: string;
  onMessage: (message: string) => void;
  sourceId?: string;
};

export default function VenueLiveChatShell({ moderationState, onMessage, sourceId = "venue:live-chat" }: VenueLiveChatShellProps) {
  const [message, setMessage] = useState("");
  const [actorAgeClass, setActorAgeClass] = useState<SafetyAgeClass>("unknown");
  const [targetAgeClass, setTargetAgeClass] = useState<SafetyAgeClass>("unknown");
  const [safetyReason, setSafetyReason] = useState<string | null>(null);

  return (
    <section style={{ borderRadius: 12, border: "1px solid #4d5b6f", background: "#121c2a", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#d4e7ff" }}>Venue Live Chat Shell</h3>
      <p style={{ color: "#dce9f9", fontSize: 12 }}>Moderation state: {moderationState}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
        <select value={actorAgeClass} onChange={(event) => setActorAgeClass(event.target.value as SafetyAgeClass)} style={{ borderRadius: 8, border: "1px solid #7f9bb8", background: "#0e1520", color: "#e6f0ff", padding: "7px 9px" }}>
          <option value="unknown">Sender age: unknown</option>
          <option value="minor">Sender age: minor</option>
          <option value="adult">Sender age: adult</option>
          <option value="test_minor">Sender age: test_minor</option>
          <option value="test_adult">Sender age: test_adult</option>
        </select>
        <select value={targetAgeClass} onChange={(event) => setTargetAgeClass(event.target.value as SafetyAgeClass)} style={{ borderRadius: 8, border: "1px solid #7f9bb8", background: "#0e1520", color: "#e6f0ff", padding: "7px 9px" }}>
          <option value="unknown">Room age class: unknown</option>
          <option value="minor">Room age class: minor</option>
          <option value="adult">Room age class: adult</option>
          <option value="test_minor">Room age class: test_minor</option>
          <option value="test_adult">Room age class: test_adult</option>
        </select>
      </div>
      {safetyReason ? <p style={{ color: "#fca5a5", fontSize: 11, marginTop: 8 }}>Blocked by P0 teen safety: {safetyReason}</p> : null}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type live chat"
          style={{ flex: 1, borderRadius: 8, border: "1px solid #7f9bb8", background: "#0e1520", color: "#e6f0ff", padding: "7px 9px" }}
        />
        <button
          onClick={() => {
            if (!message.trim()) return;

            const decision = enforceAdultTeenContactBlock({
              source: sourceId,
              channel: "room_chat",
              actor: {
                userId: "venue-local-user",
                ageClass: actorAgeClass,
              },
              target: {
                userId: "venue-room",
                ageClass: targetAgeClass,
              },
            });

            if (!decision.allowed) {
              setSafetyReason(decision.reason);
              return;
            }

            setSafetyReason(null);
            onMessage(message.trim());
            setMessage("");
          }}
          style={{ borderRadius: 8, border: "1px solid #8db7e3", background: "#26496d", color: "#d7ecff", padding: "6px 10px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </section>
  );
}
