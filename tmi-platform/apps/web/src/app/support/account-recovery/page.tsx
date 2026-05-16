'use client';
import Link from "next/link";
import RecoveryStatusCard from "@/components/auth/RecoveryStatusCard";
import LoginAlertCard from "@/components/auth/LoginAlertCard";

export default function AccountRecoverySupportPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Account Recovery Support</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
          Fallback support lane for locked or inaccessible accounts.
        </p>

        <RecoveryStatusCard
          title="Recovery Policy"
          status="warning"
          message="Use this flow when reset tokens fail, account lock is active, or trusted device is unavailable."
        />

        <LoginAlertCard
          severity="warning"
          details="Support workflows should verify ownership signals: prior device, recent activity, and confirmation email."
        />

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            padding: "12px 14px",
            fontSize: 14,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.88)",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
            <li>Collect account email + last successful sign-in window.</li>
            <li>Confirm security contact email ownership.</li>
            <li>Issue new verification and reset chain on successful ownership check.</li>
            <li>Force session invalidation on recovery completion.</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/auth/forgot-password" style={{ color: "#93c5fd", fontSize: 13 }}>
            Forgot password
          </Link>
          <Link href="/auth/session-recovery" style={{ color: "#93c5fd", fontSize: 13 }}>
            Session recovery
          </Link>
          <Link href="/auth/device-trust" style={{ color: "#93c5fd", fontSize: 13 }}>
            Device trust
          </Link>
        </div>
      </div>
    </main>
  );
}
