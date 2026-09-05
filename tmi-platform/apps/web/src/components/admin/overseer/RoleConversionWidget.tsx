"use client";

/**
 * Overseer widget — Role Correction & Profile Migration.
 * Admin can search a user by email, preview their current state,
 * choose a target role + tier, and execute the conversion.
 * Every conversion is audit-logged. No data is ever deleted.
 */

import { useState, type CSSProperties } from "react";

type RoleOption = "FAN" | "PERFORMER" | "BAND" | "PRODUCER" | "VENUE" | "PROMOTER" | "SPONSOR" | "ADVERTISER";
type TierOption = "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

const ROLES: RoleOption[] = ["FAN", "PERFORMER", "BAND", "PRODUCER", "VENUE", "PROMOTER", "SPONSOR", "ADVERTISER"];
const TIERS: TierOption[] = ["FREE", "PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

const ROLE_COLOR: Record<RoleOption, string> = {
  FAN: "#FF2DAA",
  PERFORMER: "#AA2DFF",
  BAND: "#00FFFF",
  PRODUCER: "#FFD700",
  VENUE: "#00FF88",
  PROMOTER: "#FFD700",
  SPONSOR: "#FFD700",
  ADVERTISER: "#FFA500",
};

const TIER_COLOR: Record<TierOption, string> = {
  FREE: "#888",
  PRO: "#00FFFF",
  RUBY: "#FF2DAA",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#E5E4E2",
  DIAMOND: "#AA2DFF",
};

type StepStatus = "OK" | "ERROR" | "SKIPPED";

interface MigrationStep {
  step: string;
  status: StepStatus;
  error?: string;
}

interface SensitiveResources {
  activeBookings: number;
  activeCompetitions: number;
  isCurrentlyLive: boolean;
  pendingPayoutsCents: number;
}

interface UserPreview {
  userId: string;
  email: string;
  displayName: string | null;
  currentRole: string;
  currentTier: string;
  onboardingState: string;
  allRoles: string[];
  sensitiveResources: SensitiveResources;
}

interface ConversionResult {
  ok: boolean;
  status: string;
  previousRole: string;
  newRole: string;
  previousTier: string;
  newTier: string;
  migrationSteps: MigrationStep[];
  auditLogId?: string;
  error?: string;
}

type Phase = "search" | "preview" | "confirming" | "done";

export default function RoleConversionWidget() {
  const [phase, setPhase] = useState<Phase>("search");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<UserPreview | null>(null);
  const [targetRole, setTargetRole] = useState<RoleOption>("PERFORMER");
  const [targetTier, setTargetTier] = useState<TierOption | "">("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setError(null);
    setLoading(true);
    try {
      const param = query.includes("@") ? `email=${encodeURIComponent(query)}` : `userId=${encodeURIComponent(query)}`;
      const res = await fetch(`/api/admin/convert-role?${param}`);
      const data = await res.json();
      if (!res.ok || !data.preview) {
        setError(data.error ?? "User not found.");
        setLoading(false);
        return;
      }
      setPreview(data.preview);
      setTargetRole((data.preview.currentRole in ROLE_COLOR ? data.preview.currentRole : "PERFORMER") as RoleOption);
      setTargetTier(data.preview.currentTier as TierOption);
      setPhase("preview");
    } catch {
      setError("Network error — check console.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConvert() {
    if (!preview) return;
    setError(null);
    setPhase("confirming");
    setLoading(true);
    try {
      const body: Record<string, string> = {
        userId: preview.userId,
        targetRole,
        reason: reason || "admin_role_correction",
      };
      if (targetTier) body.targetTier = targetTier;

      const res = await fetch("/api/admin/convert-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: ConversionResult = await res.json();
      setResult(data);
      setPhase("done");
    } catch {
      setError("Conversion failed — network error.");
      setPhase("preview");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPhase("search");
    setQuery("");
    setPreview(null);
    setResult(null);
    setError(null);
    setTargetRole("PERFORMER");
    setTargetTier("");
    setReason("");
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ color: "#AA2DFF", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em" }}>⚙ ROLE CORRECTION</span>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>Fan ↔ Performer · No data loss · Audit logged</span>
      </div>

      {/* ── Search Phase ─────────────────────────────────────────── */}
      {phase === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={labelStyle}>Email or User ID</label>
          <input
            style={inputStyle}
            placeholder="thegreatestlesp@gmail.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && query && handleSearch()}
          />
          <button style={btnPrimaryStyle} onClick={handleSearch} disabled={loading || !query}>
            {loading ? "Searching…" : "Look Up Account"}
          </button>
          {error && <div style={errorStyle}>{error}</div>}
        </div>
      )}

      {/* ── Preview Phase ────────────────────────────────────────── */}
      {phase === "preview" && preview && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={cardStyle}>
            <div style={cardRowStyle}>
              <span style={dimStyle}>User</span>
              <span style={valStyle}>{preview.displayName ?? preview.email}</span>
            </div>
            <div style={cardRowStyle}>
              <span style={dimStyle}>Email</span>
              <span style={valStyle}>{preview.email}</span>
            </div>
            <div style={cardRowStyle}>
              <span style={dimStyle}>Current Role</span>
              <RoleBadge role={preview.currentRole} />
            </div>
            <div style={cardRowStyle}>
              <span style={dimStyle}>Current Tier</span>
              <TierBadge tier={preview.currentTier} />
            </div>
            <div style={cardRowStyle}>
              <span style={dimStyle}>All Roles</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 9 }}>
                {preview.allRoles.join(", ")}
              </span>
            </div>
          </div>

          {/* Sensitive resources warning */}
          {(preview.sensitiveResources.activeBookings > 0 ||
            preview.sensitiveResources.activeCompetitions > 0 ||
            preview.sensitiveResources.isCurrentlyLive ||
            preview.sensitiveResources.pendingPayoutsCents > 0) && (
            <div style={warningStyle}>
              ⚠ Sensitive resources detected — conversion preserves all data.
              {preview.sensitiveResources.activeBookings > 0 && (
                <div style={warningLineStyle}>· {preview.sensitiveResources.activeBookings} active booking(s)</div>
              )}
              {preview.sensitiveResources.activeCompetitions > 0 && (
                <div style={warningLineStyle}>· {preview.sensitiveResources.activeCompetitions} active competition(s)</div>
              )}
              {preview.sensitiveResources.isCurrentlyLive && (
                <div style={warningLineStyle}>· Currently live — recommend ending session first</div>
              )}
              {preview.sensitiveResources.pendingPayoutsCents > 0 && (
                <div style={warningLineStyle}>
                  · ${(preview.sensitiveResources.pendingPayoutsCents / 100).toFixed(2)} pending payout(s) preserved
                </div>
              )}
            </div>
          )}

          {/* Target role */}
          <label style={labelStyle}>Convert to Role</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                style={{
                  ...rolePillStyle,
                  borderColor: targetRole === r ? ROLE_COLOR[r] : "rgba(255,255,255,0.15)",
                  color: targetRole === r ? ROLE_COLOR[r] : "rgba(255,255,255,0.5)",
                  background: targetRole === r ? `${ROLE_COLOR[r]}18` : "transparent",
                  fontWeight: targetRole === r ? 900 : 600,
                }}
                onClick={() => setTargetRole(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Target tier */}
          <label style={labelStyle}>
            Membership Tier <span style={{ color: "rgba(255,255,255,0.3)" }}>(leave blank to keep current)</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                style={{
                  ...rolePillStyle,
                  borderColor: targetTier === t ? TIER_COLOR[t] : "rgba(255,255,255,0.15)",
                  color: targetTier === t ? TIER_COLOR[t] : "rgba(255,255,255,0.4)",
                  background: targetTier === t ? `${TIER_COLOR[t]}18` : "transparent",
                  fontWeight: targetTier === t ? 900 : 600,
                }}
                onClick={() => setTargetTier(targetTier === t ? "" : t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Reason */}
          <label style={labelStyle}>Reason (optional)</label>
          <input
            style={inputStyle}
            placeholder="e.g. Selected wrong role at signup"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div style={{ display: "flex", gap: 6 }}>
            <button style={btnSecondaryStyle} onClick={reset}>Back</button>
            <button
              style={{ ...btnPrimaryStyle, flex: 1 }}
              onClick={handleConvert}
              disabled={loading}
            >
              Convert {preview.currentRole} → {targetRole}
              {targetTier && targetTier !== preview.currentTier ? ` · ${targetTier}` : ""}
            </button>
          </div>
          {error && <div style={errorStyle}>{error}</div>}
        </div>
      )}

      {/* ── Confirming Phase ─────────────────────────────────────── */}
      {phase === "confirming" && (
        <div style={{ padding: 16, textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
          Migrating account… Do not close this panel.
        </div>
      )}

      {/* ── Done Phase ───────────────────────────────────────────── */}
      {phase === "done" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              ...cardStyle,
              borderColor: result.ok ? "#00FF88" : "#FF6B6B",
              background: result.ok ? "rgba(0,255,136,0.06)" : "rgba(255,107,107,0.06)",
            }}
          >
            <div style={{ color: result.ok ? "#00FF88" : "#FF6B6B", fontWeight: 900, fontSize: 12, marginBottom: 4 }}>
              {result.ok ? "✓ CONVERSION COMPLETE" : "⚠ PARTIAL MIGRATION"}
            </div>
            <div style={cardRowStyle}>
              <span style={dimStyle}>Role</span>
              <span style={valStyle}>
                {result.previousRole} → <span style={{ color: ROLE_COLOR[result.newRole as RoleOption] ?? "#fff" }}>{result.newRole}</span>
              </span>
            </div>
            {result.previousTier !== result.newTier && (
              <div style={cardRowStyle}>
                <span style={dimStyle}>Tier</span>
                <span style={valStyle}>
                  {result.previousTier} → <span style={{ color: TIER_COLOR[result.newTier as TierOption] ?? "#fff" }}>{result.newTier}</span>
                </span>
              </div>
            )}
            {result.auditLogId && (
              <div style={cardRowStyle}>
                <span style={dimStyle}>Audit ID</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, fontFamily: "monospace" }}>
                  {result.auditLogId}
                </span>
              </div>
            )}
          </div>

          {/* Migration steps */}
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {result.migrationSteps.map((s, i) => (
              <div key={i} style={stepRowStyle}>
                <span style={{ color: s.status === "OK" ? "#00FF88" : s.status === "ERROR" ? "#FF6B6B" : "#888", fontSize: 9, minWidth: 10 }}>
                  {s.status === "OK" ? "✓" : s.status === "ERROR" ? "✗" : "·"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 9 }}>{s.step}</span>
                {s.error && <span style={{ color: "#FF6B6B", fontSize: 8 }}>{s.error}</span>}
              </div>
            ))}
          </div>

          {!result.ok && (
            <div style={errorStyle}>
              Some resources failed to provision. The role change committed successfully.
              Re-run conversion to retry failed steps.
            </div>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ ...btnSecondaryStyle, flex: 1 }} onClick={reset}>
              Convert Another Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLOR[role as RoleOption] ?? "#fff";
  return (
    <span style={{ color, fontWeight: 900, fontSize: 10, letterSpacing: "0.08em" }}>{role}</span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const color = TIER_COLOR[tier as TierOption] ?? "#fff";
  return (
    <span style={{ color, fontWeight: 900, fontSize: 10, letterSpacing: "0.08em" }}>{tier}</span>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: 12,
  fontFamily: "'Inter', sans-serif",
  height: "100%",
  overflowY: "auto",
};

const headerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  paddingBottom: 8,
  borderBottom: "1px solid rgba(170,45,255,0.25)",
};

const labelStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

const inputStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  padding: "7px 10px",
  color: "#fff",
  fontSize: 11,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const btnPrimaryStyle: CSSProperties = {
  background: "rgba(170,45,255,0.2)",
  border: "1px solid rgba(170,45,255,0.6)",
  borderRadius: 8,
  color: "#AA2DFF",
  fontWeight: 900,
  fontSize: 10,
  letterSpacing: "0.08em",
  padding: "8px 14px",
  cursor: "pointer",
  textTransform: "uppercase",
};

const btnSecondaryStyle: CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  color: "rgba(255,255,255,0.5)",
  fontWeight: 700,
  fontSize: 10,
  padding: "7px 12px",
  cursor: "pointer",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const cardRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const dimStyle: CSSProperties = {
  color: "rgba(255,255,255,0.35)",
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const valStyle: CSSProperties = {
  color: "#ffe9bb",
  fontSize: 10,
  fontWeight: 700,
};

const warningStyle: CSSProperties = {
  background: "rgba(255,165,0,0.08)",
  border: "1px solid rgba(255,165,0,0.3)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "#FFA500",
  fontSize: 9,
  fontWeight: 700,
};

const warningLineStyle: CSSProperties = {
  color: "rgba(255,165,0,0.8)",
  fontSize: 9,
  marginTop: 2,
  fontWeight: 600,
};

const errorStyle: CSSProperties = {
  background: "rgba(255,107,107,0.08)",
  border: "1px solid rgba(255,107,107,0.3)",
  borderRadius: 8,
  padding: "7px 10px",
  color: "#FF6B6B",
  fontSize: 9,
};

const rolePillStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 999,
  padding: "3px 9px",
  fontSize: 8,
  fontWeight: 700,
  letterSpacing: "0.06em",
  cursor: "pointer",
  textTransform: "uppercase",
  background: "transparent",
};

const stepRowStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "center",
  padding: "2px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
