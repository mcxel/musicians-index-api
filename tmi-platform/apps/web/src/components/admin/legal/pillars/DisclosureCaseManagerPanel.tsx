"use client";

import { useState } from "react";

type CaseRow = {
  caseId: string;
  kind: string;
  status: string;
  authorityState: string;
  approvalDecision: string;
  requesterLabel: string;
  jurisdictionCode: string;
  isSynthetic: boolean;
  packageId?: string;
  allowedCategories: string[];
  agentFlags: string[];
};

export default function DisclosureCaseManagerPanel({
  cases,
  loading,
  error,
  onChanged,
}: {
  cases: CaseRow[];
  loading: boolean;
  error: string | null;
  onChanged?: () => void;
}) {
  const [acting, setActing] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const act = async (caseId: string, action: "approve" | "deny" | "deliver" | "verify") => {
    setActing(caseId + action);
    setMsg(null);
    try {
      let url = `/api/admin/legal/cases/${encodeURIComponent(caseId)}/approve`;
      let body: Record<string, unknown> = {
        actor: "admin-counsel",
        decision: action === "deny" ? "DENIED" : "APPROVED",
      };
      if (action === "deliver") {
        url = `/api/admin/legal/cases/${encodeURIComponent(caseId)}/deliver`;
        body = { actor: "admin-counsel" };
      }
      if (action === "verify") {
        url = `/api/admin/legal/cases/${encodeURIComponent(caseId)}`;
        body = {
          action: "advance-authority",
          actor: "admin-counsel",
          signals: {
            hasBadgeClaim: true,
            hasEmailClaim: true,
            identityDocumentReceived: true,
            agencyRosterMatch: true,
            counselReviewed: true,
            expired: false,
            rejected: false,
          },
        };
      }
      const r = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setMsg(
        action === "deliver"
          ? data.ok
            ? `Delivered ${caseId}`
            : data.error ?? "Delivery blocked"
          : `${action} recorded for ${caseId}`,
      );
      onChanged?.();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#FF2DAA" }}>Disclosure Case Manager</div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          Catalog · Hold · Minimization · Package draft · Human/Counsel Approval Gate.
          Delivery is blocked until approval + VERIFIED authority.
        </p>
      </div>

      {msg ? <div style={{ fontSize: 12, color: "#FFD88F" }}>{msg}</div> : null}
      {loading ? <div style={empty}>Loading cases…</div> : null}
      {error ? <div style={{ ...empty, color: "#FF8A8A" }}>{error}</div> : null}
      {!loading && !error && cases.length === 0 ? (
        <div style={empty}>
          No disclosure cases yet. Use public intake or Gateway demo intake — honest empty state.
        </div>
      ) : null}

      {cases.map((c) => (
        <div
          key={c.caseId}
          style={{
            border: "1px solid rgba(255,45,170,0.28)",
            borderRadius: 10,
            padding: 12,
            background: "rgba(255,45,170,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{c.caseId}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FF2DAA" }}>
              {c.status} · {c.authorityState} · approval:{c.approvalDecision}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
            {c.kind} · {c.requesterLabel} · {c.jurisdictionCode}
            {c.isSynthetic ? " · SYNTHETIC" : ""}
            {c.packageId ? ` · pkg ${c.packageId}` : ""}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            Allowed: {c.allowedCategories.join(", ") || "none"} · Flags:{" "}
            {c.agentFlags.join(", ") || "none"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <button
              type="button"
              disabled={acting !== null}
              onClick={() => act(c.caseId, "verify")}
              style={btn("#00FFFF")}
            >
              Verify authority
            </button>
            <button
              type="button"
              disabled={acting !== null}
              onClick={() => act(c.caseId, "approve")}
              style={btn("#00FF88")}
            >
              Human approve
            </button>
            <button
              type="button"
              disabled={acting !== null}
              onClick={() => act(c.caseId, "deny")}
              style={btn("#FF4444")}
            >
              Deny
            </button>
            <button
              type="button"
              disabled={acting !== null}
              onClick={() => act(c.caseId, "deliver")}
              style={btn("#FFD700")}
            >
              Attempt deliver
            </button>
          </div>
        </div>
      ))}
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

function btn(accent: string) {
  return {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: accent,
    border: `1px solid ${accent}55`,
    borderRadius: 8,
    padding: "6px 10px",
    background: `${accent}14`,
    cursor: "pointer",
  };
}
