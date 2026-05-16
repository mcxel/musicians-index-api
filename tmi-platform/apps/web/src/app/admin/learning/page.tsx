import Link from 'next/link';
import { engagementLearningEngine } from '@/lib/learning/EngagementLearningEngine';
import { experienceOptimizationEngine } from '@/lib/learning/ExperienceOptimizationEngine';
import {
  getFailedAdaptations,
  getLearningHeatmap,
  getTopPerformingAdaptations,
  listFrozenLearningTargets,
  listLearningMutationLog,
  listUnstableLearningTargets,
} from '@/lib/learning/LearningSafetyEngine';
import { listAvatarBehaviorStates } from '@/lib/avatar/AvatarBehaviorEngine';

export default function AdminLearningPage() {
  const pulse = engagementLearningEngine.getPulse();
  const directives = experienceOptimizationEngine.generateDirectives().slice(0, 6);
  const mutationLog = listLearningMutationLog(40);
  const failedAdaptations = getFailedAdaptations(10);
  const topAdaptations = getTopPerformingAdaptations(10);
  const heatmap = getLearningHeatmap().slice(0, 20);
  const frozenTargets = listFrozenLearningTargets();
  const unstableTargets = listUnstableLearningTargets();
  const inactiveAvatars = listAvatarBehaviorStates().filter((state) => Date.now() - state.updatedAt > 86_400_000);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Platform Learning Core</h1>
      <p style={{ color: '#9befff', maxWidth: 900 }}>
        Adaptive intelligence layer built from engagement signals. The platform should improve from usage,
        visuals should evolve from performance, and bot behavior should improve from interaction outcomes.
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 16 }}>
        <div style={{ border: '1px solid #00ffff55', borderRadius: 12, padding: 12, background: '#0a0a1a' }}>
          <div style={{ color: '#99b', fontSize: 12 }}>Total Events</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{pulse.snapshot.totalEvents}</div>
        </div>
        <div style={{ border: '1px solid #00ffff55', borderRadius: 12, padding: 12, background: '#0a0a1a' }}>
          <div style={{ color: '#99b', fontSize: 12 }}>Engagement Rate</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{pulse.engagementRate}%</div>
        </div>
        <div style={{ border: '1px solid #00ffff55', borderRadius: 12, padding: 12, background: '#0a0a1a' }}>
          <div style={{ color: '#99b', fontSize: 12 }}>Share Rate</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{pulse.shareRate}%</div>
        </div>
        <div style={{ border: '1px solid #00ffff55', borderRadius: 12, padding: 12, background: '#0a0a1a' }}>
          <div style={{ color: '#99b', fontSize: 12 }}>Join/Leave Ratio</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{pulse.joinToLeaveRatio}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        <Link href="/admin/learning/engagement" style={{ color: '#00ffff' }}>Engagement</Link>
        <Link href="/admin/learning/retention" style={{ color: '#00ffff' }}>Retention</Link>
        <Link href="/admin/learning/dropoff" style={{ color: '#00ffff' }}>Drop-off</Link>
        <Link href="/admin/learning/visuals" style={{ color: '#00ffff' }}>Visual Evolution</Link>
        <Link href="/admin/learning/bots" style={{ color: '#00ffff' }}>Bot Growth</Link>
        <Link href="/admin/learning/conversion" style={{ color: '#00ffff' }}>Conversion</Link>
      </div>

      <section style={{ border: '1px solid #aa2dff55', borderRadius: 12, padding: 14, background: '#13081b', marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Optimization Directives</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {directives.map((directive) => (
            <li key={directive.id} style={{ marginBottom: 8 }}>
              <strong>{directive.priority.toUpperCase()}</strong> - {directive.action}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ border: '1px solid #00ffff33', borderRadius: 12, padding: 14, background: '#0a0a1a', marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Confidence + Before/After Comparisons</h2>
        <pre style={{ margin: 0, overflowX: 'auto' }}>
          {JSON.stringify(
            mutationLog.map((record) => ({
              engine: record.engine,
              metric: record.metric,
              status: record.status,
              confidence: record.confidence,
              before: record.beforeValue,
              after: record.appliedValue,
              blockedReason: record.blockedReason,
            })),
            null,
            2,
          )}
        </pre>
      </section>

      <section style={{ border: '1px solid #ff2daa55', borderRadius: 12, padding: 14, background: '#180914', marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Failed Evolution Attempts + Rollback Triggers</h2>
        <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(failedAdaptations, null, 2)}</pre>
      </section>

      <section style={{ border: '1px solid #ffd70055', borderRadius: 12, padding: 14, background: '#1b1608', marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Learning Heatmap + Top Performing Adaptations</h2>
        <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify({ heatmap, topAdaptations }, null, 2)}</pre>
      </section>

      <section style={{ border: '1px solid #aa2dff55', borderRadius: 12, padding: 14, background: '#13081b', marginTop: 18, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Inactive/Frozen/Unstable Avatar Flags</h2>
        <pre style={{ margin: 0, overflowX: 'auto' }}>
          {JSON.stringify({ inactiveAvatars, frozenTargets, unstableTargets }, null, 2)}
        </pre>
      </section>
    </main>
  );
}
