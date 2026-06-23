"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type SnapshotResponse = {
  ok: boolean;
  developerHq: {
    mcDesk: {
      revenueHealth: 'healthy' | 'warning' | 'critical';
      engagementHealth: 'healthy' | 'warning' | 'critical';
      boredomAlerts: number;
      brokenFlowAlerts: number;
      recommendations: string[];
    };
    tasks: Array<{
      id: string;
      title: string;
      issueType: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      sourceRoute?: string;
      sourceFile?: string;
      reportedBy: string;
      assignedTo: string;
      assignmentReason: string;
      status: string;
      requiresHumanApproval: boolean;
      createdAt: number;
      updatedAt: number;
    }>;
    ledger: Array<{
      id: string;
      taskId: string;
      issueFound: string;
      filePath: string;
      routeAffected: string;
      fixAppliedOrRecommended: string;
      testResult: 'pass' | 'fail' | 'pending';
      remainingRisk: 'none' | 'low' | 'medium' | 'high';
      createdAt: number;
    }>;
    latestAudit?: {
      healthScore?: number;
      openTickets?: number;
      criticalTickets?: number;
      recommendations?: string[];
    };
  };
  resilience: {
    systems: Array<{ key: string; label: string; score: number; status: 'healthy' | 'warning' | 'critical' }>;
    summary: { healthy: number; warning: number; critical: number };
  };
  domainRegistry: Array<{ component: string; owner: string; path: string }>;
};

function tone(status: 'healthy' | 'warning' | 'critical'): string {
  if (status === 'healthy') return '#00C896';
  if (status === 'warning') return '#FFD700';
  return '#FF2DAA';
}

