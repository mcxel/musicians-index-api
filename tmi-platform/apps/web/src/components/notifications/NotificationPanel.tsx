'use client';

import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  ts: number;
  href?: string;
  emoji?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#FF2DAA',
  high: '#FFD700',
  medium: '#00FFFF',
  low: 'rgba(255,255,255,0.3)',
};

export function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClose }: NotificationPanelProps) {
  const recent = notifications.slice(0, 20);

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 340,
        maxHeight: 480,
        background: '#0a0a1a',
        border: '1px solid rgba(0,255,255,0.2)',
        borderRadius: 12,
        boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#00FFFF', letterSpacing: '0.1em' }}>NOTIFICATIONS</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onMarkAllRead}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 10, cursor: 'pointer', padding: '2px 6px' }}
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {recent.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            No notifications
          </div>
        ) : recent.map(n => (
          <div
            key={n.id}
            onClick={() => { if (!n.read) onMarkRead(n.id); }}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: n.read ? 'transparent' : 'rgba(0,255,255,0.03)',
              cursor: n.href ? 'pointer' : 'default',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              transition: 'background 0.15s',
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{n.emoji ?? '🔔'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: n.read ? 'rgba(255,255,255,0.6)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.title}
                </span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{timeAgo(n.ts)}</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, lineHeight: 1.4 }}>
                {n.body}
              </div>
              {!n.read && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLOR[n.priority] ?? '#00FFFF', marginTop: 4 }} />
              )}
            </div>
            {n.href && (
              <Link href={n.href} style={{ fontSize: 10, color: '#00FFFF', textDecoration: 'none', flexShrink: 0, padding: '2px 0' }} onClick={onClose}>
                →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <Link
        href="/notifications"
        style={{ padding: '10px 16px', textAlign: 'center', color: '#00FFFF', fontSize: 11, fontWeight: 700, textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', letterSpacing: '0.08em' }}
        onClick={onClose}
      >
        SEE ALL NOTIFICATIONS →
      </Link>
    </div>
  );
}
