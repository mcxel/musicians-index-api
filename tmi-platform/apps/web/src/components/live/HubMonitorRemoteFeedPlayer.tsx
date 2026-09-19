'use client';

/**
 * Monitor A remote performer feed — Daily receive-only via LobbyPreviewBindRuntime.
 * Used when hub assigns PERFORMER_FEED (watcher). Never substitutes poster/thumbnail
 * as live video (Rule 20). Honest empty while waiting for publisher tracks.
 */

import { useEffect, useRef } from 'react';
import { useLobbyPreviewBind } from '@/lib/lobby/useLobbyPreviewBind';
import { resolveHubMonitorViewport } from '@/lib/live/canonicalWorldViewport';

const FOH = resolveHubMonitorViewport('A');

function Idle({ label, hint }: { label: string; hint?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'radial-gradient(circle at 50% 28%, rgba(255,45,170,0.08), #010308 72%)',
      }}
    >
      <span style={{ fontSize: 24, opacity: 0.35 }}>📡</span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.42)',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '0 16px',
        }}
      >
        {label}
      </span>
      {hint ? (
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textAlign: 'center', padding: '0 20px' }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export default function HubMonitorRemoteFeedPlayer({ roomId }: { roomId: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { mediaStream, bindStatus, bindReason } = useLobbyPreviewBind(roomId, {
    subscribed: true,
    focused: true,
    isLive: true,
    quality: 'medium',
  });

  const hasVideo =
    Boolean(mediaStream) &&
    Boolean(mediaStream?.getVideoTracks().some((t) => t.readyState === 'live'));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hasVideo && mediaStream) {
      if (video.srcObject !== mediaStream) {
        video.srcObject = mediaStream;
      }
      void video.play().catch(() => {});
      return;
    }
    video.srcObject = null;
  }, [hasVideo, mediaStream]);

  if (!roomId) {
    return <Idle label="No live room" hint="Open a live session from Lobby Wall" />;
  }

  if (!hasVideo) {
    const waiting =
      bindStatus === 'connecting' || bindStatus === 'idle'
        ? 'Connecting to remote camera…'
        : bindStatus === 'unavailable'
          ? 'Remote video unavailable'
          : 'Waiting for performer camera…';
    return (
      <Idle
        label={waiting}
        hint={bindReason ?? 'LIVE session may be listed before Daily publisher tracks arrive'}
      />
    );
  }

  return (
    <div
      data-hub-monitor-remote-feed="true"
      data-bind-status={bindStatus}
      data-canonical-viewport={FOH.role}
      style={{ position: 'absolute', inset: 0, background: '#000' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 4,
          padding: '2px 8px',
          borderRadius: 4,
          background: 'rgba(0,0,0,0.65)',
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: '0.12em',
          color: '#FF2DAA',
          pointerEvents: 'none',
        }}
      >
        {FOH.shortLabel} · REMOTE
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}
