"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  userId?: string;
  initialBalance?: number;
  accentColor?: string;
  compact?: boolean;
  showEarn?: boolean;
}

export default function TokenBalance({ userId, initialBalance = 0, accentColor = "#FFD700", compact = false, showEarn = false }: Props) {
  const [balance, setBalance] = useState(initialBalance);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!userId) return;
    async function fetchBalance() {
      try {
        const res = await fetch(`/api/tokens/balance?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.balance !== balance) {
            setBalance(data.balance ?? initialBalance);
            setPulse(true);
            setTimeout(() => setPulse(false), 800);
          }
        }
      } catch {}
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);
    return () => clearInterval(interval);
  }, [userId]);

  if (compact) {
    return (
      <Link href="/rewards" style={{ textDecoration: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 8,
          background: pulse ? `${accentColor}20` : `${accentColor}10`,
          border: `1px solid ${accentColor}33`,
          transition: "background 0.3s",
          cursor: "pointer",
        }}>
          <span style={{ fontSize: 13 }}>🪙</span>
          <span style={{ fontSize: 11, fontWeight: 900, color: accentColor, letterSpacing: "0.04em" }}>
            {balance.toLocaleString()}
          </span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>TMI</span>
        </div>
      </Link>
    );
  }

  return (
    <div style={{
      background: "rgba(5,5,16,0.95)", border: `1px solid ${accentColor}22`,
      borderRadius: 14, padding: "14px 16px", backdropFilter: "blur(16px)",
    }}>
      <div style={{ fontSize: 9, letterSpacing: "0.2em", color: accentColor, fontWeight: 900, marginBottom: 8 }}>
        🪙 TMI TOKEN BALANCE
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
        <span style={{
          fontSize: 32, fontWeight: 900, color: accentColor,
          transition: "transform 0.3s",
          transform: pulse ? "scale(1.1)" : "scale(1)",
          display: "inline-block",
        }}>
          {balance.toLocaleString()}
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>TMI</span>
      </div>
      {showEarn && (
        <div style={{ display: "flex", gap: 6 }}>
          <Link href="/battles" style={{
            flex: 1, padding: "7px", borderRadius: 8,
            background: `${accentColor}10`, border: `1px solid ${accentColor}22`,
            color: accentColor, fontSize: 9, fontWeight: 800, textDecoration: "none",
            textAlign: "center", letterSpacing: "0.06em",
          }}>
            ⚔️ EARN IN BATTLES
          </Link>
          <Link href="/rewards" style={{
            flex: 1, padding: "7px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 800, textDecoration: "none",
            textAlign: "center", letterSpacing: "0.06em",
          }}>
            🎁 REWARDS
          </Link>
        </div>
      )}
    </div>
  );
}