export default function DeveloperHqObservatoryPage() {
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;

    async function load() {
      try {
        const res = await fetch('/api/admin/developer-hq', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as SnapshotResponse;
        if (!stopped) {
          setSnapshot(data);
          setError(null);
        }
      } catch (e) {
        if (!stopped) setError(e instanceof Error ? e.message : 'Failed to load Developer HQ');
      }
    }

    void load();
    const id = setInterval(() => void load(), 5000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, []);

  const taskCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const task of snapshot?.developerHq.tasks ?? []) {
      counts[task.severity] += 1;
    }
    return counts;
  }, [snapshot]);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '22px clamp(16px,4vw,38px)', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#00FFFF', fontWeight: 900 }}>INTERNAL ONLY</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(20px,4vw,34px)', fontFamily: 'var(--font-orbitron, monospace)', letterSpacing: '.06em' }}>DEVELOPER OPERATIONS HQ</h1>
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            MC detects priorities. Developer HQ creates code tasks. Operations HQ verifies environment behavior.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/observatory" style={{ fontSize: 11, textDecoration: 'none', color: '#00C8FF', border: '1px solid rgba(0,200,255,0.4)', padding: '8px 12px', borderRadius: 8 }}>Main Observatory</Link>
          <Link href="/admin" style={{ fontSize: 11, textDecoration: 'none', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: 8 }}>Admin</Link>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, border: '1px solid rgba(255,45,170,0.45)', borderRadius: 10, padding: 12, color: '#FF2DAA' }}>
          Developer HQ feed unavailable: {error}
        </div>
      )}

      <section style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {[
          { label: 'Revenue Health', value: snapshot?.developerHq.mcDesk.revenueHealth ?? 'loading', color: tone(snapshot?.developerHq.mcDesk.revenueHealth ?? 'warning') },
          { label: 'Engagement Health', value: snapshot?.developerHq.mcDesk.engagementHealth ?? 'loading', color: tone(snapshot?.developerHq.mcDesk.engagementHealth ?? 'warning') },
          { label: 'Broken Flow Alerts', value: String(snapshot?.developerHq.mcDesk.brokenFlowAlerts ?? 0), color: '#FFD700' },
          { label: 'Boredom Alerts', value: String(snapshot?.developerHq.mcDesk.boredomAlerts ?? 0), color: '#AA2DFF' },
          { label: 'Critical Tasks', value: String(taskCounts.critical), color: '#FF2DAA' },
          { label: 'High Tasks', value: String(taskCounts.high), color: '#FFD700' },
        ].map((item) => (
          <div key={item.label} style={{ border: `1px solid ${item.color}55`, borderRadius: 12, padding: 12, background: 'rgba(5,5,16,0.8)' }}>
            <div style={{ fontSize: 9, letterSpacing: '.14em', color: 'rgba(255,255,255,0.6)' }}>{item.label.toUpperCase()}</div>
            <div style={{ marginTop: 6, fontSize: 18, color: item.color, fontWeight: 900 }}>{item.value}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 18, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 14, background: 'rgba(5,5,16,0.85)' }}>
        <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#00FF88', fontWeight: 900 }}>MC COMMAND DESK RECOMMENDATIONS</div>
        <ul style={{ marginTop: 10, paddingLeft: 18, color: 'rgba(255,255,255,0.86)', fontSize: 13, lineHeight: 1.6 }}>
          {(snapshot?.developerHq.mcDesk.recommendations ?? []).length > 0
            ? (snapshot?.developerHq.mcDesk.recommendations ?? []).map((entry) => <li key={entry}>{entry}</li>)
            : <li>No active recommendations.</li>}
        </ul>
      </section>

      <section style={{ marginTop: 18, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 14, background: 'rgba(5,5,16,0.85)' }}>
        <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#00C8FF', fontWeight: 900 }}>TASK INTAKE + ASSIGNMENT ENGINE</div>
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          {(snapshot?.developerHq.tasks ?? []).slice(0, 12).map((task) => (
            <div key={task.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 10, display: 'grid', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{task.title}</div>
                <div style={{ fontSize: 10, color: tone(task.severity === 'critical' ? 'critical' : task.severity === 'high' ? 'warning' : 'healthy'), fontWeight: 900 }}>
                  {task.severity.toUpperCase()} · {task.status.toUpperCase()}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                {task.issueType} → {task.assignedTo} ({task.assignmentReason})
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                Route: {task.sourceRoute ?? 'n/a'} | File: {task.sourceFile ?? 'n/a'}
              </div>
              {task.requiresHumanApproval && (
                <div style={{ fontSize: 10, color: '#FF2DAA', letterSpacing: '.08em', fontWeight: 800 }}>
                  HUMAN APPROVAL REQUIRED BEFORE PRODUCTION RELEASE
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 18, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 14, background: 'rgba(5,5,16,0.85)' }}>
        <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#FFD700', fontWeight: 900 }}>FIX LEDGER</div>
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          {(snapshot?.developerHq.ledger ?? []).slice(0, 8).map((entry) => (
            <div key={entry.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{entry.issueFound}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                {entry.filePath} | {entry.routeAffected}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                {entry.fixAppliedOrRecommended}
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: '#00FFFF' }}>
                Test: {entry.testResult.toUpperCase()} | Remaining Risk: {entry.remainingRisk.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 18, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 14, background: 'rgba(5,5,16,0.85)' }}>
        <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#AA2DFF', fontWeight: 900 }}>SYSTEM RESILIENCE HQ</div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 8 }}>
          {(snapshot?.resilience.systems ?? []).map((sys) => (
            <div key={sys.key} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{sys.label}</div>
              <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900, color: tone(sys.status) }}>{sys.score}</div>
              <div style={{ fontSize: 10, letterSpacing: '.1em', color: tone(sys.status) }}>{sys.status.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 18, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 14, background: 'rgba(5,5,16,0.85)' }}>
        <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#00FFFF', fontWeight: 900 }}>TMI DOMAIN REGISTRY</div>
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          {(snapshot?.domainRegistry ?? []).map((entry) => (
            <div key={entry.component} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{entry.component}</div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#00FFFF' }}>{entry.owner}</div>
              <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{entry.path}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
