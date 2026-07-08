'use client';

/**
 * ShowSummaryPanel
 *
 * Post-show curtain-close statistics panel.
 * Shown after a live performance ends — gives the performer a real report
 * of what happened: viewers, hearts, new fans, tips, merch, tickets, shares.
 *
 * Rule 20: every stat shown here must come from real data.
 * If a stat is zero or unknown, show 0 or nothing — never fake a number.
 * Pass real values from the live session engine / analytics API.
 */

import Link from 'next/link';

export interface ShowStats {
  performerName: string;
  performerSlug: string;
  /** All counts are real numbers from the live session. 0 = none. */
  liveViewers: number;
  peakAudience: number;
  avgWatchTimeMin: number;
  hearts: number;
  newFans: number;
  tips: number;         // USD cents
  merchOrders: number;
  ticketsSold: number;
  shares: number;
  bookingInquiries: number;
  /** Optional: fan rating 0–5 from post-show votes */
  fanRating?: number;
  /** ISO string of when the show ended */
  endedAt?: string;
}

interface Props {
  stats: ShowStats;
  accentColor?: string;
  onDismiss?: () => void;
}

const ROW_CONFIG: Array<{
  key: keyof ShowStats;
  icon: string;
  label: string;
  format: (v: number) => string;
  color: string;
}> = [
  { key: 'liveViewers',      icon: '👁',  label: 'Live Viewers',      format: (v) => v.toLocaleString(),                    color: '#00FFFF' },
  { key: 'peakAudience',     icon: '📈',  label: 'Peak Audience',     format: (v) => v.toLocaleString(),                    color: '#00FFFF' },
  { key: 'avgWatchTimeMin',  icon: '⏱',  label: 'Avg Watch Time',    format: (v) => `${v} min`,                             color: '#00FFFF' },
  { key: 'hearts',           icon: '❤️',  label: 'Hearts',            format: (v) => v.toLocaleString(),                    color: '#FF2DAA' },
  { key: 'newFans',          icon: '👥',  label: 'New Fans',          format: (v) => `+${v.toLocaleString()}`,              color: '#00FF88' },
  { key: 'tips',             icon: '🎁',  label: 'Tips',              format: (v) => v > 0 ? `$${(v / 100).toFixed(2)}` : '—', color: '#FFD700' },
  { key: 'merchOrders',      icon: '🛍️', label: 'Merch Orders',      format: (v) => v.toLocaleString(),                    color: '#AA2DFF' },
  { key: 'ticketsSold',      icon: '🎟',  label: 'Tickets Sold',      format: (v) => v.toLocaleString(),                    color: '#00E5FF' },
  { key: 'shares',           icon: '🔁',  label: 'Shares',            format: (v) => v.toLocaleString(),                    color: '#00FFFF' },
  { key: 'bookingInquiries', icon: '📅',  label: 'Booking Inquiries', format: (v) => v.toLocaleString(),                    color: '#FF8C00' },
];

function StatRow({
  icon, label, value, color, highlight,
}: {
  icon: string; label: string; value: string; color: string; highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: highlight ? `${color}0a` : 'transparent',
        borderLeft: highlight ? `3px solid ${color}` : '3px solid transparent',
        borderRadius: highlight ? '0 6px 6px 0' : 0,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, lineHeight: 1, minWidth: 20, textAlign: 'center' }}>{icon}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 900, color, letterSpacing: '0.02em' }}>{value}</span>
    </div>
  );
}

export default function ShowSummaryPanel({ stats, accentColor = '#00FFFF', onDismiss }: Props) {
  const totalRevenue = stats.tips;
  const hasRevenue = totalRevenue > 0;
  const hasNewFans = stats.newFans > 0;

  return (
    <div
      style={{
        background: 'rgba(5,5,16,0.97)',
        border: `1.5px solid ${accentColor}33`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: `0 0 60px ${accentColor}14, 0 24px 80px rgba(0,0,0,0.7)`,
        maxWidth: 520,
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${accentColor}12, transparent)`,
          borderBottom: `1px solid ${accentColor}22`,
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: '0.18em', marginBottom: 3 }}>
            TONIGHT&apos;S PERFORMANCE
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>
            {stats.performerName}
          </div>
          {stats.endedAt && (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              {new Date(stats.endedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {stats.fanRating !== undefined && stats.fanRating > 0 && (
            <div style={{
              background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 8, padding: '6px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#FFD700' }}>
                {stats.fanRating.toFixed(1)}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>FAN RATING</div>
            </div>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                width: 28, height: 28, borderRadius: 999,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Headline stats — 3-up grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: `${accentColor}0a`, borderBottom: `1px solid ${accentColor}18` }}>
        {[
          { icon: '👁', label: 'VIEWERS', value: stats.liveViewers.toLocaleString(), color: '#00FFFF' },
          { icon: '❤️', label: 'HEARTS',  value: stats.hearts.toLocaleString(),      color: '#FF2DAA' },
          { icon: '👥', label: 'NEW FANS', value: `+${stats.newFans.toLocaleString()}`, color: '#00FF88' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{ padding: '14px 12px', textAlign: 'center', background: 'rgba(5,5,16,0.6)' }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Detail rows */}
      <div style={{ padding: '8px 0' }}>
        {ROW_CONFIG
          .filter((r) => {
            // Don't show headline stats again
            if (['liveViewers', 'hearts', 'newFans'].includes(r.key as string)) return false;
            const v = stats[r.key] as number;
            return v !== undefined && v !== null;
          })
          .map((r) => {
            const rawVal = stats[r.key] as number;
            const formatted = r.format(rawVal);
            if (formatted === '—' && rawVal === 0) return null;
            return (
              <StatRow
                key={r.key as string}
                icon={r.icon}
                label={r.label}
                value={formatted}
                color={r.color}
                highlight={rawVal > 0}
              />
            );
          })}
      </div>

      {/* Positive reinforcement messages */}
      {(hasRevenue || hasNewFans) && (
        <div style={{
          padding: '12px 16px', margin: '0 16px 12px',
          background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)',
          borderRadius: 8,
        }}>
          {hasNewFans && (
            <div style={{ fontSize: 11, color: '#00FF88', fontWeight: 700, marginBottom: hasRevenue ? 4 : 0 }}>
              👥 You gained {stats.newFans.toLocaleString()} new {stats.newFans === 1 ? 'fan' : 'fans'} tonight.
            </div>
          )}
          {hasRevenue && (
            <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>
              🎁 ${(stats.tips / 100).toFixed(2)} in tips received.
            </div>
          )}
        </div>
      )}

      {/* CTA footer */}
      <div style={{
        padding: '12px 16px', borderTop: `1px solid ${accentColor}12`,
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', marginRight: 'auto' }}>
          Keep building your audience
        </span>
        <Link
          href={`/dashboard/performer/${stats.performerSlug}/analytics`}
          style={{
            padding: '6px 14px', background: `${accentColor}18`,
            border: `1px solid ${accentColor}44`, borderRadius: 6,
            fontSize: 9, fontWeight: 900, color: accentColor,
            textDecoration: 'none', letterSpacing: '0.08em',
          }}
        >
          SEE ANALYTICS →
        </Link>
        <Link
          href={`/live/go`}
          style={{
            padding: '6px 14px', background: accentColor,
            borderRadius: 6, fontSize: 9, fontWeight: 900,
            color: '#050310', textDecoration: 'none', letterSpacing: '0.08em',
          }}
        >
          GO LIVE AGAIN
        </Link>
      </div>
    </div>
  );
}
