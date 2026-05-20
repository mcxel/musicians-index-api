"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ArtistWorldShell from "@/components/artist/ArtistWorldShell";
import SplitStreamMatrix from "@/components/media/SplitStreamMatrix";
import RetinalHudChat from "@/components/media/RetinalHudChat";

interface MeUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface MeResponse {
  authenticated: boolean;
  user?: MeUser;
}

type InboxItemType = "shoutout" | "birthday" | "video_chat" | "booking" | "collab";
type InboxItemStatus = "pending" | "accepted" | "declined";

interface InboxItem {
  id: string;
  type: InboxItemType;
  from: string;
  fromRole: string;
  amount?: number;
  message: string;
  ts: number;
  status: InboxItemStatus;
}

const TYPE_META: Record<InboxItemType, { label: string; icon: string; color: string }> = {
  shoutout:   { label: "Shoutout Request", icon: "📣", color: "#FF2DAA" },
  birthday:   { label: "Birthday Message", icon: "🎂", color: "#FFD700" },
  video_chat: { label: "Video Chat",       icon: "🎥", color: "#00FFFF" },
  booking:    { label: "Booking Request",  icon: "📋", color: "#00FF88" },
  collab:     { label: "Collab Invite",    icon: "✨", color: "#AA2DFF" },
};

const SEED_INBOX: InboxItem[] = [
  { id: "i1", type: "shoutout",   from: "Wavetek",       fromRole: "FAN",      amount: 25,  message: "Shout me out in the next cypher, I'm your biggest fan 🎤", ts: Date.now() - 120000,  status: "pending" },
  { id: "i2", type: "birthday",   from: "Zuri Bloom",    fromRole: "FAN",      amount: 15,  message: "It's my birthday on Friday — can you say my name live?", ts: Date.now() - 900000,  status: "pending" },
  { id: "i3", type: "video_chat", from: "Krypt",         fromRole: "ARTIST",   amount: 50,  message: "Want to do a 15-min video link up — working on a remix", ts: Date.now() - 1800000, status: "pending" },
  { id: "i4", type: "booking",    from: "TMI Booking",   fromRole: "SYSTEM",   amount: 0,   message: "Venue request: Club Neon, Atlanta — 3/15 event, review now", ts: Date.now() - 3600000, status: "pending" },
  { id: "i5", type: "collab",     from: "Neon Vibe",     fromRole: "DJ",       amount: 0,   message: "Want to co-produce a track — I got the beats ready to go 🎹", ts: Date.now() - 7200000, status: "pending" },
  { id: "i6", type: "shoutout",   from: "DJ Kenzo",      fromRole: "ARTIST",   amount: 35,  message: "Big fan — drop my handle when you go live tonight 🔥",   ts: Date.now() - 14400000, status: "pending" },
];

function fmt(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60000)    return "just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

