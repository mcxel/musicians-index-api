"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Quote = {
  ok: boolean;
  productPriceCents: number;
  pointsApplied: number;
  discountCents: number;
  cashChargeCents: number;
  maxRedeemablePoints: number;
  summary: string;
  reason?: string;
  pointsBalance?: number;
};

type Props = {
  productPriceCents: number;
  sellerUserId?: string | null;
  accent?: string;
  onChange?: (pointsToRedeem: number, quote: Quote | null) => void;
};

/** Honest points-for-discount control — never cuts performer payout on list price P. */
export default function PointsDiscountField({
  productPriceCents,
  sellerUserId,
  accent = "#FFD700",
  onChange,
}: Props) {
  const [points, setPoints] = useState(0);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/points/discount-quote", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productPriceCents,
              sellerUserId: sellerUserId ?? undefined,
              pointsToRedeem: points,
            }),
          });
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as Quote & { pointsBalance?: number };
          if (cancelled) return;
          setQuote(data);
          setBalance(data.pointsBalance ?? 0);
          onChange?.(points, data);
        } catch {
          /* ignore */
        }
      })();
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // intentionally omit onChange from deps — parent may pass inline fn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productPriceCents, sellerUserId, points]);

  const max = quote?.maxRedeemablePoints ?? 0;

  return (
    <div
      style={{
        marginBottom: 16,
        padding: "12px 14px",
        borderRadius: 10,
        background: `${accent}10`,
        border: `1px solid ${accent}35`,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.14em", color: accent, fontWeight: 800, marginBottom: 8 }}>
        PAY WITH POINTS (OPTIONAL DISCOUNT)
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10, lineHeight: 1.5 }}>
        Redeem prepaid points for a cash discount. Performer + platform still settle on the full list price —
        discount burns points you already bought.{" "}
        <Link href="/store/points" style={{ color: accent }}>
          Buy points
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <input
          type="range"
          min={0}
          max={Math.max(max, 0)}
          value={Math.min(points, max)}
          onChange={(e) => setPoints(Number(e.target.value))}
          style={{ flex: 1 }}
          disabled={max <= 0}
        />
        <input
          type="number"
          min={0}
          max={max}
          value={points}
          onChange={(e) => setPoints(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          style={{
            width: 72,
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "#050510",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
        Balance {balance.toLocaleString()} pts · Max safe redeem {max.toLocaleString()} pts
      </div>
      {quote && (
        <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
          {quote.summary}
          {quote.reason ? ` · ${quote.reason}` : ""}
        </div>
      )}
    </div>
  );
}
