'use client';
// RegionalScenePanel.tsx — City/region music scene card
// Copilot wires: useRegionalScene(citySlug) — active artists, venues, events
// Proof: scene card loads with correct city, active artists show
export function RegionalScenePanel({ citySlug }: { citySlug: string }) {
  return (
    <div className="tmi-regional-scene">
      <div className="tmi-regional-scene__city" data-slot="city">Atlanta, GA</div>
      <div className="tmi-regional-scene__artists" data-slot="active-artists">
        {/* Active artists in this city */}
      </div>
      <div className="tmi-regional-scene__venues" data-slot="venues">
        {/* Active venues in this city */}
      </div>
      <button className="tmi-btn-ghost tmi-btn--sm">Explore Scene →</button>
    </div>
  );
}
