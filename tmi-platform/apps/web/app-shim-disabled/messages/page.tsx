import Link from "next/link";

const CONVERSATIONS = [
  { id: "c1", name: "Wavetek", role: "ARTIST", lastMsg: "Yo, you coming to the cypher tonight?", time: "2m ago", unread: 2, icon: "🎤", color: "#FF2DAA", online: true },
  { id: "c2", name: "TMI Support", role: "SUPPORT", lastMsg: "Your payout has been processed successfully.", time: "1h ago", unread: 0, icon: "🛡️", color: "#00FFFF", online: true },
  { id: "c3", name: "Zuri Bloom", role: "ARTIST", lastMsg: "Loved your set last night, let's collab!", time: "3h ago", unread: 1, icon: "🌍", color: "#00FF88", online: false },
  { id: "c4", name: "TMI Booking", role: "SYSTEM", lastMsg: "Venue request from venue1 - review now", time: "3d ago", unread: 1, icon: "📋", color: "#FFD700", online: true },
];

const ROLE_COLOR: Record<string, string> = { ARTIST: "#FF2DAA", SUPPORT: "#00FF88", SYSTEM: "#FFD700" };

export default function MessagesPage() {
  const totalUnread = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "36px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>INBOX</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Messages</h1>
          </div>
          {totalUnread > 0 && (
            <div style={{ background: "#FF2DAA", color: "#050510", fontSize: 10, fontWeight: 900, borderRadius: 20, padding: "4px 12px" }}>{totalUnread} new</div>
          )}
        </div>
      </section>

      <section style={{ maxWidth: 680, margin: "0 auto", padding: "16px 24px 0" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {CONVERSATIONS.map((conv) => (
            <Link key={conv.id} href={`/messages/${conv.id}`} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", textDecoration: "none", color: "inherit" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, background: `${conv.color}15`, border: `2px solid ${conv.color}30`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{conv.icon}</div>
                {conv.online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, background: "#00FF88", borderRadius: "50%", border: "2px solid #050510" }} />}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: conv.unread > 0 ? 800 : 600, color: "#fff" }}>{conv.name}</span>
                    <span style={{ fontSize: 7, fontWeight: 700, color: ROLE_COLOR[conv.role], background: `${ROLE_COLOR[conv.role]}15`, borderRadius: 3, padding: "1px 5px" }}>{conv.role}</span>
                  </div>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{conv.time}</span>
                </div>
                <div style={{ fontSize: 10, color: conv.unread > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.lastMsg}</div>
              </div>
              {conv.unread > 0 && <div style={{ width: 18, height: 18, background: "#FF2DAA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{conv.unread}</div>}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 32, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <Link href="/profile" style={{ fontSize: 9, fontWeight: 700, color: "#00FFFF", textDecoration: "none", border: "1px solid #00FFFF30", borderRadius: 6, padding: "8px 16px" }}>View Profile</Link>
        <Link href="/admin/messages" style={{ fontSize: 9, fontWeight: 700, color: "#FF2DAA", textDecoration: "none", border: "1px solid #FF2DAA40", borderRadius: 6, padding: "8px 16px" }}>Admin Monitor</Link>
      </section>
    </main>
  );
}
