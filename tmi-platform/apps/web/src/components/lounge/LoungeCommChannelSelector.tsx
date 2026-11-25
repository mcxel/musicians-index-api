"use client";

import { useEffect, useState } from "react";
import {
  LOUNGE_COMM_LABELS,
  planMicPublish,
  type LoungeCommChannel,
} from "@/lib/lounge/LoungeCommChannelAuthority";

export type LoungeCommChannelSelectorProps = {
  loungeId: string;
  initialChannel?: LoungeCommChannel;
  onChannelChange?: (channel: LoungeCommChannel, publishToProximity: boolean) => void;
  micMuted?: boolean;
  onMicMuteChange?: (muted: boolean) => void;
  speakerMuted?: boolean;
  onSpeakerMuteChange?: (muted: boolean) => void;
};

const CHANNELS: LoungeCommChannel[] = ["nearby", "room", "group", "direct"];

export default function LoungeCommChannelSelector({
  loungeId,
  initialChannel = "nearby",
  onChannelChange,
  micMuted = false,
  onMicMuteChange,
  speakerMuted = false,
  onSpeakerMuteChange,
}: LoungeCommChannelSelectorProps) {
  const [channel, setChannel] = useState<LoungeCommChannel>(initialChannel);
  const [allowPublicWhilePrivate, setAllowPublicWhilePrivate] = useState(false);
  const plan = planMicPublish(channel, { allowPublicWhilePrivate });

  useEffect(() => {
    onChannelChange?.(channel, plan.publishToProximity);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:lounge:comm-channel", {
          detail: {
            loungeId,
            channel,
            publishToProximity: plan.publishToProximity,
            plan,
          },
        }),
      );
    }
  }, [channel, loungeId, allowPublicWhilePrivate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      data-runtime="lounge-comm-channel-selector"
      style={{
        display: "grid",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,255,255,0.25)",
        background: "rgba(5,5,16,0.92)",
        maxWidth: 360,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#00FFFF",
        }}
      >
        Communication destination
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {CHANNELS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            style={{
              borderRadius: 999,
              border: channel === c ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.15)",
              background: channel === c ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.04)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {c === "nearby" ? "Nearby" : c === "room" ? "Room" : c === "group" ? "Group" : "Direct"}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
        Selected: <strong>{LOUNGE_COMM_LABELS[channel]}</strong>
      </div>
      <div style={{ fontSize: 11, color: plan.publishToProximity ? "#00FF88" : "#FFD700" }}>
        {plan.reason}
      </div>
      {(channel === "group" || channel === "direct") && (
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
          <input
            type="checkbox"
            checked={allowPublicWhilePrivate}
            onChange={(e) => setAllowPublicWhilePrivate(e.target.checked)}
          />
          Also keep public proximity mic on (explicit)
        </label>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onMicMuteChange?.(!micMuted)}
          style={muteBtn(micMuted)}
        >
          {micMuted ? "Mic muted" : "Mic on"}
        </button>
        <button
          type="button"
          onClick={() => onSpeakerMuteChange?.(!speakerMuted)}
          style={muteBtn(speakerMuted)}
        >
          {speakerMuted ? "Speaker muted" : "Speaker on"}
        </button>
      </div>
    </div>
  );
}

function muteBtn(active: boolean): React.CSSProperties {
  return {
    borderRadius: 8,
    border: active ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.2)",
    background: active ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    padding: "6px 10px",
    cursor: "pointer",
  };
}
