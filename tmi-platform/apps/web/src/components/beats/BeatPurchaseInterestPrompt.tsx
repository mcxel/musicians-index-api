"use client";

/**
 * Non-blocking “Want to purchase this beat?” prompt after a featured play.
 * 1 interested buyer → Stripe checkout at maker price.
 * 2+ → auction mode → winner pays winning bid via Stripe.
 * Fee: SPLIT_PRESETS.beat (shown in fee line, not on stage overlay).
 */

import { useCallback, useEffect, useState } from "react";
import { getBeatFeeLabel } from "@/lib/beats/BeatPurchaseInterestEngine";

type FeaturedRow = {
  beatId: string;
  beatTitle: string;
  broadcastTag: string;
  listPriceCents: number;
  mode: string;
  auctionId?: string;
  interests: { userId: string }[];
};

export default function BeatPurchaseInterestPrompt() {
  const [row, setRow] = useState<FeaturedRow | null>(null);
  const [dismissed, setDismissed] = useState<Record<string, true>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [bidDollars, setBidDollars] = useState("");
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [mode, setMode] = useState<"direct" | "auction" | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/beats/interest", { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { ok?: boolean; featured?: FeaturedRow[] };
      const next = (data.featured ?? []).find((f) => !dismissed[f.beatId]);
      setRow(next ?? null);
      if (next?.auctionId) setAuctionId(next.auctionId);
      if (next?.mode === "auction") setMode("auction");
    } catch {
      /* keep */
    }
  }, [dismissed]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 12_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  if (!row) return null;

  const priceLabel = `$${(row.listPriceCents / 100).toFixed(2)}`;

  async function onInterest() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/beats/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "interest", beatId: row!.beatId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        mode?: "direct" | "auction";
        auction?: { auctionId: string };
        listPriceCents?: number;
      };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Could not register interest");
        setBusy(false);
        return;
      }
      setMode(data.mode ?? "direct");
      if (data.mode === "direct") {
        await startCheckout(row!.listPriceCents, "non_exclusive");
      } else if (data.auction?.auctionId) {
        setAuctionId(data.auction.auctionId);
        setMsg("Auction open — highest bid wins, then Stripe checkout.");
        setBidDollars(((data.listPriceCents ?? row!.listPriceCents) / 100 + 5).toFixed(2));
      }
    } catch {
      setMsg("Network error");
    }
    setBusy(false);
  }

  async function startCheckout(amountCents: number, licenseType: string, auction?: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/beats/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          beatId: row!.beatId,
          licenseType,
          price: amountCents,
          auctionId: auction,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (res.status === 503) {
        setMsg(data.error ?? "Payments not configured (Stripe keys missing).");
        setBusy(false);
        return;
      }
      if (!res.ok || !data.url) {
        setMsg(data.error ?? "Checkout unavailable");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setMsg("Checkout failed");
      setBusy(false);
    }
  }

  async function onBid() {
    if (!auctionId) return;
    const cents = Math.round(parseFloat(bidDollars) * 100);
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/beats/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "bid", auctionId, amountCents: cents }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Bid failed");
        setBusy(false);
        return;
      }
      setMsg(`Bid locked at $${(cents / 100).toFixed(2)}. Settle when ready.`);
    } catch {
      setMsg("Bid failed");
    }
    setBusy(false);
  }

  async function onSettleWinner() {
    if (!auctionId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/beats/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "settle", auctionId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        checkoutCents?: number;
        winnerUserId?: string;
      };
      if (!res.ok || !data.ok || !data.checkoutCents) {
        setMsg(data.error ?? "Settle failed");
        setBusy(false);
        return;
      }
      await startCheckout(data.checkoutCents, "exclusive", auctionId);
    } catch {
      setMsg("Settle failed");
      setBusy(false);
    }
  }

  return (
    <div
      data-beat-purchase-interest
      style={{
        position: "fixed",
        right: 16,
        bottom: 88,
        zIndex: 60,
        width: 300,
        padding: 14,
        borderRadius: 12,
        background: "rgba(8,6,20,0.94)",
        border: "1px solid rgba(0,255,255,0.35)",
        boxShadow: "0 0 28px rgba(255,45,170,0.2)",
        backdropFilter: "blur(12px)",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "#00FFFF" }}>
          BEAT DROP · BUY?
        </div>
        <button
          type="button"
          onClick={() => setDismissed((d) => ({ ...d, [row.beatId]: true }))}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, marginTop: 6 }}>{row.beatTitle}</div>
      <div style={{ fontSize: 11, color: "#FFD700", marginTop: 2 }}>{row.broadcastTag}</div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: "8px 0" }}>
        Want to purchase this beat? List price {priceLabel}.
      </p>
      {mode !== "auction" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void onInterest()}
          style={{
            width: "100%",
            padding: "9px 0",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(90deg,#00FFFF,#FF2DAA)",
            color: "#050310",
            fontWeight: 900,
            fontSize: 11,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy ? "…" : "I'M INTERESTED"}
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            type="number"
            min={0.99}
            step={1}
            value={bidDollars}
            onChange={(e) => setBidDollars(e.target.value)}
            placeholder="Your bid (USD)"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 12,
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void onBid()}
            style={{
              padding: "8px 0",
              borderRadius: 6,
              border: "none",
              background: "#FFD700",
              color: "#050310",
              fontWeight: 900,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            PLACE BID
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onSettleWinner()}
            style={{
              padding: "8px 0",
              borderRadius: 6,
              border: "1px solid rgba(0,255,255,0.4)",
              background: "transparent",
              color: "#00FFFF",
              fontWeight: 800,
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            SETTLE WINNER → STRIPE
          </button>
        </div>
      )}
      {msg ? <p style={{ margin: "8px 0 0", fontSize: 11, color: "#FF6B9A" }}>{msg}</p> : null}
      <p style={{ margin: "8px 0 0", fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.35 }}>
        {getBeatFeeLabel()}
      </p>
    </div>
  );
}
