"use client";

import { useState } from "react";

type InviteEntry = {
  id: string;
  name: string;
  role: "fan" | "performer" | "host" | "vip";
  status: "pending" | "accepted" | "declined";
  sentAt: string;
};

const ROLE_COLORS = {
  fan: "#00FFFF",
  performer: "#FF2DAA",
  host: "#FFD700",
  vip: "#AA2DFF",
};

type LobbyInviteQueueProps = {
  roomSlug: string;
};

export default function LobbyInviteQueue({ roomSlug }: LobbyInviteQueueProps) {
  const [invites, setInvites] = useState<InviteEntry[]>([
    { id: "inv-001", name: "NovaK", role: "performer", status: "pending", sentAt: "2m ago" },
    { id: "inv-002", name: "Lyric Seven", role: "vip", status: "accepted", sentAt: "5m ago" },
    { id: "inv-003", name: "DrumLord", role: "fan", status: "pending", sentAt: "8m ago" },
  ]);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteEntry["role"]>("fan");

  function sendInvite() {
    if (!inviteName.trim()) return;
    const entry: InviteEntry = {
      id: `inv-${Date.now()}`,
      name: inviteName.trim(),
      role: inviteRole,
      status: "pending",
      sentAt: "just now",
    };
    setInvites(prev => [entry, ...prev]);
    setInviteName("");
  }

  function updateStatus(id: string, status: InviteEntry["status"]) {
    setInvites(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  const pending = invites.filter(i => i.status === "pending").length;
  const accepted = invites.filter(i => i.status === "accepted").length;

  return (
    <section style={{ borderRadius: 14, border: "1px solid #624590", background: "#160d25", padding: 12 }}>
      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>Invite Queue</div>
      <div style={{ display: "flex", gap: 12, marginTop: 4, marginBottom: 10 }}>
        <span style={{ color: "#fcd34d", fontSize: 11 }}>{pending} pending</span>
        <span style={{ color: "#22c55e", fontSize: 11 }}>{accepted} accepted</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input
          value={inviteName}
          onChange={e => setInviteName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendInvite()}
          placeholder="Name or handle"
          style={{ flex: 1, borderRadius: 7, border: "1px solid #7252a0", background: "#211236", color: "#f2e8ff", padding: "5px 8px", fontSize: 11, outline: "none" }}
        />
        <select
          value={inviteRole}
          onChange={e => setInviteRole(e.target.value as InviteEntry["role"])}
          style={{ borderRadius: 7, border: "1px solid #7252a0", background: "#211236", color: "#c4b5fd", padding: "5px 6px", fontSize: 11, outline: "none" }}
        >
          <option value="fan">Fan</option>
          <option value="performer">Performer</option>
          <option value="host">Host</option>
          <option value="vip">VIP</option>
        </select>
        <button
          onClick={sendInvite}
          style={{ borderRadius: 7, border: "1px solid #7a59ae", background: "#352053", color: "#e6dbf8", padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
        >
          INVITE
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
        {invites.map(inv => {
          const rc = ROLE_COLORS[inv.role];
          return (
            <div key={inv.id} style={{ borderRadius: 9, border: `1px solid ${inv.status === "accepted" ? "rgba(34,197,94,0.35)" : inv.status === "declined" ? "rgba(239,68,68,0.25)" : `${rc}33`}`, background: "#231238", padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: rc, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f2e9ff", fontSize: 11, fontWeight: 600 }}>{inv.name}</div>
                <div style={{ color: "#64748b", fontSize: 9 }}>{inv.role.toUpperCase()} · {inv.sentAt}</div>
              </div>
              {inv.status === "pending" ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => updateStatus(inv.id, "accepted")} style={{ borderRadius: 5, border: "1px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 9, padding: "2px 7px", cursor: "pointer", fontWeight: 700 }}>✓</button>
                  <button onClick={() => updateStatus(inv.id, "declined")} style={{ borderRadius: 5, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 9, padding: "2px 7px", cursor: "pointer", fontWeight: 700 }}>✗</button>
                </div>
              ) : (
                <span style={{ fontSize: 9, fontWeight: 700, color: inv.status === "accepted" ? "#22c55e" : "#f87171" }}>
                  {inv.status.toUpperCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
