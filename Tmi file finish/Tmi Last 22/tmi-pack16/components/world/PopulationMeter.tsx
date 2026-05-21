'use client';
// PopulationMeter.tsx — Shows live platform activity: rooms, artists, viewers
// Copilot wires: useWorldActivity() — real-time population signals
// Proof: numbers update in real-time, animated per NUMBER_MOVEMENT_SYSTEM
export function PopulationMeter() {
  return (
    <div className="tmi-population-meter">
      <div className="tmi-population-meter__item">
        <span className="tmi-population-meter__num" data-slot="active-rooms">0</span>
        <span className="tmi-population-meter__label">Rooms Live</span>
      </div>
      <div className="tmi-population-meter__item">
        <span className="tmi-population-meter__num" data-slot="artists-live">0</span>
        <span className="tmi-population-meter__label">Artists Live</span>
      </div>
      <div className="tmi-population-meter__item">
        <span className="tmi-population-meter__num" data-slot="viewers">0</span>
        <span className="tmi-population-meter__label">Watching Now</span>
      </div>
    </div>
  );
}
