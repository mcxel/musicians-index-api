"use client";

const EVENT_FEEDS = [
  { eventId: "premiere-01", title: "Premiere One", feed: "Main feed", chatRate: 84, tips: 39, votes: 22, tickets: 114, image: "/tmi-curated/mag-66.jpg", color: "#00FFFF" },
  { eventId: "battle-finals", title: "Battle Finals", feed: "Battle feed", chatRate: 97, tips: 51, votes: 61, tickets: 0, image: "/tmi-curated/mag-35.jpg", color: "#FF2DAA" },
  { eventId: "cypher-live", title: "Cypher Live", feed: "Cypher feed", chatRate: 131, tips: 64, votes: 74, tickets: 0, image: "/tmi-curated/home1.jpg", color: "#FFD700" },
];

export default function EventObservatoryWall() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 18 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "#FFD700", textTransform: "uppercase", fontWeight: 800 }}>Event Observatory</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Live event feeds with ticket, chat, tip, and vote activity</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12 }}>
          {EVENT_FEEDS.map((feed) => (
            <article key={feed.eventId} style={{ border: `1px solid ${feed.color}30`, borderRadius: 14, overflow: "hidden", background: "rgba(0,0,0,0.32)" }}>
              <div style={{ aspectRatio: "16/9", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.45)), url('${feed.image}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ padding: 12, display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{feed.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)" }}>{feed.feed}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: feed.color }}>LIVE</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {[
                    ["tickets", feed.tickets],
                    ["chat", feed.chatRate],
                    ["tips", feed.tips],
                    ["votes", feed.votes],
                  ].map(([label, value]) => (
                    <div key={label as string} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)", textTransform: "uppercase" }}>{label as string}</div>
                      <div style={{ marginTop: 4, fontSize: 16, fontWeight: 800 }}>{value as number}</div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}