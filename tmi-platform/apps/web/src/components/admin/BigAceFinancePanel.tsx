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
    <section
      data-testid="big-ace-finance-panel"
      style={{ border: "1px solid rgba(148,163,184,0.4)", borderRadius: 12, padding: 12, background: "rgba(2,6,23,0.72)" }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8, color: "#fcd34d", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
        Big Ace 10% Reinvestment Governance
      </h3>

      <div data-testid="big-ace-allocation" style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
        Allocation policy: {(BIG_ACE_ALLOCATION_PERCENT * 100).toFixed(0)}% reinvestment hold to BerntoutGlobal coffers.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button type="button" data-testid="big-ace-init-allocation" onClick={initializeAllocation}>
          Initialize 10% Allocation
        </button>
        <button type="button" data-testid="big-ace-unauthorized-spend" onClick={simulateUnauthorizedSpend}>
          Attempt Unauthorized Spend
        </button>
      </div>

      <div data-testid="big-ace-finance-action-log" style={{ fontSize: 12, color: "#7dd3fc", marginBottom: 10 }}>
        Financial action log: {lastAction}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
        <article data-testid="big-ace-coffers-balance" style={{ border: "1px solid rgba(56,189,248,0.35)", borderRadius: 10, padding: 8 }}>
          <strong style={{ fontSize: 11, color: "#bfdbfe" }}>Coffers Balance</strong>
          <pre style={{ margin: "6px 0 0", fontSize: 11, whiteSpace: "pre-wrap", color: "#e2e8f0" }}>{JSON.stringify(balances, null, 2)}</pre>
        </article>

        <article data-testid="big-ace-approved-categories" style={{ border: "1px solid rgba(74,222,128,0.35)", borderRadius: 10, padding: 8 }}>
          <strong style={{ fontSize: 11, color: "#bbf7d0" }}>Approved Use Categories</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 11, color: "#e2e8f0" }}>
            {APPROVED_USE_CATEGORIES.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </article>
      </div>

      <article data-testid="big-ace-achievement-progress" style={{ marginTop: 10, border: "1px solid rgba(250,204,21,0.35)", borderRadius: 10, padding: 8 }}>
        <strong style={{ fontSize: 11, color: "#fde68a" }}>Achievement Progress</strong>
        <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 11, color: "#e2e8f0" }}>
          {BIG_ACE_PREAPPROVED_ACHIEVEMENTS.map((achievement) => (
            <li key={achievement.id}>{achievement.title} - {achievement.progress}</li>
          ))}
        </ul>
      </article>

      <article data-testid="big-ace-ledger-entries" style={{ marginTop: 10, border: "1px solid rgba(167,139,250,0.35)", borderRadius: 10, padding: 8 }}>
        <strong style={{ fontSize: 11, color: "#ddd6fe" }}>Big Ace Reinvestment Ledger</strong>
        <pre style={{ margin: "6px 0 0", fontSize: 11, whiteSpace: "pre-wrap", color: "#e2e8f0" }}>{JSON.stringify(entries, null, 2)}</pre>
      </article>

      <p data-testid="big-ace-policy-status" style={{ marginBottom: 0, marginTop: 8, fontSize: 11, color: "#fca5a5" }}>
        Big Ace Financial Policy: 10% is a reinvestment reserve for BerntoutGlobal LLC / BerntoutGlobal.com, auditable and visible to Marcel/root.
      </p>
    </section>
  );
}
