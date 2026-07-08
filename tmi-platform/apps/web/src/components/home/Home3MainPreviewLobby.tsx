'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TMIUniversalPlayer from '@/components/media/TMIUniversalPlayer';
import { getActiveSessions, onSessionsChanged, type LiveSession } from '@/lib/broadcast/GlobalLiveSessionRegistry';
import { getPerformerBySlug, PERFORMER_REGISTRY } from '@/lib/performers/PerformerRegistry';

interface LobbyTile {
  session: LiveSession;
  emoji: string;
  color: string;
}

function RotatingLobbyTile({ tile }: { tile: LobbyTile }) {
  const router = require('next/navigation').useRouter();

  return (
    <Link
      href={`/live/rooms/${tile.session.roomId}?autoSeat=1`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${tile.color}18, rgba(0,0,0,0.6))`,
        border: `1px solid ${tile.color}44`,
        borderRadius: 10,
        padding: '10px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: 'pointer',
        transition: 'transform 0.25s ease, border-color 0.4s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: 22 }}>{tile.emoji}</span>
        <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.2 }}>{tile.session.displayName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2020', display: 'inline-block' }} />
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.55)' }}>{tile.session.viewerCount} live</span>
        </div>
        <span style={{ fontSize: 7, color: tile.color, fontWeight: 800, letterSpacing: '0.1em' }}>{tile.session.category.toUpperCase()}</span>
      </div>
    </Link>
  );
}

export default function Home3MainPreviewLobby({ title = 'MAIN PREVIEW LOBBY' }: { title?: string }) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [featIdx, setFeatIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Subscribe to live session updates
    const unsubscribe = onSessionsChanged((liveSessions) => {
      setSessions(liveSessions);
      // Reset featured index if out of range
      if (liveSessions.length > 0 && featIdx >= liveSessions.length) {
        setFeatIdx(0);
      }
    });

    // Get initial state
    const initial = getActiveSessions();
    setSessions(initial);

    // Rotate featured if multiple sessions
    if (initial.length > 1) {
      const id = setInterval(() => setFeatIdx(prev => (prev + 1) % initial.length), 8700);
      return () => {
        clearInterval(id);
        unsubscribe();
      };
    }

    return unsubscribe;
  }, []);

  if (!mounted) {
    return null;
  }

  // If no live sessions, show honest empty state
  if (sessions.length === 0) {
    return (
      <div style={{ padding: '0 12px 8px' }}>
        <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>
          {title}
        </div>
        <div style={{
          padding: '40px 20px',
          borderRadius: 14,
          border: '1px solid rgba(0,255,255,0.1)',
          background: 'rgba(0,255,255,0.04)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            No broadcasts active right now.
          </div>
          <Link
            href="/live/go"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#FF2DAA',
              color: '#000',
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 900,
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            🔴 BE THE FIRST TO GO LIVE
          </Link>
        </div>
      </div>
    );
  }

  const featured = sessions[featIdx]!;
  const lobbyTiles: LobbyTile[] = sessions.slice(1, 9).map((s, idx) => ({
    session: s,
    emoji: ['🎤', '🎧', '🎸', '🥊', '🎹', '💫', '🔥', '🌐'][idx % 8]!,
    color: ['#FF2DAA', '#00FFFF', '#FFD700', '#FF6B35', '#00FF88', '#AA2DFF', '#4488FF', '#FF2020'][idx % 8]!,
  }));

  return (
    <div style={{ padding: '0 12px 8px' }}>
      <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>
        {title}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr minmax(180px, 260px)',
        gap: 16,
        alignItems: 'start',
      }}>
        {/* LEFT — Featured session (big) */}
        <motion.div
          key={featIdx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
            border: `2px solid #FF2DAA55`,
            boxShadow: `0 0 40px #FF2DAA33, inset 0 0 0 1px #FF2DAA22`,
            background: `linear-gradient(135deg, #FF2DAA18, #050510)`,
            minHeight: 320,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
        >
          {/* Avatar / video area */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px 0' }}>
            <TMIUniversalPlayer
              mode="avatar"
              avatarEmoji="🎤"
              avatarName={featured.displayName}
              frameStyle="neon"
              frameColor="#FF2DAA"
              frameColor2="#AA2DFF"
              size="theater"
              title={featured.category}
              showBadge
              controls={false}
              privacy="public"
              autoplay
              muted
            />
          </div>

          {/* LIVE badge */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,32,32,0.9)', backdropFilter: 'blur(6px)',
            borderRadius: 20, padding: '4px 10px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite alternate' }} />
            <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: '0.12em' }}>LIVE</span>
          </div>

          {/* Viewer count badge */}
          <div style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            borderRadius: 8, padding: '4px 8px',
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
              👁 {featured.viewerCount.toLocaleString()}
            </span>
          </div>

          {/* Bottom info bar */}
          <div style={{
            padding: '14px 16px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: '0.04em' }}>
              {featured.displayName}
            </div>
            <div style={{ fontSize: 9, color: '#FF2DAA', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10 }}>
              {featured.title}
            </div>
            <Link
              href={`/live/rooms/${featured.roomId}?autoSeat=1`}
              style={{
                display: 'inline-block', padding: '8px 20px',
                background: '#FF2DAA', color: '#000',
                borderRadius: 6, fontSize: 9, fontWeight: 900,
                letterSpacing: '0.12em', textDecoration: 'none',
                boxShadow: `0 0 16px #FF2DAA88`,
              }}
            >
              ▶ JOIN ROOM
            </Link>
          </div>

          {/* Slide indicator dots */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            display: 'flex', gap: 5,
          }}>
            {sessions.slice(0, 5).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === featIdx ? '#FF2DAA' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Lobby tiles grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          maxHeight: 340,
          overflowY: 'auto',
        }}>
          {lobbyTiles.length > 0 ? (
            lobbyTiles.map((tile, i) => <RotatingLobbyTile key={`${tile.session.roomId}-${i}`} tile={tile} />)
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
              Waiting for more broadcasts...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
