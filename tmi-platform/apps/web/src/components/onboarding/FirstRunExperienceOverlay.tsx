'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type FirstRunStep,
  type UserRole,
  getFirstRunState,
  getPendingSteps,
  completeFirstRunStep,
  dismissFirstRun,
  setFirstRunRole,
  totalXPGranted,
} from '@/lib/onboarding/FirstRunExperienceEngine';

const ROLE_OPTIONS: { role: UserRole; label: string; icon: string; desc: string }[] = [
  { role: 'fan', label: 'Fan', icon: '🎧', desc: 'Vote, tip artists, join live rooms' },
  { role: 'artist', label: 'Artist', icon: '🎵', desc: 'Sell beats, enter battles, build rep' },
  { role: 'performer', label: 'Performer', icon: '🎤', desc: 'Go live, earn tips, compete' },
  { role: 'venue', label: 'Venue', icon: '🏟️', desc: 'List events, sell tickets' },
  { role: 'sponsor', label: 'Sponsor', icon: '🤝', desc: 'Patronize artists, fund prizes' },
  { role: 'advertiser', label: 'Advertiser', icon: '📢', desc: 'Run ads, reach music fans' },
];

export default function FirstRunExperienceOverlay() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [steps, setSteps] = useState<FirstRunStep[]>([]);
  const [phase, setPhase] = useState<'role-select' | 'checklist'>('role-select');

  useEffect(() => {
    setMounted(true);
    const state = getFirstRunState();
    if (state.dismissed) return;
    if (state.role) {
      setRole(state.role);
      setSteps(getPendingSteps(state.role));
      setPhase('checklist');
    }
    setVisible(true);
  }, []);

  function handleRoleSelect(r: UserRole) {
    setFirstRunRole(r);
    setRole(r);
    setSteps(getPendingSteps(r));
    setPhase('checklist');
  }

  function handleStepDone(stepId: string) {
    completeFirstRunStep(stepId);
    if (role) setSteps(getPendingSteps(role));
  }

  function handleDismiss() {
    dismissFirstRun();
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(5,5,16,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
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
              padding: 32,
              maxWidth: 520,
              width: '100%',
              position: 'relative',
            }}
          >
            <button
              onClick={handleDismiss}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 20 }}
            >
              ×
            </button>

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
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>
                  Complete these to earn up to {totalXPGranted(role)} XP
                </p>
                {steps.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#00FF88' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                    <div style={{ fontWeight: 800 }}>All done — you're set up!</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {steps.map((step) => (
                      <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{step.title}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{step.description}</div>
                          {step.xpGrant > 0 && (
                            <div style={{ fontSize: 11, color: '#FFD700', marginTop: 4 }}>+{step.xpGrant} XP</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <a
                            href={step.ctaHref}
                            style={{ padding: '7px 14px', background: '#AA2DFF', color: '#fff', borderRadius: 6, fontWeight: 800, fontSize: 11, textDecoration: 'none', whiteSpace: 'nowrap' }}
                          >
                            {step.ctaLabel}
                          </a>
                          <button
                            onClick={() => handleStepDone(step.id)}
                            style={{ padding: '5px 14px', background: 'none', color: '#666', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleDismiss}
                  style={{ marginTop: 16, width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', color: '#666', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
                >
                  I'll explore on my own
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
