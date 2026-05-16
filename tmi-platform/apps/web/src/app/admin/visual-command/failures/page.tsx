import {
  listLiveFailureRecordsFromQueue,
  summarizeVisualFailureRecords,
} from '@/lib/ai-visuals/VisualFailureMemoryEngine';
import Link from 'next/link';

export const metadata = {
  title: 'Visual Command Failures | TMI',
  description: 'Failure memory, retry count, and escalation visibility.',
};

function formatTime(value: number): string {
  return new Date(value).toLocaleString();
}

export default function AdminVisualCommandFailuresPage() {
  const records = listLiveFailureRecordsFromQueue();
  const summary = summarizeVisualFailureRecords(records);

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
          <h1 style={{ margin: 0 }}>Visual Failures</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
            No silent failures: reason, retry count, worker owner, and escalation state.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/visual-command">Back to Visual Command</Link>
          <Link href="/admin/visual-command/retries">Retry Decisions</Link>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 8,
        }}
      >
        {[
          ['Open', summary.open],
          ['Retrying', summary.retrying],
          ['Escalated', summary.escalated],
          ['Resolved', summary.resolved],
          ['Total', summary.total],
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
              <th style={{ padding: 10 }}>Route</th>
              <th style={{ padding: 10 }}>Slot</th>
              <th style={{ padding: 10 }}>Worker</th>
              <th style={{ padding: 10 }}>Reason</th>
              <th style={{ padding: 10 }}>Failures</th>
              <th style={{ padding: 10 }}>Retries</th>
              <th style={{ padding: 10 }}>Resolution</th>
              <th style={{ padding: 10 }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.requestId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{record.requestId}</td>
                <td style={{ padding: 10 }}>{record.route}</td>
                <td style={{ padding: 10 }}>{record.slotId ?? 'n/a'}</td>
                <td style={{ padding: 10 }}>{record.assignedWorker}</td>
                <td style={{ padding: 10 }}>{record.failureReason}</td>
                <td style={{ padding: 10 }}>{record.failureCount}</td>
                <td style={{ padding: 10 }}>{record.retryCount}</td>
                <td style={{ padding: 10 }}>{record.resolution}</td>
                <td style={{ padding: 10 }}>{formatTime(record.lastFailedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
