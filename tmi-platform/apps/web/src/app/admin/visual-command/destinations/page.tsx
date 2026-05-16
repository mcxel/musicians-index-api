import {
  getVisualDestinationOwnershipSummary,
  listVisualDestinationOwnership,
} from '@/lib/ai-visuals/VisualDestinationOwnershipEngine';
import Link from 'next/link';

export const metadata = {
  title: 'Visual Command Destinations | TMI',
  description: 'Destination route ownership, deployment state, and queue health.',
};

function formatTime(value: number | null): string {
  return value ? new Date(value).toLocaleString() : 'never';
}

export default function AdminVisualCommandDestinationsPage() {
  const ownership = listVisualDestinationOwnership();
  const summary = getVisualDestinationOwnershipSummary();

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
          <h1 style={{ margin: 0 }}>Visual Destination Ownership</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
            Every destination has an owner, route owner, queue status, and deployment timestamp.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/visual-command">Back to Visual Command</Link>
          <Link href="/admin/visual-command/deployments">Deployments</Link>
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
          ['Healthy', summary.healthy],
          ['Watch', summary.watch],
          ['Critical', summary.critical],
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
              <th style={{ padding: 10 }}>Destination</th>
              <th style={{ padding: 10 }}>Route</th>
              <th style={{ padding: 10 }}>Slot</th>
              <th style={{ padding: 10 }}>Destination Owner</th>
              <th style={{ padding: 10 }}>Route Owner</th>
              <th style={{ padding: 10 }}>Queue</th>
              <th style={{ padding: 10 }}>Failed</th>
              <th style={{ padding: 10 }}>Deployments</th>
              <th style={{ padding: 10 }}>Last Deployment</th>
              <th style={{ padding: 10 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {ownership.map((item) => (
              <tr key={item.destinationId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{item.destinationId}</td>
                <td style={{ padding: 10 }}>{item.routePath}</td>
                <td style={{ padding: 10 }}>{item.slotName}</td>
                <td style={{ padding: 10 }}>{item.destinationOwner}</td>
                <td style={{ padding: 10 }}>{item.routeOwner}</td>
                <td style={{ padding: 10 }}>{item.pendingJobs}</td>
                <td style={{ padding: 10 }}>{item.failedJobs}</td>
                <td style={{ padding: 10 }}>{item.deploymentCount}</td>
                <td style={{ padding: 10 }}>{formatTime(item.lastDeploymentAt)}</td>
                <td style={{ padding: 10 }}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
