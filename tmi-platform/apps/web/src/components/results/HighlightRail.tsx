'use client';
// HighlightRail.tsx — Horizontal scrolling list of room highlight moments
// Copilot wires: useHighlights(roomId | eventId, { limit: 10 })
// Proof: highlights load, timestamps correct, clips playable
export function HighlightRail({ roomId, eventId }: { roomId?: string; eventId?: string }) {
  return (
    <div className="tmi-highlight-rail">
      <div className="tmi-highlight-rail__header">
        <span className="tmi-section-label">Highlights</span>
        <button className="tmi-btn-ghost tmi-btn--sm">See All →</button>
      </div>
      <div className="tmi-highlight-rail__scroll" data-slot="highlights">
        {/* Copilot maps highlight moments: timestamp, type, reaction_count, clip_url */}
        <div className="tmi-highlight-item tmi-placeholder">Best Verse</div>
        <div className="tmi-highlight-item tmi-placeholder">Crowd Spike</div>
        <div className="tmi-highlight-item tmi-placeholder">Fire Moment</div>
      </div>
    </div>
  );
}
