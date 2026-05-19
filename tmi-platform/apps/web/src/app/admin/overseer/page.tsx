'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOverseerDeck } from '@/hooks/useOverseerDeck';
import { useFamilyConsensus } from '@/hooks/useFamilyConsensus';
import OverseerDock from '@/components/admin/overseer/OverseerDock';
import AvatarMiniPreview from '@/components/avatar/AvatarMiniPreview';
import type { RoleType } from '@/types/avatar';
import type { AccountTier, FamilyGroup } from '@/types/security';

// ─── Static config ─────────────────────────────────────────────────────────────

const ROLE_META: Record<RoleType, { color: string; bg: string; label: string; emoji: string }> = {
  FAN:       { color: '#00FFFF', bg: 'rgba(0,255,255,0.08)',  label: 'Fan',       emoji: '🎧' },
  PERFORMER: { color: '#FF2DAA', bg: 'rgba(255,45,170,0.08)', label: 'Performer', emoji: '🎤' },
  ADMIN:     { color: '#FFD700', bg: 'rgba(255,215,0,0.08)',  label: 'Admin',     emoji: '👑' },
};

const ACCOUNT_TIER_BY_ROLE: Record<RoleType, AccountTier> = {
  FAN:       'YOUTH_16',
  PERFORMER: 'ADULT',
  ADMIN:     'ADULT',
};

const DEMO_FAMILY: FamilyGroup = {
  id: 'family-demo-01',
  familyName: 'Demo Family',
  members: [
    { id: 'parent_mom',   userName: 'Parent (Mom)',  tier: 'ADULT',    isVerifiedCustodian: true },
    { id: 'parent_dad',   userName: 'Parent (Dad)',  tier: 'ADULT',    isVerifiedCustodian: true },
    { id: 'guardian_3',   userName: 'Guardian',      tier: 'ADULT',    isVerifiedCustodian: true },
    { id: 'youth_demo_01',userName: 'Youth Account', tier: 'YOUTH_16', isVerifiedCustodian: false },
  ],
  approvalThreshold: 2,
};

const DEMO_ADULT_ID = 'DEMO_ADULT_01';
const DEMO_YOUTH_ID = 'youth_demo_01';

const DEMO_ADULT_NAME = 'Demo Adult';

const custodians = DEMO_FAMILY.members.filter((m) => m.isVerifiedCustodian);

