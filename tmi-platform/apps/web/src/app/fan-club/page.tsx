import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fan Club | TMI",
  description: "Join a TMI artist's fan club. Exclusive content, early access, and direct connection with your favorite artists.",
};

const FEATURED_CLUBS = [
  {
    artist: "Wavetek",       genre: "Trap",      members: "4,200",  tier: "Gold",     price: "$4.99/mo", color: "#FF2DAA", icon: "🎤",
    perks: ["Exclusive room access", "Monthly DM session", "Early beat drops", "Fan-only live streams"],
  },
  {
    artist: "Zuri Bloom",    genre: "Afrobeats", members: "3,100",  tier: "Silver",   price: "$2.99/mo", color: "#00FF88", icon: "🌍",
    perks: ["Behind-the-scenes content", "Monthly Q&A access", "Newsletter + updates"],
  },
  {
    artist: "Neon Vibe",     genre: "House",     members: "8,400",  tier: "Platinum", price: "$7.99/mo", color: "#00FFFF", icon: "🎧",
    perks: ["VIP room front row", "1:1 booking requests", "Exclusive remix packs", "Merch discounts"],
  },
  {
    artist: "Ray Journey",   genre: "Hip-Hop",   members: "6,700",  tier: "Gold",     price: "$4.99/mo", color: "#FFD700", icon: "👑",
    perks: ["Early beat access", "Monthly video drops", "Contest priority voting", "Signed merch giveaways"],
  },
  {
    artist: "Krypt",         genre: "Hip-Hop",   members: "2,900",  tier: "Bronze",   price: "$1.99/mo", color: "#AA2DFF", icon: "🔒",
    perks: ["Exclusive fan badge", "Monthly fan chat", "Priority room seating"],
  },
  {
    artist: "Lena Sky",      genre: "R&B",       members: "5,100",  tier: "Gold",     price: "$4.99/mo", color: "#FF9500", icon: "🎵",
    perks: ["Exclusive acoustic sessions", "Fan club newsletter", "Monthly listening party", "Direct tip boost"],
  },
];

const TIER_COLOR: Record<string, string> = { Bronze: "#CD7F32", Silver: "#C0C0C0", Gold: "#FFD700", Platinum: "#00FFFF" };

export default function FanClubPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>TMI FAN CLUBS</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Fan Clubs</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
          Go deeper with your favorite artists. Exclusive content, direct access, and community — for real fans.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
        {FEATURED_CLUBS.map(club => (
          <div key={club.artist} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${club.color}20`, borderRadius: 14, padding: "22px 20px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, background: `${club.color}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{club.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{club.artist}</div>
                <div style={{ fontSize: 8, color: club.color, marginTop: 2 }}>{club.genre}</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 8, fontWeight: 700, color: TIER_COLOR[club.tier] }}>{club.tier}</div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 5 }}>
              {club.perks.map(p => (
                <li key={p} style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", display: "flex", gap: 7 }}>
                  <span style={{ color: club.color, flexShrink: 0 }}>✓</span>{p}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{club.price}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{club.members} members</div>
              </div>
              <Link
                href={`/api/stripe/checkout?product=FAN_CLUB_${club.artist.toUpperCase().replace(/\s/g,"_")}&mode=subscription`}
                style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: "#050510", background: club.color, borderRadius: 6, padding: "8px 14px", textDecoration: "none" }}
              >
                JOIN
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 680, margin: "48px auto 0", padding: "0 24px", textAlign: "center" }}>
        <div style={{ background: "rgba(255,45,170,0.05)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 14, padding: "24px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#FF2DAA", marginBottom: 8 }}>Are you an artist?</div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
            Launch your own fan club and start earning recurring revenue from your most loyal fans.
          </p>
          <Link href="/artists/dashboard" style={{ display: "inline-block", padding: "10px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#FF2DAA", borderRadius: 7, textDecoration: "none" }}>
            LAUNCH YOUR FAN CLUB →
          </Link>
        </div>
      </section>
    </main>
  );
}
