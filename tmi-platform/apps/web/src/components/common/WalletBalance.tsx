"use client";
import Link from "next/link";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";

interface WalletBalanceProps {
  compact?: boolean;
  showPoints?: boolean;
}

export default function WalletBalance({ compact = false, showPoints = true }: WalletBalanceProps) {
  const { walletCredits, totalXp } = useGamificationEngine();

  if (compact) {
    return (
      <Link href="/wallet" aria-label="View wallet" style={{ display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#00FF88" }}>{walletCredits.toLocaleString()} cr</span>
        {showPoints && <span style={{ fontSize:9, color:"rgba(255,213,0,0.7)" }}>· {totalXp.toLocaleString()} XP</span>}
      </Link>
    );
  }

  return (
    <Link href="/wallet" aria-label="View wallet" style={{ display:"flex", gap:10, textDecoration:"none" }}>
      <div style={{ padding:"6px 12px", background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.2)", borderRadius:7 }}>
        <div style={{ fontSize:7, letterSpacing:"0.12em", color:"rgba(0,255,136,0.6)", fontWeight:700 }}>CREDITS</div>
        <div style={{ fontSize:13, fontWeight:900, color:"#00FF88" }}>{walletCredits.toLocaleString()}</div>
      </div>
      {showPoints && (
        <div style={{ padding:"6px 12px", background:"rgba(255,213,0,0.06)", border:"1px solid rgba(255,213,0,0.15)", borderRadius:7 }}>
          <div style={{ fontSize:7, letterSpacing:"0.12em", color:"rgba(255,213,0,0.5)", fontWeight:700 }}>XP POINTS</div>
          <div style={{ fontSize:13, fontWeight:900, color:"#FFD700" }}>{totalXp.toLocaleString()}</div>
        </div>
      )}
    </Link>
  );
}
