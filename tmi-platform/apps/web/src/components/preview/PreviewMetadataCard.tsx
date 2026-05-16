'use client';
import { ImageSlotWrapper } from '@/components/visual-enforcement';
// PreviewMetadataCard.tsx — Metadata overlay: source type, title, artist, duration
// Copilot wires: usePreviewMetadata(sourceUrl, sourceType)
// Proof: metadata populates from source, fallback shows if metadata unavailable
export function PreviewMetadataCard({ title, artist, sourceType, duration, thumbnailUrl }: { title?: string; artist?: string; sourceType?: string; duration?: string; thumbnailUrl?: string }) {
  return (
    <div className="tmi-preview-metadata">
      {thumbnailUrl && <ImageSlotWrapper imageId="img-fv5noq" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />}
      {title && <div className="tmi-preview-metadata__title">{title}</div>}
      {artist && <div className="tmi-preview-metadata__artist">{artist}</div>}
      {sourceType && <div className="tmi-preview-metadata__source">{sourceType}</div>}
      {duration && <div className="tmi-preview-metadata__duration">{duration}</div>}
    </div>
  );
}
