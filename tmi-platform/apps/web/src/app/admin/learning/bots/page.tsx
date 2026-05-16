import { botIntelligenceGrowthEngine } from '@/lib/learning/BotIntelligenceGrowthEngine';
import {
  getFailedAdaptations,
  listFrozenLearningTargets,
  listUnstableLearningTargets,
} from '@/lib/learning/LearningSafetyEngine';

export default function AdminLearningBotsPage() {
  const prompts = botIntelligenceGrowthEngine.getPromptEffectiveness(30);
  const winners = prompts.filter((prompt) => prompt.recommendation === 'promote prompt');
  const weak = prompts.filter((prompt) => prompt.recommendation === 'retire prompt');
  const failedAdaptations = getFailedAdaptations(20).filter((record) => record.engine.includes('Bot'));
  const frozenTargets = listFrozenLearningTargets().filter((target) => target.includes('bot'));
  const unstableTargets = listUnstableLearningTargets().filter((target) => target.includes('bot'));

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Learning: Bot Intelligence Growth</h1>
      <p style={{ color: '#9befff' }}>
        Identify which prompts, reminders, and onboarding assists improve outcomes and which should be retired.
      </p>

      <h2>Promote Prompt Set</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(winners, null, 2)}
      </pre>

      <h2>Retire Prompt Set</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(weak, null, 2)}
      </pre>

      <h2>Failed Bot Evolution Attempts + Rollback Triggers</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #ff2daa44', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(failedAdaptations, null, 2)}
      </pre>

      <h2>Frozen / Unstable Bot Targets</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #ffd70044', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify({ frozenTargets, unstableTargets }, null, 2)}
      </pre>
    </main>
  );
}
