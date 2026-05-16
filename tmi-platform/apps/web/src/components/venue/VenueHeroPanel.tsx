'use client';
// VenueHeroPanel.tsx — Top of venue page: identity, type, digital twin status
// Copilot wires: useVenueProfile(slug) → /venues/[slug] route
// Proof: venue renders with identity, active rooms count correct
export function VenueHeroPanel({ slug }: { slug: string }) {
  return (
    <div className="tmi-venue-hero">
      <div className="tmi-venue-hero__bg" data-slot="venue-bg" />
      <div className="tmi-venue-hero__content">
        <div className="tmi-venue-hero__type" data-slot="type">Club · Hip Hop</div>
        <h1 className="tmi-venue-hero__name" data-slot="name">Venue Name</h1>
        <div className="tmi-venue-hero__location" data-slot="location">Atlanta, GA</div>
        <div className="tmi-venue-hero__twin-badge">Digital Venue Twin Active</div>
        <div className="tmi-venue-hero__stats" data-slot="stats">
          <div className="tmi-stat"><span className="tmi-stat__num" data-slot="shows">24</span><span className="tmi-stat__label">Shows This Month</span></div>
          <div className="tmi-stat"><span className="tmi-stat__num" data-slot="live">3</span><span className="tmi-stat__label">Live Now</span></div>
        </div>
        <div className="tmi-venue-hero__actions">
          <button className="tmi-btn-primary">Join Active Room</button>
          <button className="tmi-btn-ghost">View Schedule</button>
          <button className="tmi-btn-ghost">Book This Venue</button>
        </div>
      </div>
    </div>
  );
}
