import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Write for TMI | The Musician's Index",
  description: "Submit articles, earn per read, and get paid based on engagement. Artist spotlights, news, and sponsor features.",
};

const LEVELS = [
  { level: "new-contributor", label: "New Contributor", trustScore: 25, basePay: "$6/article", unlock: "Submit articles for review", color: "#888" },
  { level: "verified-contributor", label: "Verified Contributor", trustScore: 60, basePay: "$12/article", unlock: "Priority queue, artist slugs", color: "#00FFFF" },
  { level: "trusted-editor", label: "Trusted Editor", trustScore: 80, basePay: "$18/article", unlock: "Can approve submissions", color: "#AA2DFF" },
  { level: "staff-editor", label: "Staff Editor", trustScore: 95, basePay: "$18 + bonus", unlock: "Full editorial access", color: "#FFD700" },
];

const CATEGORIES = [
  { id: "news", label: "TMI News", desc: "Platform updates, contest results, announcements.", color: "#FFD700" },
  { id: "artist", label: "Artist Spotlight", desc: "Deep-dive features on artists in the TMI ecosystem.", color: "#00FFFF" },
  { id: "performer", label: "Performer Feature", desc: "Interview and profile pieces on performers.", color: "#FF2DAA" },
  { id: "sponsor", label: "Partner Feature", desc: "Sponsored editorial for verified TMI partners.", color: "#AA2DFF" },
  { id: "interview", label: "TMI Interview", desc: "Q&A format with artists, hosts, and industry figures.", color: "#00FF88" },
];

export default function WritersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "60px 24px 44px", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>TMI EDITORIAL PROGRAM</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 14 }}>Write. Earn. Get Credited.</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Submit articles to TMI Magazine and earn per verified read. Artist spotlights, platform news, interviews. Your credit shows every time your article appears.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/writers/signup" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 10, textDecoration: "none" }}>
            JOIN AS CONTRIBUTOR →
          </Link>
          <Link href="/writers/submit" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 10, textDecoration: "none" }}>
            SUBMIT ARTICLE
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 24 }}>CONTRIBUTOR LEVELS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {LEVELS.map((lvl) => (
            <div key={lvl.level} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${lvl.color}25`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: lvl.color, letterSpacing: "0.1em", marginBottom: 6 }}>{lvl.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{lvl.basePay}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>Trust ≥ {lvl.trustScore}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{lvl.unlock}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 24 }}>ARTICLE CATEGORIES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: `1px solid ${cat.color}20`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ width: 3, flexShrink: 0, borderRadius: 2, background: cat.color, alignSelf: "stretch" }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: cat.color, marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 0" }}>
        <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>HOW PAYOUTS WORK</div>
          {[
            { label: "Base rate", value: "$6–$18 per approved article" },
            { label: "Engagement bonus", value: "Up to $220 extra based on verified reads" },
            { label: "Sponsor share", value: "20% of sponsor revenue attached to your article" },
            { label: "Payout cap", value: "$500–$3,000/month depending on level" },
            { label: "Suspicious traffic", value: "Flagged reads excluded from calculations" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "right", maxWidth: "55%" }}>{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 0", textAlign: "center" }}>
        <Link href="/writers/dashboard" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 2 }}>
          Already a contributor? View your dashboard →
        </Link>
      </section>
    </main>
  );
}
