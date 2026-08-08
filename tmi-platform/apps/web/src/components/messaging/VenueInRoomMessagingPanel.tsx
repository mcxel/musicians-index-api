"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { setVenueQuietDmActive } from "@/lib/messaging/messageAlertPolicy";

const MessagingCanister = dynamic(() => import("@/components/canisters/MessagingCanister"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 16, color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Loading messages…</div>
  ),
});

type Member = { userId: string; displayName: string };

type VenueInRoomMessagingPanelProps = {
  members: Member[];
  selfUserId: string;
  roomLabel: string;
};

export default function VenueInRoomMessagingPanel({
  members,
  selfUserId,
  roomLabel,
}: VenueInRoomMessagingPanelProps) {
  const [tab, setTab] = useState<"room" | "personal">("room");
  const [recipientId, setRecipientId] = useState("");
  const peers = members.filter((m) => m.userId && m.userId !== selfUserId);

  useEffect(() => {
    setVenueQuietDmActive(true);
    return () => setVenueQuietDmActive(false);
  }, []);

  useEffect(() => {
    if (!recipientId && peers[0]) setRecipientId(peers[0].userId);
  }, [peers, recipientId]);

  const selected = peers.find((p) => p.userId === recipientId);

  return (
    <div style={{ marginTop: 10, border: "1px solid rgba(0,255,255,0.25)", borderRadius: 10, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        {(["room", "personal"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: "8px 10px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              border: "none",
              cursor: "pointer",
              background: tab === key ? "rgba(0,255,255,0.12)" : "transparent",
              color: tab === key ? "#00FFFF" : "rgba(255,255,255,0.45)",
            }}
          >
            {key === "room" ? "VENUE CHAT" : "PERSONAL DM"}
          </button>
        ))}
      </div>

      {tab === "room" ? (
        <div style={{ padding: "10px 12px", fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
          Public lines appear as comic bubbles over the crowd. Use the send box below for {roomLabel}.
        </div>
      ) : (
        <div style={{ padding: 8 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 6, letterSpacing: "0.08em" }}>
            Quiet visual DMs — no chime during the show
          </div>
          {peers.length === 0 ? (
            <div style={{ padding: 12, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              No other people in this venue yet. Personal messages unlock when someone else is here.
            </div>
          ) : (
            <>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: 8,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  padding: "8px 10px",
                  fontSize: 12,
                }}
              >
                {peers.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.displayName}
                  </option>
                ))}
              </select>
              <MessagingCanister
                recipientId={recipientId}
                recipientName={selected?.displayName}
                height={280}
                compact
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
