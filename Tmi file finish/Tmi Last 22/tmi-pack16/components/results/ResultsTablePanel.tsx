'use client';
// ResultsTablePanel.tsx — Structured results table: battle, event, tournament
// Copilot wires: useEventResults(eventId) or useBattleResults(roomId)
// Proof: results display correctly with rankings
export function ResultsTablePanel({ eventId, roomId }: { eventId?: string; roomId?: string }) {
  return (
    <div className="tmi-results-table">
      <div className="tmi-results-table__header">Results</div>
      <div className="tmi-results-table__rows" data-slot="results">
        {/* Copilot maps result rows: rank, name, score, outcome */}
      </div>
    </div>
  );
}
