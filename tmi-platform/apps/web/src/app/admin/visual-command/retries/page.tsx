import {
  getVisualRetrySummary,
  previewVisualRetryDecisions,
} from '@/lib/ai-visuals/VisualRetryEscalationEngine';
import Link from 'next/link';

export const metadata = {
  title: 'Visual Command Retries | TMI',
  description: 'Retry budget and escalation decisions for failed visual jobs.',
};

export default function AdminVisualCommandRetriesPage() {
  const decisions = previewVisualRetryDecisions();
  const summary = getVisualRetrySummary();

  return (
    <main style={{ padding: 24, display: 'grid', gap: 14 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Visual Retry Decisions</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
            Failed visuals are either retried or escalated. Nothing remains dead without visibility.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/visual-command">Back to Visual Command</Link>
          <Link href="/admin/visual-command/failures">Failure Memory</Link>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: 8,
        }}
      >
        {[
          ['Pending Failures', summary.pendingFailures],
          ['Open Failures', summary.openFailures],
          ['Retryable', summary.retryable],
          ['Escalation Required', summary.escalationRequired],
        ].map(([label, value]) => (
          <div
            key={label as string}
            style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label as string}</div>
            <div style={{ marginTop: 4, fontSize: 24, fontWeight: 700 }}>{value as number}</div>
          </div>
        ))}
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.04)' }}>
              <th style={{ padding: 10 }}>Request</th>
              <th style={{ padding: 10 }}>Action</th>
              <th style={{ padding: 10 }}>Owner</th>
              <th style={{ padding: 10 }}>Reason</th>
              <th style={{ padding: 10 }}>Failure Reason</th>
              <th style={{ padding: 10 }}>Attempts</th>
              <th style={{ padding: 10 }}>Max Attempts</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision) => (
              <tr key={decision.requestId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{decision.requestId}</td>
                <td style={{ padding: 10 }}>{decision.action}</td>
                <td style={{ padding: 10 }}>{decision.recommendedOwner}</td>
                <td style={{ padding: 10 }}>{decision.reason}</td>
                <td style={{ padding: 10 }}>{decision.failureReason}</td>
                <td style={{ padding: 10 }}>{decision.attempts}</td>
                <td style={{ padding: 10 }}>{decision.maxAttempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
