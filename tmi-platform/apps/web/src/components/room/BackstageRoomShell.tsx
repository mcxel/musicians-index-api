'use client';
// BackstageRoomShell.tsx — Pre-live staging area — performer-only access
// Copilot wires: useEventPreLive(eventId), usePerformerReadiness(eventId)
// Proof: only performers can access, countdown fires correctly
export function BackstageRoomShell({ eventId }: { eventId: string }) {
  return (
    <div className="tmi-backstage" data-event-id={eventId}>
      <div className="tmi-backstage-header">
        <div className="tmi-badge tmi-badge--backstage">Backstage · Pre-Live Only</div>
        <div data-slot="countdown" className="tmi-countdown">
          {/* CountdownCard to show start — Copilot wires */}
        </div>
      </div>
      <div className="tmi-backstage-lineup" data-slot="lineup">
        {/* Ordered performer list with ready/not-ready status */}
      </div>
      <div className="tmi-backstage-soundcheck" data-slot="soundcheck">
        <div className="tmi-soundcheck-items">
          <span>Mic ✓</span><span>Beat Preview ✓</span><span>Video ✓</span>
        </div>
      </div>
      <div className="tmi-backstage-notes" data-slot="host-notes">
        {/* Show notes from host/operator */}
      </div>
      <button className="tmi-btn-primary tmi-btn--lg">Mark Ready</button>
    </div>
  );
}
