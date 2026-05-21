import Link from "next/link";

const DEMO_MESSAGES = [
  { id: "m1", from: "TMI Booking", text: "Venue request updated for Friday night.", mine: false },
  { id: "m2", from: "You", text: "Perfect. Please send the updated run-of-show.", mine: true },
  { id: "m3", from: "TMI Booking", text: "Confirmed. Contract draft is in your dashboard.", mine: false },
];

export default async function MessageThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;

  return (
    <main style={{ minHeight: "100vh", background: "#090714", color: "#fff", padding: "20px 16px 24px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
          <Link href="/messages" style={{ color: "#71f4ff", textDecoration: "none", fontWeight: 700 }}>Back to inbox</Link>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Thread: {threadId}</span>
        </div>

        <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, background: "rgba(255,255,255,0.02)", padding: 14, display: "grid", gap: 10 }}>
          {DEMO_MESSAGES.map((message) => (
            <article key={message.id} style={{ justifySelf: message.mine ? "end" : "start", maxWidth: "85%", padding: "10px 12px", borderRadius: 12, border: `1px solid ${message.mine ? "rgba(255,45,170,0.45)" : "rgba(113,244,255,0.45)"}`, background: message.mine ? "rgba(255,45,170,0.14)" : "rgba(113,244,255,0.1)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{message.from}</div>
              <div style={{ fontSize: 14, lineHeight: 1.35 }}>{message.text}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
