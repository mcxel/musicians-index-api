import { engagementLearningEngine } from '@/lib/learning/EngagementLearningEngine';
import { clickPatternEngine } from '@/lib/learning/ClickPatternEngine';
import { contentInterestEngine } from '@/lib/learning/ContentInterestEngine';

export default function AdminLearningEngagementPage() {
  const pulse = engagementLearningEngine.getPulse();
  const topClicks = clickPatternEngine.getTopClickTargets(10);
  const topContent = contentInterestEngine.getTopContent(10);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Learning: Engagement</h1>
      <p style={{ color: '#9befff' }}>Signals from clicks, reads, listens, shares, and session behavior.</p>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(pulse, null, 2)}
      </pre>

      <h2>Top Click Targets</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(topClicks, null, 2)}
      </pre>

      <h2>Top Content Interest</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(topContent, null, 2)}
      </pre>
    </main>
  );
}
