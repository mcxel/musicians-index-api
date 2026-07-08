"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LaunchStatusCard from "@/components/admin/LaunchStatusCard";
import StripeObservatoryCard from "@/components/admin/StripeObservatoryCard";

type FleetResult = {
  status: string;
  lastRunAt: string | null;
  failedCheck: string | null;
  durationMs: number | null;
  deviceTarget?: string;
};

type FleetRow = {
  slug: string;
  email: string;
  displayName: string;
  role: string;
  certRole: string;
  tier: string;
  purpose: string;
  checkCount: number;
  result: FleetResult | null;
};

type CertificationSummary = {
  pass: number;
  fail: number;
  pending: number;
  total: number;
  passRate: number;
};

type CertificationApiResponse = {
  summary: CertificationSummary;
  fleet: FleetRow[];
};

type RoleAuditUsage = {
  line: number;
  text: string;
  snippet: string;
};

type RoleAuditFileRow = {
  file: string;
  usages: RoleAuditUsage[];
};

type RoleAuditResponse = {
  generatedAt: string;
  count: number;
  report: RoleAuditFileRow[];
};

type RemediationStatus = "pending" | "backlog" | "reviewed";
type RemediationState = Record<string, RemediationStatus>;

const STORAGE_KEY = "roleAuditRemediationState";

function metricLabel(value: number, label: string) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{value}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function formatPath(path: string) {
  return path.replace(/\\/g, "/");
}

function badgeForStatus(status: RemediationStatus) {
  const styleMap: Record<RemediationStatus, { color: string; background: string }> = {
    pending: { color: "#FFD700", background: "rgba(255,215,0,0.12)" },
    backlog: { color: "#AA2DFF", background: "rgba(170,45,255,0.12)" },
    reviewed: { color: "#00FF88", background: "rgba(0,255,136,0.12)" },
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: styleMap[status].color, background: styleMap[status].background }}>
      {status}
    </span>
  );
}

function loadRemediationState(): RemediationState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RemediationState) : {};
  } catch {
    return {};
  }
}

