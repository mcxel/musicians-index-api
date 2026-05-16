"use client";

import { useGenreRotation, GENRE_LABELS } from "@/lib/engine/GenreRotationEngine";
import { getArtistsByGenre } from "@/lib/data/artistPool";
import { HOME1_SLOTS } from "@/lib/magazine/slotMap";
import ArtistFaceCard from "@/components/artists/ArtistFaceCard";

export default function MagazineHeroLive() {
  const { genre } = useGenreRotation(5000);
  const artists = getArtistsByGenre(genre, 10);

  return (
    <section className="magazine-hero-live" aria-label="Live Magazine Hero">
      <div className="magazine-hero-live__bg" aria-hidden />
      <div className="magazine-hero-live__rings" aria-hidden />

      <header className="magazine-hero-live__header">
        <p className="magazine-hero-live__kicker">Live Magazine Engine</p>
        <h2 className="magazine-hero-live__title">{GENRE_LABELS[genre]} Crown Cycle</h2>
      </header>

      <div className="magazine-hero-live__canvas">
        {HOME1_SLOTS.map((slot, index) => {
          const artist = artists[index];
          if (!artist) return null;
          return <ArtistFaceCard key={slot.slotId} artist={artist} slot={slot} />;
        })}
      </div>

      <div className="magazine-hero-live__footer">
        <span className="magazine-hero-live__badge">Top 10 Live</span>
        <span className="magazine-hero-live__badge">5s Genre Rotation</span>
        <span className="magazine-hero-live__badge">Slot-Based Render</span>
      </div>
    </section>
  );
}
