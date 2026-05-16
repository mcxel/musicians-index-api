"use client";

import { useState } from "react";

type Invoice = {
  id: string;
  period: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
};

const SEED_INVOICES: Invoice[] = [
  { id: "inv-001", period: "Apr 2026", amount: 4200, status: "pending", dueDate: "2026-05-01" },
  { id: "inv-002", period: "Mar 2026", amount: 2800, status: "paid",    dueDate: "2026-04-01" },
  { id: "inv-003", period: "Feb 2026", amount: 3100, status: "paid",    dueDate: "2026-03-01" },
  { id: "inv-004", period: "Jan 2026", amount: 2400, status: "paid",    dueDate: "2026-02-01" },
];

const STATUS_COLOR: Record<string, string> = { paid: "#22c55e", pending: "#f59e0b", overdue: "#ef4444" };

export default function BillingRail() {
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);

  function pay(id: string) {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: "paid" } : inv));
  }

  const totalOwed = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <section style={{ border: "1px solid rgba(34,197,94,0.35)", borderRadius: 12, background: "linear-gradient(180deg, rgba(5,25,15,0.65), rgba(3,8,6,0.9))", padding: 14, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ color: "#86efac", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", flex: 1 }}>BILLING</strong>
        {totalOwed > 0 && <span style={{ color: "#f59e0b", fontSize: 10, fontWeight: 700 }}>Owed: ${totalOwed.toLocaleString()}</span>}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {invoices.map((inv) => (
          <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${STATUS_COLOR[inv.status]}22`, borderRadius: 8, background: "rgba(0,0,0,0.3)", padding: "8px 10px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#f1f5f9" }}>{inv.period}</p>
              <p style={{ margin: "2px 0 0", fontSize: 8, color: "#64748b" }}>Due: {inv.dueDate} · {inv.id}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9" }}>${inv.amount.toLocaleString()}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: STATUS_COLOR[inv.status], border: `1px solid ${STATUS_COLOR[inv.status]}44`, borderRadius: 3, padding: "1px 6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{inv.status}</span>
            {inv.status !== "paid" && (
              <button type="button" onClick={() => pay(inv.id)} style={{ borderRadius: 5, border: "1px solid rgba(34,197,94,0.4)", background: "rgba(5,46,22,0.35)", color: "#86efac", fontSize: 9, fontWeight: 700, padding: "3px 9px", cursor: "pointer" }}>PAY</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(34,197,94,0.15)", paddingTop: 8, display: "flex", gap: 8 }}>
        <button type="button" style={{ flex: 1, borderRadius: 7, border: "1px solid rgba(34,197,94,0.4)", background: "rgba(5,46,22,0.3)", color: "#86efac", fontSize: 10, fontWeight: 700, padding: "6px 0", cursor: "pointer" }}>ADD PAYMENT METHOD</button>
        <button type="button" style={{ flex: 1, borderRadius: 7, border: "1px solid rgba(251,191,36,0.35)", background: "rgba(120,53,15,0.25)", color: "#fde68a", fontSize: 10, fontWeight: 700, padding: "6px 0", cursor: "pointer" }}>DOWNLOAD INVOICES</button>
      </div>
    </section>
  );
}
