import Link from "next/link";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export default function ShowsTodayPage() {
  const shows = WhatsHappeningTodayEngine.listByType("show");

  return (
    <main style={{ minHeight: "100vh", background: "#070510", color: "#fff", padding: "26px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1>Live Shows Happening Today</h1>
        {shows.map((event) => (
          <Link key={event.slug} href={`/events/${event.slug}`} style={{ display: "block", marginTop: 10, border: "1px solid #00FFFF66", borderRadius: 10, padding: 10, textDecoration: "none", color: "inherit" }}>
            {event.title}
          </Link>
        ))}
      </div>
    </main>
  );
}
