'use client';
// WorldPremierePanel.tsx — Upcoming exclusive drops with countdown
// Copilot wires: useWorldPremiere() — fetches next scheduled premiere
// Proof: premiere shows, countdown ticks, release fires at T=0
export function WorldPremierePanel() {
  return (
    <div className="tmi-premiere-panel">
      <div className="tmi-premiere-panel__label">WORLD PREMIERES</div>
      <div className="tmi-premiere-panel__text">An upcoming exclusive drop</div>
      <div className="tmi-premiere-panel__countdown" data-slot="countdown">
        {/* CountdownCard mounts here — Copilot wires */}
        <div className="tmi-countdown-display">01:14:32:05</div>
      </div>
      <div className="tmi-premiere-panel__art" data-slot="album-art">
        {/* New track / album art */}
        <div className="tmi-placeholder tmi-placeholder--art">New Track</div>
      </div>
    </div>
  );
}
