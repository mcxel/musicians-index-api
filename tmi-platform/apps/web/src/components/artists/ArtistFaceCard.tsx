"use client";

import Link from "next/link";
import { ImageSlotWrapper } from '@/components/visual-enforcement';
import type { LiveArtist } from "@/lib/data/artistPool";
import type { MagazineSlot } from "@/lib/magazine/slotMap";

type ArtistFaceCardProps = {
  artist: LiveArtist;
  slot: MagazineSlot;
};

export default function ArtistFaceCard({ artist, slot }: ArtistFaceCardProps) {
  const src = artist.image || "/tmi-curated/host-main.png";

  const style = {
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    width: `${slot.w}%`,
    height: `${slot.h}%`,
    transform: "translate(-50%, -50%)",
  } as const;

  return (
    <article className={`live-face-slot live-face-slot--${slot.role}`} style={style} data-slot={slot.slotId}>
      <div className="live-face-slot__media-wrap">
        <ImageSlotWrapper
          imageId={`artist-face-${artist.id}`}
          roomId="artist-magazine-grid"
          priority="normal"
          fallbackUrl={src}
          altText={`${artist.name} portrait`}
          className="live-face-slot__image"
          containerStyle={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="live-face-slot__overlay">
        <span className="live-face-slot__rank">#{artist.rank}</span>
        <span className="live-face-slot__name">{artist.name}</span>
        <div className="live-face-slot__actions">
          <Link href={`/artist/${artist.id}`} className="live-face-slot__btn">View</Link>
          <Link href={`/vote/idol?artist=${artist.id}`} className="live-face-slot__btn">Vote</Link>
          <Link href={`/live/room/${artist.id}`} className="live-face-slot__btn">Live</Link>
        </div>
      </div>
    </article>
  );
}
