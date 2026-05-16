import { listDeployments } from '@/lib/ai-visuals/VisualDeploymentEngine';
import {
  getVisualQueuePrioritySummary,
  listVisualQueuePriorityRecords,
} from '@/lib/ai-visuals/VisualQueuePriorityEngine';
import Link from 'next/link';

export const metadata = {
  title: 'Visual Command Deployments | TMI',
  description: 'Deployment history with queue priority and critical work visibility.',
};

function formatTime(value: number): string {
  return new Date(value).toLocaleString();
}

export default function AdminVisualCommandDeploymentsPage() {
  const deployments = listDeployments();
  const priorities = listVisualQueuePriorityRecords();
  const summary = getVisualQueuePrioritySummary();

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
          <h1 style={{ margin: 0 }}>Visual Deployments</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
            Deployment stream plus queue priority pressure and critical items.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/visual-command">Back to Visual Command</Link>
          <Link href="/admin/visual-command/destinations">Destination Ownership</Link>
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
          ['Critical', summary.critical],
          ['High', summary.high],
          ['Medium', summary.medium],
          ['Low', summary.low],
          ['Deployments', deployments.length],
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
              <th style={{ padding: 10 }}>Deployment</th>
              <th style={{ padding: 10 }}>Slot</th>
              <th style={{ padding: 10 }}>Asset</th>
              <th style={{ padding: 10 }}>Version</th>
              <th style={{ padding: 10 }}>Rollback From</th>
              <th style={{ padding: 10 }}>Deployed At</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((item) => (
              <tr key={item.deploymentId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{item.deploymentId}</td>
                <td style={{ padding: 10 }}>{item.slotId}</td>
                <td style={{ padding: 10 }}>{item.assetId}</td>
                <td style={{ padding: 10 }}>{item.version}</td>
                <td style={{ padding: 10 }}>{item.rollbackFromAssetId ?? 'n/a'}</td>
                <td style={{ padding: 10 }}>{formatTime(item.deployedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.04)' }}>
              <th style={{ padding: 10 }}>Request</th>
              <th style={{ padding: 10 }}>Route</th>
              <th style={{ padding: 10 }}>Asset Kind</th>
              <th style={{ padding: 10 }}>Current Priority</th>
              <th style={{ padding: 10 }}>Recommended Priority</th>
              <th style={{ padding: 10 }}>Score</th>
              <th style={{ padding: 10 }}>Reason</th>
              <th style={{ padding: 10 }}>Failures</th>
            </tr>
          </thead>
          <tbody>
            {priorities.slice(0, 40).map((item) => (
              <tr key={item.requestId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{item.requestId}</td>
                <td style={{ padding: 10 }}>{item.route}</td>
                <td style={{ padding: 10 }}>{item.assetKind}</td>
                <td style={{ padding: 10 }}>{item.currentPriority}</td>
                <td style={{ padding: 10 }}>{item.recommendedPriority}</td>
                <td style={{ padding: 10 }}>{item.priorityScore}</td>
                <td style={{ padding: 10 }}>{item.reason}</td>
                <td style={{ padding: 10 }}>{item.failureCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
