'use client';

import { useEffect, useState } from 'react';
import MotionPosterPlayer from '@/components/media/MotionPosterPlayer';
import AvatarLobbyCanvas from '@/components/lobbies/AvatarLobbyCanvas';
import BattleSplitScreenPanel from '@/components/live/BattleSplitScreenPanel';

export type ViewportMode =
  | 'EMPTY_VENUE'
  | 'LIVE_VENUE'
  | 'AVATAR_LOBBY'
  | 'PLAYLIST'
  | 'TMI_TV'        // editorial / magazine TV broadcast
  | 'MAGAZINE_TV'
  | 'BATTLE_ARENA'
  | 'CYPHER'
  | 'GAME_SHOW';

export type ViewportRoomRuntimeState = 'IDLE' | 'MEDIA' | 'PRESHOW' | 'COUNTDOWN' | 'REVEAL' | 'LIVE' | 'POSTSHOW';

export interface ViewportSession {
  displayName: string;
  roomId: string;
  viewerCount: number;
  avatarUrl?: string | null;
  introVideoUrl?: string;
  motionPosterUrl?: string;
}

interface UniversalViewportEngineProps {
  role: 'fan' | 'performer';
  accentColor: string;
  stageAccent: string;
  defaultMode: ViewportMode;
  currentSession?: ViewportSession;
  curtainCountdown?: number;
  isCurtainClosed?: boolean;
  isCurtainOpening?: boolean;
  roomRuntimeState?: ViewportRoomRuntimeState;
  fanPlaylistTrackUrl?: string | null;
  onModeChange?: (mode: ViewportMode) => void;
  battleSession?: {
    performerA: { id: string; name: string; profileImageUrl: string; score?: number };
    performerB: { id: string; name: string; profileImageUrl: string; score?: number };
    host?: { id: string; name: string; profileImageUrl: string };
    roundLabel?: string;
    timerLabel?: string;
    winnerId?: string;
  };
}

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mm = String(Math.floor(clamped / 60)).padStart(2, '0');
  const ss = String(clamped % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function EmptyVenueState({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: accentColor, letterSpacing: '0.08em' }}>THE STAGE IS YOURS</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>No active room — select Live, Playlist, or Avatar Lobby to begin.</div>
      </div>
    </div>
  );
}

function PlaylistViewportState({ trackUrl, accentColor }: { trackUrl: string | null | undefined; accentColor: string }) {
  if (!trackUrl) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: accentColor }}>No track selected</div>
          <div style={{ fontSize: 11, marginTop: 6 }}>Add a track to your playlist to play it here.</div>
        </div>
      </div>
    );
  }
  const isVideo = /\.mp4(\?|$)|\.webm(\?|$)|\.m3u8(\?|$)|\.mov(\?|$)/i.test(trackUrl);
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#050510' }}>
      {isVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={trackUrl} controls autoPlay style={{ maxHeight: '100%', maxWidth: '100%' }} />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio src={trackUrl} controls autoPlay style={{ width: '80%' }} />
      )}
    </div>
  );
}

function CurtainOverlay({
  isCurtainClosed,
  isCurtainOpening,
  curtainCountdown,
  accentColor,
}: {
  isCurtainClosed: boolean;
  isCurtainOpening: boolean;
  curtainCountdown: number;
  accentColor: string;
}) {
  if (!isCurtainClosed) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a0414, #1a0a2e)',
        opacity: isCurtainOpening ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: isCurtainOpening ? 'none' : 'auto',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', fontWeight: 900, color: accentColor, textTransform: 'uppercase' }}>
          {curtainCountdown > 0 ? 'Going Live' : 'Entering Stage'}
        </div>
        {curtainCountdown > 0 && (
          <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', marginTop: 6 }}>{formatCountdown(curtainCountdown)}</div>
        )}
      </div>
    </div>
  );
}

export default function UniversalViewportEngine({
  role,
  accentColor,
  stageAccent,
  defaultMode,
  currentSession,
  curtainCountdown = 0,
  isCurtainClosed = false,
  isCurtainOpening = false,
  roomRuntimeState = 'IDLE',
  fanPlaylistTrackUrl,
  onModeChange,
  battleSession,
}: UniversalViewportEngineProps) {
  const [mode, setMode] = useState<ViewportMode>(defaultMode);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const isLive = roomRuntimeState === 'LIVE';

  let body: React.ReactNode;
  switch (mode) {
    case 'BATTLE_ARENA':
      body = battleSession ? (
        <BattleSplitScreenPanel
          performerA={battleSession.performerA}
          performerB={battleSession.performerB}
          host={battleSession.host}
          eventType="battle"
          roundLabel={battleSession.roundLabel}
          timerLabel={battleSession.timerLabel}
          showHost={!!battleSession.host}
          winnerId={battleSession.winnerId}
        />
      ) : (
        <EmptyVenueState accentColor={accentColor} />
      );
      break;
    case 'LIVE_VENUE':
    case 'CYPHER':
    case 'GAME_SHOW':
    case 'MAGAZINE_TV':
    case 'TMI_TV':
      body = currentSession ? (
        <MotionPosterPlayer
          isLive={isLive}
          liveRoomRoute={`/live/rooms/${currentSession.roomId}`}
          introVideoUrl={currentSession.introVideoUrl}
          motionPosterUrl={currentSession.motionPosterUrl}
          staticImageUrl={currentSession.avatarUrl ?? '/images/tmi-placeholder.jpg'}
          alt={currentSession.displayName}
          audienceCount={currentSession.viewerCount}
          showLiveOverlay
        />
      ) : (
        <EmptyVenueState accentColor={accentColor} />
      );
      break;
    case 'AVATAR_LOBBY':
      body = <AvatarLobbyCanvas roomName={role === 'performer' ? 'Backstage Lobby' : 'Avatar Lobby'} accentColor={stageAccent} />;
      break;
    case 'PLAYLIST':
      body = <PlaylistViewportState trackUrl={fanPlaylistTrackUrl} accentColor={accentColor} />;
      break;
    case 'EMPTY_VENUE':
    default:
      body = <EmptyVenueState accentColor={accentColor} />;
  }

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 16,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(12,20,50,0.95) 0%, rgba(7,7,26,0.98) 100%)',
        border: `1px solid ${stageAccent}33`,
        boxShadow: `0 0 15px ${stageAccent}26, inset 0 0 10px rgba(0,255,255,0.08)`,
      }}
    >
      {body}
      <CurtainOverlay
        isCurtainClosed={isCurtainClosed}
        isCurtainOpening={isCurtainOpening}
        curtainCountdown={curtainCountdown}
        accentColor={accentColor}
      />
    </div>
  );
}
