'use client';
// ReputationMeter.tsx — Visual reputation bar for artist/producer/venue
// Copilot wires: profile.reputationScore from useProfile()
// Proof: bar fills proportionally to score, milestones highlight
export function ReputationMeter({ score, maxScore = 10000, label = 'Reputation' }: { score: number; maxScore?: number; label?: string }) {
  const pct = Math.min(100, (score / maxScore) * 100);
  return (
    <div className="tmi-reputation-meter">
      <div className="tmi-reputation-meter__label">{label}</div>
      <div className="tmi-reputation-meter__bar">
        <div className="tmi-reputation-meter__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="tmi-reputation-meter__score">{score.toLocaleString()} pts</div>
    </div>
  );
}
