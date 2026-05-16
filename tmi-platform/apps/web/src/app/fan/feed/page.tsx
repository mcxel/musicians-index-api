"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Friend = {
  id: string;
  username: string;
  avatar: string;
  role: string;
  status: "online" | "offline" | "live";
  since: string;
};

type PendingInvite = {
  id: string;
  from: string;
  avatar: string;
  message: string;
  time: string;
  direction: "incoming" | "outgoing";
};

const SEED_FRIENDS: Friend[] = [
  { id: "f1", username: "Wavetek",     avatar: "🎸", role: "Artist",   status: "live",    since: "Apr 2026" },
  { id: "f2", username: "ZuriBloom",   avatar: "🎵", role: "Artist",   status: "online",  since: "Mar 2026" },
  { id: "f3", username: "NxghtOwl",    avatar: "🦉", role: "Producer", status: "offline", since: "Feb 2026" },
  { id: "f4", username: "Coralline_V", avatar: "🌊", role: "Fan",      status: "online",  since: "Apr 2026" },
];

const SEED_INVITES: PendingInvite[] = [
  { id: "i1", from: "MakoMixer",  avatar: "🎛️", message: "Hey, want to connect on TMI?", time: "2h ago",  direction: "incoming" },
  { id: "i2", from: "PhaseTwo_",  avatar: "⚡",  message: "Let's connect!",               time: "5h ago",  direction: "incoming" },
  { id: "i3", from: "DrumLogic",  avatar: "🥁",  message: "",                             time: "1d ago",  direction: "outgoing" },
];

const STATUS_COLOR = { online: "#00FF88", offline: "rgba(255,255,255,0.2)", live: "#FF2DAA" } as const;
const STATUS_LABEL = { online: "Online",  offline: "Offline",               live: "Live Now" } as const;

function normalizeFriends(data: unknown): Friend[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  return (data as Record<string, unknown>[]).map((f, i) => ({
    id:       String(f.id       ?? `f-${i}`),
    username: String(f.username ?? f.name ?? "Unknown"),
    avatar:   String(f.avatar   ?? f.icon ?? "👤"),
    role:     String(f.role     ?? "Fan"),
    status:   (["online","offline","live"].includes(String(f.status)) ? f.status : "offline") as Friend["status"],
    since:    String(f.createdAt ?? f.since ?? ""),
  }));
}

function normalizeInvites(data: unknown): PendingInvite[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  return (data as Record<string, unknown>[]).map((inv, i) => ({
    id:        String(inv.id          ?? `inv-${i}`),
    from:      String(inv.senderName  ?? inv.from ?? "Unknown"),
    avatar:    String(inv.avatar      ?? inv.icon ?? "👤"),
    message:   String(inv.message     ?? ""),
    time:      String(inv.createdAt   ?? inv.time ?? ""),
    direction: (inv.direction === "outgoing" ? "outgoing" : "incoming") as PendingInvite["direction"],
  }));
}

