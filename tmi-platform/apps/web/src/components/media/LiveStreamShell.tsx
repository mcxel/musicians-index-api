'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export type StreamMode = 'viewer' | 'participant' | 'spotlight' | 'admin-monitor' | 'ad' | 'preview';
export type StreamState = 'CONNECTING' | 'LIVE' | 'OFFLINE' | 'CAMERA_OFF' | 'AD' | 'AVATAR';

interface LiveStreamShellProps {
  mode?:           StreamMode;
  roomId?:         string;
  channelId?:      string;
  userId?:         string;
  title?:          string;
  fallbackAvatar?: string;       // emoji or image URL
  sponsorAssetUrl?: string;
  accentColor?:    string;
  muted?:          boolean;
  autoplay?:       boolean;
  compact?:        boolean;      // small admin-monitor tile
  onClick?:        () => void;
  onJoinCamera?:   (stream: MediaStream) => void;
  onLeave?:        () => void;
}

const STATE_LABELS: Record<StreamState, string> = {
  CONNECTING: 'CONNECTING', LIVE: 'LIVE', OFFLINE: 'OFFLINE',
  CAMERA_OFF: 'CAMERA OFF', AD: 'AD', AVATAR: 'OFFLINE',
};

const STATE_COLORS: Record<StreamState, string> = {
  CONNECTING: '#FFD700', LIVE: '#FF2DAA', OFFLINE: '#444',
  CAMERA_OFF: '#888',   AD: '#AA2DFF',  AVATAR: '#333',
};

export default function LiveStreamShell({
  mode = 'viewer',
  roomId = 'room-1',
  title = 'Live Room',
  fallbackAvatar = '🎤',
  sponsorAssetUrl,
  accentColor = '#00FFFF',
  muted = true,
  compact = false,
  onClick,
  onJoinCamera,
  onLeave,
}: LiveStreamShellProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streamState, setStreamState] = useState<StreamState>('AVATAR');
  const [isMuted, setIsMuted]         = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const joinCamera = useCallback(async () => {
    if (streamState === 'LIVE') return;
    setStreamState('CONNECTING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play(); }
      setStreamState('LIVE');
      onJoinCamera?.(stream);
    } catch {
      setStreamState('OFFLINE');
    }
  }, [streamState, onJoinCamera]);

  const leaveCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamState('AVATAR');
    onLeave?.();
  }, [onLeave]);

  const toggleFullscreen = useCallback(() => setIsFullscreen(f => !f), []);

  const liveColor = STATE_COLORS[streamState];
  const fs        = compact ? 10 : 14;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset:    isFullscreen ? 0 : undefined,
        zIndex:   isFullscreen ? 9999 : undefined,
        background: '#000',
        borderRadius: compact ? 8 : 12,
        overflow: 'hidden',
        border: `1px solid ${accentColor}22`,
        cursor: onClick ? 'pointer' : 'default',
        aspectRatio: compact ? undefined : '16/9',
        width: '100%',
      }}
    >
      {/* Video element (hidden until camera is live) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: streamState === 'LIVE' ? 'block' : 'none' }}
      />

      {/* Ad/Sponsor mode */}
      {mode === 'ad' && sponsorAssetUrl && (
        <video
          src={sponsorAssetUrl}
          autoPlay
          playsInline
          muted={isMuted}
          loop
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Fallback avatar / offline state */}
      {(streamState === 'AVATAR' || streamState === 'OFFLINE') && mode !== 'ad' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0018, #050510)' }}>
          <div style={{ fontSize: compact ? 28 : 48, marginBottom: 8 }}>
            {fallbackAvatar.startsWith('http') || fallbackAvatar.startsWith('/')
              ? <img src={fallbackAvatar} alt="" style={{ width: compact ? 48 : 80, height: compact ? 48 : 80, borderRadius: '50%', objectFit: 'cover' }} />
              : fallbackAvatar
            }
          </div>
          {!compact && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>{title}</div>}
        </div>
      )}

      {/* Status badge */}
      <div style={{ position: 'absolute', top: compact ? 4 : 10, left: compact ? 4 : 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.75)', borderRadius: 20, padding: compact ? '2px 6px' : '4px 10px' }}>
        <div style={{ width: compact ? 5 : 7, height: compact ? 5 : 7, borderRadius: '50%', background: liveColor, boxShadow: streamState === 'LIVE' ? `0 0 6px ${liveColor}` : 'none' }} />
        <span style={{ fontSize: compact ? 7 : 9, fontWeight: 800, color: liveColor, letterSpacing: '0.08em' }}>{STATE_LABELS[streamState]}</span>
      </div>

      {/* Room title */}
      {!compact && (
        <div style={{ position: 'absolute', bottom: 44, left: 10, right: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{title}</div>
        </div>
      )}

      {/* Controls bar */}
      {!compact && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {mode === 'viewer' && streamState !== 'LIVE' && (
              <button onClick={(e) => { e.stopPropagation(); void joinCamera(); }}
                style={{ padding: '5px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', background: accentColor, color: '#050510', border: 'none', borderRadius: 20, cursor: 'pointer' }}>
                JOIN CAMERA
              </button>
            )}
            {streamState === 'LIVE' && (
              <button onClick={(e) => { e.stopPropagation(); leaveCamera(); }}
                style={{ padding: '5px 10px', fontSize: 9, fontWeight: 700, background: 'rgba(255,68,68,0.2)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 20, cursor: 'pointer' }}>
                LEAVE
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {streamState === 'LIVE' && (
              <button onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }}
                style={{ width: 26, height: 26, fontSize: 11, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#fff' }}>
                {isMuted ? '🔇' : '🔊'}
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              style={{ width: 26, height: 26, fontSize: 11, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#fff' }}>
              {isFullscreen ? '⊡' : '⛶'}
            </button>
          </div>
        </div>
      )}

      {/* Compact room label */}
      {compact && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '3px 5px', background: 'rgba(0,0,0,0.7)', fontSize: fs, color: 'rgba(255,255,255,0.7)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
      )}

      {/* Viewer count */}
      {!compact && (
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.6)', padding: '3px 7px', borderRadius: 10 }}>
          {roomId}
        </div>
      )}
    </motion.div>
  );
}
