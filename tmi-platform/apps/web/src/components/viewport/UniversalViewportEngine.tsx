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

    case 'CYPHER':
      body = currentSession ? (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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
          {/* Cypher lower-third */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(170,45,255,0.4)', borderRadius: 8, padding: '6px 12px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#AA2DFF', boxShadow: '0 0 8px #AA2DFF', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#AA2DFF' }}>NOW IN THE CIRCLE</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#AA2DFF', letterSpacing: '0.08em' }}>🎤 CYPHER MODE</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>No active cypher. <a href="/live/cypher" style={{ color: '#AA2DFF', textDecoration: 'none', fontWeight: 700 }}>Browse cyphers →</a></div>
          </div>
        </div>
      );
      break;

    case 'GAME_SHOW':
      body = currentSession ? (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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
          {/* Game show lower-third */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,215,0,0.45)', borderRadius: 8, padding: '6px 12px' }}>
            <span style={{ fontSize: 13 }}>🎮</span>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700' }}>LIVE GAME · {currentSession.displayName.toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FFD700', letterSpacing: '0.08em' }}>🎮 GAME SHOW</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>No active game show. <a href="/live/game-show" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: 700 }}>Browse games →</a></div>
          </div>
        </div>
      );
      break;

    case 'MAGAZINE_TV':
      body = currentSession ? (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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
          {/* Magazine editorial lower-third */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px', background: 'linear-gradient(0deg, rgba(0,0,0,0.82) 0%, transparent 100%)' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 900 }}>TMI EDITORIAL BROADCAST</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 2 }}>{currentSession.displayName}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.08em' }}>📰 MAGAZINE TV</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>No broadcast active. <a href="/magazine" style={{ color: '#00FFFF', textDecoration: 'none', fontWeight: 700 }}>Open magazine →</a></div>
          </div>
        </div>
      );
      break;

    case 'TMI_TV':
      body = currentSession ? (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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
          {/* TMI TV channel badge */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,45,170,0.5)', borderRadius: 6, padding: '4px 10px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF2DAA', boxShadow: '0 0 6px #FF2DAA' }} />
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.25em', color: '#FF2DAA' }}>TMI LIVE</span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px', background: 'linear-gradient(0deg, rgba(0,0,0,0.82) 0%, transparent 100%)' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 900 }}>THE MUSICIAN&apos;S INDEX · LIVE CHANNEL</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 2 }}>{currentSession.displayName}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.08em' }}>📺 TMI TV</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>No broadcast active. <a href="/live" style={{ color: '#FF2DAA', textDecoration: 'none', fontWeight: 700 }}>Tune in →</a></div>
          </div>
        </div>
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
