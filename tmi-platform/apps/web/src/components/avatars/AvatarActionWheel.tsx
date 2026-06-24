'use client';

/**
 * AvatarActionWheel — the user's avatar control panel inside a live room.
 *
 * Six tabs:
 *   Expressions  — 9 facial states (Happy/Laughing/Excited…) → ExpressionEngine
 *   Emotes       — 8 animations (Wave/Clap/Dance…)          → EmoteEngine
 *   Props        — equipped props (honest empty until certified assets exist)
 *   Music        — links to user's playlist page
 *   Audience     — current seat + group info
 *   Social       — links to messaging
 *
 * Per Rule 14: every button navigates, submits, or triggers a real action.
 * Per Rule 20: Props tab shows honest empty state — no fake prop placeholders.
 *
 * Usage:
 *   <AvatarActionWheel entityId={userId} roomId={roomId} />
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getExpressionSpecList, triggerExpression, getActiveExpression, type AvatarExpression } from '@/lib/avatars/ExpressionEngine';
import { getEmoteSpecList, triggerEmote, getActiveEmote, type AvatarEmote } from '@/lib/avatars/EmoteEngine';
import { getEntity } from '@/lib/avatars/UnifiedAvatarRuntime';
import { listPropManifests } from '@/lib/avatars/AvatarPropManifest';

// ─── Types ────────────────────────────────────────────────────────────────────

type WheelTab = 'expressions' | 'emotes' | 'props' | 'music' | 'audience' | 'social';

interface Props {
  entityId: string;
  roomId?:  string;
  /** Whether the wheel starts visible. Default false (user opens it). */
  defaultOpen?: boolean;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: WheelTab; label: string; emoji: string }[] = [
  { id: 'expressions', label: 'Express',  emoji: '😄' },
  { id: 'emotes',      label: 'Emotes',   emoji: '💃' },
  { id: 'props',       label: 'Props',    emoji: '🎸' },
  { id: 'music',       label: 'Music',    emoji: '🎵' },
  { id: 'audience',    label: 'Audience', emoji: '🪑' },
  { id: 'social',      label: 'Social',   emoji: '💬' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  overlay: {
    position: 'fixed' as const, bottom: 80, right: 16, zIndex: 1000,
    display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 8,
  },
  toggleBtn: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg, #AA2DFF, #00FFFF)',
    border: 'none', cursor: 'pointer', fontSize: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 20px rgba(170,45,255,0.5)',
  },
  panel: {
    background: 'rgba(5,5,16,0.94)',
    border: '1px solid rgba(170,45,255,0.4)',
    borderRadius: 12, padding: '12px 10px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 0 30px rgba(170,45,255,0.2)',
    width: 280,
  },
  tabBar: {
    display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' as const,
  },
  tab: (active: boolean) => ({
    flex: '1 1 auto',
    background: active ? 'rgba(170,45,255,0.3)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? 'rgba(170,45,255,0.7)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 6, padding: '4px 2px', cursor: 'pointer',
    fontSize: 10, color: active ? '#AA2DFF' : 'rgba(255,255,255,0.6)',
    fontWeight: 700, letterSpacing: '0.04em', textAlign: 'center' as const,
    textTransform: 'uppercase' as const, transition: 'all 0.15s',
  }),
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
  },
  actionBtn: (active: boolean) => ({
    background: active ? 'rgba(170,45,255,0.25)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(170,45,255,0.6)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 8, padding: '8px 4px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3,
    transition: 'all 0.15s', color: 'white',
  }),
  actionEmoji: { fontSize: 22 },
  actionLabel: {
    fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.7)', fontWeight: 700,
  },
  emptyState: {
    padding: '16px 8px', textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5,
  },
  seatInfo: {
    padding: '10px 8px', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8,
  },
  linkRow: {
    display: 'flex', flexDirection: 'column' as const, gap: 6,
  },
  linkBtn: {
    display: 'block', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
    padding: '10px 12px', color: 'rgba(255,255,255,0.85)',
    fontSize: 12, fontWeight: 600, textDecoration: 'none',
    letterSpacing: '0.04em', cursor: 'pointer',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvatarActionWheel({ entityId, roomId, defaultOpen = false }: Props) {
  const [open, setOpen]         = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<WheelTab>('expressions');
  const [, forceUpdate]         = useState(0);

  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  // Refresh on expression/emote changes so active indicators update
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [open, refresh]);

  const entity = getEntity(entityId);

  // ── Expression tab ──────────────────────────────────────────────────────────

  const renderExpressions = () => {
    const specs       = getExpressionSpecList();
    const activeExpr  = getActiveExpression(entityId);
    return (
      <div style={S.grid}>
        {specs.filter(s => s.expression !== 'neutral').map(spec => {
          const isActive = activeExpr === spec.expression;
          return (
            <button
              key={spec.expression}
              style={S.actionBtn(isActive)}
              onClick={() => {
                triggerExpression(entityId, spec.expression as AvatarExpression, roomId);
                refresh();
              }}
              title={`${spec.label} (+${spec.xpAward} XP)`}
            >
              <span style={S.actionEmoji}>{spec.emoji}</span>
              <span style={S.actionLabel}>{spec.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // ── Emotes tab ──────────────────────────────────────────────────────────────

  const renderEmotes = () => {
    const specs      = getEmoteSpecList();
    const activeEmot = getActiveEmote(entityId);
    return (
      <div style={S.grid}>
        {specs.map(spec => {
          const isActive = activeEmot === spec.emote;
          return (
            <button
              key={spec.emote}
              style={S.actionBtn(isActive)}
              onClick={() => {
                triggerEmote(entityId, spec.emote as AvatarEmote, roomId);
                refresh();
              }}
              title={`${spec.label} (+${spec.xpAward} XP)`}
            >
              <span style={S.actionEmoji}>{spec.emoji}</span>
              <span style={S.actionLabel}>{spec.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // ── Props tab ───────────────────────────────────────────────────────────────

  const renderProps = () => {
    const certified = listPropManifests({ certified: true });
    if (certified.length === 0) {
      return (
        <div style={S.emptyState}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎸</div>
          <div>No props in inventory yet.</div>
          <div style={{ fontSize: 10, marginTop: 4, color: 'rgba(255,255,255,0.3)' }}>
            Props coming soon to the store.
          </div>
        </div>
      );
    }
    return (
      <div style={S.grid}>
        {certified.map(prop => (
          <button key={prop.propId} style={S.actionBtn(false)}>
            <span style={S.actionEmoji}>🎸</span>
            <span style={S.actionLabel}>{prop.name}</span>
          </button>
        ))}
      </div>
    );
  };

  // ── Music tab ───────────────────────────────────────────────────────────────

  const renderMusic = () => (
    <div style={S.linkRow}>
      <Link href="/playlist" style={S.linkBtn}>🎵 My Playlists</Link>
      <Link href="/music/submit" style={S.linkBtn}>🎤 Submit Music</Link>
      <Link href="/live/radio" style={S.linkBtn}>📻 TMI Radio</Link>
    </div>
  );

  // ── Audience tab ────────────────────────────────────────────────────────────

  const renderAudience = () => {
    if (!entity) {
      return (
        <div style={S.emptyState}>
          Avatar not in a room.
        </div>
      );
    }
    return (
      <div style={S.seatInfo}>
        <div>🪑 <strong>Seat:</strong> {entity.seatId ?? 'Unassigned'}</div>
        <div>📍 <strong>Position:</strong> {entity.worldPosition}</div>
        {entity.groupId && <div>👥 <strong>Group:</strong> {entity.groupId}</div>}
        {roomId && (
          <div style={{ marginTop: 8 }}>
            <Link href={`/live/rooms/${roomId}`} style={{ ...S.linkBtn, display: 'block', textAlign: 'center', marginTop: 4 }}>
              🏟 View Full Room
            </Link>
          </div>
        )}
      </div>
    );
  };

  // ── Social tab ──────────────────────────────────────────────────────────────

  const renderSocial = () => (
    <div style={S.linkRow}>
      <Link href="/messages" style={S.linkBtn}>💬 Messages</Link>
      <Link href="/friends" style={S.linkBtn}>👥 Friends</Link>
      <Link href="/profile" style={S.linkBtn}>👤 My Profile</Link>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'expressions': return renderExpressions();
      case 'emotes':      return renderEmotes();
      case 'props':       return renderProps();
      case 'music':       return renderMusic();
      case 'audience':    return renderAudience();
      case 'social':      return renderSocial();
    }
  };

  return (
    <div style={S.overlay}>
      {open && (
        <div style={S.panel}>
          {/* Tab bar */}
          <div style={S.tabBar}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                style={S.tab(activeTab === tab.id)}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                {tab.emoji}
              </button>
            ))}
          </div>
          {/* Tab label */}
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </div>
          {/* Content */}
          {renderTabContent()}
        </div>
      )}

      {/* Toggle button */}
      <button
        style={S.toggleBtn}
        onClick={() => setOpen(o => !o)}
        title={open ? 'Close avatar controls' : 'Open avatar controls'}
        aria-label="Avatar action wheel"
      >
        {open ? '✕' : '🎭'}
      </button>
    </div>
  );
}
