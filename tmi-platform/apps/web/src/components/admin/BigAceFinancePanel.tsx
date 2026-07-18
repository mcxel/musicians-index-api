"use client";

import { useMemo, useState } from "react";
import { BIG_ACE_PREAPPROVED_ACHIEVEMENTS } from "@/lib/bots/bigAceAchievementRegistry";
import {
  APPROVED_USE_CATEGORIES,
  BIG_ACE_ALLOCATION_PERCENT,
  allocateBigAceReinvestment,
  requestReinvestmentSpend,
} from "@/lib/finance/bigAceReinvestmentEngine";
import { getAllCoffersBalances, getLedgerEntries } from "@/lib/finance/businessCoffersLedger";

export default function BigAceFinancePanel() {
  const [businessId] = useState("berntoutglobal-core");
  const [lastAction, setLastAction] = useState("No financial actions yet.");

  const initializeAllocation = () => {
    const result = allocateBigAceReinvestment(businessId, 100000, "big-ace");
    setLastAction(`Allocated ${result.allocation.toFixed(2)} into coffers.`);
  };

  const simulateUnauthorizedSpend = () => {
    const result = requestReinvestmentSpend({
      businessId,
      actor: "big-ace",
      category: "cashout" as string,
      amount: 500,
      note: "Attempt user payout cashout bypass",
    });
    setLastAction(result.reason);
  };

  const balances = useMemo(() => getAllCoffersBalances(), [lastAction]);
  const entries = useMemo(() => getLedgerEntries().slice(0, 8), [lastAction]);

  return (
    <div
      data-testid="big-ace-finance-panel"
      style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Member avatars */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px" }}>
        {[
          { name: "Ace", role: "Owner" },
          { name: "Max", role: "Developer" },
          { name: "Lil Sis", role: "Moderator" },
          { name: "NOVA", role: "AI Member" }
        ].map((member) => (
          <div key={member.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "2px solid #D4AF37",
              background: "linear-gradient(135deg, #FFD700, #B8860B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 8px rgba(255,215,0,0.3)"
            }}>
              <span style={{ fontSize: 13 }}>👤</span>
            </div>
            <span style={{ fontSize: 8, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase" }}>{member.name}</span>
          </div>
        ))}
      </div>
      
      {/* Tiny reinvestment metrics */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "rgba(255,255,255,0.4)", borderTop: "1px solid rgba(255,215,0,0.1)", paddingTop: 6 }}>
        <span>COFFERS BALANCE: 44.1M</span>
        <span style={{ color: "#00FF88" }}>ACTIVE</span>
      </div>
    </div>
  );
}
