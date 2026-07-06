'use client';

/**
 * VideoMonitorGrid — The canonical 4-panel monitor system for TMI-OS.
 *
 * Layout: 2 big (left column) + 2 mini (right column).
 * Each monitor is independent — different feed, different controls, different state.
 * Every surface that needs this layout uses this ONE component.
 *
 * Slots:
 *   slot1 — top-left big:    Main stream (performer live, artist highlight)
 *   slot2 — bottom-left big: Secondary (audience view, lobby, battle feed)
 *   slot3 — top-right mini:  Utility (self camera, PiP)
 *   slot4 — bottom-right mini: Billboard (memory wall scroll, sponsor, ticker)
 *
 * Sound feedback: /sounds/ui/ pack — no extra dependencies.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '@/lib/sound/playSound';
import { BroadcastSourceSelector } from '@/components/broadcast/BroadcastSourceSelector';

// ── Feed types each monitor can cycle through ─────────────────────────────────

// All media types a monitor can display — video, ad, commercial, performance included
export type MonitorFeed =
  | 'live-stream'      // performer live WebRTC broadcast
  | 'audience'         // audience/crowd view
  | 'self-camera'      // user's own webcam PiP
  | 'now-available'    // latest content feed canister
  | 'memory-wall'      // memory wall scroll
  | 'playlist'         // now-playing + visualizer
  | 'billboard'        // live lobby wall scroll
  | 'battle-feed'      // battle room
  | 'cypher-feed'      // cypher circle
  | 'challenge-feed'   // challenge room
  | 'sponsor'          // sponsor content
  | 'ad'               // ad/commercial — any injected video ad
  | 'commercial'       // branded commercial break
  | 'video'            // any video file (performance replay, VOD, highlight)
  | 'performance'      // recorded performance replay
  | 'curtain'          // pre-show curtain (settle-in buffer before live starts)
  | 'screen-share'     // user's own screen share
  | 'empty';           // no signal / offline

interface FeedMeta {
  label: string;
  badge: string;
  badgeColor: string;
  icon: string;
}

const FEED_META: Record<MonitorFeed, FeedMeta> = {
  'live-stream':    { label: 'Live Stage',      badge: 'LIVE',        badgeColor: '#E63000', icon: '🔴' },
  'audience':       { label: 'Audience View',   badge: 'AUDIENCE',    badgeColor: '#0070a0', icon: '👥' },
  'self-camera':    { label: 'Your Camera',     badge: 'PIP — YOU',   badgeColor: '#534AB7', icon: '📷' },
  'now-available':  { label: 'Now Available',   badge: 'NEW',         badgeColor: '#00C8FF', icon: '✨' },
  'memory-wall':    { label: 'Memory Wall',     badge: 'MEMORIES',    badgeColor: '#B47517', icon: '🧠' },
  'playlist':       { label: 'Now Playing',     badge: 'PLAYLIST',    badgeColor: '#007050', icon: '🎵' },
  'billboard':      { label: 'Lobby Wall',      badge: 'BILLBOARD',   badgeColor: '#005090', icon: '🏙️' },
  'battle-feed':    { label: 'Battle Arena',    badge: 'BATTLE',      badgeColor: '#9B0070', icon: '⚔️' },
  'cypher-feed':    { label: 'Cypher Circle',   badge: 'CYPHER',      badgeColor: '#006090', icon: '🎤' },
  'challenge-feed': { label: 'Challenge',       badge: 'CHALLENGE',   badgeColor: '#B06000', icon: '🎯' },
  'sponsor':        { label: 'Sponsor',         badge: 'SPONSORED',   badgeColor: '#606000', icon: '📢' },
  'ad':             { label: 'Advertisement',   badge: 'AD',          badgeColor: '#404040', icon: '📺' },
  'commercial':     { label: 'Commercial',      badge: 'COMMERCIAL',  badgeColor: '#303030', icon: '🎬' },
  'video':          { label: 'Video',           badge: 'VIDEO',       badgeColor: '#005080', icon: '▶️' },
  'performance':    { label: 'Performance',     badge: 'REPLAY',      badgeColor: '#800060', icon: '🎭' },
  'curtain':        { label: 'Show Starting',   badge: 'CURTAIN',     badgeColor: '#600000', icon: '🎪' },
  'empty':          { label: 'No Signal',       badge: 'OFFLINE',     badgeColor: '#333',    icon: '📺' },
  'screen-share':   { label: 'Screen Share',    badge: 'SHARING',     badgeColor: '#00A896', icon: '🖥️' },
};

const FEED_LABEL_OVERRIDES: Partial<Record<
  | 'host'
  | 'dj'
  | 'performer'
  | 'replay'
  | 'magazine'
  | 'camera'
  | 'friend'
  | 'lobby'
  | 'battle',
  MonitorFeed
>> = {
  host: 'live-stream',
  dj: 'playlist',
  performer: 'live-stream',
  replay: 'performance',
  magazine: 'now-available',
  camera: 'self-camera',
  friend: 'audience',
  lobby: 'billboard',
  battle: 'battle-feed',
};

const FEED_DISPLAY_LABEL: Partial<Record<MonitorFeed, string>> = {
  'live-stream': 'Main Stage',
  'audience': 'Audience',
  'self-camera': 'Camera',
  'now-available': 'Magazine',
  'playlist': 'DJ / Playlist',
  'billboard': 'Lobby',
  'performance': 'Replay',
  'screen-share': 'Screen Share',
};

// ── Per-monitor config (caller sets this) ──────────────────────────────────────

export interface MonitorConfig {
  /** Initial feed for this monitor */
  defaultFeed: MonitorFeed;
  /** Which feeds this monitor can cycle through on click */
  availableFeeds: MonitorFeed[];
  /** Optional media URL for stream/static feeds */
  mediaUrl?: string;
  /** Optional React node to render inside (e.g. <MemoryWall>, <LiveLobbyWallCanister>) */
  children?: React.ReactNode;
  /** Accent color for glow border on this monitor */
  accentColor?: string;
}

