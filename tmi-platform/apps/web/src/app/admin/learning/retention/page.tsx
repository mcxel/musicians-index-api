import { retentionPatternEngine } from '@/lib/learning/RetentionPatternEngine';
import { lobbyBehaviorEngine } from '@/lib/learning/LobbyBehaviorEngine';
import { rewardResponseEngine } from '@/lib/learning/RewardResponseEngine';

export default function AdminLearningRetentionPage() {
  const summary = retentionPatternEngine.getSummary();
  const retentionSignals = retentionPatternEngine.getRetentionSignals().slice(0, 15);
  const lobbySignals = lobbyBehaviorEngine.getLobbySignals(12);
  const rewardSignals = rewardResponseEngine.getRewardResponse(12);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Learning: Retention</h1>
      <p style={{ color: '#9befff' }}>Track churn risk, repeat sessions, lobby stickiness, and reward uplift.</p>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(summary, null, 2)}
      </pre>

      <h2>Top Retention Signals</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(retentionSignals, null, 2)}
      </pre>

      <h2>Lobby Retention</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(lobbySignals, null, 2)}
      </pre>

      <h2>Reward Response</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(rewardSignals, null, 2)}
      </pre>
    </main>
  );
}
