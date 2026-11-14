"use client";

import Link from "next/link";
import AccountClosurePanel from "@/components/account/AccountClosurePanel";

export default function DeactivateAccountPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <Link href="/account" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← Back to Account
        </Link>
        <AccountClosurePanel />
      </div>
    </main>
  );
}
