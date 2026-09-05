"use client";

import { useEffect, useState } from "react";
import MediaPlayerChassisPreview from "@/components/media/MediaPlayerChassisPreview";
import { MEDIA_PLAYER_CHASSIS_REGISTRY, type MediaPlayerChassisId } from "@/lib/artifacts/PlaylistArtifactEngine";

interface ProfileMediaPlayerShowcaseProps {
  ownerSlug: string;
  accentColor?: string;
}

interface ShowcasePayload {
  displayChassisId: MediaPlayerChassisId;
  followActivePlayer: boolean;
}

export default function ProfileMediaPlayerShowcase({
  ownerSlug,
  accentColor = "#00FFFF",
}: ProfileMediaPlayerShowcaseProps) {
  const [state, setState] = useState<ShowcasePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/profile/media-player?slug=${encodeURIComponent(ownerSlug)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data: Partial<ShowcasePayload> & { ok?: boolean; error?: string }) => {
        if (cancelled) return;
        if (!data.ok && data.error) {
          setError(data.error);
          return;
        }
        if (!data.displayChassisId || !(data.displayChassisId in MEDIA_PLAYER_CHASSIS_REGISTRY)) {
          setError("Media player unavailable.");
          return;
        }
        setState({
          displayChassisId: data.displayChassisId,
          followActivePlayer: Boolean(data.followActivePlayer),
        });
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load media player.");
      });
    return () => {
      cancelled = true;
    };
  }, [ownerSlug]);

  const chassis = state ? MEDIA_PLAYER_CHASSIS_REGISTRY[state.displayChassisId] : null;

  return (
    <div
      data-profile-media-player-showcase
      style={{
        marginBottom: 20,
        borderRadius: 14,
        border: `1px solid ${accentColor}33`,
        background: "rgba(5,5,20,0.85)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: `1px solid ${accentColor}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
          TMI MEDIA PLAYER
        </span>
        {state ? (
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
            {state.followActivePlayer ? "Following active player" : "Profile skin locked"}
          </span>
        ) : null}
      </div>
      <div style={{ minHeight: 140, padding: 12 }}>
        {error ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>{error}</div>
        ) : chassis ? (
          <MediaPlayerChassisPreview chassis={chassis} owned equipped />
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
            Loading media player…
          </div>
        )}
      </div>
    </div>
  );
}
