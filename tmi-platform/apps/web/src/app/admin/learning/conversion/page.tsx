import { ticketDemandEngine } from '@/lib/learning/TicketDemandEngine';
import { battleInterestEngine } from '@/lib/learning/BattleInterestEngine';
import { avatarBehaviorEngine } from '@/lib/learning/AvatarBehaviorEngine';
import { emoteLearningEngine } from '@/lib/learning/EmoteLearningEngine';
import { experienceOptimizationEngine } from '@/lib/learning/ExperienceOptimizationEngine';

export default function AdminLearningConversionPage() {
  const ticketDemand = ticketDemandEngine.getDemandSignals(15);
  const battleDemand = battleInterestEngine.getBattleSignals(15);
  const avatarSignals = avatarBehaviorEngine.getAvatarSignals(15);
  const emoteSignals = emoteLearningEngine.getTopEmotes(15);
  const directives = experienceOptimizationEngine.generateDirectives();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Learning: Conversion</h1>
      <p style={{ color: '#9befff' }}>
        Conversion intelligence across tickets, battles, avatar activity, emotes, and optimization directives.
      </p>

      <h2>Ticket Demand</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(ticketDemand, null, 2)}
      </pre>

      <h2>Battle Interest</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(battleDemand, null, 2)}
      </pre>

      <h2>Avatar + Emote Conversion Signals</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify({ avatarSignals, emoteSignals }, null, 2)}
      </pre>

      <h2>Experience Directives</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(directives, null, 2)}
      </pre>
    </main>
  );
}
