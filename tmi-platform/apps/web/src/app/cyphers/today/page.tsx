import Link from "next/link";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export default function CyphersTodayPage() {
  const cyphers = WhatsHappeningTodayEngine.listByType("cypher");

  return (
    <main style={{ minHeight: "100vh", background: "#070510", color: "#fff", padding: "26px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1>Hip-Hop Cyphers Today</h1>
        {cyphers.map((event) => (
          <Link key={event.slug} href={`/events/${event.slug}`} style={{ display: "block", marginTop: 10, border: "1px solid #FF2DAA66", borderRadius: 10, padding: 10, textDecoration: "none", color: "inherit" }}>
            {event.title}
          </Link>
        ))}
      </div>
    </main>
  );
}
