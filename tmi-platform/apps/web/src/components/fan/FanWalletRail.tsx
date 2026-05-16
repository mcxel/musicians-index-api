// Fan Wallet Rail — displays tip balance, vote credits, and transaction history.
// Server component.

import Link from "next/link";

interface WalletTransaction {
  id: string;
  label: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
}

interface FanWalletRailProps {
  tipBalance: number;
  voteCredits: number;
  transactions?: WalletTransaction[];
  fanSlug: string;
}

const ACCENT = "#FFD700";

export default function FanWalletRail({
  tipBalance,
  voteCredits,
  transactions = [],
  fanSlug,
}: FanWalletRailProps) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.28em",
            color: ACCENT,
            textTransform: "uppercase",
          }}
        >
          Wallet
        </span>
        <Link
          href={`/fans/${fanSlug}/wallet`}
          style={{
            fontSize: 7,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Manage →
        </Link>
      </div>

      {/* Balance cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            border: `1px solid ${ACCENT}30`,
            background: `${ACCENT}08`,
          }}
        >
          <p style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.22em", color: ACCENT, textTransform: "uppercase", margin: "0 0 6px" }}>
            Tip Balance
          </p>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>
            ${tipBalance.toFixed(2)}
          </p>
        </div>
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <p style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", margin: "0 0 6px" }}>
            Vote Credits
          </p>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>
            {voteCredits.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {transactions.slice(0, 5).map((tx, i) => (
            <div
              key={tx.id}
              style={{
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: i < Math.min(transactions.length, 5) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0 }}>{tx.label}</p>
                <p style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", margin: 0 }}>{tx.date}</p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: tx.type === "credit" ? "#4ade80" : "#f87171",
                }}
              >
                {tx.type === "credit" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
