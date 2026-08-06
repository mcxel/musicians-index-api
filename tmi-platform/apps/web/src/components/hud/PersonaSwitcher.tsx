'use client';
/**
 * PersonaSwitcher.tsx
 *
 * Universal workspace switching HUD — one identity, many workspaces, works for every TMI user.
 * No logout. Session token unchanged. Role cookie updates to match active workspace.
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

// Dashboard switching is admin-only (Marcel Dickens, 2026-07-24: "fans and
// performers cannot switch to each other's accounts. Only administrators
// can do this."). Regular accounts never see this control, no matter how
// many real roles they hold - see also /api/auth/switch-persona, which
// enforces the same rule server-side.
const ADMIN_ROLES = new Set(['ADMIN', 'STAFF']);

// Only ADMIN can self-add every persona for oversight/QA preview; everyone
// who reaches this component is already admin-gated (see isAdmin check
// below), so this list only matters for what an admin can preview into.
const SELF_ADDABLE: PersonaType[] = ['fan', 'artist', 'producer', 'performer', 'dj', 'host', 'sponsor', 'advertiser', 'venue'];

export function PersonaSwitcher({ userId, currentRole, compact = false, showAdd = true }: PersonaSwitcherProps) {
  const router = useRouter();
  const ref    = useRef<HTMLDivElement>(null);

  const [userPersonas,  setUserPersonas]  = useState<PersonaType[]>(['fan']);
  const [activePersona, setActivePersona] = useState<PersonaType>('fan');
  const [open,          setOpen]          = useState(false);
  const [addOpen,       setAddOpen]       = useState(false);
  const [switching,     setSwitching]     = useState(false);
  // Compact mode's dropdown is position:absolute anchored to the toggle
  // button, inside a flex:1 header slot whose real screen position varies.
  // On a narrow phone screen that overflows off the edge and becomes
  // unreadable/untappable (reported 2026-08-04, Jay Paul Sanchez — couldn't
  // see or reach the workspace switch on mobile). Below 640px we switch the
  // dropdown to position:fixed with viewport-relative insets instead, so it
  // can never overflow regardless of where the button sits.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  // Admin-only gate — placed after all hooks (Rules of Hooks), before render.
  // A Fan/Performer/etc. account must never see this control, regardless of
  // how many real roles it holds.
  if (!ADMIN_ROLES.has((currentRole ?? '').toUpperCase())) {
    return null;
  }

  const activeMeta = PERSONA_META[activePersona];
  const addablePool: PersonaType[] = [...SELF_ADDABLE, 'admin'];
  const addable: PersonaType[] = addablePool.filter((p) => !userPersonas.includes(p));
  const quickSwitchCandidates: PersonaType[] = ['admin', 'performer', 'fan'];
  const quickSwitchTargets: PersonaType[] = quickSwitchCandidates.filter(
    (pt) => userPersonas.includes(pt) || addable.includes(pt),
  );

  if (compact) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => { setOpen(!open); setAddOpen(false); }}
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           6,
            padding:       isMobile ? '10px 14px' : '5px 10px',
            minHeight:     isMobile ? 44 : undefined,
            background:    `${activeMeta.color}18`,
            border:        `1px solid ${activeMeta.color}44`,
            borderRadius:  8,
            cursor:        'pointer',
            fontSize:      isMobile ? 14 : 11,
            fontWeight:    700,
            color:         activeMeta.color,
            letterSpacing: '0.06em',
            whiteSpace:    'nowrap',
          }}
        >
          <span style={{ fontSize: isMobile ? 16 : 13 }}>{activeMeta.icon}</span>
          {activeMeta.label}
          <span style={{ opacity: 0.5, fontSize: isMobile ? 11 : 9 }}>▾</span>
        </button>

        {open && (
          <div style={dropdownStyle(isMobile)}>
            <div style={dropdownHeaderStyle}>Workspace</div>

            {quickSwitchTargets.length > 0 && (
              <div style={{ display: 'flex', gap: 6, padding: '0 8px 8px', flexWrap: 'wrap' }}>
                {quickSwitchTargets.map((pt) => {
                  const meta = PERSONA_META[pt];
                  const isActive = pt === activePersona;
                  return (
                    <button
                      key={`quick-${pt}`}
                      onClick={() => userPersonas.includes(pt) ? handleSwitch(pt) : handleAddPersona(pt)}
                      style={{
                        border: `1px solid ${meta.color}55`,
                        background: isActive ? `${meta.color}22` : 'rgba(255,255,255,0.02)',
                        color: meta.color,
                        borderRadius: 999,
                        padding: isMobile ? '8px 12px' : '3px 8px',
                        minHeight: isMobile ? 36 : undefined,
                        fontSize: isMobile ? 12 : 9,
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                      }}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active personas */}
            {userPersonas.map((pt) => {
              const meta   = PERSONA_META[pt];
              const isActive = pt === activePersona;
              return (
                <button key={pt} onClick={() => handleSwitch(pt)} disabled={switching} style={menuItemStyle(isActive, meta.color, isMobile)}>
                  <span style={{ fontSize: isMobile ? 16 : 14 }}>{meta.icon}</span>
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
                  style={{ ...menuItemStyle(false, 'rgba(255,255,255,0.3)', isMobile), fontSize: isMobile ? 13 : 11 }}
                >
                  <span>+</span> Add Workspace
                </button>
                {addOpen && addable.map((pt) => {
                  const meta = PERSONA_META[pt];
                  return (
                    <button key={pt} onClick={() => handleAddPersona(pt)} style={{ ...menuItemStyle(false, meta.color, isMobile), paddingLeft: 24 }}>
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
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Active Workspace</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: activeMeta.color }}>{activeMeta.label}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{activeMeta.description}</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 8, background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, boxShadow: '0 12px 48px rgba(0,0,0,0.7)' }}>
          <div style={dropdownHeaderStyle}>Switch Workspace</div>

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
                <span style={{ fontSize: 16 }}>+</span> Add New Workspace
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

function dropdownStyle(isMobile = false): React.CSSProperties {
  if (isMobile) {
    // Viewport-relative instead of button-relative — guaranteed on-screen
    // no matter where the toggle button actually sits in the header.
    return {
      position:     'fixed',
      top:          64,
      left:         12,
      right:        12,
      background:   '#0d1117',
      border:       '1px solid rgba(255,255,255,0.12)',
      borderRadius: 12,
      padding:      10,
      zIndex:       9999,
      maxHeight:    'calc(100vh - 88px)',
      overflowY:    'auto',
      boxShadow:    '0 8px 32px rgba(0,0,0,0.6)',
    };
  }
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

function menuItemStyle(active: boolean, color: string, isMobile = false): React.CSSProperties {
  return {
    display:     'flex',
    alignItems:  'center',
    gap:         10,
    width:       '100%',
    padding:     isMobile ? '13px 14px' : '9px 12px',
    minHeight:   isMobile ? 44 : undefined,
    background:  active ? `${color}14` : 'transparent',
    border:      'none',
    borderRadius: 7,
    cursor:      active ? 'default' : 'pointer',
    color:       active ? color : 'rgba(255,255,255,0.65)',
    fontSize:    isMobile ? 14 : 12,
    fontWeight:  active ? 700 : 500,
    textAlign:   'left',
    transition:  'background 0.15s',
  };
}

export default PersonaSwitcher;
