import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

const PRIZES: Record<string, {
  label: string; amount: string; type: string; icon: string;
  color: string; desc: string; source: string; claimable: boolean;
}> = {
  p1: { label: "Grand Prize: Season Pass + $500",  amount: "$500 + Season Pass", type: "GRAND",     icon: "🏆", color: "#FFD700", desc: "The grand prize for Season 1 Grand Contest winners. Includes a full Season Pass plus $500 direct payout via Stripe Connect.", source: "TMI Grand Contest S1", claimable: false },
  p2: { label: "2nd Place: Artist Feature Slot",  amount: "Feature Placement",   type: "FEATURE",   icon: "⭐", color: "#00FFFF", desc: "A 7-day featured artist slot on the TMI homepage and magazine. Estimated organic reach: 80,000+ impressions.", source: "TMI Contest", claimable: true },
  p3: { label: "3rd Place: Emote Pack + 5000 XP", amount: "5,000 XP + Emotes",   type: "XP",        icon: "✨", color: "#AA2DFF", desc: "An exclusive Emote Pack plus 5,000 platform XP credited directly to your account.", source: "TMI Contest", claimable: true },
  p4: { label: "Weekly Gift: Sponsor Giveaway",   amount: "Variable",            type: "SPONSORED", icon: "🎁", color: "#00FF88", desc: "Weekly sponsored giveaway prize. Amount and items vary by sponsor. This week: $100 store credit.", source: "PrimeWave Sponsor", claimable: true },
};

export async function generateStaticParams() {
  return Object.keys(PRIZES).map(id => ({ id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const prize = PRIZES[id];
  if (!prize) return { title: "Prize Not Found | TMI" };
  return { title: `${prize.label} | TMI Prizes`, description: prize.desc };
}

export default async function PrizeDetailPage({ params }: Props) {
  const { id } = await params;
  const prize = PRIZES[id];
  if (!prize) return notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/prizes" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← PRIZES
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", padding: "40px 0 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 32 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{prize.icon}</div>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: prize.color, border: `1px solid ${prize.color}40`, borderRadius: 4, padding: "4px 12px" }}>
            {prize.type}
          </span>
          <h1 style={{ fontSize: "clamp(1.2rem,3.5vw,1.8rem)", fontWeight: 900, lineHeight: 1.3, marginTop: 16, marginBottom: 8 }}>
            {prize.label}
          </h1>
          <div style={{ fontSize: 22, fontWeight: 900, color: prize.color }}>{prize.amount}</div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 12 }}>ABOUT THIS PRIZE</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>{prize.desc}</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>SOURCE</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{prize.source}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>STATUS</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: prize.claimable ? "#00FF88" : "#FFD700" }}>
                {prize.claimable ? "CLAIMABLE" : "PENDING WINNER"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {prize.claimable ? (
            <Link href="/rewards/claims" style={{ flex: 1, display: "block", textAlign: "center", padding: "13px 0", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: `linear-gradient(135deg,${prize.color},${prize.color}99)`, borderRadius: 10, textDecoration: "none" }}>
              CLAIM PRIZE
            </Link>
          ) : (
            <div style={{ flex: 1, textAlign: "center", padding: "13px 0", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
              NOT YET AVAILABLE
            </div>
          )}
          <Link href="/prizes" style={{ padding: "13px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, textDecoration: "none" }}>
            ALL PRIZES
          </Link>
        </div>
      </div>
    </main>
  );
}
