"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Policy = {
  policyId: string;
  version: string;
  jurisdictionCode: string;
  title: string;
  summary: string;
  counselReviewedPlaceholder: true;
};

type AuthState = string;

const AUTH_STATES: AuthState[] = [
  "UNVERIFIED",
  "IDENTITY_VERIFIED",
  "DOCUMENTS_PENDING",
  "LEGAL_REVIEW_REQUIRED",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
];

export default function LegalRequestGatewayPanel({ onChanged }: { onChanged?: () => void }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/legal/gateway", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
        setPolicies((data.policies ?? []) as Policy[]);
        setStatus("ready");
      })
      .catch((e: Error) => {
        setError(e.message);
        setStatus("error");
      });
  }, []);

  const advanceDemo = async () => {
    setMsg(null);
    try {
      const r = await fetch("/api/admin/legal/cases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "demo-intake",
          requesterLabel: "Demo Agency Desk",
          requesterEmail: "demo.authority@example.gov",
          jurisdictionCode: "US-FED",
          legalBasisSummary: "Admin gateway demo intake — not a real legal process",
          requestedCategories: ["ACCOUNT", "AUDIT"],
          authoritySignals: { hasBadgeClaim: true, hasEmailClaim: true },
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setMsg(
        `Case ${data.case?.caseId} created · authority=${data.case?.authorityState} · status=${data.case?.status} · blocked until human approval`,
      );
      onChanged?.();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Demo intake failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#00FFFF" }}>Legal Request Gateway</div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          AuthorityVerificationEngine · JurisdictionPolicyRegistry · EmergencyDisclosureProtocol.
          Badge/email alone never reaches VERIFIED disclosure eligibility.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {AUTH_STATES.map((s) => (
          <span
            key={s}
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: s === "VERIFIED" ? "#00FF88" : "rgba(255,255,255,0.55)",
              border: "1px solid rgba(0,255,255,0.25)",
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/legal/government-requests" style={linkBtn}>
          Open public intake →
        </Link>
        <button type="button" onClick={advanceDemo} style={btn}>
          Create demo intake case
        </button>
      </div>
      {msg ? <div style={{ fontSize: 12, color: "#8CF9FF" }}>{msg}</div> : null}

      {status === "loading" ? <div style={empty}>Loading jurisdiction policies…</div> : null}
      {status === "error" ? <div style={{ ...empty, color: "#FF8A8A" }}>{error}</div> : null}

      {status === "ready"
        ? policies.map((p) => (
            <div
              key={p.policyId}
              style={{
                border: "1px solid rgba(0,255,255,0.22)",
                borderRadius: 10,
                padding: 12,
                background: "rgba(0,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {p.title}{" "}
                <span style={{ color: "#00FFFF", fontWeight: 700 }}>
                  {p.jurisdictionCode} · {p.policyId}@{p.version}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.4 }}>
                {p.summary}
              </div>
            </div>
          ))
        : null}
    </div>
  );
}

const empty = {
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
  padding: 16,
  border: "1px dashed rgba(255,255,255,0.15)",
  borderRadius: 10,
  textAlign: "center" as const,
};

const btn = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#00FFFF",
  border: "1px solid rgba(0,255,255,0.4)",
  borderRadius: 8,
  padding: "7px 11px",
  background: "rgba(0,255,255,0.1)",
  cursor: "pointer",
};

const linkBtn = {
  ...btn,
  textDecoration: "none",
  display: "inline-block",
};
