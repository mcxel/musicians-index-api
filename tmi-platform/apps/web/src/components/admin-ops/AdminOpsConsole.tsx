'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';

export type AdminOpsMetric = {
  label: string;
  value: string;
  tone?: 'green' | 'yellow' | 'white' | 'red';
};

export type AdminOpsRow = {
  primary: string;
  secondary: string;
  status?: string;
  value?: string;
  chips?: string[];
};

export type AdminOpsAction = {
  id: string;
  label: string;
  tone?: 'green' | 'yellow' | 'white' | 'red';
};

export type AdminOpsLink = {
  href: string;
  label: string;
};

type Props = {
  title: string;
  subtitle: string;
  metrics: AdminOpsMetric[];
  rowsTitle: string;
  rows: AdminOpsRow[];
  actions: AdminOpsAction[];
  quickLinks: AdminOpsLink[];
};

const toneMap: Record<NonNullable<AdminOpsMetric['tone']>, string> = {
  green: '#00ff88',
  yellow: '#ffd700',
  white: '#ffffff',
  red: '#ff4d4d',
};

function toneStyle(tone: AdminOpsMetric['tone'] = 'white') {
  return toneMap[tone];
}

export default function AdminOpsConsole({
  title,
  subtitle,
  metrics,
  rowsTitle,
  rows,
  actions,
  quickLinks,
}: Props) {
  const [lastAction, setLastAction] = useState('none');
  const [actionCount, setActionCount] = useState<Record<string, number>>({});

  const summary = useMemo(() => {
    const total = Object.values(actionCount).reduce((acc, n) => acc + n, 0);
    return `${total} actions issued`;
  }, [actionCount]);

  const runAction = (id: string) => {
    setLastAction(id);
    setActionCount(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ color: '#9ca3af', fontSize: 11, textDecoration: 'none' }}>Back Admin</Link>
          <span style={{ color: '#374151' }}>/</span>
          <Link href="/admin/operations" style={{ color: '#9ca3af', fontSize: 11, textDecoration: 'none' }}>Back Operations</Link>
          <span style={{ marginLeft: 'auto', color: '#00ff88', fontSize: 11 }}>LIVE OPS</span>
          <PersonaSwitcher currentRole="admin" compact />
        </div>

        <h1 style={{ marginTop: 12, marginBottom: 6, fontSize: 30 }}>{title}</h1>
        <p style={{ margin: 0, color: '#9ca3af' }}>{subtitle}</p>

        <div style={{ marginTop: 16, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, background: 'rgba(0,0,0,0.28)' }}>
          <div style={{ fontSize: 12, color: '#d1d5db' }}>Control Feedback</div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#00ff88' }}>Last action: {lastAction}</div>
          <div style={{ marginTop: 3, fontSize: 12, color: '#f3f4f6' }}>{summary}</div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {metrics.map(metric => (
            <div key={metric.label} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' }}>{metric.label}</div>
              <div style={{ marginTop: 6, fontSize: 22, color: toneStyle(metric.tone), fontWeight: 700 }}>{metric.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.04)', fontSize: 12, color: '#d1d5db' }}>{rowsTitle}</div>
          <div>
            {rows.map(row => (
              <div key={`${row.primary}-${row.secondary}`} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 0.7fr 0.8fr', gap: 10, padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{row.primary}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{row.secondary}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(row.chips ?? []).map(chip => (
                    <span key={chip} style={{ fontSize: 10, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '2px 8px', color: '#e5e7eb' }}>
                      {chip}
                    </span>
                  ))}
                </div>
                <div style={{ color: '#facc15', fontSize: 12, alignSelf: 'center' }}>{row.status ?? 'OK'}</div>
                <div style={{ color: '#fff', fontSize: 12, alignSelf: 'center', textAlign: 'right' }}>{row.value ?? '-'}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, color: '#d1d5db', marginBottom: 8 }}>Actions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => runAction(action.id)}
                style={{
                  border: `1px solid ${toneStyle(action.tone)}`,
                  borderRadius: 8,
                  background: 'transparent',
                  color: toneStyle(action.tone),
                  padding: '8px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {action.label} ({actionCount[action.id] ?? 0})
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, color: '#d1d5db', marginBottom: 8 }}>Department Links</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {quickLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: '#e5e7eb',
                  textDecoration: 'none',
                  padding: '8px 10px',
                  fontSize: 12,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
