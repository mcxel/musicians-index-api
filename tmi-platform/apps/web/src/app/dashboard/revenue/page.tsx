import Link from "next/link";
import { getRevenueSnapshot, formatCents, getRecentTransactions } from "@/lib/finance/revenueLedger";
import { calculateProfit } from "@/lib/finance/ProfitEngine";
import { calculateAdminSplits } from "@/lib/finance/AdminSplitEngine";

const CYAN = "#00e5ff";
const GOLD = "#ffd700";
const FUCHSIA = "#ff00ff";
const GREEN = "#22C55E";
const RED = "#ff4444";
const MUTED = "#666";

export default function RevenueDashboard() {
  const now = Date.now();
  const dayStart = now - 86_400_000;
  const weekStart = now - 7 * 86_400_000;

  const today = getRevenueSnapshot(dayStart, now);
  const week = getRevenueSnapshot(weekStart, now);
  const allTime = getRevenueSnapshot(0, now);
  const profit = calculateProfit(weekStart, now);
  const adminSplits = calculateAdminSplits(weekStart, now);
  const recent = getRecentTransactions(10);

  const marcelSplit = adminSplits.find((s) => s.recipientId === "admin-owner");

  return (
    <main style={{ background: "#0a0a0f", minHeight: "100vh", color: "#e0e0e0", fontFamily: "monospace" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ marginBottom: 8 }}>
          <Link href="/dashboard" style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>← Dashboard</Link>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: GREEN, margin: "0 0 4px" }}>REVENUE CENTER</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: "0 0 32px" }}>
          Tips · Subscriptions · Beats · Ads · Bookings — live platform splits
        </p>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Today Gross", value: formatCents(today.totalGross), color: CYAN },
            { label: "Week Gross", value: formatCents(week.totalGross), color: GOLD },
            { label: "Platform Revenue", value: formatCents(week.totalPlatformRevenue), color: FUCHSIA },
            { label: "Creator Payouts", value: formatCents(week.totalCreatorPayouts), color: GREEN },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20, textAlign: "center" as const }}>
              <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4, letterSpacing: "0.1em" }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Profit + Admin Split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Profit Report */}
          <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", color: GOLD, fontSize: 12, letterSpacing: "0.1em" }}>THIS WEEK — PROFIT REPORT</h3>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, fontSize: 13 }}>
              {[
                { label: "Gross Revenue", value: formatCents(profit.grossRevenue), color: "#e0e0e0" },
                { label: "Platform Cut", value: formatCents(profit.platformRevenue), color: CYAN },
                { label: "Total Expenses", value: `−${formatCents(profit.totalExpenses)}`, color: RED },
                { label: "Net Profit", value: formatCents(profit.netProfit), color: GREEN },
                { label: "Reserve Held (15%)", value: `−${formatCents(profit.reserveHeld)}`, color: MUTED },
                { label: "Available to Distribute", value: formatCents(profit.availableForPayouts), color: GOLD },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1a1a2e", paddingBottom: 6 }}>
                  <span style={{ color: MUTED }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Split */}
          <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", color: FUCHSIA, fontSize: 12, letterSpacing: "0.1em" }}>PROFIT SPLIT (WEEK)</h3>
            {adminSplits.length === 0 ? (
              <p style={{ color: MUTED, fontSize: 13 }}>No distributable profit yet this period.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {adminSplits.map((split) => (
                  <div key={split.recipientId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1a1a2e" }}>
                    <span style={{ fontSize: 13, color: split.recipientId === "admin-owner" ? GOLD : "#e0e0e0", fontWeight: split.recipientId === "admin-owner" ? 700 : 400 }}>
                      {split.recipientName}{split.recipientId === "admin-owner" && " 👑"}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: split.recipientId === "admin-owner" ? GOLD : CYAN }}>
                      {formatCents(split.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {marcelSplit && (
              <div style={{ marginTop: 16, background: "#0a0a0f", borderRadius: 8, padding: 14, textAlign: "center" as const }}>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, letterSpacing: "0.1em" }}>YOUR PERSONAL INCOME (WEEK)</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: GOLD }}>{formatCents(marcelSplit.amountCents)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue by type */}
        <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px", color: CYAN, fontSize: 12, letterSpacing: "0.1em" }}>REVENUE BY TYPE — ALL TIME</h3>
          {Object.keys(allTime.byType).length === 0 ? (
            <p style={{ color: MUTED, fontSize: 13 }}>
              No completed transactions yet — revenue appears here as payments settle.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {(Object.entries(allTime.byType) as [string, number][]).map(([type, total]) => (
                <div key={type} style={{ background: "#0a0a0f", borderRadius: 8, padding: 12, border: "1px solid #1a1a2e" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: CYAN }}>{formatCents(total)}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{type.replace(/_/g, " ").toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", color: CYAN, fontSize: 12, letterSpacing: "0.1em" }}>RECENT TRANSACTIONS</h3>
          {recent.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 13 }}>No transactions recorded yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr style={{ color: MUTED, borderBottom: "1px solid #333" }}>
                  {["ID", "Type", "Gross", "Platform", "Creator", "Status", "Time"].map((h) => (
                    <th key={h} style={{ textAlign: "left" as const, padding: "6px 10px", letterSpacing: "0.08em", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "6px 10px", color: MUTED, fontSize: 10 }}>{tx.id}</td>
                    <td style={{ padding: "6px 10px", color: CYAN }}>{tx.type}</td>
                    <td style={{ padding: "6px 10px", color: "#e0e0e0", fontWeight: 700 }}>{formatCents(tx.grossAmount)}</td>
                    <td style={{ padding: "6px 10px", color: GOLD }}>{formatCents(tx.platformCut)}</td>
                    <td style={{ padding: "6px 10px", color: GREEN }}>{formatCents(tx.creatorCut)}</td>
                    <td style={{ padding: "6px 10px", color: tx.status === "completed" ? GREEN : tx.status === "failed" ? RED : MUTED }}>
                      {tx.status.toUpperCase()}
                    </td>
                    <td style={{ padding: "6px 10px", color: MUTED }}>
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  );
}
