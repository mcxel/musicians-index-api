"use client";

/**
 * LEGAL & COMPLIANCE — Observatory Intelligence Deck launcher card.
 * Collapsed counts only — no sensitive case details on main Observatory.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Summary = {
  openCases: number;
  awaitingApproval: number;
  holdsActive: number;
  privacyOpen: number;
  ledgerEvents: number;
  copyrightOpen?: number;
  sensitiveDetailsExposed: false;
};

export default function LegalComplianceCard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/legal/summary", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? (r.status === 403 ? "Admin/staff required" : `HTTP ${r.status}`));
        setSummary(data.summary ?? null);
        setError(null);
      })
      .catch((e: Error) => {
        setError(e.message);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div
      data-testid="legal-compliance-card"
      data-deck="intelligence"
      style={{
        height: "100%",
        minHeight: collapsed ? 72 : 200,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FFD700", textTransform: "uppercase" }}>
            Legal Command · Client
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>LEGAL & COMPLIANCE</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Collapsed counts only — no case details on Observatory
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => setCollapsed((v) => !v)} style={btn}>
            {collapsed ? "Expand" : "Collapse"}
          </button>
          <button type="button" onClick={load} style={btn}>
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
        <Stat label="Open" value={loading ? "…" : String(summary?.openCases ?? 0)} accent="#FF2DAA" />
        <Stat label="Awaiting" value={loading ? "…" : String(summary?.awaitingApproval ?? 0)} accent="#FFD700" />
        <Stat label="Holds" value={loading ? "…" : String(summary?.holdsActive ?? 0)} accent="#00FFFF" />
        <Stat label="Privacy" value={loading ? "…" : String(summary?.privacyOpen ?? 0)} accent="#00FF88" />
        <Stat label="IP" value={loading ? "…" : String(summary?.copyrightOpen ?? 0)} accent="#FF6B1A" />
      </div>

      {error ? (
        <div style={{ fontSize: 11, color: "#FF8A8A" }}>{error}</div>
      ) : null}

      {!collapsed ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.45 }}>
          Defensible Compliance & Accountability. Open Legal Command Center for case management,
          vault metadata, and audit ledger. Sensitive subjects are never listed here.
          <div style={{ marginTop: 8 }}>
            <Link href="/admin/legal" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>
              Open Legal Command →
            </Link>
          </div>
        </div>
      ) : (
        <Link href="/admin/legal" style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none" }}>
          Open Legal Command →
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        border: `1px solid ${accent}40`,
        borderRadius: 8,
        padding: "8px 10px",
        background: `${accent}10`,
      }}
    >
      <div style={{ fontSize: 9, color: accent, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{value}</div>
    </div>
  );
}

const btn = {
  fontSize: 10,
  fontWeight: 800,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,215,0,0.35)",
  background: "rgba(255,215,0,0.08)",
  color: "#FFD700",
  cursor: "pointer",
};
