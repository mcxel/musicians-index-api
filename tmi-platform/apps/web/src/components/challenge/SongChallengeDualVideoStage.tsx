"use client";

/**
 * Dual competitor WebRTC tiles for Song Challenge.
 * Reuses useStageWebRTC (same capture path as UniversalVenueRenderer / battles).
 * Rule 20: never fake a live face — honest empty/error when camera denied.
 */

import { useEffect, useRef } from "react";
import { useStageWebRTC } from "@/hooks/useStageWebRTC";
import { SONG_CHALLENGE_SKIN as SKIN } from "@/lib/challenge/SongChallengeSkin";

export type ChallengerSeatRole = "audience" | "challenger-a" | "challenger-b";

export interface SongChallengeCompetitor {
  id: string;
  displayName: string;
  songTitle?: string | null;
  /** Optional remote MediaStream when peer signaling is wired */
  remoteStream?: MediaStream | null;
}

interface Props {
  role: ChallengerSeatRole;
  sideA: SongChallengeCompetitor | null;
  sideB: SongChallengeCompetitor | null;
  activeSide?: "A" | "B" | null;
  className?: string;
}

function RemoteOrEmptyTile({
  stream,
  accent,
  label,
  songTitle,
  isActive,
}: {
  stream: MediaStream | null | undefined;
  accent: string;
  label: string;
  songTitle?: string | null;
  isActive?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (stream) {
      ref.current.srcObject = stream;
    } else {
      ref.current.srcObject = null;
    }
  }, [stream]);

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: 180,
        borderRadius: 12,
        overflow: "hidden",
        border: `2px solid ${isActive ? accent : `${accent}66`}`,
        boxShadow: isActive ? `0 0 28px ${accent}55` : `0 0 12px ${accent}22`,
        background: "rgba(0,0,0,0.55)",
      }}
    >
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 180 }}
        />
      ) : (
        <div
          style={{
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.5 }}>📷</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: "0.08em" }}>
            {label}
          </div>
          <div style={{ fontSize: 9, color: SKIN.textMuted }}>
            Waiting for challenger camera — no fake live face
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "8px 10px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, color: accent }}>{label}</div>
        {songTitle ? (
          <div style={{ fontSize: 9, color: "#fff", marginTop: 2 }}>🎵 {songTitle}</div>
        ) : (
          <div style={{ fontSize: 9, color: SKIN.textMuted, marginTop: 2 }}>No song locked yet</div>
        )}
      </div>
    </div>
  );
}

function LocalCaptureTile({
  accent,
  label,
  songTitle,
  isActive,
}: {
  accent: string;
  label: string;
  songTitle?: string | null;
  isActive?: boolean;
}) {
  const { stream, error, videoRef } = useStageWebRTC({ video: true, audio: true, hd: false });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: 180,
        borderRadius: 12,
        overflow: "hidden",
        border: `2px solid ${isActive ? accent : `${accent}66`}`,
        boxShadow: isActive ? `0 0 28px ${accent}55` : `0 0 12px ${accent}22`,
        background: "rgba(0,0,0,0.55)",
      }}
    >
      {stream && !error ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 180 }}
        />
      ) : (
        <div
          style={{
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.5 }}>📷</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: accent }}>
            {error ? "Camera unavailable" : "Starting camera…"}
          </div>
          <div style={{ fontSize: 9, color: SKIN.textMuted }}>
            {error ?? "Allow camera/mic to show your face in the venue"}
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "8px 10px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, color: accent }}>{label} · YOU</div>
        {songTitle ? (
          <div style={{ fontSize: 9, color: "#fff", marginTop: 2 }}>🎵 {songTitle}</div>
        ) : (
          <div style={{ fontSize: 9, color: SKIN.textMuted, marginTop: 2 }}>Pick your best track</div>
        )}
      </div>
    </div>
  );
}

export default function SongChallengeDualVideoStage({
  role,
  sideA,
  sideB,
  activeSide = null,
  className,
}: Props) {
  const aLabel = sideA?.displayName?.trim() || "Challenger A";
  const bLabel = sideB?.displayName?.trim() || "Challenger B";

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 10,
        alignItems: "stretch",
        padding: "10px 12px",
        background: SKIN.bgRadial,
        borderBottom: `1px solid ${SKIN.sideA}33`,
      }}
    >
      {role === "challenger-a" ? (
        <LocalCaptureTile
          accent={SKIN.sideA}
          label={aLabel}
          songTitle={sideA?.songTitle}
          isActive={activeSide === "A"}
        />
      ) : (
        <RemoteOrEmptyTile
          stream={sideA?.remoteStream}
          accent={SKIN.sideA}
          label={aLabel}
          songTitle={sideA?.songTitle}
          isActive={activeSide === "A"}
        />
      )}

      <div
        style={{
          alignSelf: "center",
          background: SKIN.vsBadge,
          color: "#050510",
          fontWeight: 900,
          fontSize: 14,
          padding: "10px 12px",
          borderRadius: 8,
          boxShadow: `0 0 24px ${SKIN.vsBadgeGlow}`,
          letterSpacing: "0.06em",
        }}
      >
        VS
      </div>

      {role === "challenger-b" ? (
        <LocalCaptureTile
          accent={SKIN.sideB}
          label={bLabel}
          songTitle={sideB?.songTitle}
          isActive={activeSide === "B"}
        />
      ) : (
        <RemoteOrEmptyTile
          stream={sideB?.remoteStream}
          accent={SKIN.sideB}
          label={bLabel}
          songTitle={sideB?.songTitle}
          isActive={activeSide === "B"}
        />
      )}
    </div>
  );
}
