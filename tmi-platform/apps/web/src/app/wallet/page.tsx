"use client";
import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

const TRANSACTIONS = [
  { id: "tx1", label: "Battle Win Bonus", amount: 22.50, type: "credit", date: "May 20, 2026" },
  { id: "tx2", label: "Fan Tip — XR99", amount: 5.00, type: "credit", date: "May 19, 2026" },
  { id: "tx3", label: "NFT Mint Sale", amount: 48.00, type: "credit", date: "May 18, 2026" },
  { id: "tx4", label: "Beat Sale — Mako collab", amount: 15.00, type: "credit", date: "May 17, 2026" },
  { id: "tx5", label: "Subscription Fee", amount: -9.99, type: "debit", date: "May 1, 2026" },
];

export default function WalletPage() {
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutStatus, setPayoutStatus] = useState("");
  const balance = TRANSACTIONS.reduce((acc, t) => acc + t.amount, 0);

  const handlePayout = () => {
    const amt = parseFloat(payoutAmount);
    if (!amt || amt < 20) { setPayoutStatus("Minimum payout is $20.00"); return; }
    if (amt > balance) { setPayoutStatus("Insufficient balance."); return; }
    setPayoutStatus(`Payout of $${amt.toFixed(2)} requested. Processing in 2-3 business days.`);
    setPayoutAmount("");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/performer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Performer Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>EARNINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>My Wallet</h1>

        {/* Balance card */}
        <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(0,255,255,0.08))", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Available Balance</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#22c55e" }}>${balance.toFixed(2)}</div>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} type="number" min="20" placeholder="Amount (min $20)" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, width: 180 }} />
            <button onClick={handlePayout} style={{ padding: "10px 24px", borderRadius: 8, background: "#22c55e", color: "#05060c", fontWeight: 800, fontSize: 13, cursor: "pointer", border: "none" }}>Request Payout</button>
          </div>
          {payoutStatus && <div style={{ marginTop: 12, fontSize: 12, color: payoutStatus.includes("Processing") ? "#22c55e" : "#ef4444" }}>{payoutStatus}</div>}
        </div>

        {/* Transaction history */}
        <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 12 }}>TRANSACTION HISTORY</div>
        <div style={{ display: "grid", gap: 8 }}>
          {TRANSACTIONS.map((t) => (
            <div key={t.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{t.date}</div>
              </div>
              <span style={{ fontWeight: 800, fontSize: 14, color: t.type === "credit" ? "#22c55e" : "#ef4444" }}>{t.type === "credit" ? "+" : ""}${Math.abs(t.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/earnings" style={{ fontSize: 12, color: "#22c55e", textDecoration: "none", fontWeight: 700 }}>Full Earnings Report →</Link>
          <Link href="/tax-info" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Tax Info</Link>
          <Link href="/payouts" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Payout History</Link>
        </div>
      </div>
    </main>
  );
}
