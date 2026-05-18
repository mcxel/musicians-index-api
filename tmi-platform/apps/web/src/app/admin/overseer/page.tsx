'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOverseerDeck } from '@/hooks/useOverseerDeck';
import OverseerDock from '@/components/admin/overseer/OverseerDock';
import AvatarMiniPreview from '@/components/avatar/AvatarMiniPreview';
import type { RoleType } from '@/types/avatar';

const ROLE_META: Record<RoleType, { color: string; bg: string; label: string; emoji: string }> = {
  FAN:       { color: '#00FFFF', bg: 'rgba(0,255,255,0.08)',  label: 'Fan',       emoji: '🎧' },
  PERFORMER: { color: '#FF2DAA', bg: 'rgba(255,45,170,0.08)', label: 'Performer', emoji: '🎤' },
  ADMIN:     { color: '#FFD700', bg: 'rgba(255,215,0,0.08)',  label: 'Admin',     emoji: '👑' },
};

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export default function OverseerPage() {
  const { currentRole, setRole, isAdmin, isPerformer, isFan } = useOverseerDeck();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const [lastSwitchedAt, setLastSwitchedAt] = useState<string | null>(null);
  const [localStorageRaw, setLocalStorageRaw] = useState<string | null>(null);
  const [sessionPresent, setSessionPresent] = useState<boolean | null>(null);

  // Read debug values client-side only
  useEffect(() => {
    if (!hydrated) return;
    setLocalStorageRaw(localStorage.getItem('tmi_role') ?? '(not set)');
    const cookies = document.cookie;
    setSessionPresent(cookies.includes('tmi_session') || cookies.includes('tmi_user_email'));
  }, [hydrated, currentRole]);

  const handleSwitch = (role: RoleType) => {
    setRole(role);
    setLastSwitchedAt(new Date().toLocaleTimeString());
  };

  const meta = ROLE_META[currentRole];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '24px 20px 80px', maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 6 }}>
            ADMIN OVERSEER DECK
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900 }}>
            System Control
          </h1>
        </div>

        {/* Active Role — large cockpit display */}
        <section style={{
          borderRadius: 16,
          border: `2px solid ${meta.color}44`,
          background: meta.bg,
          padding: '24px 28px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: 6 }}>
              ACTIVE ROLE
            </div>
            <div style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: meta.color, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {meta.emoji} {meta.label.toUpperCase()}
            </div>
            {lastSwitchedAt && (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                Last switched: {lastSwitchedAt}
              </div>
            )}
          </div>

          {/* Live pulse dot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: meta.color,
              boxShadow: `0 0 14px ${meta.color}`,
              animation: 'overseerPulse 1.8s ease-in-out infinite',
            }} />
            <div style={{ fontSize: 7, color: meta.color, fontWeight: 900, letterSpacing: '0.12em' }}>LIVE</div>
          </div>
        </section>

        <style>{`
          @keyframes overseerPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.55; transform: scale(0.88); }
          }
        `}</style>

        {/* Role Switch Buttons */}
        <section style={{
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
          padding: '18px 20px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
            SWITCH ROLE
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(Object.entries(ROLE_META) as [RoleType, typeof meta][]).map(([role, m]) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSwitch(role)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: `1px solid ${currentRole === role ? m.color + '88' : 'rgba(255,255,255,0.12)'}`,
                  background: currentRole === role ? m.bg : 'transparent',
                  color: currentRole === role ? m.color : 'rgba(255,255,255,0.5)',
                  fontSize: 11, fontWeight: 900, letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                {m.emoji} {role}
              </button>
            ))}
          </div>
        </section>

        {/* State Inspector */}
        <section style={{
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.3)',
          padding: '18px 20px',
          marginBottom: 20,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', gridColumn: '1/-1', marginBottom: 4 }}>
            STATE INSPECTOR
          </div>
          {[
            ['currentRole', currentRole],
            ['isFan', String(isFan)],
            ['isPerformer', String(isPerformer)],
            ['isAdmin', String(isAdmin)],
          ].map(([k, v]) => (
            <div key={k} style={{ fontSize: 11, display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{k}</span>
              <span style={{ color: '#00FF88', fontWeight: 700, fontFamily: 'monospace' }}>{v}</span>
            </div>
          ))}
        </section>

        {/* Avatar Preview */}
        <AvatarMiniPreview
          variant="card"
          role={meta.label}
          accentColor={meta.color}
        />

        {/* Debug Panel */}
        <section style={{
          borderRadius: 12,
          border: '1px solid rgba(255,215,0,0.15)',
          background: 'rgba(255,215,0,0.03)',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 14, fontWeight: 800 }}>
            DEBUG PANEL
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              ['route',        pathname ?? '(unknown)'],
              ['localStorage', hydrated ? (localStorageRaw ?? '…') : '(server render)'],
              ['session',      hydrated ? (sessionPresent ? '✓ present' : '✗ not found') : '(server render)'],
              ['hydration',    hydrated ? 'mounted' : 'pending'],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                fontSize: 11, fontFamily: 'monospace',
                borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 7,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{
                  color: label === 'session' && value === '✗ not found' ? '#FF4444'
                       : label === 'session' && typeof value === 'string' && value.startsWith('✓') ? '#00FF88'
                       : label === 'hydration' && value === 'mounted' ? '#00FF88'
                       : '#fff',
                  fontWeight: 700,
                }}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <OverseerDock operatorName="Marcel" operatorRole="Platform Director" systemHealth={98} />
    </div>
  );
}
