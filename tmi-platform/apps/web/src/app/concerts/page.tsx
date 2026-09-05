import Link from "next/link";
import type { Metadata } from "next";
import ShowsReleasesMarquee from "@/components/events/ShowsReleasesMarquee";

export const metadata: Metadata = {
  title: "Live Online Concerts | TMI",
  description:
    "Scheduled Live Online Concerts and World Releases on The Musician's Index — watch worldwide.",
};

export default function ConcertsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section
        style={{
          textAlign: "center",
          padding: "64px 24px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: "#FFD700",
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          TMI LIVE ONLINE CONCERTS
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, marginBottom: 12 }}>
          Shows & Releases
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 480,
            margin: "0 auto 24px",
          }}
        >
          Scheduled Live Online Concerts and World Releases — artwork-first, real rooms, real ticket
          checkout when required. No fake viewer counts.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/live/lobby-wall"
            style={{
              padding: "9px 22px",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#050510",
              background: "linear-gradient(135deg,#FFD700,#FF8C00)",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            LOBBIES · SHOWS & RELEASES
          </Link>
          <Link
            href="/tickets"
            style={{
              padding: "9px 22px",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#00FFFF",
              border: "1px solid rgba(0,255,255,0.3)",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            MY TICKETS
          </Link>
          <Link
            href="/performer/dashboard"
            style={{
              padding: "9px 22px",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#AA2DFF",
              border: "1px solid rgba(170,45,255,0.35)",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            PUBLISH A SHOW
          </Link>
        </div>
      </section>

      <ShowsReleasesMarquee zone="concerts-page" showBrowseAll={false} limit={48} />
    </main>
  );
}
