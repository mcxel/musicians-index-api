'use client';

import { useEffect, useState } from 'react';
import {
  getTopFansByTips,
  getTopFansByPresence,
  type FanMomentum,
} from '@/lib/fans/SuperFanMomentumEngine';
import { getFanIdentity } from '@/lib/fans/FanLoyaltyProfile';

interface Props {
  performerId: string;
  tipTotal: number;
}

interface FanRow {
  momentum: FanMomentum;
  title: string;
  glyph: string;
  color: string;
}

function toRows(fans: FanMomentum[]): FanRow[] {
  return fans.map((m) => {
    const id = getFanIdentity(m);
    return { momentum: m, title: id.title, glyph: id.glyph, color: id.color };
  });
}

export default function PerformerRelationshipPanel({ performerId, tipTotal }: Props) {
  const [topDonors, setTopDonors] = useState<FanRow[]>([]);
  const [frontRow, setFrontRow] = useState<FanRow[]>([]);
  const [activeTab, setActiveTab] = useState<'donors' | 'frontrow'>('donors');

  useEffect(() => {
    function refresh() {
      setTopDonors(toRows(getTopFansByTips(performerId, 6)));
      setFrontRow(toRows(getTopFansByPresence(performerId, 6)));
    }
    refresh();
    const id = setInterval(refresh, 5_000);
    return () => clearInterval(id);
  }, [performerId]);

  const rows = activeTab === 'donors' ? topDonors : frontRow;

  return (
    <div style={{ border: '1px solid rgba(255,215,0,0.22)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,215,0,0.07)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700' }}>SUPER FANS</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>Who's in your corner tonight</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#00FF88' }}>
          💸 ${tipTotal.toFixed(2)}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {([
          { id: 'donors',   label: '💸 BIG DONORS',    },
          { id: 'frontrow', label: '🕺 FRONT ROW',      },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '7px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #FFD700' : '2px solid transparent',
              color: activeTab === tab.id ? '#FFD700' : 'rgba(255,255,255,0.35)',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.12em',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fan list */}
      <div style={{ maxHeight: 210, overflowY: 'auto' }}>
        {rows.length === 0 ? (
          <div style={{ padding: '20px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            No one in your corner yet — drop is coming 🔥
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.momentum.fanId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Aura glyph */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${row.color}18`,
                border: `1px solid ${row.color}44`,
                display: 'grid', placeItems: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {row.glyph}
              </div>

              {/* Identity */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.momentum.displayName}
                </div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', color: row.color }}>
                  {row.glyph} {row.title}
                </div>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {activeTab === 'donors' ? (
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#00FF88' }}>
                    ${row.momentum.tipTotalUsd.toFixed(0)}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#00FFFF' }}>
                    {row.momentum.sessionCount} sessions
                  </div>
                )}
                {row.momentum.legendaryMoments > 0 && (
                  <div style={{ fontSize: 8, color: '#FFD700', fontWeight: 700, letterSpacing: '0.06em' }}>
                    ✨ {row.momentum.legendaryMoments} legendary
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
