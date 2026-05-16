'use client';
// BroadcastPanel.tsx — Platform broadcasts (operator or venue-level)
// Copilot wires: useBroadcasts() — fetches recent broadcasts
// Proof: broadcasts load, Big Ace can post from /admin/command-center
export function BroadcastPanel() {
  return (
    <div className="tmi-broadcast-panel">
      <div className="tmi-broadcast-panel__header">Platform Broadcasts</div>
      <div className="tmi-broadcast-panel__list" data-slot="broadcasts">
        {/* Copilot maps broadcast cards */}
      </div>
    </div>
  );
}
