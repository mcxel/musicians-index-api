"use client";

import VerticalGenreScroller from "@/packages/motion/VerticalGenreScroller";
import { useGenreRotation } from "@/lib/engine/GenreRotationEngine";
import { TOP10_FACE_BY_GENRE } from "@/packages/home/experience/top10FaceData";
import MagazineArtifactCanvas from "@/packages/home/experience/MagazineArtifactCanvas";

export default function Home12Surface() {
  const { genre, label } = useGenreRotation(5000);
  const entries = TOP10_FACE_BY_GENRE[genre] ?? [];

  return (
    <main className="relative min-h-screen bg-black px-4 py-6 text-white">
      <section className="relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-2xl border border-fuchsia-300/35 bg-black/70 p-4">
        <MagazineArtifactCanvas />
        <div className="relative z-10 mb-3">
          <p className="tmi-hud-label" style={{ fontSize: 10 }}>TMI Home 1-2</p>
          <h1 className="tmi-promo-title" style={{ fontSize: 'clamp(1.25rem,3vw,2rem)' }}>Vertical Genre Conveyor</h1>
          <p className="tmi-body-copy" style={{ fontSize: '0.75rem' }}>Genre · {label} · 5s rotation</p>
        </div>
        <div className="relative z-10">
          <VerticalGenreScroller genre={genre} entries={entries} />
        </div>
      </section>
    </main>
  );
}
