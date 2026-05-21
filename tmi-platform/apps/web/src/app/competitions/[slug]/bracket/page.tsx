import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Competition Bracket · The Musician's Index" };

const ROUNDS = [
  { round: "Round of 16", matches: [["Nova Cipher", "Raze K"], ["Mako Beats", "SunStreak"], ["K1 Flair", "XR99"], ["DJ Floss", "Lena P"]] },
  { round: "Quarterfinals", matches: [["Nova Cipher", "Mako Beats"], ["K1 Flair", "DJ Floss"]] },
  { round: "Semifinals", matches: [["Nova Cipher", "K1 Flair"]] },
];

interface Props { params: Promise<{ slug: string }> }

export default async function BracketPage({ params }: Props) {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href={`/competitions/${slug}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← {title}</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>BRACKET</div>
        <h1 style={{ fontSize: "clamp(20px,4vw,32px)", fontWeight: 900, margin: "0 0 28px" }}>{title}</h1>
        <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 16 }}>
          {ROUNDS.map((r) => (
            <div key={r.round} style={{ minWidth: 220 }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.15em", marginBottom: 12 }}>{r.round.toUpperCase()}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {r.matches.map((m, i) => (
                  <div key={i} style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{m[0]}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>VS</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{m[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ minWidth: 220 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.15em", marginBottom: 12 }}>FINAL</div>
            <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 10, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🏆</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>To be determined</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
