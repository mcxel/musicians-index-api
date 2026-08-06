"use client";

/**
 * AdminAssignRolesPanel
 *
 * Admin UI to assign multiple roles to a single account.
 * Primary use case: BJM (bjmtherapper1@gmail.com) gets PERFORMER + ADMIN + FAN.
 *
 * Calls POST /api/admin/users/assign-roles
 */

import { useCallback, useState } from "react";

const ALL_ROLES = [
  { id: "FAN",        label: "FAN",        icon: "🎵", color: "#00FFFF" },
  { id: "PERFORMER",  label: "PERFORMER",  icon: "🎤", color: "#FF2DAA" },
  { id: "ARTIST",     label: "ARTIST",     icon: "🎙️", color: "#FF2DAA" },
  { id: "BAND",       label: "BAND",       icon: "🎸", color: "#AA2DFF" },
  { id: "ADMIN",      label: "ADMIN",      icon: "⚡", color: "#FFD700" },
  { id: "VENUE",      label: "VENUE",      icon: "🏟️", color: "#00D4FF" },
  { id: "PROMOTER",   label: "PROMOTER",   icon: "📣", color: "#FF6B35" },
  { id: "SPONSOR",    label: "SPONSOR",    icon: "🤝", color: "#C0C0C0" },
  { id: "ADVERTISER", label: "ADVERTISER", icon: "📊", color: "#E5E4E2" },
  { id: "WRITER",     label: "WRITER",     icon: "✍️", color: "#A3E635" },
  { id: "STAFF",      label: "STAFF",      icon: "🛡️", color: "#F59E0B" },
  { id: "JUDGE",      label: "JUDGE",      icon: "⚖️", color: "#60A5FA" },
] as const;

type RoleId = (typeof ALL_ROLES)[number]["id"];

type AssignResult = {
  ok: boolean;
  assignedRoles?: string[];
  user?: { email: string | null; primaryRole: string };
  error?: string;
};

const CSS = `
@keyframes tmiARPIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

export default function AdminAssignRolesPanel() {
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Set<RoleId>>(new Set());
  const [primaryRole, setPrimaryRole] = useState<RoleId | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssignResult | null>(null);

  const toggleRole = useCallback((roleId: RoleId) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
        // Clear primary if it was this role
        setPrimaryRole((p) => (p === roleId ? "" : p));
      } else {
        next.add(roleId);
        // Auto-set primary if none chosen yet
        setPrimaryRole((p) => (!p ? roleId : p));
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!email.includes("@") || selectedRoles.size === 0) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/users/assign-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          roles: Array.from(selectedRoles),
          primaryRole: primaryRole || Array.from(selectedRoles)[0],
        }),
        credentials: "include",
      });
      const data = await res.json();
      setResult(res.ok ? { ok: true, ...data } : { ok: false, error: data.error ?? "Unknown error" });
    } catch {
      setResult({ ok: false, error: "Network error" });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, selectedRoles, primaryRole]);

  const reset = useCallback(() => {
    setEmail("");
    setSelectedRoles(new Set());
    setPrimaryRole("");
    setResult(null);
  }, []);

  const primaryDef = ALL_ROLES.find((r) => r.id === primaryRole);

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(170,45,255,0.06), transparent 50%)," +
            "#06070d",
          border: "1px solid rgba(170,45,255,0.3)",
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(170,45,255,0.15)",
              border: "2px solid rgba(170,45,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🎭
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#AA2DFF",
              }}
            >
              MULTI-ROLE ASSIGNMENT
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
              Give one account multiple hub personas
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.1em", marginBottom: 8 }}>
            ACCOUNT EMAIL
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="bjmtherapper1@gmail.com"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(170,45,255,0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#fff",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Role picker */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.1em", marginBottom: 8 }}>
            SELECT ROLES TO ASSIGN (tap to toggle)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ALL_ROLES.map((role) => {
              const active = selectedRoles.has(role.id);
              const isPrimary = primaryRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    if (active && !isPrimary) {
                      setPrimaryRole(role.id);
                    } else {
                      toggleRole(role.id);
                    }
                  }}
                  title={active && !isPrimary ? "Click to set as PRIMARY role" : undefined}
                  style={{
                    background: active ? `${role.color}22` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? role.color : "#333"}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    color: active ? role.color : "#666",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s ease",
                    outline: isPrimary ? `2px solid ${role.color}` : "none",
                    outlineOffset: 2,
                  }}

                >
                  <span style={{ fontSize: 13 }}>{role.icon}</span>
                  <span>{role.label}</span>
                  {isPrimary && (
                    <span
                      style={{
                        fontSize: 7,
                        background: role.color,
                        color: "#000",
                        borderRadius: 3,
                        padding: "1px 4px",
                        fontWeight: 900,
                      }}
                    >
                      PRIMARY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedRoles.size > 0 && (
            <div style={{ fontSize: 10, color: "#555", marginTop: 8 }}>
              {selectedRoles.size} role{selectedRoles.size === 1 ? "" : "s"} selected
              {primaryDef ? ` · Primary hub: ${primaryDef.label}` : ""}
              {selectedRoles.size > 1
                ? " · Tap a selected role to promote it to PRIMARY"
                : ""}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${result.ok ? "#00FFFF44" : "#FF2DAA44"}`,
              background: result.ok ? "rgba(0,255,255,0.06)" : "rgba(255,45,170,0.06)",
              animation: "tmiARPIn 0.2s ease",
            }}
          >
            {result.ok ? (
              <>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: "#00FFFF",
                    letterSpacing: "0.08em",
                  }}
                >
                  ✓ ROLES ASSIGNED
                </div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 6 }}>
                  {result.user?.email ?? email} →{" "}
                  <strong style={{ color: "#fff" }}>
                    {result.assignedRoles?.join(", ")}
                  </strong>
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>
                  Primary: {result.user?.primaryRole}. The account can now switch
                  between roles via the SWITCH ROLE button.
                </div>
                <button
                  onClick={reset}
                  style={{
                    marginTop: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid #333",
                    borderRadius: 6,
                    color: "#888",
                    fontSize: 10,
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.08em",
                  }}
                >
                  ASSIGN ANOTHER ACCOUNT
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#FF2DAA" }}>
                  ✗ {result.error ?? "Error"}
                </div>
                <button
                  onClick={() => setResult(null)}
                  style={{
                    marginTop: 8,
                    background: "none",
                    border: "none",
                    color: "#666",
                    fontSize: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Try again
                </button>
              </>
            )}
          </div>
        )}

        {/* Submit */}
        {!result && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !email.includes("@") || selectedRoles.size === 0}
            style={{
              background:
                selectedRoles.size === 0
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, rgba(170,45,255,0.3), rgba(170,45,255,0.15))",
              border: `1px solid ${selectedRoles.size === 0 ? "#333" : "#AA2DFF"}`,
              borderRadius: 10,
              padding: "14px",
              color: selectedRoles.size === 0 ? "#555" : "#AA2DFF",
              fontSize: 13,
              fontWeight: 900,
              cursor:
                selectedRoles.size === 0 || isSubmitting ? "not-allowed" : "pointer",
              letterSpacing: "0.12em",
              transition: "all 0.2s ease",
            }}
          >
            {isSubmitting
              ? "ASSIGNING…"
              : selectedRoles.size === 0
              ? "SELECT ROLES FIRST"
              : `🎭 ASSIGN ${selectedRoles.size} ROLE${selectedRoles.size === 1 ? "" : "S"} TO ACCOUNT`}
          </button>
        )}
      </div>
    </>
  );
}
