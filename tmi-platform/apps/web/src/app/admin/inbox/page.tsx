"use client";

import React from "react";
import Link from "next/link";
import UnifiedInboxPanel from "@/components/admin/UnifiedInboxPanel";
import AdminInboxRail from "@/components/admin/AdminInboxRail";

export default function AdminInboxPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#020208", color: "#fff", fontFamily: "'Inter', sans-serif", padding: "24px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid rgba(0,255,255,0.15)", paddingBottom: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", textTransform: "uppercase", fontWeight: 800, marginBottom: 4 }}>
              Admin · Unified Inbox
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, fontFamily: "var(--font-orbitron, Impact)", letterSpacing: "0.05em" }}>
              PLATFORM <span style={{ color: "#AA2DFF" }}>MESSAGES</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/admin/overseer" style={navLink}>← Overseer</Link>
            <Link href="/admin" style={navLink}>Admin Hub →</Link>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "flex-start" }}>
          <AdminInboxRail />
          <UnifiedInboxPanel />
        </div>

      </div>
    </div>
  );
}

const navLink: React.CSSProperties = {
  color: "rgba(255,255,255,0.45)",
  textDecoration: "none",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "7px 14px",
  borderRadius: 6,
};
