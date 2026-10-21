'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type FirstRunStep,
  type UserRole,
  getFirstRunState,
  getPendingSteps,
  getActiveStepsForRole,
  completeFirstRunStep,
  dismissFirstRun,
  setFirstRunRole,
  totalXPGranted,
  mapPlatformRoleToFirstRunRole,
} from '@/lib/onboarding/FirstRunExperienceEngine';

const ROLE_OPTIONS: { role: UserRole; label: string; icon: string; desc: string }[] = [
  { role: 'fan', label: 'Fan', icon: '🎧', desc: 'Vote, tip artists, join live rooms' },
  { role: 'artist', label: 'Artist', icon: '🎵', desc: 'Sell beats, enter battles, build rep' },
  { role: 'performer', label: 'Performer', icon: '🎤', desc: 'Go live, earn tips, compete' },
  { role: 'venue', label: 'Venue', icon: '🏟️', desc: 'List events, sell tickets' },
  { role: 'sponsor', label: 'Sponsor', icon: '🤝', desc: 'Patronize artists, fund prizes' },
  { role: 'advertiser', label: 'Advertiser', icon: '📢', desc: 'Run ads, reach music fans' },
];

const AUTH_PATHS = ['/auth', '/signup', '/login', '/support/account-recovery', '/home', '/onboarding', '/admin'];

// Below RoleWelcomeBriefing (9450) and hub GPS recall/drawer (9350/9360).
// 9999 painted this checklist over the welcome "Not now" control.
const FIRST_RUN_Z = 9340;

// The hub GPS drawer sets data-gps-rail-open="1" on <html> while it is open.
// While the drawer is open its destination launchers must win taps over this
// checklist card on compact screens; the card is non-destructive, so yielding
// is safe and reversible (it restores as soon as the drawer closes).
const GPS_RAIL_OPEN_SELECTOR = '[data-gps-rail-open="1"]';

const NEXT_ACTIONS = [
  { icon: '🎭', label: 'Join a Live Room',     desc: 'Watch artists perform right now',        href: '/fan/theater'      },
  { icon: '📰', label: 'Visit the Magazine',   desc: 'News, battles, and editorials',          href: '/home/1'           },
  { icon: '👤', label: 'Complete Your Profile',desc: 'Add photo, bio, and links',              href: '/account'          },
  { icon: '⭐', label: 'Follow an Artist',     desc: 'Get notified when they go live',         href: '/artists/dashboard'},
  { icon: '✨', label: 'Earn Your First XP',   desc: 'Vote in a battle or send a tip',         href: '/battles'          },
];

