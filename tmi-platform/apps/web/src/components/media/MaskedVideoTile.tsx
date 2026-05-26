'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type TileShape =
  | 'octagon'
  | 'hexagon'
  | 'pentagon'
  | 'diamond'
  | 'circle'
  | 'star'
  | 'torn-edge'
  | 'glitch-rect';

export interface MaskedVideoTileProps {
  shape?: TileShape;
  streamUrl?: string;
  performerName?: string;
  performerSlug?: string;
  rank?: number;
  isLive?: boolean;
  viewerCount?: number;
  genre?: string;
  accentColor?: string;
  size?: number;
  avatarEmoji?: string;
  avatarIcon?: ReactNode;
  avatarUrl?: string;
  showActions?: boolean;
  onJoin?: () => void;
  onTip?: () => void;
  onMessage?: () => void;
  className?: string;
}

const CLIP_PATHS: Record<TileShape, string> = {
  octagon:     'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  hexagon:     'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  pentagon:    'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  diamond:     'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  circle:      'circle(50% at 50% 50%)',
  star:        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  'torn-edge': 'polygon(0% 8%, 7% 0%, 14% 6%, 20% 1%, 28% 7%, 35% 2%, 44% 8%, 52% 3%, 60% 7%, 67% 2%, 74% 6%, 80% 1%, 87% 5%, 93% 0%, 100% 4%, 100% 92%, 93% 100%, 87% 94%, 79% 100%, 73% 95%, 66% 100%, 58% 94%, 50% 100%, 42% 95%, 35% 100%, 27% 95%, 20% 100%, 13% 94%, 6% 100%, 0% 95%)',
  'glitch-rect': 'polygon(0% 0%, 100% 0%, 100% 85%, 97% 85%, 97% 90%, 100% 90%, 100% 100%, 0% 100%, 0% 15%, 3% 15%, 3% 10%, 0% 10%)',
};

