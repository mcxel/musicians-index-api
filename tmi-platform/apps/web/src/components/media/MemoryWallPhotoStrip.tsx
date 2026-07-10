"use client";

import { useEffect, useState } from "react";
import type { MemoryItem } from "@/lib/profiles/MemoryWallEngine";

interface MemoryWallPhotoStripProps {
  entityId?: string;
  entityType?: string;
  accentColor?: string;
  max?: number;
}

// A few selected photos from the real Memory Wall, meant to sit next to the
// playlist — same /api/memory/wall source MemoryWall's own "Moments" tab
// uses, filtered down to just photo-type entries (Rule 20: real data or an
// honest empty state, never a placeholder image grid).
export default function MemoryWallPhotoStrip({ entityId, entityType = "performer", accentColor = "#FFD700", max = 6 }: MemoryWallPhotoStripProps) {
  const [photos, setPhotos] = useState<MemoryItem[] | null>(null);

  useEffect(() => {
    if (!entityId) { setPhotos([]); return; }
    let cancelled = false;
    fetch(`/api/memory/wall?entitySlug=${encodeURIComponent(entityId)}&entityType=${encodeURIComponent(entityType)}`)
      .then((r) => r.json())
      .then((d: { memories?: MemoryItem[] }) => {
        if (cancelled) return;
        const onlyPhotos = (d.memories ?? []).filter((m) => m.contentType === "photo").slice(0, max);
        setPhotos(onlyPhotos);
      })
      .catch(() => { if (!cancelled) setPhotos([]); });
    return () => { cancelled = true; };
  }, [entityId, entityType, max]);

  if (photos === null) {
    return <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", padding: "6px 0" }}>Loading photos…</div>;
  }

  if (photos.length === 0) {
    return (
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", padding: "6px 0" }}>
        No memory photos selected yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
      {photos.map((photo) => (
        <a
          key={photo.memoryId}
          href="#memory-wall"
          title={photo.title}
          style={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${accentColor}44`,
            display: "block",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.contentUrl} alt={photo.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </a>
      ))}
    </div>
  );
}
