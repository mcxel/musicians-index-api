"use client";

/**
 * LegalCommandCenter — admin workspace shell for Global Legal, Privacy & Records Command.
 * Five disclosure pillars + Copyright & IP (RightsComplianceEngine). Rule 20 honest states.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import CorporateRecordsVaultPanel from "./pillars/CorporateRecordsVaultPanel";
import LegalRequestGatewayPanel from "./pillars/LegalRequestGatewayPanel";
import DisclosureCaseManagerPanel from "./pillars/DisclosureCaseManagerPanel";
import PrivacyRightsCenterPanel from "./pillars/PrivacyRightsCenterPanel";
import LegalAuditLedgerPanel from "./pillars/LegalAuditLedgerPanel";
import CopyrightIpPanel from "./pillars/CopyrightIpPanel";

type PillarId = "vault" | "gateway" | "cases" | "privacy" | "ledger" | "copyright";

type Summary = {
  openCases: number;
  awaitingApproval: number;
  holdsActive: number;
  privacyOpen: number;
  ledgerEvents: number;
  sensitiveDetailsExposed: false;
};

type Snapshot = {
  summary: Summary;
  cases: unknown[];
  activeHolds: unknown[];
  recentLedger: unknown[];
  chain: { ok: boolean; checked: number; message: string };
};

const PILLARS: { id: PillarId; label: string; accent: string }[] = [
  { id: "vault", label: "Corporate Records Vault", accent: "#FFD700" },
  { id: "gateway", label: "Legal Request Gateway", accent: "#00FFFF" },
  { id: "cases", label: "Disclosure Case Manager", accent: "#FF2DAA" },
  { id: "privacy", label: "Privacy Rights Center", accent: "#00FF88" },
  { id: "copyright", label: "Copyright & IP", accent: "#FF6B1A" },
  { id: "ledger", label: "Legal Audit Ledger", accent: "#AA2DFF" },
];

export default function LegalCommandCenter() {
  const [pillar, setPillar] = useState<PillarId>("cases");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [syntheticMsg, setSyntheticMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setStatus("loading");
    setError(null);
    fetch("/api/admin/legal/snapshot", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
        setSnapshot(data as Snapshot);
        setStatus("ready");
      })
      .catch((e: Error) => {
        setError(e.message);
        setSnapshot(null);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runSynthetic = async () => {
    setBusy(true);
    setSyntheticMsg(null);
    try {
      const r = await fetch("/api/admin/legal/synthetic", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor: "admin-certification" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setSyntheticMsg(
        data.ok
          ? `Synthetic exercise PASS · ${data.caseId}`
          : `Synthetic exercise incomplete · ${data.caseId ?? "n/a"}`,
      );
      load();
      setPillar("ledger");
    } catch (e) {
      setSyntheticMsg(e instanceof Error ? e.message : "Synthetic exercise failed");
    } finally {
      setBusy(false);
    }
  };

  const summary = snapshot?.summary;

  return (
    <div data-testid="legal-command-center" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header
        style={{
          border: "1px solid rgba(255,215,0,0.28)",
          borderRadius: 14,
          padding: "16px 18px",
          background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(170,45,255,0.06))",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700", textTransform: "uppercase" }}>
          TMI Global Legal · Privacy & Records Command
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 22, fontWeight: 900 }}>Legal Command Center</h1>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)", maxWidth: 820, lineHeight: 1.5 }}>
          Defensible Compliance & Accountability. Automation prepares. Authority verifies. Policy scopes.
          Humans approve. The system securely delivers. The ledger proves what happened. Not legal advice.
          Rapid, authenticated, legally scoped, auditable disclosure — never open access.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <Link href="/legal/government-requests" style={chip("#00FFFF")}>
            Public intake →
          </Link>
          <Link href="/legal/privacy" style={chip("#00FF88")}>
            Privacy rights →
          </Link>
          <button type="button" onClick={load} style={btn("#00FFFF")} disabled={status === "loading"}>
            Refresh
          </button>
          <button type="button" onClick={runSynthetic} style={btn("#FFD700")} disabled={busy}>
            {busy ? "Running…" : "Run synthetic certification"}
          </button>
        </div>
        {syntheticMsg ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "#FFD88F" }}>{syntheticMsg}</div>
        ) : null}
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
        <Stat label="Open cases" value={status === "loading" ? "…" : String(summary?.openCases ?? 0)} accent="#FF2DAA" />
        <Stat label="Awaiting approval" value={status === "loading" ? "…" : String(summary?.awaitingApproval ?? 0)} accent="#FFD700" />
        <Stat label="Active holds" value={status === "loading" ? "…" : String(summary?.holdsActive ?? 0)} accent="#00FFFF" />
        <Stat label="Privacy open" value={status === "loading" ? "…" : String(summary?.privacyOpen ?? 0)} accent="#00FF88" />
        <Stat label="Ledger events" value={status === "loading" ? "…" : String(summary?.ledgerEvents ?? 0)} accent="#AA2DFF" />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {PILLARS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPillar(p.id)}
            style={{
              ...btn(p.accent),
              opacity: pillar === p.id ? 1 : 0.7,
              borderWidth: pillar === p.id ? 2 : 1,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {status === "error" ? (
        <div style={banner("#FF4444")}>Unable to load Legal Command snapshot. {error}</div>
      ) : null}
      {status === "loading" && !snapshot ? (
        <div style={banner("rgba(255,255,255,0.35)")}>Loading Legal Command Center…</div>
      ) : null}

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: 14,
          minHeight: 360,
          background: "rgba(5,5,16,0.65)",
        }}
      >
        {pillar === "vault" ? <CorporateRecordsVaultPanel /> : null}
        {pillar === "gateway" ? (
          <LegalRequestGatewayPanel onChanged={load} />
        ) : null}
        {pillar === "cases" ? (
          <DisclosureCaseManagerPanel
            cases={(snapshot?.cases as never[]) ?? []}
            loading={status === "loading"}
            error={error}
            onChanged={load}
          />
        ) : null}
        {pillar === "privacy" ? <PrivacyRightsCenterPanel /> : null}
        {pillar === "copyright" ? <CopyrightIpPanel /> : null}
        {pillar === "ledger" ? (
          <LegalAuditLedgerPanel
            events={(snapshot?.recentLedger as never[]) ?? []}
            chain={snapshot?.chain ?? null}
            loading={status === "loading"}
          />
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        border: `1px solid ${accent}44`,
        borderRadius: 10,
        padding: "10px 12px",
        background: `${accent}10`,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.12em", color: accent, fontWeight: 800, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 4 }}>{value}</div>
    </div>
  );
}

function chip(accent: string): CSSProperties {
  return {
    textDecoration: "none",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: accent,
    border: `1px solid ${accent}55`,
    borderRadius: 999,
    padding: "6px 12px",
    background: `${accent}14`,
  };
}

function btn(accent: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: accent,
    border: `1px solid ${accent}55`,
    borderRadius: 8,
    padding: "7px 11px",
    background: `${accent}14`,
    cursor: "pointer",
  };
}

function banner(color: string): CSSProperties {
  return {
    fontSize: 12,
    color,
    border: `1px dashed ${color}`,
    borderRadius: 10,
    padding: 12,
  };
}
