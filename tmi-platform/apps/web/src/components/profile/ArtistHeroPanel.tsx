'use client';
// ArtistHeroPanel.tsx — Full artist hero: photo, rank, name, tier, stats, actions
// Copilot wires: useArtistProfile(slug) — fetches all fields
// Proof: Diamond badge shows for Marcel/BJ, rank shows correctly, media links work
export function ArtistHeroPanel({ slug }: { slug: string }) {
  return (
    <div className="tmi-artist-hero">
      <div className="tmi-artist-hero__bg" data-slot="hero-bg" />
      <div className="tmi-artist-hero__content">
        <div className="tmi-artist-hero__avatar" data-slot="avatar">
          <div className="tmi-avatar-placeholder" />
        </div>
        <div className="tmi-artist-hero__identity">
          <div className="tmi-artist-hero__rank" data-slot="rank">#3 Overall</div>
          <h1 className="tmi-artist-hero__name" data-slot="name">Artist Name</h1>
          <div className="tmi-artist-hero__handle" data-slot="handle">@artisthandle</div>
          <div data-slot="tier">{/* DiamondTierBadge — Copilot wires */}</div>
          <div className="tmi-artist-hero__genres" data-slot="genres">
            {/* Genre tags — Copilot maps from profile.genreTags */}
          </div>
        </div>
        <div className="tmi-artist-hero__stats" data-slot="stats">
          <div className="tmi-stat"><span className="tmi-stat__num">1.4K</span><span className="tmi-stat__label">Followers</span></div>
          <div className="tmi-stat"><span className="tmi-stat__num">12</span><span className="tmi-stat__label">Cypher Wins</span></div>
          <div className="tmi-stat"><span className="tmi-stat__num">$1,870</span><span className="tmi-stat__label">Revenue</span></div>
        </div>
        <div className="tmi-artist-hero__actions">
          <button className="tmi-btn-primary">Follow</button>
          <button className="tmi-btn-ghost">Go Live</button>
          <button className="tmi-btn-ghost">Upload Link</button>
          <button className="tmi-btn-ghost">Book</button>
        </div>
      </div>
    </div>
  );
}
