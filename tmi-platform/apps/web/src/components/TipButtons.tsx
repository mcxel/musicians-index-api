"use client";

import { useState } from "react";

const PAYPAL_HANDLE = process.env.NEXT_PUBLIC_PAYPAL_HANDLE ?? "berntmusic33";

export type UserTier = "FREE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

const TIER_DISCOUNTS: Record<UserTier, number> = {
  FREE: 0,
  SILVER: 0.05,
  GOLD: 0.10,
  PLATINUM: 0.15,
  DIAMOND: 0.20,
};

const TIER_MAX_TIP: Record<UserTier, number> = {
  FREE: 5,
  SILVER: 10,
  GOLD: 25,
  PLATINUM: 50,
  DIAMOND: Infinity,
};

const TIER_NEXT: Partial<Record<UserTier, string>> = {
  FREE: "SILVER",
  SILVER: "GOLD",
  GOLD: "PLATINUM",
  PLATINUM: "DIAMOND",
};

const TIP_AMOUNTS = [1, 5, 10, 25, 50];

const CYAN = "#00e5ff";
const GOLD = "#ffd700";
const MUTED = "#666";

interface TipButtonsProps {
  userTier?: UserTier;
  userId?: string;
  recipientId?: string;
  disabled?: boolean;
}

export function TipButtons({ userTier = "FREE", userId, recipientId, disabled }: TipButtonsProps) {
  const [sent, setSent] = useState(false);
  const [lockedHint, setLockedHint] = useState<number | null>(null);

  const discount = TIER_DISCOUNTS[userTier];
  const maxTip = TIER_MAX_TIP[userTier];

  async function handleTip(baseAmount: number) {
    if (disabled) return;
    if (baseAmount > maxTip) {
      setLockedHint(baseAmount);
      setTimeout(() => setLockedHint(null), 3000);
      return;
    }

    const finalAmount = +(baseAmount * (1 - discount)).toFixed(2);

    fetch("/api/paypal/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId ?? "anonymous",
        amount: Math.round(finalAmount * 100),
        recipientId,
        type: "tip",
      }),
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent("tmi:tip", { detail: { amount: finalAmount, method: "paypal" } }));

    setSent(true);
    window.open(`https://www.paypal.com/paypalme/${PAYPAL_HANDLE}/${finalAmount}`, "_blank");
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div style={{ fontFamily: "monospace" }}>
      {discount > 0 && (
        <div style={{ marginBottom: 10, fontSize: 11, color: CYAN }}>
          ✨ {userTier}: {Math.round(discount * 100)}% tip discount active
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
        {TIP_AMOUNTS.map((amount) => {
          const locked = amount > maxTip;
          const final = +(amount * (1 - discount)).toFixed(2);
          return (
            <button
              key={amount}
              onClick={() => handleTip(amount)}
              disabled={!!disabled}
              style={{
                background: locked ? "#1a1a2e" : sent ? "#0a2a0a" : "#0a1a2e",
                color: locked ? MUTED : sent ? "#00ff88" : GOLD,
                border: `1px solid ${locked ? "#333" : sent ? "#00ff88" : GOLD}`,
                borderRadius: 8,
                padding: "9px 14px",
                cursor: locked || disabled ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 700,
                opacity: locked || disabled ? 0.5 : 1,
              }}
            >
              {locked ? "🔒" : "💸"} ${amount}
              {discount > 0 && !locked && final !== amount && (
                <span style={{ display: "block", fontSize: 9, color: CYAN, fontWeight: 400, marginTop: 1 }}>
                  pay ${final}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {sent && (
        <div style={{ marginTop: 10, color: "#00ff88", fontSize: 12, fontWeight: 700 }}>
          🔥 TIP SENT — PayPal opening...
        </div>
      )}

      {lockedHint !== null && (
        <div style={{ marginTop: 10, background: "#1a1a0a", border: "1px solid #ffd70044", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
          <span style={{ color: GOLD, fontWeight: 700 }}>
            💡 Upgrade to {TIER_NEXT[userTier] ?? "DIAMOND"} to unlock ${lockedHint} tips —{" "}
          </span>
          <a href="/pricing" style={{ color: CYAN, textDecoration: "none" }}>Upgrade →</a>
        </div>
      )}
    </div>
  );
}