export default function FirstRunExperienceOverlay() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [steps, setSteps] = useState<FirstRunStep[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [phase, setPhase] = useState<'role-select' | 'checklist'>('role-select');
  const [compactViewport, setCompactViewport] = useState(false);
  const [gpsRailOpen, setGpsRailOpen] = useState(false);

  const isAuthPath = AUTH_PATHS.some(p => pathname === p || pathname?.startsWith(p + '/'));

  useEffect(() => {
    const media = window.matchMedia('(max-width: 480px), (max-height: 520px)');
    const apply = () => setCompactViewport(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  // Track the hub GPS drawer's open state so this checklist yields taps to it.
  useEffect(() => {
    const root = document.documentElement;
    const applyGps = () => setGpsRailOpen(root.matches(GPS_RAIL_OPEN_SELECTOR));
    applyGps();
    const observer = new MutationObserver(applyGps);
    observer.observe(root, { attributes: true, attributeFilter: ['data-gps-rail-open'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAuthPath) return;
    setMounted(true);
    let cancelled = false;

    function showChecklist(r: UserRole) {
      const all = getActiveStepsForRole(r);
      setRole(r);
      setTotalSteps(all.length);
      setSteps(getPendingSteps(r));
      setPhase('checklist');
      setVisible(true);
    }

    async function init() {
      const state = getFirstRunState();
      if (state.dismissed) return;

      // Already picked a role in this flow before — never ask again.
      if (state.role) {
        showChecklist(state.role);
        return;
      }

      // No local answer yet. Check whether this is a signed-in account that
      // already chose a role at signup — if so, use that instead of asking
      // "what brings you here?" a second time. tmi_role is httpOnly, so this
      // requires a server round-trip rather than reading document.cookie.
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        const data = await res.json().catch(() => null) as {
          authenticated?: boolean;
          user?: { role?: string; onboardingState?: string };
        } | null;
        const onboardingState = data?.user?.onboardingState?.toLowerCase();
        if (!cancelled && data?.authenticated && onboardingState === 'complete') {
          dismissFirstRun();
          return;
        }
        const mapped = data?.authenticated && data.user?.role
          ? mapPlatformRoleToFirstRunRole(data.user.role)
          : null;
        if (!cancelled && mapped) {
          setFirstRunRole(mapped);
          showChecklist(mapped);
          return;
        }
      } catch {
        // Session lookup failed — fall back to manual role-select below.
      }

      if (!cancelled) setVisible(true);
    }

    init();
    return () => { cancelled = true; };
  }, [isAuthPath]);

  function handleRoleSelect(r: UserRole) {
    setFirstRunRole(r);
    setRole(r);
    const all = getActiveStepsForRole(r);
    setTotalSteps(all.length);
    setSteps(getPendingSteps(r));
    setPhase('checklist');
  }

  function handleStepDone(stepId: string) {
    completeFirstRunStep(stepId);
    if (role) {
      setSteps(getPendingSteps(role));
    }
  }

  function handleDismiss() {
    dismissFirstRun();
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  const completedCount = totalSteps - steps.length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: FIRST_RUN_Z,
            background: 'rgba(5,5,16,0.92)',
            display: 'flex',
            alignItems: compactViewport ? 'flex-start' : 'center',
            justifyContent: 'center',
            paddingTop: compactViewport ? 'max(200px, calc(env(safe-area-inset-top) + 188px))' : 24,
            paddingRight: compactViewport ? 'max(16px, env(safe-area-inset-right))' : 24,
            paddingBottom: compactViewport ? 'max(16px, env(safe-area-inset-bottom))' : 24,
            paddingLeft: compactViewport ? 'max(16px, env(safe-area-inset-left))' : 24,
            // The dimmer is not a control. On compact screens it must not
            // take taps meant for the welcome dismiss, GPS, or account trigger.
            pointerEvents: compactViewport ? 'none' : 'auto',
          }}
        >
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#0d0d22',
              border: '1px solid rgba(170,45,255,0.35)',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              position: 'relative',
              maxHeight: compactViewport ? 'calc(100dvh - 216px - env(safe-area-inset-bottom))' : '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              // While the hub GPS drawer is open, its destination launchers
              // must receive taps. This checklist is non-destructive and
              // restores itself when the drawer closes, so it yields pointer
              // events on compact screens rather than covering the launchers.
              pointerEvents: compactViewport && gpsRailOpen ? 'none' : 'auto',
            }}
          >
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close"
              style={{
                alignSelf: 'flex-end',
                flex: '0 0 auto',
                width: 44,
                height: 44,
                minWidth: 44,
                minHeight: 44,
                margin: '8px 8px 0 0',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: 20,
                zIndex: 2,
              }}
            >
              ×
            </button>
            <div style={{ overflowY: 'auto', minHeight: 0, flex: '1 1 auto', padding: '0 32px 32px' }}>

            {phase === 'role-select' && (
              <>
                <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>WELCOME TO TMI</div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#fff' }}>What brings you here?</h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 }}>Pick your role to get a personalized quick-start guide.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.role}
                      onClick={() => handleRoleSelect(opt.role)}
                      style={{
                        background: 'rgba(170,45,255,0.08)',
                        border: '1px solid rgba(170,45,255,0.25)',
                        borderRadius: 10,
                        padding: '14px 12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: '#fff',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {phase === 'checklist' && role && (
              <>
                <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>QUICK START</div>
                <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#fff' }}>Your First Steps</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12 }}>
                  Complete these to earn up to {totalXPGranted(role)} XP
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{completedCount} of {totalSteps} complete</span>
                    <span style={{ fontSize: 11, color: '#AA2DFF', fontWeight: 700 }}>{progressPct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg,#AA2DFF,#00FFFF)', borderRadius: 2 }}
                    />
                  </div>
                </div>

                {steps.length === 0 ? (
                  <div>
                    <div style={{ textAlign: 'center', padding: '16px 0 20px', color: '#00FF88' }}>
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 36, marginBottom: 8 }}>🏆</motion.div>
                      <div style={{ fontWeight: 900, fontSize: 18, color: '#fff', marginBottom: 4 }}>You&apos;re set up!</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Here&apos;s where to go next.</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {NEXT_ACTIONS.map((a) => (
                        <a key={a.href} href={a.href} onClick={handleDismiss} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, textDecoration: 'none', color: '#fff', transition: 'border-color 0.15s' }}>
                          <span style={{ fontSize: 20 }}>{a.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{a.label}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{a.desc}</div>
                          </div>
                          <span style={{ color: '#AA2DFF', fontSize: 14 }}>›</span>
                        </a>
                      ))}
                    </div>
                    <button
                      onClick={handleDismiss}
                      style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#AA2DFF,#00CCFF)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 900, fontSize: 13, letterSpacing: '0.06em' }}
                    >
                      Enter TMI →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {steps.map((step) => (
                      <motion.div
                        key={step.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{step.title}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{step.description}</div>
                          {step.xpGrant > 0 && (
                            <div style={{ fontSize: 11, color: '#FFD700', marginTop: 4 }}>+{step.xpGrant} XP</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                          <a
                            href={step.ctaHref}
                            onClick={handleDismiss}
                            style={{ padding: '7px 14px', background: '#AA2DFF', color: '#fff', borderRadius: 6, fontWeight: 800, fontSize: 11, textDecoration: 'none', whiteSpace: 'nowrap', textAlign: 'center' }}
                          >
                            {step.ctaLabel}
                          </a>
                          <button
                            onClick={() => handleStepDone(step.id)}
                            style={{ padding: '5px 14px', background: 'none', color: '#666', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}
                          >
                            ✓ Done
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {steps.length > 0 && (
                  <button
                    onClick={handleDismiss}
                    style={{ marginTop: 16, width: '100%', minHeight: 44, padding: '10px', background: 'rgba(255,255,255,0.04)', color: '#666', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
                  >
                    I&apos;ll explore on my own
                  </button>
                )}
              </>
            )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
