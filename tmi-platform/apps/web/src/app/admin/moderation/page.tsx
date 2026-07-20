"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

/**
 * Was a static SEED_FLAGS array — fake reports, and a "Resolve" button that
 * only mutated local React state (reset on refresh, never persisted).
 * Rewired to the real /api/admin/moderation queue, backed by the Report/
 * ModerationAction tables and real account-status enforcement (2026-07-19).
 */

interface ReportRow {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  category: string;
  detail: string | null;
  status: string;
  severity: string;
  createdAt: string;
}
interface SuspendedUser {
  id: string;
  email: string | null;
  displayName: string | null;
  accountStatusReason: string | null;
  accountStatusExpiresAt: string | null;
}

const SEV_COLORS: Record<string, string> = { p1: "#FF4444", p2: "#FF9500", p3: "#FFD700", p4: "rgba(255,255,255,0.4)" };

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [autoSuspended, setAutoSuspended] = useState<SuspendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/moderation", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Admin/staff session required" : `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: { pendingReports: ReportRow[]; autoSuspended: SuspendedUser[] }) => {
        setReports(d.pendingReports);
        setAutoSuspended(d.autoSuspended);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (targetUserId: string, actionType: "clear" | "warn" | "suspend" | "ban", reportId: string, reason: string) => {
    setActing(reportId);
    try {
      await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId, actionType, reason, reportId }),
      });
      load();
    } finally {
      setActing(null);
    }
  };

  const openCount = reports.length;
  const highSeverity = reports.filter((r) => r.severity === "p1").length;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
        <h1 className="text-3xl font-bold text-[#ff6b35]">Moderation Queue</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          {loading ? "Loading…" : `${openCount} pending report${openCount === 1 ? "" : "s"} · ${highSeverity} severe · ${autoSuspended.length} account${autoSuspended.length === 1 ? "" : "s"} on auto-suspend hold`}
        </p>
      </div>

      {error && (
        <div style={{ padding: "14px 18px", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: 10, color: "#FF8A8A", fontSize: 12, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {!loading && !error && autoSuspended.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700", marginBottom: 10 }}>AUTO-SUSPEND HOLDS — NEED A DECISION</div>
          <div style={{ display: "grid", gap: 8 }}>
            {autoSuspended.map((u) => (
              <div key={u.id} style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{u.displayName ?? u.email ?? u.id}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                    {u.accountStatusReason} {u.accountStatusExpiresAt && `· hold expires ${new Date(u.accountStatusExpiresAt).toLocaleDateString()}`}
                  </div>
                </div>
                <button onClick={() => act(u.id, "clear", "", "Auto-suspend hold reviewed — cleared")} style={{ fontSize: 10, fontWeight: 700, color: "#00FFAA", background: "rgba(0,255,170,0.1)", border: "1px solid rgba(0,255,170,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Clear</button>
                <button onClick={() => act(u.id, "ban", "", "Confirmed after auto-suspend review")} style={{ fontSize: 10, fontWeight: 700, color: "#FF4444", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Confirm Ban</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 10 }}>
          {reports.length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>No pending reports.</div>
          )}
          {reports.map((r) => (
            <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${SEV_COLORS[r.severity]}25`, borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
                  <span style={{ color: SEV_COLORS[r.severity] }}>[{r.severity.toUpperCase()}]</span> {r.targetType} — {r.category.replace("_", " ")}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  Target: {r.targetId} · Reported by: {r.reporterId} · {new Date(r.createdAt).toLocaleString()}
                </div>
                {r.detail && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>"{r.detail}"</div>}
              </div>
              {r.targetType === "user" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button disabled={acting === r.id} onClick={() => act(r.targetId, "clear", r.id, "Reviewed — no action needed")} style={{ fontSize: 10, fontWeight: 700, color: "#00FFAA", background: "rgba(0,255,170,0.1)", border: "1px solid rgba(0,255,170,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Dismiss</button>
                  <button disabled={acting === r.id} onClick={() => act(r.targetId, "warn", r.id, `Warned: ${r.category}`)} style={{ fontSize: 10, fontWeight: 700, color: "#FFD700", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Warn</button>
                  <button disabled={acting === r.id} onClick={() => act(r.targetId, "suspend", r.id, `Suspended: ${r.category}`)} style={{ fontSize: 10, fontWeight: 700, color: "#FF9500", background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Suspend</button>
                  <button disabled={acting === r.id} onClick={() => act(r.targetId, "ban", r.id, `Banned: ${r.category}`)} style={{ fontSize: 10, fontWeight: 700, color: "#FF4444", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Ban</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <Link href="/admin/security" style={{ fontSize: 12, color: "#ff6b35", textDecoration: "none" }}>Security →</Link>
      </div>
    </main>
  );
}
