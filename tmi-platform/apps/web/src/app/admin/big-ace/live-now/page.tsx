import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export default function BigAceLiveNowPage() {
  const events = WhatsHappeningTodayEngine.listLiveNow();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1>Big Ace Live Now</h1>
        {events.map((event) => (
          <div key={event.slug} style={{ marginTop: 10, border: "1px solid rgba(0,255,255,0.3)", borderRadius: 10, padding: 10 }}>
            <strong>{event.title}</strong>
            <div style={{ color: "#bae6fd", fontSize: 12 }}>{event.city} · {event.venueName}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
