'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { PersonaType, GovernancePersona } from '@/lib/auth/GovernanceClusterEngine';
import { getActivePersonaState, getAvailablePersonas } from '@/lib/auth/PersonaSwitchEngine';

interface GovernancePersonaSwitcherProps {
  memberId: string;
  compact?: boolean;
}

const PERSONA_ICONS: Record<PersonaType, string> = {
  admin:  '⚡',
  artist: '🎤',
  fan:    '🎧',
};

const PERSONA_LABELS: Record<PersonaType, string> = {
  admin:  'Admin Mode',
  artist: 'Artist Mode',
  fan:    'Fan Mode',
};

const PERSONA_COLORS: Record<PersonaType, string> = {
  admin:  '#ff6b1a',
  artist: '#00FFFF',
  fan:    '#FF2DAA',
};

export function GovernancePersonaSwitcher({ memberId, compact = false }: GovernancePersonaSwitcherProps) {
  const router  = useRouter();
  const ref     = useRef<HTMLDivElement>(null);
  const personas = getAvailablePersonas(memberId);

  const [activeState, setActiveState]   = useState(() => getActivePersonaState());
  const [open, setOpen]                 = useState(false);
  const [switching, setSwitching]       = useState(false);

  const activeType  = activeState.personaType ?? 'admin';
  const activeColor = PERSONA_COLORS[activeType];
  const activeIcon  = PERSONA_ICONS[activeType];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSwitch(persona: GovernancePersona) {
    if (switching || persona.personaType === activeType) { setOpen(false); return; }
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/switch-persona', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ memberId, personaType: persona.personaType }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveState({
          memberId,
          personaType:    persona.personaType,
          role:           data.role,
          displayName:    data.displayName,
          dashboardRoute: data.dashboardRoute,
          isGovernance:   true,
        });
        setOpen(false);
        router.push(data.dashboardRoute);
      }
    } catch { /* silently fail — keep current persona */ }
    finally { setSwitching(false); }
  }

  if (compact) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            6,
            padding:        '5px 10px',
            background:     `${activeColor}18`,
            border:         `1px solid ${activeColor}44`,
            borderRadius:   8,
            cursor:         'pointer',
            fontSize:       11,
            fontWeight:     700,
            color:          activeColor,
            letterSpacing:  '0.06em',
            textTransform:  'uppercase',
          }}
          title="Switch Persona"
        >
          {activeIcon} {PERSONA_LABELS[activeType]}
          <span style={{ opacity: 0.6, fontSize: 9 }}>▾</span>
        </button>
        {open && (
          <div style={{
            position:  'absolute',
            top:       '100%',
            left:      0,
            marginTop: 6,
            background: '#0d1117',
            border:    '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding:   8,
            zIndex:    9999,
            minWidth:  160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', padding: '4px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Switch Persona
            </div>
            {personas.map((p) => {
              const active = p.personaType === activeType;
              const color  = PERSONA_COLORS[p.personaType];
              return (
                <button
                  key={p.personaId}
                  onClick={() => handleSwitch(p)}
                  disabled={switching}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            10,
                    width:          '100%',
                    padding:        '9px 12px',
                    background:     active ? `${color}14` : 'transparent',
                    border:         'none',
                    borderRadius:   7,
                    cursor:         active ? 'default' : 'pointer',
                    color:          active ? color : 'rgba(255,255,255,0.6)',
                    fontSize:       12,
                    fontWeight:     active ? 700 : 500,
                    textAlign:      'left',
                    transition:     'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{PERSONA_ICONS[p.personaType]}</span>
                  <span style={{ flex: 1 }}>{PERSONA_LABELS[p.personaType]}</span>
                  {active && <span style={{ fontSize: 8, color, opacity: 0.8 }}>●</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Full-size variant
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           10,
          padding:       '10px 16px',
          background:    `${activeColor}12`,
          border:        `1px solid ${activeColor}44`,
          borderRadius:  10,
          cursor:        'pointer',
          minWidth:      180,
        }}
      >
        <span style={{ fontSize: 18 }}>{activeIcon}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Persona</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: activeColor }}>{PERSONA_LABELS[activeType]}</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position:     'absolute',
          top:          '100%',
          left:         0,
          right:        0,
          marginTop:    8,
          background:   '#0d1117',
          border:       '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding:      10,
          zIndex:       9999,
          boxShadow:    '0 12px 48px rgba(0,0,0,0.7)',
        }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', padding: '2px 10px 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Governance Cluster — Switch Persona
          </div>
          {personas.map((p) => {
            const active = p.personaType === activeType;
            const color  = PERSONA_COLORS[p.personaType];
            return (
              <button
                key={p.personaId}
                onClick={() => handleSwitch(p)}
                disabled={switching}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         12,
                  width:       '100%',
                  padding:     '12px 14px',
                  background:  active ? `${color}12` : 'transparent',
                  border:      active ? `1px solid ${color}33` : '1px solid transparent',
                  borderRadius: 9,
                  cursor:      active ? 'default' : 'pointer',
                  marginBottom: 4,
                  transition:  'all 0.15s',
                }}
              >
                <span style={{ fontSize: 20 }}>{PERSONA_ICONS[p.personaType]}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: active ? color : '#fff' }}>
                    {PERSONA_LABELS[p.personaType]}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                    {p.dashboardRoute}
                  </div>
                </div>
                {active && (
                  <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`, padding: '2px 8px', borderRadius: 5 }}>
                    Active
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0 4px', padding: '8px 10px 0' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
              GOVERNANCE CLUSTER · DIAMOND TIER · NO RE-LOGIN REQUIRED
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GovernancePersonaSwitcher;