function PerformerInbox() {
  const [items, setItems] = useState<InboxItem[]>(SEED_INBOX);
  const [filter, setFilter] = useState<InboxItemType | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const pending = items.filter(i => i.status === "pending");
  const displayed = filter === "all" ? pending : pending.filter(i => i.type === filter);
  const totalRevenue = pending.filter(i => (i.amount ?? 0) > 0).reduce((s, i) => s + (i.amount ?? 0), 0);

  function respond(id: string, accepted: boolean) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: accepted ? "accepted" : "declined" } : i));
    const item = items.find(i => i.id === id);
    const meta = item ? TYPE_META[item.type] : null;
    setToast(accepted
      ? `${meta?.icon ?? "✓"} ${meta?.label ?? "Request"} accepted${item?.amount ? ` — $${item.amount} queued` : ""}`
      : "Request declined");
    setTimeout(() => setToast(null), 2600);
  }

  const FILTERS: Array<InboxItemType | "all"> = ["all", "shoutout", "birthday", "video_chat", "booking", "collab"];

  return (
    <div style={{ marginTop: 28 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>PERFORMER INBOX</div>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{pending.length} pending</span>
            {totalRevenue > 0 && (
              <span style={{ fontSize: 11, fontWeight: 800, color: "#00FF88" }}>+${totalRevenue} queued</span>
            )}
          </div>
        </div>
        <Link
          href="/messages"
          style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 6, padding: "5px 10px", background: "rgba(0,255,255,0.05)" }}
        >
          VIEW ALL MESSAGES →
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {FILTERS.map(f => {
          const meta = f !== "all" ? TYPE_META[f] : null;
          const count = f === "all" ? pending.length : pending.filter(i => i.type === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 8, fontWeight: 800, letterSpacing: "0.08em",
                cursor: "pointer", border: `1px solid ${filter === f ? (meta?.color ?? "#00FFFF") : "rgba(255,255,255,0.08)"}`,
                background: filter === f ? `${meta?.color ?? "#00FFFF"}10` : "transparent",
                color: filter === f ? (meta?.color ?? "#00FFFF") : "rgba(255,255,255,0.35)",
              }}
            >
              {meta?.icon ?? "📬"} {f === "all" ? "ALL" : meta?.label.toUpperCase() ?? f.toUpperCase()} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence>
          {displayed.length === 0 && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", padding: "20px 0", textAlign: "center" }}>
              No pending requests.
            </p>
          )}
          {displayed.map(item => {
            const meta = TYPE_META[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  borderRadius: 10, padding: "12px 14px",
                  background: `${meta.color}06`,
                  border: `1px solid ${meta.color}22`,
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{item.from}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", color: meta.color }}>{meta.label.toUpperCase()}</span>
                    {(item.amount ?? 0) > 0 && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 4, padding: "1px 6px" }}>
                        ${item.amount}
                      </span>
                    )}
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{fmt(item.ts)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "0 0 10px", lineHeight: 1.4 }}>{item.message}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => respond(item.id, true)}
                      style={{
                        padding: "5px 14px", borderRadius: 6, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                        border: `1px solid ${meta.color}55`, background: `${meta.color}10`,
                        color: meta.color, cursor: "pointer",
                      }}
                    >
                      {item.type === "booking" ? "REVIEW" : item.type === "collab" ? "ACCEPT COLLAB" : "ACCEPT"}
                    </button>
                    <button
                      onClick={() => respond(item.id, false)}
                      style={{
                        padding: "5px 14px", borderRadius: 6, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                        border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
                        color: "rgba(255,255,255,0.3)", cursor: "pointer",
                      }}
                    >
                      DECLINE
                    </button>
                    {item.type === "video_chat" && (
                      <Link
                        href={`/video/rooms/new?inviteId=${item.from.toLowerCase().replace(/\s+/g, "")}&name=${encodeURIComponent(item.from)}`}
                        style={{
                          padding: "5px 14px", borderRadius: 6, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                          border: "1px solid rgba(0,255,255,0.25)", background: "rgba(0,255,255,0.06)",
                          color: "#00FFFF", textDecoration: "none",
                        }}
                      >
                        🎥 JOIN CALL
                      </Link>
                    )}
                    {item.type === "booking" && (
                      <Link
                        href="/messages/c6"
                        style={{
                          padding: "5px 14px", borderRadius: 6, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                          border: "1px solid rgba(255,213,0,0.25)", background: "rgba(255,213,0,0.06)",
                          color: "#FFD700", textDecoration: "none",
                        }}
                      >
                        VIEW DETAILS
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 20, padding: "10px 24px", fontSize: 11, fontWeight: 800, color: "#00FF88", zIndex: 9999, backdropFilter: "blur(10px)", whiteSpace: "nowrap" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ArtistDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBattle, setIsBattle] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store", credentials: "include" });
        if (res.status === 401 || res.status === 403) { router.replace("/auth"); return; }
        const data = (await res.json()) as MeResponse;
        if (!data.authenticated || !data.user) { router.replace("/auth"); return; }
        setUser(data.user);
      } catch {
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#040614", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.14em", fontSize: 11 }}>
          LOADING STAGE…
        </p>
      </main>
    );
  }

  if (!user) return null;

  const displayName = user.name ?? user.email.split("@")[0] ?? "Artist";
  const slug = user.id;

  return (
    <ArtistWorldShell
      displayName={displayName}
      slug={slug}
      tagline={`${user.email} · Artist Dashboard`}
      isVerified
    >
      {/* Stream + HUD panel injected as children into the identity header area */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 20, flexWrap: "wrap" }}>
        {/* Live stream controls */}
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
            STREAM CONTROL
          </div>
          <SplitStreamMatrix
            mode="SPLIT"
            isBattle={isBattle}
            battleOpponentLabel="Challenger"
            onModeChange={() => {}}
          />
          <button
            onClick={() => setIsBattle(b => !b)}
            style={{
              marginTop: 10,
              padding: "7px 14px",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              border: `1px solid ${isBattle ? "rgba(255,45,170,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 6,
              background: isBattle ? "rgba(255,45,170,0.08)" : "transparent",
              color: isBattle ? "#FF2DAA" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}
          >
            {isBattle ? "⚔️ BATTLE MODE ON" : "ENABLE BATTLE MODE"}
          </button>
        </div>

        {/* Retinal HUD chat */}
        <div style={{ flexShrink: 0 }}>
          <RetinalHudChat />
        </div>
      </div>

      {/* Performer inbox */}
      <PerformerInbox />
    </ArtistWorldShell>
  );
}