// ── Individual monitor ────────────────────────────────────────────────────────

export interface MonitorProps {
  config: MonitorConfig;
  size: 'big' | 'mini';
  onFeedChange?: (feed: MonitorFeed) => void;
}

export function Monitor({ config, size, onFeedChange }: MonitorProps) {
  const [feed, setFeed] = useState<MonitorFeed>(config.defaultFeed);
  const [isRecording, setIsRecording] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const accent = config.accentColor ?? FEED_META[feed].badgeColor;

  const captureScreenshot = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `tmi-monitor-screenshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSound('ui_camera_shutter');
  }, []);

  // Cycle to the next feed in the available list
  function cycleNext(e: React.MouseEvent) {
    e.stopPropagation();
    const idx = config.availableFeeds.indexOf(feed);
    const next = config.availableFeeds[(idx + 1) % config.availableFeeds.length];
    setFeed(next);
    onFeedChange?.(next);
    playSound('ui_whoosh_bubbles');
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
      setStreamActive(false);
    }
  }

  // Start webcam when self-camera feed is active
  const startLocalStream = useCallback(async () => {
    if (feed !== 'self-camera') return;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then(stream => {
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      }).catch(() => setStreamActive(false));
    return () => {
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    };
  }, [feed]);

  // Start screen share when feed is active
  const startScreenShare = useCallback(async () => {
    if (feed !== 'screen-share' || !('getDisplayMedia' in navigator.mediaDevices)) return;
    (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      }).catch(() => setStreamActive(false));
    return () => {
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    };
  }, [feed]);

  useEffect(() => {
    void startLocalStream();
    void startScreenShare();
  }, [feed]);

  const meta = FEED_META[feed];
  const h = size === 'big' ? '100%' : '100%';
  const showSyntheticFeed = !config.children && feed !== 'self-camera' && feed !== 'screen-share' && feed !== 'now-available' && feed !== 'empty';
  const sourceOptions = config.availableFeeds.map((entry) => {
    const normalized = FEED_LABEL_OVERRIDES[entry as keyof typeof FEED_LABEL_OVERRIDES] ?? entry;
    return { raw: entry, normalized };
  });

  function onSourceSelect(nextRaw: string) {
    const normalized = FEED_LABEL_OVERRIDES[nextRaw as keyof typeof FEED_LABEL_OVERRIDES] ?? nextRaw;
    const next = normalized as MonitorFeed;
    setFeed(next);
    onFeedChange?.(next);
    playSound('ui_whoosh_bubbles');
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: h,
        background: `radial-gradient(120% 120% at 15% 0%, ${accent}33, rgba(8,8,15,0.95)), #08080f`,
        border: `1.5px solid ${accent}55`,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        boxShadow: `0 0 16px ${accent}22`,
      }}
      onClick={cycleNext}
      title={`${meta.label} — click to switch feed`}
    >
      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `rgba(0,200,220,0.15)`,
        animation: 'tmiScan 3s linear infinite',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Video element (self-camera) */}
      {(feed === 'self-camera' || feed === 'screen-share') && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
      )}

      {/* Injected children (MemoryWall, LiveLobbyWall, etc.) */}
      {config.children && feed !== 'self-camera' && feed !== 'screen-share' && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {config.children}
        </div>
      )}

      {/* Built-in now-available feed preview */}
      {!config.children && feed === 'now-available' && (
        <div style={{ position: 'absolute', inset: 0, padding: size === 'big' ? 12 : 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            '🎵 4 New Songs',
            '🎥 2 New Videos',
            '📰 July Magazine Issue',
            '🎟 New Live Events',
          ].map((line) => (
            <div
              key={line}
              style={{
                fontSize: size === 'big' ? 10 : 8,
                color: 'rgba(255,255,255,0.82)',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(0,0,0,0.42)',
                borderRadius: 6,
                padding: '4px 6px',
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Synthetic feed visual to avoid dead-black monitors while source is not attached */}
      {showSyntheticFeed && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-20%',
              background: `conic-gradient(from 120deg, ${accent}35, rgba(10,20,40,0.1), ${accent}15, rgba(0,0,0,0.65))`,
              filter: 'blur(20px)',
              animation: 'tmiPulse 6s ease-in-out infinite',
            }}
          />

          <div style={{ position: 'absolute', left: 10, right: 10, bottom: size === 'big' ? 46 : 36, display: 'flex', gap: 4 }}>
            {[24, 42, 31, 55, 28, 38, 21, 60, 36, 48].map((v, i) => (
              <div
                key={`${feed}-${i}`}
                style={{
                  flex: 1,
                  height: `${v}%`,
                  minHeight: 3,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${accent}cc, rgba(255,255,255,0.08))`,
                  alignSelf: 'flex-end',
                  opacity: 0.75,
                }}
              />
            ))}
          </div>

          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 12px #00ff88aa' }} />
            <span style={{ fontSize: size === 'big' ? 8 : 7, color: 'rgba(234,238,255,0.8)', letterSpacing: '0.08em' }}>
              SIGNAL LOCKED
            </span>
          </div>
        </div>
      )}

      {/* Empty / offline placeholder */}
      {!config.children && feed === 'empty' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: size === 'big' ? 36 : 22, opacity: 0.25 }}>{meta.icon}</span>
          <span style={{ fontSize: size === 'big' ? 11 : 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', fontWeight: 700 }}>
            {meta.label.toUpperCase()}
          </span>
        </div>
      )}

      {/* LIVE badge */}
      <div style={{
        position: 'absolute', top: 6, right: 7,
        background: `${meta.badgeColor}cc`,
        color: '#fff', fontSize: size === 'big' ? 8 : 7,
        fontWeight: 800, padding: '2px 6px', borderRadius: 3, zIndex: 5,
        letterSpacing: '0.08em',
      }}>
        {meta.badge}
      </div>

      {/* Per-monitor source selector (Broadcast Bus) */}
      <BroadcastSourceSelector
        value={feed}
        size={size}
        onSelect={onSourceSelect}
        options={sourceOptions.map(({ raw, normalized }) => ({
          value: raw,
          label: FEED_DISPLAY_LABEL[normalized] ?? FEED_META[normalized]?.label ?? normalized,
        }))}
      />

      {/* Feed label */}
      <div style={{
        position: 'absolute', bottom: size === 'big' ? 28 : 20, left: 7,
        background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)',
        fontSize: size === 'big' ? 9 : 8, padding: '1px 5px', borderRadius: 3, zIndex: 5,
      }}>
        {meta.label}
      </div>

      {/* Camera-capture controls — only on self-camera feed */}
      {feed === 'self-camera' && (
        <div style={{
          position: 'absolute', bottom: 6, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 6, zIndex: 6,
        }}>
          <button
            onClick={e => { e.stopPropagation(); playSound('ui_camera_shutter'); setIsRecording(r => !r); }}
            style={{
              background: isRecording ? 'rgba(230,48,0,0.9)' : 'rgba(0,0,0,0.7)',
              border: `1px solid ${isRecording ? '#E63000' : 'rgba(255,255,255,0.3)'}`,
              color: '#fff', borderRadius: 4,
              fontSize: size === 'big' ? 9 : 8, padding: '3px 8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {isRecording && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'tmiRecDot 1s infinite' }} />}
            {isRecording ? 'Stop' : '● Record'}
          </button>
          <button
            onClick={captureScreenshot}
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: 4,
              fontSize: size === 'big' ? 9 : 8,
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            📸 Screenshot
          </button>
        </div>
      )}

      {/* Switch indicator bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 18,
        background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: config.availableFeeds.length > 1 ? 4 : 0, zIndex: 5,
      }}>
        {config.availableFeeds.map(f => (
          <div key={f} style={{
            width: f === feed ? 14 : 5, height: 3, borderRadius: 2,
            background: f === feed ? accent : 'rgba(255,255,255,0.15)',
            transition: 'all 0.2s',
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────

export interface VideoMonitorGridProps {
  /** Top-left — big, primary content */
  slot1: MonitorConfig;
  /** Bottom-left — big, secondary content */
  slot2: MonitorConfig;
  /** Top-right — mini, utility (self camera, PiP) */
  slot3: MonitorConfig;
  /** Bottom-right — mini, billboard (memory wall, sponsor, ticker) */
  slot4: MonitorConfig;
  /** Overall accent color for the grid frame */
  accentColor?: string;
  /** Label shown above the grid (e.g. performer name) */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function VideoMonitorGrid({
  slot1, slot2, slot3, slot4,
  accentColor = '#00FFFF',
  label,
  className,
  style,
}: VideoMonitorGridProps) {
  return (
    <div className={className} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Inject keyframes once */}
      <style>{`
        @keyframes tmiScan { 0%{top:-5%} 100%{top:105%} }
        @keyframes tmiRecDot { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes tmiPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.04) } }
      `}</style>

      {/* Grid header */}
      {label && (
        <div style={{
          fontSize: 9, fontWeight: 900, letterSpacing: '0.25em',
          color: `${accentColor}aa`, marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
      )}

      {/*
        Broadcast Director layout (2 big + 2 mini):
          ┌────────────────────────┬───────────────────┐
          │      slot1 BIG HERO    │    slot2 BIG      │
          │      (spans 2 rows)    ├──────────┬────────┤
          │                        │ slot3 M  │ slot4 M│
          └────────────────────────┴──────────┴────────┘
      */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.7fr 1.3fr',
        gridTemplateRows: '1.2fr 0.8fr',
        gap: 8,
        width: '100%',
        aspectRatio: '16/9',
      }}>
        {/* Big hero monitor */}
        <div style={{ gridColumn: '1', gridRow: '1 / span 2' }}>
          <Monitor config={slot1} size="big" />
        </div>

        {/* Big secondary monitor */}
        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <Monitor config={slot2} size="big" />
        </div>

        {/* Mini utility monitors */}
        <div style={{ gridColumn: '2', gridRow: '2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Monitor config={slot3} size="mini" />
          <Monitor config={slot4} size="mini" />
        </div>
      </div>

      {/* Accent glow frame */}
      <div style={{
        position: 'absolute', inset: -1, borderRadius: 12, pointerEvents: 'none',
        boxShadow: `0 0 32px ${accentColor}18, inset 0 0 0 1px ${accentColor}14`,
      }} />
    </div>
  );
}