export default function AdminCertificationPage() {
  const [summary, setSummary] = useState<CertificationSummary | null>(null);
  const [fleet, setFleet] = useState<FleetRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<RoleAuditResponse | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [remediationState, setRemediationState] = useState<RemediationState>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/certification-fleet?view=summary", { cache: "no-store", credentials: "include" });
        if (!res.ok) {
          setError(`Failed to load certification fleet (${res.status})`);
          return;
        }
        const body = (await res.json()) as CertificationApiResponse;
        if (!active) return;
        setSummary(body.summary);
        setFleet(body.fleet);
        setError(null);
      } catch {
        if (!active) return;
        setError("Unable to load certification data.");
      }
    };

    void load();
    const interval = setInterval(() => void load(), 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/role-audit", { cache: "no-store" });
        if (!res.ok) {
          setAuditError(`Unable to load role audit (${res.status})`);
          return;
        }
        const body = (await res.json()) as RoleAuditResponse;
        if (!active) return;
        setAudit(body);
        setAuditError(null);
        setSelectedFile((prev) => prev ?? body.report[0]?.file ?? null);
      } catch {
        if (!active) return;
        setAuditError("Unable to load role audit report.");
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setRemediationState(loadRemediationState());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remediationState));
    } catch {
      // ignore storage errors
    }
  }, [remediationState]);

  const auditSummary = useMemo(() => {
    if (!audit) return null;

    const totalFiles = audit.report.length;
    const totalUsages = audit.count ?? audit.report.reduce((sum, entry) => sum + entry.usages.length, 0);
    const reviewedCount = audit.report.filter((entry) => remediationState[formatPath(entry.file)] === "reviewed").length;
    const backlogCount = audit.report.filter((entry) => remediationState[formatPath(entry.file)] === "backlog").length;
    const pendingCount = totalFiles - reviewedCount - backlogCount;

    const topFileList = [...audit.report]
      .sort((a, b) => b.usages.length - a.usages.length)
      .slice(0, 8)
      .map((entry) => ({ file: entry.file, count: entry.usages.length, status: remediationState[formatPath(entry.file)] ?? "pending" as RemediationStatus }));

    return {
      generatedAt: audit.generatedAt,
      totalFiles,
      totalUsages,
      reviewedCount,
      backlogCount,
      pendingCount,
      topFileList,
    };
  }, [audit, remediationState]);

  const accessRiskSummary = useMemo(() => {
    if (!auditSummary || !summary) return null;

    const usageRisk = Math.min(100, Math.round((auditSummary.totalUsages / Math.max(1, auditSummary.totalFiles)) * 8));
    const backlogRisk = Math.min(100, auditSummary.backlogCount * 5);
    const failRisk = Math.min(100, summary.fail * 4);
    const rawScore = Math.min(100, Math.round((usageRisk * 0.45) + (backlogRisk * 0.35) + (failRisk * 0.2)));
    const score = Math.max(0, rawScore);

    const label = score >= 65 ? "High" : score >= 35 ? "Medium" : "Low";
    const description =
      score >= 65
        ? "Critical access risk: prioritize role audit review and QA failure remediation."
        : score >= 35
        ? "Moderate access risk: continue review and validate critical paths."
        : "Low access risk: most role paths are reviewed and QA accounts are stable.";

    return { score, label, description };
  }, [auditSummary, summary]);

  const selectedEntry = useMemo(() => {
    if (!audit || !selectedFile) return null;
    return audit.report.find((entry) => formatPath(entry.file) === formatPath(selectedFile)) ?? audit.report[0] ?? null;
  }, [audit, selectedFile]);

  const setFileStatus = (file: string, status: RemediationStatus) => {
    setRemediationState((prev) => ({ ...prev, [formatPath(file)]: status }));
  };

  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, rgba(0,255,255,0.08), transparent 35%), #050510", color: "#fff" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 24 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", fontWeight: 900, color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>
            Certification Dashboard
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Launch Readiness & QA Fleet</h1>
          <p style={{ marginTop: 10, maxWidth: 760, lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>
            A single dashboard for launch certification state, fleet health, and release readiness. This view surfaces the core QA fleet pass/fail summary, the current launch gate status, and the admin remediation queue for access-critical UI paths.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/overview" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 999, padding: "8px 14px", textDecoration: "none" }}>
              Back to Mission Control
            </Link>
            <Link href="/admin/big-ace" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 999, padding: "8px 14px", textDecoration: "none" }}>
              Big Ace Release Gate
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 14 }}>
          {metricLabel(summary?.pass ?? 0, "Passed Accounts")}
          {metricLabel(summary?.fail ?? 0, "Failed Accounts")}
          {metricLabel(summary?.pending ?? 0, "Pending Accounts")}
          {metricLabel(summary?.total ?? 0, "Total QA Accounts")}
          {metricLabel(accessRiskSummary?.score ?? 0, "Access Risk")}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(320px, 420px)", gap: 20 }}>
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF", textTransform: "uppercase" }}>Launch Gate</div>
                  <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#fff" }}>Live launch health probes</div>
                </div>
              </div>
              <LaunchStatusCard />
            </div>

            <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#AA2DFF", textTransform: "uppercase" }}>Access Risk</div>
                  <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#fff" }}>Role access review health</div>
                </div>
                {accessRiskSummary ? (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: accessRiskSummary.score >= 65 ? "#FF2DAA" : accessRiskSummary.score >= 35 ? "#FFD700" : "#00FF88" }}>
                      {accessRiskSummary.score}%
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{accessRiskSummary.label} risk</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Waiting for audit and QA data…</div>
                )}
              </div>
              {accessRiskSummary && (
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 1.7 }}>{accessRiskSummary.description}</div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 20 }}>
              <StripeObservatoryCard />
            </div>

            <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#AA2DFF", textTransform: "uppercase", marginBottom: 12 }}>
                Certification Summary
              </div>
              {error ? (
                <div style={{ color: "#FF6B6B", fontSize: 12 }}>{error}</div>
              ) : summary ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>Pass Rate</span>
                    <span style={{ color: "#00FF88", fontWeight: 900, fontSize: 14 }}>{Math.round(summary.passRate)}%</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ padding: 14, borderRadius: 12, background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.18)" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Pass</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#00FF88" }}>{summary.pass}</div>
                    </div>
                    <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.18)" }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Fail</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#FF2DAA" }}>{summary.fail}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Loading certification summary…</div>
              )}
            </div>

            <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700", textTransform: "uppercase", marginBottom: 12 }}>
                Quick Actions
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <Link href="/admin/big-ace" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
                  Review release gate metrics
                </Link>
                <Link href="/admin/mission-control" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
                  Open mission control timeline
                </Link>
                <Link href="/admin/observatory" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
                  Open observatory summary
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 14 }}>
            Role Audit Remediation
          </div>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
              {metricLabel(auditSummary?.totalFiles ?? 0, "Files Scanned")}
              {metricLabel(auditSummary?.totalUsages ?? 0, "Interactive Elements")}
              {metricLabel(auditSummary?.reviewedCount ?? 0, "Reviewed Files")}
              {metricLabel(auditSummary?.backlogCount ?? 0, "Backlog Items")}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>Prioritized remediation queue</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    Review the highest-risk access surfaces first. Mark files reviewed once the role audit classification is confirmed.
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                  Audit generated: {auditSummary?.generatedAt ? new Date(auditSummary.generatedAt).toLocaleString() : "—"}
                </div>
              </div>
              {auditError ? (
                <div style={{ color: "#FF6B6B", fontSize: 12 }}>{auditError}</div>
              ) : !auditSummary ? (
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Loading role audit data…</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {auditSummary.topFileList.map((item) => (
                    <div key={item.file} style={{ display: "grid", gap: 10, padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", wordBreak: "break-word" }}>{formatPath(item.file)}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{item.count} interactive usages flagged</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {badgeForStatus(item.status)}
                          <button
                            type="button"
                            onClick={() => setSelectedFile(item.file)}
                            style={{ fontSize: 11, fontWeight: 700, color: "#00FFFF", background: "transparent", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => setFileStatus(item.file, "reviewed")}
                            style={{ fontSize: 11, fontWeight: 700, color: "#00FF88", background: "transparent", border: "1px solid rgba(0,255,255,0.18)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}
                          >
                            Mark reviewed
                          </button>
                          <button
                            type="button"
                            onClick={() => setFileStatus(item.file, "backlog")}
                            style={{ fontSize: 11, fontWeight: 700, color: "#AA2DFF", background: "transparent", border: "1px solid rgba(170,45,255,0.18)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}
                          >
                            Add to backlog
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedEntry && (
              <div style={{ display: "grid", gap: 14, padding: 18, borderRadius: 18, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>Selected file</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{formatPath(selectedEntry.file)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {badgeForStatus(remediationState[formatPath(selectedEntry.file)] ?? "pending")}
                    <button
                      type="button"
                      onClick={() => setFileStatus(selectedEntry.file, "reviewed")}
                      style={{ fontSize: 11, fontWeight: 700, color: "#00FF88", background: "transparent", border: "1px solid rgba(0,255,255,0.18)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}
                    >
                      Mark reviewed
                    </button>
                    <button
                      type="button"
                      onClick={() => setFileStatus(selectedEntry.file, "backlog")}
                      style={{ fontSize: 11, fontWeight: 700, color: "#AA2DFF", background: "transparent", border: "1px solid rgba(170,45,255,0.18)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}
                    >
                      Add to backlog
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {selectedEntry.usages.slice(0, 6).map((usage, index) => (
                    <div key={`${selectedEntry.file}-${usage.line}-${index}`} style={{ padding: 14, borderRadius: 14, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                        <span>Line {usage.line}</span>
                        <span>{usage.text.trim().slice(0, 80)}{usage.text.trim().length > 80 ? "…" : ""}</span>
                      </div>
                      <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "rgba(255,255,255,0.85)" }}>{usage.snippet.trim()}</pre>
                    </div>
                  ))}
                  {selectedEntry.usages.length > 6 && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                      Showing 6 of {selectedEntry.usages.length} usages. Use the role audit report file for complete context.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 14 }}>
            QA Fleet Accounts
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {['Account', 'Role', 'Tier', 'Checks', 'Status', 'Last Run', 'Failed Check'].map((title) => (
                    <th key={title} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)' }}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleet.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '18px 12px', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                      {error ? error : 'Loading QA fleet account list…'}
                    </td>
                  </tr>
                ) : (
                  fleet.map((row) => (
                    <tr key={row.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '12px', fontSize: 12, color: '#fff' }}>
                        <div style={{ fontWeight: 700 }}>{row.displayName}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{row.email}</div>
                      </td>
                      <td style={{ padding: '12px', fontSize: 12, color: '#fff' }}>{row.certRole}</td>
                      <td style={{ padding: '12px', fontSize: 12, color: '#fff' }}>{row.tier}</td>
                      <td style={{ padding: '12px', fontSize: 12, color: '#fff' }}>{row.checkCount}</td>
                      <td style={{ padding: '12px', fontSize: 12, fontWeight: 700, color: row.result?.status === 'PASS' ? '#00FF88' : row.result?.status === 'FAIL' ? '#FF2DAA' : '#FFD700' }}>
                        {row.result?.status ?? 'PENDING'}
                      </td>
                      <td style={{ padding: '12px', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{row.result?.lastRunAt ? new Date(row.result.lastRunAt).toLocaleString() : '—'}</td>
                      <td style={{ padding: '12px', fontSize: 11, color: row.result?.failedCheck ? '#FF6B6B' : 'rgba(255,255,255,0.55)' }}>{row.result?.failedCheck ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