export default function FanFeedPage() {
  const [friends,   setFriends]   = useState<Friend[]>(SEED_FRIENDS);
  const [invites,   setInvites]   = useState<PendingInvite[]>(SEED_INVITES);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading");
  const [searchVal, setSearchVal] = useState("");
  const [sendTo,    setSendTo]    = useState("");
  const [sendMsg,   setSendMsg]   = useState("");
  const [sentList,  setSentList]  = useState<string[]>([]);
  const [tab,       setTab]       = useState<"friends" | "invites" | "send">("friends");

  // Load friends + invites from API, fall back to seed on failure
  useEffect(() => {
    let active = true;

    Promise.allSettled([
      fetch("/api/friends",       { cache: "no-store", credentials: "include" }).then(r => r.json()),
      fetch("/api/invites/inbox", { cache: "no-store", credentials: "include" }).then(r => r.json()),
    ]).then(([friendsResult, invitesResult]) => {
      if (!active) return;

      if (friendsResult.status === "fulfilled") {
        const normalized = normalizeFriends(friendsResult.value);
        if (normalized.length > 0) setFriends(normalized);
      }

      if (invitesResult.status === "fulfilled") {
        const normalized = normalizeInvites(invitesResult.value);
        if (normalized.length > 0) setInvites(normalized);
      }

      setLoadState("ok");
    }).catch(() => {
      if (active) setLoadState("error");
    });

    return () => { active = false; };
  }, []);

  const acceptInvite = useCallback(async (id: string) => {
    const invite = invites.find(i => i.id === id);
    if (!invite) return;

    // Optimistic update
    setFriends(f => [
      ...f,
      { id: `f${Date.now()}`, username: invite.from, avatar: invite.avatar, role: "Fan", status: "online", since: "Now" },
    ]);
    setInvites(i => i.filter(x => x.id !== id));

    // Persist via API
    await fetch(`/api/friends/request/${id}/accept`, { method: "POST", credentials: "include" }).catch(() => {});
  }, [invites]);

  const declineInvite = useCallback(async (id: string) => {
    // Optimistic
    setInvites(i => i.filter(x => x.id !== id));
    await fetch(`/api/friends/request/${id}/decline`, { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  const sendInvite = useCallback(async () => {
    const target = sendTo.trim();
    if (!target) return;

    // Optimistic
    setSentList(s => [...s, target]);
    setInvites(i => [
      ...i,
      { id: `io${Date.now()}`, from: target, avatar: "👤", message: sendMsg, time: "Just now", direction: "outgoing" },
    ]);
    setSendTo("");
    setSendMsg("");
    setTab("invites");

    // Persist via API — toUserId is the username/email (backend resolves)
    await fetch("/api/friends/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ toUserId: target }),
    }).catch(() => {});
  }, [sendTo, sendMsg]);

  const removeFriend = useCallback(async (id: string) => {
    setFriends(f => f.filter(x => x.id !== id));
    await fetch(`/api/friends/${id}`, { method: "DELETE", credentials: "include" }).catch(() => {});
  }, []);

  const filtered = searchVal
    ? friends.filter(f => f.username.toLowerCase().includes(searchVal.toLowerCase()))
    : friends;

  const incomingCount = invites.filter(i => i.direction === "incoming").length;

  return (
    <main style={{ minHeight: "100vh", background: "#07070f", color: "#fff", paddingTop: 56, paddingBottom: 60 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 18px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 6 }}>FAN FEED</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>My Network</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {loadState === "loading" && (
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SYNCING…</span>
            )}
            {loadState === "error" && (
              <span style={{ fontSize: 9, color: "#FFD700", letterSpacing: "0.1em" }}>OFFLINE MODE</span>
            )}
            <Link href="/" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 14px" }}>
              ← Home
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
          {([
            { label: "Friends", value: friends.length,  color: "#00FFFF" },
            { label: "Invites", value: incomingCount,   color: "#FF2DAA" },
            { label: "Sent",    value: sentList.length, color: "#FFD700" },
          ] as const).map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}20`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em", marginTop: 3 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {(["friends", "invites", "send"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "9px 18px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                background: "transparent", border: "none", cursor: "pointer",
                color: tab === t ? "#00FFFF" : "rgba(255,255,255,0.3)",
                borderBottom: tab === t ? "2px solid #00FFFF" : "2px solid transparent",
                position: "relative", top: 1,
              }}
            >
              {t === "invites" && incomingCount > 0 ? `INVITES (${incomingCount})` : t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Friends tab ── */}
        {tab === "friends" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search friends…"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }}
            />
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No friends found.</div>
            )}
            {filtered.map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `2px solid ${STATUS_COLOR[f.status]}40` }}>
                  {f.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{f.username}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{f.role} · since {f.since}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLOR[f.status], display: "inline-block" }} />
                  <span style={{ fontSize: 9, color: STATUS_COLOR[f.status], fontWeight: 700 }}>{STATUS_LABEL[f.status]}</span>
                </div>
                <button
                  onClick={() => void removeFriend(f.id)}
                  aria-label={`Remove ${f.username}`}
                  style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,68,68,0.6)", background: "transparent", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}
                >
                  REMOVE
                </button>
              </div>
            ))}

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                onClick={() => setTab("send")}
                style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FF2DAA", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 8, cursor: "pointer" }}
              >
                + ADD FRIEND
              </button>
            </div>
          </div>
        )}

        {/* ── Invites tab ── */}
        {tab === "invites" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {invites.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No pending invites.</div>
            )}
            {invites.map(inv => (
              <div key={inv.id} style={{
                padding: "12px 14px",
                background:  inv.direction === "incoming" ? "rgba(255,45,170,0.04)"  : "rgba(255,255,255,0.02)",
                border: `1px solid ${inv.direction === "incoming" ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {inv.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{inv.from}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                      {inv.direction === "incoming" ? "Wants to connect" : "Invite sent"} · {inv.time}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 8, fontWeight: 800,
                    color:      inv.direction === "incoming" ? "#FF2DAA"               : "rgba(255,255,255,0.3)",
                    background: inv.direction === "incoming" ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.05)",
                    border:    `1px solid ${inv.direction === "incoming" ? "rgba(255,45,170,0.3)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 4, padding: "2px 7px",
                  }}>
                    {inv.direction === "incoming" ? "INCOMING" : "OUTGOING"}
                  </span>
                </div>
                {inv.message && (
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, fontStyle: "italic" }}>&ldquo;{inv.message}&rdquo;</p>
                )}
                {inv.direction === "incoming" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => void acceptInvite(inv.id)}
                      style={{ padding: "7px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: "#00FF88", borderRadius: 7, border: "none", cursor: "pointer" }}
                    >
                      ACCEPT
                    </button>
                    <button
                      onClick={() => void declineInvite(inv.id)}
                      style={{ padding: "7px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", background: "transparent", borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}
                    >
                      DECLINE
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Send tab ── */}
        {tab === "send" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              Enter a TMI username or email to send a friend invite.
            </p>

            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>USERNAME OR EMAIL</label>
              <input
                value={sendTo}
                onChange={e => setSendTo(e.target.value)}
                placeholder="e.g. Wavetek or fan@email.com"
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>MESSAGE (OPTIONAL)</label>
              <textarea
                value={sendMsg}
                onChange={e => setSendMsg(e.target.value)}
                placeholder="Say something…"
                rows={3}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <button
              onClick={() => void sendInvite()}
              disabled={!sendTo.trim()}
              style={{
                alignSelf: "flex-start", padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
                color:      sendTo.trim() ? "#050510"                                   : "rgba(255,255,255,0.2)",
                background: sendTo.trim() ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)"  : "rgba(255,255,255,0.06)",
                borderRadius: 8, border: "none", cursor: sendTo.trim() ? "pointer" : "not-allowed",
              }}
            >
              SEND INVITE →
            </button>

            {sentList.length > 0 && (
              <div style={{ marginTop: 8, padding: "12px 14px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.1em", marginBottom: 8 }}>RECENTLY SENT</div>
                {sentList.map((s, i) => (
                  <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", padding: "3px 0" }}>→ {s}</div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
