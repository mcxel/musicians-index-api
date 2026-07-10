"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

type LegalDocId =
  | "disclaimer"
  | "promoter"
  | "ticket"
  | "terms"
  | "privacy"
  | "dmca"
  | "community";

const DOC_TEXT: Record<LegalDocId, string> = {
  disclaimer:
    "Platform participation is subject to policy controls, age requirements, and role-bound permissions. Operational actions are logged and auditable.",
  promoter:
    "Promoters must follow verified event and ticket authority flow. Ticket inventory creation and allocation remain venue/promoter/admin-authoritative.",
  ticket:
    "Ticketing and allocation are controlled by authorized roles only. All transfers, ownership changes, and redemption states must be recorded.",
  terms:
    "Terms govern account usage, platform access, and enforcement standards for all stakeholders in the TMI network.",
  privacy:
    "Privacy controls define data handling, retention windows, and consent flow for profile, media, and communications data.",
  dmca:
    "DMCA policy defines notice, takedown, and dispute workflow for copyrighted uploads and content claims.",
  community:
    "Community rules govern acceptable behavior, moderation actions, and safety escalation across public and private surfaces.",
};

export function LegalDocPanel({ id }: { id: LegalDocId }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10, padding: 10 }}>
      <div style={{ color: "rgba(255,255,255,0.84)", fontSize: 12, lineHeight: 1.55 }}>{DOC_TEXT[id]}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Link href="/legal" style={legalBtnStyle}>Open Legal Site</Link>
        <button type="button" style={legalBtnStyle}>Print / Export</button>
      </div>
    </div>
  );
}

export function ComplianceOverviewPanel() {
  const checks = [
    { label: "Disclaimer", state: "PASS" },
    { label: "Terms", state: "PASS" },
    { label: "Privacy", state: "PASS" },
    { label: "DMCA", state: "WARN" },
    { label: "Ticket Rules", state: "PASS" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8, padding: 10 }}>
      {checks.map((check) => (
        <div key={check.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,215,0,0.22)", borderRadius: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{check.label}</span>
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", color: check.state === "PASS" ? "#00FF88" : "#FFD700" }}>{check.state}</span>
        </div>
      ))}
    </div>
  );
}

export function ContactSupportPanel() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8, padding: 10 }}>
      <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 1.5 }}>
        Route policy/legal escalations to support operations with workspace context and audit references.
      </div>
      <Link href="/contact" style={legalBtnStyle}>Contact Us</Link>
      <Link href="/support" style={legalBtnStyle}>Support Center</Link>
    </div>
  );
}

const legalBtnStyle: CSSProperties = {
  textDecoration: "none",
  borderRadius: 8,
  border: "1px solid rgba(255,215,0,0.35)",
  background: "rgba(255,215,0,0.1)",
  color: "#FFD88F",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  padding: "6px 9px",
};
