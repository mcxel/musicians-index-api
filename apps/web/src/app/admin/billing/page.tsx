import Link from "next/link";
import type { Metadata } from "next";
import { ACCOUNT_METRIC_UNAVAILABLE_LABEL } from "@/lib/account/accountMetricPresentation";

export const metadata: Metadata = { title: "Billing | TMI Admin" };

export default function AdminBillingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Billing & Payouts</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Platform payouts are shown only from a connected ledger.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 36 }}>
          {["Paid Out", "Pending Payout", "Platform Cut", "Payout Cycle"].map((label) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.72)", marginBottom: 4 }}>{ACCOUNT_METRIC_UNAVAILABLE_LABEL}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 16 }}>ARTIST PAYOUTS</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)" }}>Payout data is not available.</div>
      </div>
    </main>
  );
}