// ─── Hydration helper ─────────────────────────────────────────────────────────

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverseerPage() {
  const { currentRole, setRole, isAdmin, isPerformer, isFan } = useOverseerDeck();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const [lastSwitchedAt, setLastSwitchedAt] = useState<string | null>(null);
  const [localStorageRaw, setLocalStorageRaw] = useState<string | null>(null);
  const [sessionPresent, setSessionPresent] = useState<boolean | null>(null);

  const {
    activeRequest,
    trustLinks,
    allowConnection,
    createRequest,
    approveRequest,
    declineRequest,
    resetRequest,
  } = useFamilyConsensus(DEMO_FAMILY);

  const accountTier = ACCOUNT_TIER_BY_ROLE[currentRole];

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

        {/* Active Role display */}
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

        {/* Role switcher */}
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

        {/* State inspector */}
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
          {([
            ['currentRole', currentRole],
            ['isFan',        String(isFan)],
            ['isPerformer',  String(isPerformer)],
            ['isAdmin',      String(isAdmin)],
          ] as const).map(([k, v]) => (
            <div key={k} style={{ fontSize: 11, display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{k}</span>
              <span style={{ color: '#00FF88', fontWeight: 700, fontFamily: 'monospace' }}>{v}</span>
            </div>
          ))}
        </section>

        {/* Avatar preview */}
        <div style={{ marginBottom: 20 }}>
          <AvatarMiniPreview variant="card" role={meta.label} accentColor={meta.color} />
        </div>

        {/* ── Security / Trust Panel ────────────────────────────────────────────── */}
        <section style={{
          borderRadius: 14,
          border: '1px solid rgba(255,68,68,0.28)',
          background: 'rgba(255,68,68,0.03)',
          padding: '20px 22px',
          marginBottom: 20,
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.22em', color: '#FF4444', fontWeight: 800 }}>
                SECURITY / TRUST
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                Family consensus · 16+ youth account gating
              </div>
            </div>
            <div style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: `1px solid ${accountTier === 'YOUTH_16' ? '#00FFFF88' : '#FFD70088'}`,
              background: accountTier === 'YOUTH_16' ? 'rgba(0,255,255,0.1)' : 'rgba(255,215,0,0.1)',
              fontSize: 10, fontWeight: 900, letterSpacing: '0.12em',
              color: accountTier === 'YOUTH_16' ? '#00FFFF' : '#FFD700',
            }}>
              {accountTier === 'YOUTH_16' ? '16+ YOUTH' : 'ADULT'}
            </div>
          </div>

          {/* allowConnection boolean indicator */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${allowConnection ? '#00FF8844' : 'rgba(255,255,255,0.08)'}`,
            background: allowConnection ? 'rgba(0,255,136,0.06)' : 'rgba(255,255,255,0.02)',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: allowConnection ? '#00FF88' : '#FF4444',
              boxShadow: allowConnection ? '0 0 6px #00FF88' : 'none',
            }} />
            <div style={{ fontSize: 10, color: allowConnection ? '#00FF88' : 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              allowConnection = <strong>{String(allowConnection)}</strong>
            </div>
          </div>

          {/* No active request */}
          {!activeRequest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                Family: <span style={{ color: '#fff' }}>{custodians.length} custodians</span>
                {' · '}threshold: <span style={{ color: '#FFD700' }}>{DEMO_FAMILY.approvalThreshold}/{custodians.length}</span>
              </div>
              <button
                type="button"
                onClick={() => createRequest(DEMO_ADULT_ID, DEMO_ADULT_NAME, DEMO_YOUTH_ID)}
                style={{
                  padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                  border: '1px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.08)',
                  color: '#FFD700', fontSize: 11, fontWeight: 900, letterSpacing: '0.1em',
                  alignSelf: 'flex-start',
                }}
              >
                SIMULATE LINK REQUEST →
              </button>
            </div>
          )}

          {/* Active consensus request */}
          {activeRequest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                  Request:{' '}
                  <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: 9 }}>
                    {activeRequest.requestId.slice(0, 18)}…
                  </span>
                </div>
                <div style={{
                  padding: '3px 10px', borderRadius: 20,
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.12em',
                  background: activeRequest.status === 'FULLY_APPROVED' ? 'rgba(0,255,136,0.15)'
                            : activeRequest.status === 'REJECTED_WIPED' ? 'rgba(255,68,68,0.15)'
                            : 'rgba(255,215,0,0.12)',
                  color:      activeRequest.status === 'FULLY_APPROVED' ? '#00FF88'
                            : activeRequest.status === 'REJECTED_WIPED' ? '#FF4444'
                            : '#FFD700',
                  border: `1px solid ${
                    activeRequest.status === 'FULLY_APPROVED' ? '#00FF8844'
                    : activeRequest.status === 'REJECTED_WIPED' ? '#FF444444'
                    : '#FFD70044'
                  }`,
                }}>
                  {activeRequest.status}
                </div>
              </div>

              {/* Per-custodian vote rows */}
              {custodians.map((custodian) => {
                const vote = activeRequest.votes[custodian.id] ?? 'PENDING';
                const settled = vote !== 'PENDING';
                return (
                  <div key={custodian.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${
                      vote === 'APPROVED' ? '#00FF8833'
                      : vote === 'DECLINED' ? '#FF444433'
                      : 'rgba(255,255,255,0.08)'
                    }`,
                    background: vote === 'APPROVED' ? 'rgba(0,255,136,0.04)'
                              : vote === 'DECLINED' ? 'rgba(255,68,68,0.04)'
                              : 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                      {custodian.userName}
                    </div>
                    {settled ? (
                      <div style={{
                        fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
                        color: vote === 'APPROVED' ? '#00FF88' : '#FF4444',
                      }}>
                        {vote === 'APPROVED' ? '✓ APPROVED' : '✗ DECLINED'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => approveRequest(activeRequest.requestId, custodian.id)}
                          disabled={activeRequest.status !== 'PENDING'}
                          style={{
                            padding: '5px 12px', borderRadius: 6, fontSize: 10, fontWeight: 900,
                            border: '1px solid #00FF8866', background: 'rgba(0,255,136,0.1)',
                            color: '#00FF88', cursor: 'pointer', letterSpacing: '0.08em',
                          }}
                        >
                          APPROVE
                        </button>
                        <button
                          type="button"
                          onClick={() => declineRequest(activeRequest.requestId, custodian.id)}
                          disabled={activeRequest.status !== 'PENDING'}
                          style={{
                            padding: '5px 12px', borderRadius: 6, fontSize: 10, fontWeight: 900,
                            border: '1px solid #FF444466', background: 'rgba(255,68,68,0.1)',
                            color: '#FF4444', cursor: 'pointer', letterSpacing: '0.08em',
                          }}
                        >
                          DECLINE
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Threshold progress */}
              {activeRequest.status === 'PENDING' && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  {Object.values(activeRequest.votes).filter((v) => v === 'APPROVED').length}/
                  {activeRequest.threshold} approvals needed
                  {' · '}any decline instantly kills this request
                </div>
              )}

              {/* Reset after terminal state */}
              {(activeRequest.status === 'FULLY_APPROVED' || activeRequest.status === 'REJECTED_WIPED') && (
                <button
                  type="button"
                  onClick={resetRequest}
                  style={{
                    padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent', color: 'rgba(255,255,255,0.4)',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    alignSelf: 'flex-start',
                  }}
                >
                  RESET SIMULATION
                </button>
              )}
            </div>
          )}

          {/* Active trust links */}
          {trustLinks.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.18em', color: '#00FF88', fontWeight: 800, marginBottom: 8 }}>
                ACTIVE TRUST LINKS
              </div>
              {trustLinks.map((link) => (
                <div key={link.id} style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', lineHeight: 1.9 }}>
                  <span style={{ color: '#FFD700' }}>{link.adultId}</span>
                  {' ↔ '}
                  <span style={{ color: '#00FFFF' }}>{link.youthId}</span>
                  {' · '}
                  <span style={{ color: '#00FF88' }}>approved by {link.approvedBy.length} custodians</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Debug panel */}
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
            {([
              ['route',        pathname ?? '(unknown)'],
              ['localStorage', hydrated ? (localStorageRaw ?? '…') : '(server render)'],
              ['session',      hydrated ? (sessionPresent ? '✓ present' : '✗ not found') : '(server render)'],
              ['hydration',    hydrated ? 'mounted' : 'pending'],
              ['accountTier',  accountTier],
              ['allowConnection', String(allowConnection)],
            ] as const).map(([label, value]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                fontSize: 11, fontFamily: 'monospace',
                borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 7,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{
                  color: label === 'session'          && value === '✗ not found' ? '#FF4444'
                       : label === 'session'          && (value as string).startsWith('✓') ? '#00FF88'
                       : label === 'hydration'        && value === 'mounted'     ? '#00FF88'
                       : label === 'accountTier'      && value === 'YOUTH_16'    ? '#00FFFF'
                       : label === 'accountTier'      && value === 'ADULT'       ? '#FFD700'
                       : label === 'allowConnection'  && value === 'true'        ? '#00FF88'
                       : label === 'allowConnection'  && value === 'false'       ? '#FF4444'
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
