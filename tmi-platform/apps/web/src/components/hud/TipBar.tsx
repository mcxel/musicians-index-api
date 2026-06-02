"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TIP_AMOUNTS = [
  { label: "$1",  cents: 100,  color: "#00FFFF", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TIP_1   ?? "price_tip_1"   },
  { label: "$5",  cents: 500,  color: "#00FF88", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TIP_5   ?? "price_tip_5"   },
  { label: "$10", cents: 1000, color: "#FFD700", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TIP_10  ?? "price_tip_10"  },
  { label: "$20", cents: 2000, color: "#AA2DFF", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TIP_20  ?? "price_tip_20"  },
  { label: "$50", cents: 5000, color: "#FF2DAA", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TIP_50  ?? "price_tip_50"  },
];

interface Props {
  performerId: string;
  performerName: string;
  roomId?: string;
  accentColor?: string;
  compact?: boolean;
}

export default function TipBar({ performerId, performerName, roomId = "live", accentColor = "#00FFFF", compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [lastTipped, setLastTipped] = useState<string | null>(null);

  async function handleTip(tip: typeof TIP_AMOUNTS[0]) {
    setLoading(tip.label);
    const params = new URLSearchParams({
      priceId: tip.priceId,
      amount: String(tip.cents),
      productName: `TMI Tip to ${performerName}: ${tip.label}`,
      mode: "payment",
      performerId,
      roomId,
      tipType: "live_tip",
    });
    setLastTipped(tip.label);
    setTimeout(() => setLastTipped(null), 3000);
    router.push(`/api/stripe/checkout?${params.toString()}`);
  }

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", fontWeight: 700, whiteSpace: "nowrap" }}>💰 TIP:</span>
        {TIP_AMOUNTS.map(t => (
          <button
            key={t.label}
            onClick={() => handleTip(t)}
            disabled={!!loading}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: `1px solid ${t.color}44`,
              background: lastTipped === t.label ? `${t.color}30` : `${t.color}12`,
              color: t.color, fontSize: 9, fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading === t.label ? 0.5 : 1,
              letterSpacing: "0.06em", whiteSpace: "nowrap",
              transition: "all 0.15s",
              boxShadow: lastTipped === t.label ? `0 0 10px ${t.color}44` : "none",
            }}
          >
            {lastTipped === t.label ? "✓" : t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(5,5,16,0.95)", border: `1px solid ${accentColor}22`,
      borderRadius: 14, padding: "14px 16px", backdropFilter: "blur(16px)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: accentColor, fontWeight: 900 }}>💰 TIP THE ARTIST</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{performerName}</div>
        </div>
        {lastTipped && (
          <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 900, animation: "none" }}>
            ✓ Tip sent!
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TIP_AMOUNTS.map(t => (
          <button
            key={t.label}
            onClick={() => handleTip(t)}
            disabled={!!loading}
            style={{
              flex: 1, minWidth: 48, padding: "10px 6px",
              borderRadius: 10, border: `1.5px solid ${t.color}33`,
              background: lastTipped === t.label ? `${t.color}22` : `${t.color}0A`,
              color: t.color, cursor: loading ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 900, letterSpacing: "0.04em",
              transition: "all 0.15s",
              boxShadow: lastTipped === t.label ? `0 0 14px ${t.color}44` : "none",
              opacity: loading === t.label ? 0.5 : 1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 8, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
        Secured by Stripe · Tips go directly to the artist
      </div>
    </div>
  );
}
