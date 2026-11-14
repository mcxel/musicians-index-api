"use client";

import { useState } from "react";

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
  /** Performer user id or slug — required for Stripe tip checkout. */
  recipientId?: string;
  artistSlug?: string;
  roomId?: string;
  disabled?: boolean;
}

/**
 * TipButtons — Stripe Checkout via POST /api/tips.
 * Rule 20: no fake "TIP SENT", no fire-and-forget tmi:tip, no PayPalme invent.
 */
export function TipButtons({
  userTier = "FREE",
  recipientId,
  artistSlug,
  roomId,
  disabled,
}: TipButtonsProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockedHint, setLockedHint] = useState<number | null>(null);

  const discount = TIER_DISCOUNTS[userTier];
  const maxTip = TIER_MAX_TIP[userTier];
  const tipKey = (artistSlug || recipientId || "").trim();

  async function handleTip(baseAmount: number) {
    if (disabled) return;
    if (!tipKey) {
      setStatus("error");
      setErrorMsg("Tip unavailable — no recipient bound.");
      return;
    }
    if (baseAmount > maxTip) {
      setLockedHint(baseAmount);
      setTimeout(() => setLockedHint(null), 3000);
      return;
    }

    const finalAmount = +(baseAmount * (1 - discount)).toFixed(2);
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(artistSlug ? { artistSlug } : { recipientId }),
          amount: finalAmount,
          ...(roomId ? { roomId } : {}),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setStatus("error");
        setErrorMsg(
          data.error ??
            (data.code === "STRIPE_NOT_CONFIGURED"
              ? "Tips unavailable — payments not configured."
              : "Could not start tip checkout."),
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setStatus("error");
      setErrorMsg("Network error — tip not sent.");
    }
  }

  if (!tipKey) {
    return (
      <div data-testid="tip-buttons-unavailable" style={{ fontFamily: "monospace", fontSize: 12, color: MUTED }}>
        Tip checkout unavailable — recipient not bound.
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "monospace" }} data-testid="tip-buttons">
      {discount > 0 && (
        <div style={{ marginBottom: 10, fontSize: 11, color: CYAN }}>
          {userTier}: {Math.round(discount * 100)}% tip discount active
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
        {TIP_AMOUNTS.map((amount) => {
          const locked = amount > maxTip;
          const final = +(amount * (1 - discount)).toFixed(2);
          return (
            <button
              key={amount}
              type="button"
              onClick={() => void handleTip(amount)}
              disabled={!!disabled || status === "loading"}
              style={{
                background: locked ? "#1a1a2e" : "#0a1a2e",
                color: locked ? MUTED : GOLD,
                border: `1px solid ${locked ? "#333" : GOLD}`,
                borderRadius: 8,
                padding: "9px 14px",
                cursor: locked || disabled || status === "loading" ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 700,
                opacity: locked || disabled ? 0.5 : 1,
              }}
            >
              {locked ? "🔒" : "$"}
              {amount}
              {discount > 0 && !locked && final !== amount && (
                <span style={{ display: "block", fontSize: 9, color: CYAN, fontWeight: 400, marginTop: 1 }}>
                  pay ${final}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {status === "loading" && (
        <div style={{ marginTop: 10, color: CYAN, fontSize: 12, fontWeight: 700 }}>
          Opening Stripe Checkout…
        </div>
      )}

      {errorMsg && (
        <div data-testid="tip-buttons-error" style={{ marginTop: 10, color: "#FF6B9A", fontSize: 12 }}>
          {errorMsg}
        </div>
      )}

      {lockedHint !== null && (
        <div style={{ marginTop: 10, background: "#1a1a0a", border: "1px solid #ffd70044", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
          <span style={{ color: GOLD, fontWeight: 700 }}>
            Upgrade to {TIER_NEXT[userTier] ?? "DIAMOND"} to unlock ${lockedHint} tips —{" "}
          </span>
          <a href="/pricing" style={{ color: CYAN, textDecoration: "none" }}>Upgrade →</a>
        </div>
      )}
    </div>
  );
}
