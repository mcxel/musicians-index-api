'use client';
/**
 * PersonaSwitcher.tsx
 *
 * Universal persona switching HUD — works for every TMI user.
 * No logout. Session token unchanged. Role cookie updates to match active persona.
 *
 * Usage:
 *   <PersonaSwitcher userId={userId} currentRole={role} />
 *
 * Props:
 *   userId       — user's ID (used for server-side persona persistence)
 *   currentRole  — current TMIRole from session
 *   compact      — true for header/nav bar variant, false for sidebar/full variant
 *   showAdd      — show "Add Persona" option (defaults true)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PERSONA_META,
  CAPABILITY_MATRIX,
  getUserPersonas,
  addPersona,
  switchPersonaLocal,
  getActivePersonaFromCookie,
  getDefaultPersonaForRole,
  type PersonaType,
} from '@/lib/identity/MultiPersonaEngine';
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

interface PersonaSwitcherProps {
  userId?:     string;
  currentRole?: string;
  compact?:    boolean;
  showAdd?:    boolean;
}

// Which personas users can add themselves (others require admin grant)
const SELF_ADDABLE: PersonaType[] = ['fan', 'artist', 'producer', 'performer', 'dj', 'host', 'sponsor', 'advertiser', 'venue'];

export function PersonaSwitcher({ userId, currentRole, compact = false, showAdd = true }: PersonaSwitcherProps) {
  const router = useRouter();
  const ref    = useRef<HTMLDivElement>(null);

  const [userPersonas,  setUserPersonas]  = useState<PersonaType[]>(['fan']);
  const [activePersona, setActivePersona] = useState<PersonaType>('fan');
  const [open,          setOpen]          = useState(false);
  const [addOpen,       setAddOpen]       = useState(false);
  const [switching,     setSwitching]     = useState(false);

  useEffect(() => {
    const personas    = getUserPersonas();
    const fromCookie  = getActivePersonaFromCookie();
    const fromRole    = currentRole ? getDefaultPersonaForRole(currentRole) : 'fan';
    const active      = fromCookie ?? fromRole;

    setUserPersonas(personas.length > 0 ? personas : [fromRole]);
    setActivePersona(personas.includes(active) ? active : fromRole);
  }, [currentRole]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAddOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = useCallback(async (personaType: PersonaType) => {
    if (switching || personaType === activePersona) { setOpen(false); return; }
    setSwitching(true);
    try {
      // Server-side cookie update
      if (userId) {
        await fetch('/api/auth/switch-persona', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ personaType, userId }),
        }).catch(() => {}); // best-effort — local switch always works
      }
      // Local-first switch (no round-trip dependency)
      const result = switchPersonaLocal(personaType);
      if (result.ok) {
        Analytics.personaSwitch({ userId, from: activePersona, to: personaType });
        setActivePersona(personaType);
        setOpen(false);
        router.push(result.dashboardRoute);
      }
    } finally {
      setSwitching(false);
    }
  }, [switching, activePersona, userId, router]);

  const handleAddPersona = useCallback((personaType: PersonaType) => {
    const updated = addPersona(personaType);
    setUserPersonas(updated);
    setAddOpen(false);
    handleSwitch(personaType);
  }, [handleSwitch]);

  const activeMeta = PERSONA_META[activePersona];
  const addable    = SELF_ADDABLE.filter((p) => !userPersonas.includes(p));

  if (compact) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => { setOpen(!open); setAddOpen(false); }}
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           6,
            padding:       '5px 10px',
            background:    `${activeMeta.color}18`,
            border:        `1px solid ${activeMeta.color}44`,
            borderRadius:  8,
            cursor:        'pointer',
            fontSize:      11,
            fontWeight:    700,
            color:         activeMeta.color,
            letterSpacing: '0.06em',
            whiteSpace:    'nowrap',
          }}
        >
          <span style={{ fontSize: 13 }}>{activeMeta.icon}</span>
          {activeMeta.label}
          <span style={{ opacity: 0.5, fontSize: 9 }}>▾</span>
        </button>

        {open && (
          <div style={dropdownStyle()}>
            <div style={dropdownHeaderStyle}>Persona</div>

            {/* Active personas */}
            {userPersonas.map((pt) => {
              const meta   = PERSONA_META[pt];
              const isActive = pt === activePersona;
              return (
                <button key={pt} onClick={() => handleSwitch(pt)} disabled={switching} style={menuItemStyle(isActive, meta.color)}>
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{meta.label}</span>
                  {isActive && <span style={{ fontSize: 8, color: meta.color }}>●</span>}
                </button>
              );
            })}

            {/* Add persona */}
            {showAdd && addable.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '6px 0' }} />
                <button
                  onClick={() => { setAddOpen(!addOpen); }}
                  style={{ ...menuItemStyle(false, 'rgba(255,255,255,0.3)'), fontSize: 11 }}
                >
                  <span>+</span> Add Persona
                </button>
                {addOpen && addable.map((pt) => {
                  const meta = PERSONA_META[pt];
                  return (
                    <button key={pt} onClick={() => handleAddPersona(pt)} style={{ ...menuItemStyle(false, meta.color), paddingLeft: 24 }}>
                      <span style={{ fontSize: 12 }}>{meta.icon}</span>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: 11 }}>{meta.label}</span>
                    </button>
                  );
                })}
              </>
            )}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '6px 0 4px', padding: '4px 10px 0' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em' }}>
                NO RE-LOGIN REQUIRED
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Full Sidebar Variant ──────────────────────────────────────────────────

  return (
    <div ref={ref} style={{ width: '100%' }}>
      {/* Active persona button */}
      <button
        onClick={() => { setOpen(!open); setAddOpen(false); }}
        style={{
          width:        '100%',
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          padding:      '12px 16px',
          background:   `${activeMeta.color}10`,
          border:       `1px solid ${activeMeta.color}44`,
          borderRadius: 12,
          cursor:       'pointer',
          transition:   'all 0.15s',
        }}
      >
        <span style={{ fontSize: 22 }}>{activeMeta.icon}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Active Persona</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: activeMeta.color }}>{activeMeta.label}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{activeMeta.description}</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 8, background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, boxShadow: '0 12px 48px rgba(0,0,0,0.7)' }}>
          <div style={dropdownHeaderStyle}>Switch Persona</div>

          {userPersonas.map((pt) => {
            const meta     = PERSONA_META[pt];
            const isActive = pt === activePersona;
            const capCount = CAPABILITY_MATRIX[pt].length;
            return (
              <button key={pt} onClick={() => handleSwitch(pt)} disabled={switching} style={{ ...menuItemStyle(isActive, meta.color), padding: '11px 14px', marginBottom: 4, borderRadius: 9 }}>
                <span style={{ fontSize: 18 }}>{meta.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? meta.color : '#fff' }}>{meta.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{capCount} capabilities · {meta.dashboardRoute}</div>
                </div>
                {isActive && <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, background: `${meta.color}18`, padding: '2px 8px', borderRadius: 5 }}>Active</span>}
              </button>
            );
          })}

          {showAdd && addable.length > 0 && (
            <>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />
              <button
                onClick={() => setAddOpen(!addOpen)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 9, cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}
              >
                <span style={{ fontSize: 16 }}>+</span> Add New Persona
                <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 9 }}>{addOpen ? '▲' : '▼'}</span>
              </button>
              {addOpen && (
                <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {addable.map((pt) => {
                    const meta = PERSONA_META[pt];
                    return (
                      <button
                        key={pt}
                        onClick={() => handleAddPersona(pt)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: `${meta.color}0a`, border: `1px solid ${meta.color}22`, borderRadius: 8, cursor: 'pointer', color: meta.color, fontSize: 11, fontWeight: 700 }}
                      >
                        <span>{meta.icon}</span> {meta.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Style Helpers ─────────────────────────────────────────────────────────────

function dropdownStyle(): React.CSSProperties {
  return {
    position:     'absolute',
    top:          '100%',
    left:         0,
    marginTop:    6,
    background:   '#0d1117',
    border:       '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding:      8,
    zIndex:       9999,
    minWidth:     180,
    boxShadow:    '0 8px 32px rgba(0,0,0,0.6)',
  };
}

const dropdownStyle2 = dropdownStyle();

const dropdownHeaderStyle: React.CSSProperties = {
  fontSize:      9,
  color:         'rgba(255,255,255,0.3)',
  padding:       '4px 10px 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

function menuItemStyle(active: boolean, color: string): React.CSSProperties {
  return {
    display:     'flex',
    alignItems:  'center',
    gap:         10,
    width:       '100%',
    padding:     '9px 12px',
    background:  active ? `${color}14` : 'transparent',
    border:      'none',
    borderRadius: 7,
    cursor:      active ? 'default' : 'pointer',
    color:       active ? color : 'rgba(255,255,255,0.65)',
    fontSize:    12,
    fontWeight:  active ? 700 : 500,
    textAlign:   'left',
    transition:  'background 0.15s',
  };
}

export default PersonaSwitcher;