function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function MaskedVideoTile({
  shape = 'octagon',
  streamUrl,
  performerName = 'Performer',
  performerSlug,
  rank,
  isLive = false,
  viewerCount = 0,
  genre,
  accentColor = '#00FFFF',
  size = 180,
  avatarEmoji = '🎤',
  avatarIcon,
  avatarUrl,
  showActions = false,
  onJoin,
  onTip,
  onMessage,
  className = '',
}: MaskedVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const isFirstPlace = rank === 1;
  const clipPath = CLIP_PATHS[shape];
  const glowColor = isFirstPlace ? '#FFD700' : accentColor;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    video.src = streamUrl;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    const onMeta = () => setVideoReady(true);
    video.addEventListener('loadedmetadata', onMeta);
    video.play().catch(() => {});
    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.pause();
      video.src = '';
    };
  }, [streamUrl]);

  useEffect(() => {
    if (shape !== 'glitch-rect') return;
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 180);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [shape]);

  const tileContent = (
    <div
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
    >
      {/* Underlay glow */}
      <div style={{ position: 'absolute', inset: -8, background: `radial-gradient(ellipse at center, ${glowColor}55 0%, transparent 70%)`, opacity: hovered || isFirstPlace ? 1 : 0.45, transition: 'opacity 0.35s ease', pointerEvents: 'none', filter: 'blur(6px)' }} />

      {/* Crown */}
      {isFirstPlace && (
        <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.18, filter: 'drop-shadow(0 0 8px #FFD700)', zIndex: 20, animation: 'tmiCrownFloat 3s ease-in-out infinite', pointerEvents: 'none' }}>
          👑
        </div>
      )}

      {/* Rank badge */}
      {rank !== undefined && (
        <div style={{ position: 'absolute', top: -10, left: -10, zIndex: 25, width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: isFirstPlace ? 'linear-gradient(135deg, #FFD700, #FF9500)' : `${accentColor}22`, border: `2px solid ${isFirstPlace ? '#FFD700' : accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.1, fontWeight: 900, color: isFirstPlace ? '#050510' : accentColor, boxShadow: `0 0 12px ${isFirstPlace ? '#FFD700' : accentColor}66` }}>
          {rank}
        </div>
      )}

      {/* LIVE badge */}
      {isLive && (
        <div style={{ position: 'absolute', top: size * 0.04, right: -4, zIndex: 25, background: '#FF2020', borderRadius: 4, padding: '2px 6px', fontSize: size * 0.07, fontWeight: 900, color: '#fff', letterSpacing: '0.05em', boxShadow: '0 0 8px #FF2020' }}>
          ● LIVE
        </div>
      )}

      {/* Shape mask */}
      <div style={{ width: '100%', height: '100%', clipPath, position: 'relative', overflow: 'hidden', border: `2px solid ${glowColor}88`, boxShadow: `0 0 ${hovered ? 28 : 14}px ${glowColor}55`, transition: 'box-shadow 0.3s ease', transform: glitching ? `translateX(${Math.random() * 6 - 3}px)` : 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${glowColor}22, #050510)` }} />

        {streamUrl && (
          <video ref={videoRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: videoReady ? 1 : 0, transition: 'opacity 0.5s ease' }} />
        )}

        {(!streamUrl || !videoReady) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={performerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : avatarIcon ? (
              <div style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>{avatarIcon}</div>
            ) : (
              <div style={{ fontSize: size * 0.32, filter: `drop-shadow(0 0 8px ${glowColor})` }}>{avatarEmoji}</div>
            )}
          </div>
        )}

        {/* Bottom info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(5,5,16,0.9) 0%, transparent 100%)', padding: `${size * 0.06}px ${size * 0.06}px ${size * 0.05}px` }}>
          <div style={{ fontSize: size * 0.09, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.02em' }}>{performerName}</div>
          {viewerCount > 0 && <div style={{ fontSize: size * 0.07, color: `${glowColor}cc`, fontWeight: 700 }}>👁 {formatViewers(viewerCount)}</div>}
        </div>

        {/* Genre tag */}
        {genre && (
          <div style={{ position: 'absolute', top: size * 0.06, left: size * 0.06, fontSize: size * 0.07, fontWeight: 900, color: glowColor, background: `${glowColor}18`, border: `1px solid ${glowColor}44`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {genre}
          </div>
        )}

        {/* Hover actions */}
        {showActions && hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,5,16,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.04 }}>
            {onJoin && <button onClick={onJoin} style={{ padding: `${size * 0.05}px ${size * 0.1}px`, background: glowColor, border: 'none', borderRadius: 6, fontSize: size * 0.08, fontWeight: 900, color: '#050510', cursor: 'pointer', letterSpacing: '0.06em' }}>JOIN</button>}
            <div style={{ display: 'flex', gap: size * 0.04 }}>
              {onTip && <button onClick={onTip} style={{ padding: `${size * 0.04}px ${size * 0.07}px`, background: 'rgba(0,255,136,0.15)', border: '1px solid #00FF88', borderRadius: 6, fontSize: size * 0.07, fontWeight: 800, color: '#00FF88', cursor: 'pointer' }}>💰 TIP</button>}
              {onMessage && <button onClick={onMessage} style={{ padding: `${size * 0.04}px ${size * 0.07}px`, background: 'rgba(0,255,255,0.1)', border: '1px solid #00FFFF', borderRadius: 6, fontSize: size * 0.07, fontWeight: 800, color: '#00FFFF', cursor: 'pointer' }}>MSG</button>}
            </div>
          </div>
        )}

        {/* Scanline overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)', pointerEvents: 'none' }} />
      </div>

      {isFirstPlace && (
        <div style={{ position: 'absolute', bottom: -6, right: -6, fontSize: size * 0.13, filter: 'drop-shadow(0 0 6px #FFD700)', zIndex: 20, pointerEvents: 'none' }}>⭐</div>
      )}

      <style>{`@keyframes tmiCrownFloat { 0%,100% { transform: translateX(-50%) translateY(0px); } 50% { transform: translateX(-50%) translateY(-6px); } }`}</style>
    </div>
  );

  if (performerSlug) {
    return <Link href={`/profile/performer/${performerSlug}`} style={{ textDecoration: 'none' }}>{tileContent}</Link>;
  }
  return tileContent;
}
