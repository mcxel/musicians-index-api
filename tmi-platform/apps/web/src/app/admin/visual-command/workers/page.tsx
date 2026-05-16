import {
  getVisualWorkerHealthSummary,
  listVisualWorkerHealthRecords,
} from '@/lib/ai-visuals/VisualWorkerHealthEngine';
import {
  getVisualWorkerSpecialtySummary,
  listVisualWorkerSpecialties,
} from '@/lib/ai-visuals/VisualWorkerSpecialtyEngine';
import { getWorkforceSchedulerSnapshot } from '@/lib/automation/WorkforceSchedulerEngine';
import { ensureWorkforceSchedulerRuntime } from '@/lib/integration/EconomyIntegrationRuntime';
import Link from 'next/link';

export const metadata = {
  title: 'Visual Command Workers | TMI',
  description: 'Worker health, specialty coverage, and queue exposure.',
};

export default function AdminVisualCommandWorkersPage() {
  ensureWorkforceSchedulerRuntime();
  const health = listVisualWorkerHealthRecords();
  const healthSummary = getVisualWorkerHealthSummary();
  const specialties = listVisualWorkerSpecialties();
  const specialtySummary = getVisualWorkerSpecialtySummary();
  const scheduler = getWorkforceSchedulerSnapshot('global-economy-runtime');

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
          <h1 style={{ margin: 0 }}>Visual Worker Control</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
            Health score, specialty matching, and failure exposure for each worker bot.
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
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 8,
        }}
      >
        {[
          ['Green', healthSummary.green],
          ['Yellow', healthSummary.yellow],
          ['Red', healthSummary.red],
          ['Avg Health', healthSummary.averageHealth],
          ['Overloaded', specialtySummary.overloadedWorkers],
          ['Underused', specialtySummary.underusedWorkers],
          ['Balanced', specialtySummary.balancedWorkers],
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

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 8,
        }}
      >
        {[
          ['Scheduler', scheduler ? 'Active' : 'Offline'],
          ['Daily %', scheduler?.daily.completionPercent ?? 0],
          ['Weekly %', scheduler?.weekly.completionPercent ?? 0],
          ['Monthly %', scheduler?.monthly.completionPercent ?? 0],
          ['Yearly %', scheduler?.yearly.completionPercent ?? 0],
          ['MC Health', scheduler?.mc.commandHealth ?? 'n/a'],
          ['Big Ace Health', scheduler?.bigAce.platformHealth ?? 'n/a'],
          ['Readiness', scheduler?.bigAce.readinessScore ?? 0],
        ].map(([label, value]) => (
          <div
            key={label as string}
            style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>{label as string}</div>
            <div style={{ marginTop: 4, fontSize: 24, fontWeight: 700 }}>
              {value as string | number}
            </div>
          </div>
        ))}
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.04)' }}>
              <th style={{ padding: 10 }}>Worker</th>
              <th style={{ padding: 10 }}>Specialty</th>
              <th style={{ padding: 10 }}>Health</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Fatigue</th>
              <th style={{ padding: 10 }}>Queue</th>
              <th style={{ padding: 10 }}>Success</th>
              <th style={{ padding: 10 }}>Failure</th>
              <th style={{ padding: 10 }}>Active Task</th>
            </tr>
          </thead>
          <tbody>
            {health.map((item) => (
              <tr key={item.workerId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{item.name}</td>
                <td style={{ padding: 10 }}>{item.specialty}</td>
                <td style={{ padding: 10 }}>{item.healthScore}</td>
                <td style={{ padding: 10 }}>{item.status}</td>
                <td style={{ padding: 10 }}>{item.fatigue}</td>
                <td style={{ padding: 10 }}>{item.queueLoad}</td>
                <td style={{ padding: 10 }}>{item.successRate}%</td>
                <td style={{ padding: 10 }}>{item.failureRate}%</td>
                <td style={{ padding: 10 }}>{item.activeTask ?? 'idle'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.04)' }}>
              <th style={{ padding: 10 }}>Worker</th>
              <th style={{ padding: 10 }}>Compatible Kinds</th>
              <th style={{ padding: 10 }}>Assigned</th>
              <th style={{ padding: 10 }}>Failure Exposure</th>
              <th style={{ padding: 10 }}>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {specialties.map((item) => (
              <tr key={item.workerId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{item.workerName}</td>
                <td style={{ padding: 10 }}>{item.compatibleKinds.join(', ')}</td>
                <td style={{ padding: 10 }}>{item.assignedJobs}</td>
                <td style={{ padding: 10 }}>{item.failureExposure}</td>
                <td style={{ padding: 10 }}>{item.utilizationPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
