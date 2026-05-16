"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface WalletBalanceProps {
  compact?: boolean;
  showPoints?: boolean;
}

export default function WalletBalance({ compact = false, showPoints = true }: WalletBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [points,  setPoints]  = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/rewards")
      .then(r => r.json())
      .then((d: unknown) => {
        const data = d as { balance?: number; points?: number };
        setBalance(data.balance ?? 0);
        setPoints(data.points ?? 0);
      })
      .catch(() => { setBalance(0); setPoints(0); });
  }, []);

  if (balance === null) {
    return <div style={{ width:60, height:20, background:"rgba(255,255,255,0.06)", borderRadius:4, animation:"pulse 1.5s infinite" }} />;
  }

  if (compact) {
    return (
      <Link href="/wallet" aria-label="View wallet" style={{ display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#00FF88" }}>${(balance/100).toFixed(2)}</span>
        {showPoints && <span style={{ fontSize:9, color:"rgba(255,213,0,0.7)" }}>· {points?.toLocaleString()} XP</span>}
      </Link>
    );
  }

  return (
    <Link href="/wallet" aria-label="View wallet" style={{ display:"flex", gap:10, textDecoration:"none" }}>
      <div style={{ padding:"6px 12px", background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.2)", borderRadius:7 }}>
        <div style={{ fontSize:7, letterSpacing:"0.12em", color:"rgba(0,255,136,0.6)", fontWeight:700 }}>BALANCE</div>
        <div style={{ fontSize:13, fontWeight:900, color:"#00FF88" }}>${(balance/100).toFixed(2)}</div>
      </div>
      {showPoints && (
        <div style={{ padding:"6px 12px", background:"rgba(255,213,0,0.06)", border:"1px solid rgba(255,213,0,0.15)", borderRadius:7 }}>
          <div style={{ fontSize:7, letterSpacing:"0.12em", color:"rgba(255,213,0,0.5)", fontWeight:700 }}>XP POINTS</div>
          <div style={{ fontSize:13, fontWeight:900, color:"#FFD700" }}>{points?.toLocaleString()}</div>
        </div>
      )}
    </Link>
  );
}
