'use client';
import type { Metadata } from "next";
import Link from "next/link";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata: Metadata = {
  title: "Admin Messages | TMI",
  description: "Admin message monitor and escalation queue.",
};

type Channel = "Booking" | "Support" | "Safety" | "Sponsor" | "Editorial" | "System";
type State = "OPEN" | "REVIEW" | "RESOLVED" | "ESCALATED";
type Priority = "HIGH" | "MEDIUM" | "LOW";

type MessageItem = {
  id: string;
  channel: Channel;
  subject: string;
  from: string;
  state: State;
  priority: Priority;
  time: string;
  body: string;
};

const CHANNEL_COLOR: Record<Channel, string> = {
  Booking:   "#00FFFF",
  Support:   "#FF2DAA",
  Safety:    "#FF4444",
  Sponsor:   "#FFD700",
  Editorial: "#AA2DFF",
  System:    "#00FF88",
};

const STATE_COLOR: Record<State, string> = {
  OPEN:      "#FF2DAA",
  REVIEW:    "#FFD700",
  RESOLVED:  "#00FF88",
  ESCALATED: "#FF4444",
};

const MESSAGES: MessageItem[] = [
  { id: "m01", channel: "Booking",   subject: "Venue date change — Club Nova → April 30",         from: "Wavetek",         state: "OPEN",      priority: "HIGH",   time: "8m ago",  body: "Artist requesting reschedule due to travel conflict. Venue has a slot open April 30 8PM." },
  { id: "m02", channel: "Support",   subject: "Billing dispute — payout delay",                   from: "Zuri Bloom",      state: "REVIEW",    priority: "HIGH",   time: "22m ago", body: "Artist reports payout for week of April 14 hasn't arrived. Stripe webhook logs need review." },
  { id: "m03", channel: "Safety",    subject: "Abuse report — offensive content in Cypher room",  from: "[User Report]",   state: "ESCALATED", priority: "HIGH",   time: "34m ago", body: "Three separate user reports flagging a session participant for repeated rule violations." },
  { id: "m04", channel: "Sponsor",   subject: "Campaign slot confirmation — PrimeWave April run", from: "PrimeWave Audio", state: "OPEN",      priority: "MEDIUM", time: "1h ago",  body: "Sponsor requesting confirmation of homepage hero slot for April 28–May 5 campaign window." },
  { id: "m05", channel: "Editorial", subject: "Article submission — Wavetek interview draft",     from: "TMI Editorial",   state: "REVIEW",    priority: "MEDIUM", time: "2h ago",  body: "First draft of Wavetek cover interview ready for editorial review before publication." },
  { id: "m06", channel: "Booking",   subject: "New venue application — Frequency Lounge",         from: "Frequency LLC",   state: "OPEN",      priority: "MEDIUM", time: "3h ago",  body: "New venue requesting approval to list open nights on the TMI booking platform." },
  { id: "m07", channel: "Support",   subject: "Login recovery — account locked",                  from: "[Fan User]",      state: "OPEN",      priority: "LOW",    time: "4h ago",  body: "User unable to log in after password reset. Email delivery may be delayed." },
  { id: "m08", channel: "System",    subject: "Webhook failure — Stripe checkout endpoint",       from: "System Monitor",  state: "REVIEW",    priority: "HIGH",   time: "5h ago",  body: "3 failed webhook deliveries in last 6 hours. Endpoint responding with 500 on /stripe/webhook." },
  { id: "m09", channel: "Sponsor",   subject: "New sponsor inquiry — BeatLink Studio",            from: "BeatLink PR",     state: "OPEN",      priority: "LOW",    time: "6h ago",  body: "Interested in Gold tier partnership. Requesting media kit and platform stats deck." },
  { id: "m10", channel: "Safety",    subject: "Spam detection — 40+ duplicate messages",         from: "System Monitor",  state: "RESOLVED",  priority: "MEDIUM", time: "1d ago",  body: "Bot pattern detected and banned. 40 duplicate lobby messages purged from session logs." },
];

const CHANNELS: Channel[] = ["Booking", "Support", "Safety", "Sponsor", "Editorial", "System"];
const recentArticles = MAGAZINE_ISSUE_1.slice(0, 3);

export default function AdminMessagesPage() {
  const openCount    = MESSAGES.filter(m => m.state === "OPEN").length;
  const escalated    = MESSAGES.filter(m => m.state === "ESCALATED").length;
  const highPriority = MESSAGES.filter(m => m.priority === "HIGH").length;

  return (
    <main style={{ minHeight: "100vh", background: "#07070f", color: "#fff", padding: "28px 18px 60px" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>ADMIN PANEL</div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Message Monitor</h1>
          </div>
          <Link href="/admin" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 14px", alignSelf: "flex-start" }}>
            ← Admin Home
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 24, marginBottom: 28 }}>
          {([
            { label: "Open",      value: openCount,    color: "#FF2DAA" },
            { label: "Escalated", value: escalated,    color: "#FF4444" },
            { label: "High Pri.", value: highPriority, color: "#FFD700" },
          ] as const).map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}20`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em", marginTop: 4 }}>{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {CHANNELS.map(ch => {
            const count = MESSAGES.filter(m => m.channel === ch).length;
            return (
              <span key={ch} style={{ fontSize: 9, fontWeight: 700, color: CHANNEL_COLOR[ch], background: `${CHANNEL_COLOR[ch]}12`, border: `1px solid ${CHANNEL_COLOR[ch]}30`, borderRadius: 6, padding: "4px 10px" }}>
                {ch} ({count})
              </span>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {MESSAGES.map(msg => (
            <article key={msg.id} style={{ border: `1px solid ${msg.state === "ESCALATED" ? "rgba(255,68,68,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, background: msg.state === "ESCALATED" ? "rgba(255,68,68,0.04)" : "rgba(255,255,255,0.02)", padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: CHANNEL_COLOR[msg.channel], background: `${CHANNEL_COLOR[msg.channel]}15`, border: `1px solid ${CHANNEL_COLOR[msg.channel]}30`, borderRadius: 4, padding: "2px 7px" }}>{msg.channel.toUpperCase()}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: msg.priority === "HIGH" ? "#FF4444" : msg.priority === "MEDIUM" ? "#FFD700" : "rgba(255,255,255,0.3)" }}>{msg.priority}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{msg.time}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: STATE_COLOR[msg.state], background: `${STATE_COLOR[msg.state]}15`, border: `1px solid ${STATE_COLOR[msg.state]}30`, borderRadius: 999, padding: "2px 8px" }}>{msg.state}</span>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{msg.subject}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>From: {msg.from}</div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{msg.body}</p>
            </article>
          ))}
        </div>

        {recentArticles.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 16 }}>RECENT EDITORIAL — PENDING REVIEW</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentArticles.map(a => (
                <Link key={a.slug} href={`/magazine/article/${a.slug}`} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(170,45,255,0.12)", borderRadius: 8, textDecoration: "none", color: "inherit" }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{a.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{a.author} — {a.publishedAt}</div>
                  </div>
                  <span style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 700 }}>REVIEW →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </section>
    </main>
  );
}
