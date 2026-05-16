"use client";

const BOT_EVENTS = [
  { botId: "bot-alpha", status: "active", login: "ok", movement: "venue lobby", roomJoin: "monday-cypher", chat: "engaged", purchase: "ticket hold", voting: "queued", tips: "armed" },
  { botId: "bot-beta", status: "watch", login: "retry", movement: "fan lounge", roomJoin: "battle-ring", chat: "shadow", purchase: "none", voting: "live", tips: "sent" },
  { botId: "bot-gamma", status: "active", login: "ok", movement: "vip lobby", roomJoin: "neon-stage", chat: "monitoring", purchase: "merch sim", voting: "none", tips: "none" },
  { botId: "bot-delta", status: "critical", login: "blocked", movement: "stalled", roomJoin: "failed", chat: "muted", purchase: "rollback", voting: "duplicate", tips: "reversed" },
  { botId: "bot-epsilon", status: "active", login: "ok", movement: "ticket queue", roomJoin: "premiere", chat: "spark", purchase: "vip bundle", voting: "armed", tips: "queued" },
  { botId: "bot-zeta", status: "watch", login: "ok", movement: "artist room", roomJoin: "green-room", chat: "idle", purchase: "none", voting: "observe", tips: "armed" },
];

function tone(status: string): string {
  if (status === "active") return "#00FF88";
  if (status === "critical") return "#FF2DAA";
  return "#FFD700";
}

export default function BotObservationGrid() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 18 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "#FF2DAA", textTransform: "uppercase", fontWeight: 800 }}>Bot Observation Grid</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Watch bot logins, movement, room joins, chats, purchases, voting, and tips</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
          {BOT_EVENTS.map((bot) => (
            <article key={bot.botId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, background: "rgba(0,0,0,0.32)", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{bot.botId}</div>
                <span style={{ fontSize: 9, fontWeight: 800, color: tone(bot.status), background: `${tone(bot.status)}18`, border: `1px solid ${tone(bot.status)}35`, borderRadius: 999, padding: "3px 8px", textTransform: "uppercase" }}>{bot.status}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["login", bot.login],
                  ["movement", bot.movement],
                  ["room join", bot.roomJoin],
                  ["chat", bot.chat],
                  ["purchase", bot.purchase],
                  ["voting", bot.voting],
                  ["tips", bot.tips],
                ].map(([label, value]) => (
                  <div key={label as string} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label as string}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5 }}>{value as string}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}