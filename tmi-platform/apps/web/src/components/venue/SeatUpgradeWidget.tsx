"use client";
/**
 * SeatUpgradeWidget — microtransaction seat upgrade system
 * Each click → Stripe Checkout → seat ownership update → audience refresh
 * Seat prices already live in Stripe (created 2026-05-25)
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

const SEAT_UPGRADES = [
  { id: "seat_1",     label: "Move Up 1 Row",    price: 1,  cents: 100,  emoji: "⬆️",  color: "#00FFFF",  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEAT_1     ?? "price_1Tb13rEAwH1Fjtu9W8hkZoAK", desc: "Slide one row closer to the stage" },
  { id: "seat_5",     label: "Move Up 5 Rows",   price: 4,  cents: 400,  emoji: "🚀",  color: "#00FF88",  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEAT_5     ?? "price_1Tb13qEAwH1Fjtu9NPlYgq4C", desc: "Jump 5 rows toward the action" },
  { id: "seat_front", label: "Front Section",    price: 10, cents: 1000, emoji: "🎯",  color: "#FFD700",  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEAT_FRONT ?? "price_1Tb13qEAwH1Fjtu9Rmyd3uH4", desc: "Front section — best view in the house" },
  { id: "seat_vip",   label: "VIP Seat Jump",    price: 20, cents: 2000, emoji: "💎",  color: "#AA2DFF",  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEAT_VIP   ?? "price_1Tb13pEAwH1Fjtu9JSvCEHqR", desc: "Reserved VIP section with premium perks" },
];

interface Props {
  roomId: string;
  currentRow?: number;
  currentSeat?: string;
  accentColor?: string;
  compact?: boolean;
}

export default function SeatUpgradeWidget({ roomId, currentRow, currentSeat, accentColor = "#00FFFF", compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [upgraded, setUpgraded] = useState<string | null>(null);

  async function handleUpgrade(upgrade: typeof SEAT_UPGRADES[0]) {
    setLoading(upgrade.id);
    const params = new URLSearchParams({
      priceId: upgrade.priceId,
      amount: String(upgrade.cents),
      productName: `TMI Seat Upgrade: ${upgrade.label}`,
      mode: "payment",
    });
    if (currentSeat) params.set("currentSeat", currentSeat);
    params.set("roomId", roomId);
    params.set("upgradeType", upgrade.id);
    router.push(`/api/stripe/checkout?${params.toString()}`);
  }

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", fontWeight: 700 }}>UPGRADE SEAT:</span>
        {SEAT_UPGRADES.map(u => (
          <button key={u.id} onClick={() => handleUpgrade(u)} disabled={!!loading} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${u.color}44`, background: `${u.color}12`, color: u.color, fontSize: 9, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading === u.id ? 0.5 : 1, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            {u.emoji} ${u.price}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: "rgba(5,5,16,0.95)", border: `1px solid ${accentColor}22`, borderRadius: 16, padding: "18px 20px", backdropFilter: "blur(16px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: accentColor, fontWeight: 900 }}>SEAT UPGRADE</div>
          {currentSeat && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Current: {currentSeat}</div>}
        </div>
        <span style={{ fontSize: 20 }}>💺</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SEAT_UPGRADES.map(u => (
          <button
            key={u.id}
            onClick={() => handleUpgrade(u)}
            disabled={!!loading || upgraded === u.id}
            style={{
              padding: "12px 10px", borderRadius: 12, border: `1.5px solid ${u.color}33`,
              background: upgraded === u.id ? `${u.color}20` : `${u.color}08`,
              color: "#fff", cursor: loading || upgraded === u.id ? "not-allowed" : "pointer",
              textAlign: "left", transition: "all 0.15s", opacity: loading === u.id ? 0.6 : 1,
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{u.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: u.color, marginBottom: 2 }}>{u.label}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 6, lineHeight: 1.3 }}>{u.desc}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: u.color }}>
              ${u.price}
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
        Secured by Stripe · Seat updates instantly after payment
      </div>
    </div>
  );
}
