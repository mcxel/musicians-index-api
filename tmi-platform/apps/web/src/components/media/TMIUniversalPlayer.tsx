'use client';

/**
 * TMIUniversalPlayer — The TMI Television System.
 *
 * Every screen on the platform — lobby wall, stage, billboard, hub, dashboard,
 * sponsor preview, fan lounge, battle arena — runs through this single player.
 *
 * Sources: WebRTC live | HLS/DASH stream | VOD (MP4/WebM) | YouTube embed |
 *          Avatar canvas | Lobby feed | Sponsor/ad video | Idle hold screen
 *
 * Layers (bottom → top):
 *   1. Underlay   — ambient glow, chromatic bleed, background effects
 *   2. Source     — the actual video/canvas/iframe
 *   3. Frame      — neon/holographic/stage/glass/gold/circuit decorative border
 *   4. Overlay    — controls, badges, sponsor banner, reactions
 *   5. Children   — any custom content passed as React children
 *
 * Privacy: public (anyone) | lobby (same-room users only) | private (owner only)
 * Tiers:   free=480p | pro=720p | gold=1080p | diamond=4K + all frame styles
 */

import {
  useRef, useState, useEffect, useCallback, type ReactNode, type CSSProperties,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SourceMode =
  | 'webrtc'    // live getUserMedia / peer stream
  | 'hls'       // HLS manifest URL
  | 'vod'       // direct MP4/WebM/any video URL
  | 'youtube'   // YouTube embed by video ID
  | 'avatar'    // animated avatar canvas (ultra-realistic fallback)
  | 'lobby'     // lobby feed — other users' avatars/streams
  | 'ad'        // sponsor/advertiser video
  | 'idle';     // animated hold screen

export type FrameStyle =
  | 'neon'         // electric neon border, animated glow
  | 'holographic'  // prismatic rainbow-shift border
  | 'stage'        // theatrical red/gold stage curtain frame
  | 'glass'        // frosted glass edge
  | 'gold'         // premium VIP gold trim
  | 'circuit'      // tech circuit-board pattern
  | 'raw';         // no frame — pure content

export type SizePreset =
  | 'mini'       // 160×90   — inline tile
  | 'card'       // 320×180  — card embed
  | 'standard'   // 16/9 responsive
  | 'cinema'     // 21/9 ultrawide
  | 'square'     // 1/1
  | 'portrait'   // 9/16 mobile/reel
  | 'theater'    // large in-page, near-fullscreen
  | 'fill';      // fills parent container 100%

export type PrivacyMode = 'public' | 'lobby' | 'private';
export type VideoTier   = 'free' | 'pro' | 'gold' | 'platinum' | 'diamond';

export interface SponsorBanner {
  imageUrl?: string;
  videoUrl?: string;
  label:     string;
  linkUrl?:  string;
  position?: 'top' | 'bottom' | 'overlay-corner';
}

export interface TMIUniversalPlayerProps {
  // ── Source
  src?:          string;        // VOD/HLS URL or direct video URL
  youtubeId?:    string;        // YouTube video ID
  roomId?:       string;        // WebRTC/Daily room ID
  avatarEmoji?:  string;        // emoji for avatar fallback
  avatarName?:   string;
  lobbyId?:      string;
  mode?:         SourceMode;

  // ── Frame
  frameStyle?:   FrameStyle;
  frameColor?:   string;        // primary accent
  frameColor2?:  string;        // secondary accent (gradients)
  clipPath?:     string;        // CSS clip-path for geometric shapes
  scanLines?:    boolean;       // retro CRT scanline overlay
  filmGrain?:    boolean;

  // ── Size
  size?:         SizePreset;
  aspectRatio?:  string;        // custom e.g. '21/9' or '4/3'
  minHeight?:    number;

  // ── Content
  title?:        string;
  subtitle?:     string;
  overlay?:      ReactNode;     // custom overlay (above video, below controls)
  underlay?:     ReactNode;     // custom underlay (behind video)
  children?:     ReactNode;     // topmost layer
  sponsorBanner?: SponsorBanner;

  // ── Behavior
  privacy?:      PrivacyMode;
  tier?:         VideoTier;
  autoplay?:     boolean;
  muted?:        boolean;
  loop?:         boolean;
  controls?:     boolean;       // show built-in controls bar
  showBadge?:    boolean;       // show LIVE / quality badge
  allowFullscreen?: boolean;
  allowPiP?:     boolean;

  // ── Location
  countryCode?:  string;   // ISO 3166-1 alpha-2 e.g. 'US', 'NG', 'GB' — auto-converts to flag emoji
  countryFlag?:  string;   // raw flag emoji override e.g. '🇺🇸' (takes precedence over countryCode)

  // ── Callbacks
  onJoinCamera?: (stream: MediaStream) => void;
  onLeave?:      () => void;
  onClick?:      () => void;
  onEnded?:      () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_ASPECT: Record<SizePreset, string> = {
  mini:     '16/9',
  card:     '16/9',
  standard: '16/9',
  cinema:   '21/9',
  square:   '1/1',
  portrait: '9/16',
  theater:  '16/9',
  fill:     'unset',
};

const TIER_MAX_QUALITY: Record<VideoTier, string> = {
  free:     '480p',
  pro:      '720p',
  gold:     '1080p',
  platinum: '1080p',
  diamond:  '4K',
};

const FRAME_COLORS: Record<FrameStyle, [string, string]> = {
  neon:        ['#00FFFF', '#FF2DAA'],
  holographic: ['#AA2DFF', '#00FFFF'],
  stage:       ['#FFD700', '#FF2DAA'],
  glass:       ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)'],
  gold:        ['#FFD700', '#FFA500'],
  circuit:     ['#00FF88', '#00FFFF'],
  raw:         ['transparent', 'transparent'],
};

// ─── Country code → flag emoji ────────────────────────────────────────────────

function codeToFlag(code: string): string {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarCanvas({ emoji, name, accentColor }: { emoji: string; name: string; accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const t         = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      t.current += 0.016;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep space background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
      bg.addColorStop(0, '#0d0020');
      bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Pulsing ambient ring
      const pulse = 0.85 + Math.sin(t.current * 1.8) * 0.15;
      const ring = ctx.createRadialGradient(w / 2, h / 2, h * 0.18 * pulse, w / 2, h / 2, h * 0.46 * pulse);
      ring.addColorStop(0, accentColor + '33');
      ring.addColorStop(1, 'transparent');
      ctx.fillStyle = ring;
      ctx.fillRect(0, 0, w, h);

      // Orbiting particle ring
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t.current * 0.5;
        const r = h * 0.3 + Math.sin(t.current * 2 + i) * 8;
        const px = w / 2 + Math.cos(angle) * r;
        const py = h / 2 + Math.sin(angle) * r * 0.4;
        const alpha = 0.3 + Math.sin(t.current * 3 + i * 0.8) * 0.2;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = accentColor + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // Avatar circle background
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, h * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = accentColor + '22';
      ctx.fill();
      ctx.strokeStyle = accentColor + '66';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Emoji avatar
      ctx.font = `${h * 0.28}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, w / 2, h * 0.42);

      // Name label
      ctx.font = `bold ${h * 0.055}px Inter, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.fillText(name, w / 2, h * 0.72);

      // Bottom neon line
      const lineGrad = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, 0);
      lineGrad.addColorStop(0, 'transparent');
      lineGrad.addColorStop(0.5, accentColor);
      lineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.82);
      ctx.lineTo(w * 0.9, h * 0.82);
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [emoji, name, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

function LobbyFeed({ lobbyId, accentColor }: { lobbyId: string; accentColor: string }) {
  const LOBBY_AVATARS = ['🎤', '🎧', '🎵', '🥁', '🎸', '🎹', '🎷', '🎺', '🎻', '🎼'];
  const LOBBY_NAMES   = ['KreachBeat', 'NovaCipher', 'AriVolt', 'FlowState', 'YungMako', 'MysticT', 'Skeet', 'ParisC', 'LorenzM', 'JasonS'];
  const slots = Array.from({ length: 6 }, (_, i) => ({
    emoji: LOBBY_AVATARS[i % LOBBY_AVATARS.length],
    name:  LOBBY_NAMES[i % LOBBY_NAMES.length],
    live:  i < 2,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#050510', padding: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4 }}>
      {slots.map((s, i) => (
        <div key={i} style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: `1px solid ${s.live ? accentColor + '55' : 'rgba(255,255,255,0.06)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {s.live && <div style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: '#FF2DAA', boxShadow: '0 0 6px #FF2DAA' }} />}
          <div style={{ fontSize: 22 }}>{s.emoji}</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginTop: 2, letterSpacing: '0.05em' }}>{s.name}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
        LOBBY · {lobbyId}
      </div>
    </div>
  );
}

function FrameOverlay({
  style,
  color1,
  color2,
  size,
}: {
  style: FrameStyle;
  color1: string;
  color2: string;
  size: SizePreset;
}) {
  if (style === 'raw') return null;
  const corner = size === 'mini' ? 8 : 14;
  const thick  = size === 'mini' ? 1 : 2;

  if (style === 'neon') {
    return (
      <>
        {/* Animated neon border */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 20,
            boxShadow: `inset 0 0 0 ${thick}px ${color1}, 0 0 20px ${color1}44, 0 0 40px ${color1}22` }}
        />
        {/* Corner brackets */}
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <NeonCorner key={pos} pos={pos} color={pos === 'tl' || pos === 'br' ? color1 : color2} size={corner} thick={thick} />
        ))}
      </>
    );
  }

  if (style === 'holographic') {
    return (
      <motion.div
        animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 20,
          boxShadow: `inset 0 0 0 ${thick}px ${color1}, 0 0 30px ${color1}55` }}
      />
    );
  }

  if (style === 'gold') {
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 20,
          background: `linear-gradient(135deg, ${color1}44, transparent 40%, transparent 60%, ${color2}44)`,
          boxShadow: `inset 0 0 0 ${thick}px ${color1}cc, 0 0 24px ${color1}44` }} />
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <NeonCorner key={pos} pos={pos} color={color1} size={corner + 4} thick={thick + 1} />
        ))}
      </>
    );
  }

  if (style === 'stage') {
    return (
      <>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, zIndex: 20, pointerEvents: 'none',
          background: `linear-gradient(90deg, ${color2}, ${color1}, ${color1}, ${color2})` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, zIndex: 20, pointerEvents: 'none',
          background: `linear-gradient(90deg, ${color2}, ${color1}, ${color2})` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, zIndex: 20, pointerEvents: 'none',
          background: `linear-gradient(180deg, ${color2}, ${color1}, ${color2})` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 4, zIndex: 20, pointerEvents: 'none',
          background: `linear-gradient(180deg, ${color2}, ${color1}, ${color2})` }} />
      </>
    );
  }

  if (style === 'glass') {
    return (
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 20,
        boxShadow: `inset 0 0 0 ${thick}px rgba(255,255,255,0.25)`,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)' }} />
    );
  }

  if (style === 'circuit') {
    return (
      <>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 20,
            boxShadow: `inset 0 0 0 ${thick}px ${color1}88, 0 0 15px ${color1}33` }}
        />
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <NeonCorner key={pos} pos={pos} color={color1} size={corner + 6} thick={thick} />
        ))}
      </>
    );
  }

  return null;
}

function NeonCorner({
  pos, color, size, thick,
}: { pos: 'tl' | 'tr' | 'bl' | 'br'; color: string; size: number; thick: number }) {
  const base: CSSProperties = { position: 'absolute', width: size, height: size, zIndex: 21, pointerEvents: 'none' };
  const borders: Record<typeof pos, CSSProperties> = {
    tl: { top: 0, left: 0, borderTop: `${thick}px solid ${color}`, borderLeft: `${thick}px solid ${color}` },
    tr: { top: 0, right: 0, borderTop: `${thick}px solid ${color}`, borderRight: `${thick}px solid ${color}` },
    bl: { bottom: 0, left: 0, borderBottom: `${thick}px solid ${color}`, borderLeft: `${thick}px solid ${color}` },
    br: { bottom: 0, right: 0, borderBottom: `${thick}px solid ${color}`, borderRight: `${thick}px solid ${color}` },
  };
  return <div style={{ ...base, ...borders[pos], boxShadow: `0 0 8px ${color}88` }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TMIUniversalPlayer({
  src,
  youtubeId,
  roomId      = 'lobby',
  avatarEmoji = '🎤',
  avatarName  = 'Artist',
  lobbyId     = 'main',
  mode        = 'avatar',
  frameStyle  = 'neon',
  frameColor,
  frameColor2,
  clipPath,
  scanLines   = false,
  filmGrain   = false,
  size        = 'standard',
  aspectRatio,
  minHeight,
  title       = 'TMI Live',
  subtitle,
  overlay,
  underlay,
  children,
  sponsorBanner,
  privacy     = 'public',
  tier        = 'free',
  autoplay    = false,
  muted       = true,
  loop        = false,
  controls    = true,
  showBadge   = true,
  allowFullscreen = true,
  allowPiP    = true,
  onJoinCamera,
  onLeave,
  onClick,
  onEnded,
  countryCode,
  countryFlag,
}: TMIUniversalPlayerProps) {
  const flagEmoji = countryFlag ?? (countryCode ? codeToFlag(countryCode) : undefined);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [streamState, setStreamState] = useState<'idle' | 'connecting' | 'live' | 'paused' | 'ended' | 'error'>('idle');
  const [isMuted, setIsMuted]         = useState(muted);
  const [volume, setVolume]           = useState(0.85);
  const [isFull, setIsFull]           = useState(false);
  const [showCtrl, setShowCtrl]       = useState(false);
  const [quality, setQuality]         = useState<string>(TIER_MAX_QUALITY[tier]);
  const ctrlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine frame colors
  const [c1, c2] = FRAME_COLORS[frameStyle];
  const fc1 = frameColor  ?? c1;
  const fc2 = frameColor2 ?? c2;

  // Aspect ratio
  const ar = aspectRatio ?? SIZE_ASPECT[size];

  // Autoplay
  useEffect(() => {
    if (!autoplay || !src || mode === 'youtube' || mode === 'avatar' || mode === 'lobby') return;
    const v = videoRef.current;
    if (!v) return;
    v.src = src;
    v.muted = muted;
    void v.play().then(() => setStreamState('live')).catch(() => setStreamState('error'));
  }, [autoplay, src, mode, muted]);

  const joinCamera = useCallback(async () => {
    setStreamState('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) { v.srcObject = stream; void v.play(); }
      setStreamState('live');
      onJoinCamera?.(stream);
    } catch {
      setStreamState('error');
    }
  }, [onJoinCamera]);

  const leaveCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    const v = videoRef.current;
    if (v) { v.srcObject = null; v.src = ''; }
    setStreamState('idle');
    onLeave?.();
  }, [onLeave]);

  const toggleFullscreen = useCallback(() => {
    if (!allowFullscreen) return;
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen?.();
      setIsFull(true);
    } else {
      void document.exitFullscreen?.();
      setIsFull(false);
    }
  }, [allowFullscreen]);

  const showControls = useCallback(() => {
    setShowCtrl(true);
    if (ctrlTimer.current) clearTimeout(ctrlTimer.current);
    ctrlTimer.current = setTimeout(() => setShowCtrl(false), 2800);
  }, []);

  // Privacy indicator color
  const privacyColor = privacy === 'public' ? '#00FF88' : privacy === 'lobby' ? '#FFD700' : '#888';

  // Badge label
  const badgeText = streamState === 'live'
    ? (mode === 'webrtc' ? 'LIVE' : 'PLAYING')
    : streamState === 'connecting' ? 'CONNECTING'
    : mode === 'idle' ? 'STANDBY'
    : 'OFFLINE';
  const badgeColor = streamState === 'live' ? (mode === 'webrtc' ? '#FF2DAA' : '#00FFFF') : '#888';

  const containerStyle: CSSProperties = {
    position:   'relative',
    width:      '100%',
    aspectRatio: ar === 'unset' ? undefined : ar,
    minHeight:  minHeight ?? (size === 'mini' ? 90 : size === 'card' ? 180 : undefined),
    background: '#000',
    borderRadius: size === 'mini' ? 6 : 12,
    overflow:   'hidden',
    clipPath,
    cursor:     onClick ? 'pointer' : undefined,
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onClick={onClick}
    >
      {/* ── UNDERLAY LAYER ─────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {/* Ambient chromatic glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 30% 60%, ${fc1}18 0%, transparent 55%),
                       radial-gradient(ellipse at 70% 40%, ${fc2}12 0%, transparent 50%)`,
        }} />
        {underlay}
      </div>

      {/* ── SOURCE LAYER ───────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>

        {/* VOD / HLS / WebRTC */}
        {(mode === 'vod' || mode === 'hls' || mode === 'webrtc' || mode === 'ad') && (
          <video
            ref={videoRef}
            src={mode !== 'webrtc' ? src : undefined}
            autoPlay={autoplay || mode === 'webrtc'}
            playsInline
            muted={isMuted}
            loop={loop}
            onEnded={onEnded}
            onError={() => setStreamState('error')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* YouTube embed */}
        {mode === 'youtube' && youtubeId && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=0&modestbranding=1&rel=0`}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        )}

        {/* Avatar canvas */}
        {(mode === 'avatar' || (mode === 'webrtc' && streamState === 'idle')) && (
          <AvatarCanvas emoji={avatarEmoji} name={avatarName} accentColor={fc1} />
        )}

        {/* Lobby feed */}
        {mode === 'lobby' && (
          <LobbyFeed lobbyId={lobbyId} accentColor={fc1} />
        )}

        {/* Idle / Standby */}
        {mode === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0018, #050510)' }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: 36, marginBottom: 12 }}
            >
              📺
            </motion.div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.3em', color: fc1 }}>TMI · STANDBY</div>
            {title && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{title}</div>}
          </div>
        )}

        {/* Connecting overlay */}
        {streamState === 'connecting' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,16,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 5 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${fc1}`, borderTopColor: 'transparent' }}
            />
            <div style={{ fontSize: 10, fontWeight: 800, color: fc1, letterSpacing: '0.2em' }}>CONNECTING…</div>
          </div>
        )}

        {/* Error state */}
        {streamState === 'error' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,16,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ fontSize: 28 }}>⚠️</div>
            <div style={{ fontSize: 10, color: '#FF4444', fontWeight: 700, letterSpacing: '0.1em' }}>STREAM UNAVAILABLE</div>
            <button onClick={() => setStreamState('idle')}
              style={{ marginTop: 6, padding: '5px 14px', fontSize: 9, fontWeight: 700, background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', borderRadius: 20, color: '#FF4444', cursor: 'pointer' }}>
              RETRY
            </button>
          </div>
        )}
      </div>

      {/* ── SCAN LINES ─────────────────────────────────────── */}
      {scanLines && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }} />
      )}

      {/* ── FILM GRAIN ─────────────────────────────────────── */}
      {filmGrain && (
        <motion.div
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 0.08, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, zIndex: 9, pointerEvents: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            opacity: 0.04 }} />
      )}

      {/* ── CUSTOM OVERLAY ─────────────────────────────────── */}
      {overlay && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none' }}>
          {overlay}
        </div>
      )}

      {/* ── FRAME LAYER ────────────────────────────────────── */}
      <FrameOverlay style={frameStyle} color1={fc1} color2={fc2} size={size} />

      {/* ── CONTROLS OVERLAY ───────────────────────────────── */}
      {controls && size !== 'mini' && (
        <AnimatePresence>
          {showCtrl && (
            <motion.div
              key="ctrl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 25, padding: '12px 10px 10px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
            >
              {/* Join / Leave camera */}
              {mode === 'webrtc' && streamState === 'idle' && (
                <button onClick={(e) => { e.stopPropagation(); void joinCamera(); }}
                  style={{ padding: '5px 12px', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', background: fc1, color: '#050510', border: 'none', borderRadius: 20, cursor: 'pointer' }}>
                  JOIN CAMERA
                </button>
              )}
              {mode === 'webrtc' && streamState === 'live' && (
                <button onClick={(e) => { e.stopPropagation(); leaveCamera(); }}
                  style={{ padding: '5px 12px', fontSize: 9, fontWeight: 800, background: 'rgba(255,68,68,0.2)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.4)', borderRadius: 20, cursor: 'pointer' }}>
                  LEAVE
                </button>
              )}

              {/* VOD play/pause */}
              {(mode === 'vod' || mode === 'hls') && (
                <button onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (!v) return;
                  if (v.paused) { void v.play(); setStreamState('live'); }
                  else { v.pause(); setStreamState('paused'); }
                }}
                  style={{ width: 28, height: 28, fontSize: 12, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {streamState === 'live' ? '⏸' : '▶'}
                </button>
              )}

              {/* Mute */}
              <button onClick={(e) => { e.stopPropagation(); setIsMuted(m => { if (videoRef.current) videoRef.current.muted = !m; return !m; }); }}
                style={{ width: 28, height: 28, fontSize: 12, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#fff' }}>
                {isMuted ? '🔇' : '🔊'}
              </button>

              {/* Volume slider */}
              {!isMuted && (
                <input type="range" min={0} max={1} step={0.05} value={volume}
                  onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; }}
                  onClick={ev => ev.stopPropagation()}
                  style={{ width: 60, accentColor: fc1 }} />
              )}

              <div style={{ flex: 1 }} />

              {/* Quality badge */}
              <span style={{ fontSize: 8, fontWeight: 800, color: fc1, letterSpacing: '0.08em', padding: '3px 7px', border: `1px solid ${fc1}55`, borderRadius: 10 }}>
                {quality}
              </span>

              {/* Privacy */}
              <span style={{ fontSize: 8, fontWeight: 700, color: privacyColor, letterSpacing: '0.06em' }}>
                {privacy === 'public' ? '🌐' : privacy === 'lobby' ? '🏠' : '🔒'} {privacy.toUpperCase()}
              </span>

              {/* PiP */}
              {allowPiP && 'pictureInPictureEnabled' in document && mode !== 'youtube' && mode !== 'avatar' && (
                <button onClick={(e) => { e.stopPropagation(); void videoRef.current?.requestPictureInPicture?.(); }}
                  style={{ width: 26, height: 26, fontSize: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#fff' }}>
                  ⧉
                </button>
              )}

              {/* Fullscreen */}
              {allowFullscreen && (
                <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  style={{ width: 26, height: 26, fontSize: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#fff' }}>
                  {isFull ? '⊡' : '⛶'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── STATUS BADGES ──────────────────────────────────── */}
      {showBadge && size !== 'mini' && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 26, display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: '3px 9px', backdropFilter: 'blur(4px)' }}>
            <motion.div
              animate={streamState === 'live' ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: badgeColor, boxShadow: streamState === 'live' ? `0 0 6px ${badgeColor}` : 'none' }}
            />
            <span style={{ fontSize: 8, fontWeight: 800, color: badgeColor, letterSpacing: '0.1em' }}>{badgeText}</span>
          </div>
          {title && size !== 'card' && (
            <div style={{ background: 'rgba(0,0,0,0.65)', borderRadius: 20, padding: '3px 9px', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{title}</span>
            </div>
          )}
        </div>
      )}

      {/* Mini badge */}
      {showBadge && size === 'mini' && (
        <div style={{ position: 'absolute', top: 3, left: 3, zIndex: 26, display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: '2px 5px' }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: badgeColor }} />
          <span style={{ fontSize: 6, fontWeight: 800, color: badgeColor, letterSpacing: '0.06em' }}>{badgeText}</span>
        </div>
      )}

      {/* ── COUNTRY FLAG BADGE ─────────────────────────────── */}
      {flagEmoji && (
        <div style={{
          position: 'absolute',
          bottom: size === 'mini' ? 4 : 10,
          right:  size === 'mini' ? 4 : 10,
          zIndex: 28,
          pointerEvents: 'none',
          fontSize: size === 'mini' ? 10 : 14,
          lineHeight: 1,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.85))',
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 4,
          padding: size === 'mini' ? '1px 2px' : '2px 4px',
          backdropFilter: 'blur(4px)',
        }}>
          {flagEmoji}
        </div>
      )}

      {/* Sponsor banner */}
      {sponsorBanner && (
        <div style={{ position: 'absolute', zIndex: 27, pointerEvents: 'auto',
          ...(sponsorBanner.position === 'top' ? { top: 0, left: 0, right: 0 } :
             sponsorBanner.position === 'overlay-corner' ? { bottom: 44, right: 10 } :
             { bottom: 0, left: 0, right: 0 }) }}>
          <div style={{ background: 'rgba(0,0,0,0.8)', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: '#FFD700', letterSpacing: '0.12em' }}>SPONSORED</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{sponsorBanner.label}</span>
            {sponsorBanner.linkUrl && (
              <a href={sponsorBanner.linkUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 8, fontWeight: 700, color: '#FFD700', textDecoration: 'none', letterSpacing: '0.08em' }}>
                LEARN MORE →
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── CHILDREN (topmost) ─────────────────────────────── */}
      {children && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
          {children}
        </div>
      )}
    </div>
  );
}
