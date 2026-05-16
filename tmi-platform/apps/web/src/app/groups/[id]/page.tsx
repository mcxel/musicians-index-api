"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  joinGroup,
  leaveGroup,
  listGroupMembers,
  listGroupMessages,
  sendGroupMessage,
} from "@/lib/social/GroupChatEngine";

export default function GroupRoomPage({ params }: { params: { id: string } }) {
  const groupId = params.id;
  const userId = "loop-user";

  const [draft, setDraft] = useState("");
  const [tick, setTick] = useState(0);

  useMemo(() => {
    joinGroup(groupId, userId);
    sendGroupMessage(groupId, "system", `Welcome to ${groupId}`);
  }, [groupId]);

  const members = listGroupMembers(groupId);
  const messages = listGroupMessages(groupId);

  const onSend = () => {
    if (!draft.trim()) return;
    sendGroupMessage(groupId, userId, draft.trim());
    setDraft("");
    setTick((v) => v + 1);
  };

  const onLeave = () => {
    leaveGroup(groupId, userId);
    setTick((v) => v + 1);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "34px 18px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <Link href="/groups" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Groups</Link>
        <h1 style={{ fontSize: 30, margin: "10px 0 6px" }}>Group Chat: {groupId}</h1>
        <p style={{ color: "rgba(255,255,255,0.64)" }}>Live group DM loop with join, chat, leave, and return routing.</p>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14, marginTop: 18 }}>
          <section style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>MEMBERS ({members.length})</div>
            <div style={{ display: "grid", gap: 6 }}>
              {members.map((member) => (
                <div key={member} style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{member}</div>
              ))}
            </div>
            <button onClick={onLeave} style={{ marginTop: 14, width: "100%", border: "1px solid rgba(255,45,170,0.45)", background: "rgba(255,45,170,0.12)", color: "#FF2DAA", borderRadius: 8, padding: "8px 10px", fontWeight: 700, cursor: "pointer" }}>
              Leave Group
            </button>
          </section>

          <section style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>MESSAGES ({messages.length})</div>
            <div style={{ maxHeight: 330, overflowY: "auto", display: "grid", gap: 8, marginBottom: 12 }}>
              {messages.map((entry) => (
                <div key={entry.id} style={{ borderRadius: 8, background: "rgba(255,255,255,0.04)", padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "#00FF88", marginBottom: 2 }}>{entry.userId}</div>
                  <div style={{ fontSize: 12, color: "#fff" }}>{entry.body}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type message" style={{ flex: 1, background: "#0e1023", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, color: "#fff", padding: "9px 10px" }} />
              <button onClick={onSend} style={{ border: "none", background: "#00FFFF", color: "#050510", borderRadius: 8, padding: "9px 14px", fontWeight: 800, cursor: "pointer" }}>Send</button>
            </div>
          </section>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/messages" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>DM Inbox</Link>
          <Link href="/friends" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Friends</Link>
          <Link href="/notifications" style={{ color: "#00FF88", textDecoration: "none", fontSize: 12 }}>Notifications</Link>
          <Link href="/hub/fan" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>Return Profile</Link>
        </div>
      </div>
    </main>
  );
}
