'use client';
// WinnerCard.tsx — Winner announcement card — used in results, events, battles
// Copilot wires: useBattleResult(roomId) or useEventResult(eventId)
// Proof: winner shows correctly after event/battle ends
export function WinnerCard({ winnerName, winnerAvatarUrl, category, points }: { winnerName: string; winnerAvatarUrl?: string; category?: string; points?: number }) {
  return (
    <div className="tmi-winner-card">
      <div className="tmi-winner-card__crown">👑</div>
      <div className="tmi-winner-card__label">{category || 'WINNER'}</div>
      {winnerAvatarUrl && <img src={winnerAvatarUrl} alt={winnerName} className="tmi-winner-card__avatar" />}
      <div className="tmi-winner-card__name">{winnerName}</div>
      {points && <div className="tmi-winner-card__points">+{points} pts</div>}
    </div>
  );
}
