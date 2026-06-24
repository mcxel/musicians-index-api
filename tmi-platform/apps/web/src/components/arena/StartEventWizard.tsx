'use client';

/**
 * StartEventWizard — one "START EVENT" button for Gold+ users.
 *
 * Step flow: Closed → TypeSelect → HostSelect → Settings → Launching
 *
 * Who can use:
 *   Gold, Platinum, Diamond performers
 *   DJs (any tier) for Dance Parties
 *   Venue, Promoter, Admin accounts
 *
 * Creates an event via /api/events/create, which registers with GlobalLiveSessionRegistry.
 * The wizard produces ONE event record — the runtime owns it, not the creator.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Event type catalog ───────────────────────────────────────────────────────

type EventTypeId =
  | 'battle'
  | 'cypher'
  | 'challenge'
  | 'joke-off'
  | 'dance-off'
  | 'dirty-dozens'
  | 'beat-battle'
  | 'producer-showcase'
  | 'dance-party'
  | 'open-mic'
  | 'talent-showcase'
  | 'custom';

type HostOptionId =
  | 'self'
  | 'avatar-host'
  | 'dj-host'
  | 'producer-host'
  | 'platform-host';

const EVENT_TYPES: Array<{
  id: EventTypeId;
  label: string;
  icon: string;
  color: string;
  description: string;
  minTier?: string;
  djOnly?: boolean;
}> = [
  { id: 'battle',            label: 'Battle',            icon: '⚔️',  color: '#FF2020', description: '1v1 or 2v2 performance showdown' },
  { id: 'cypher',            label: 'Cypher',            icon: '🔄',  color: '#AA2DFF', description: 'Open circle — multiple performers' },
  { id: 'challenge',         label: 'Challenge',         icon: '🎯',  color: '#00E5FF', description: 'Set a challenge for others to match' },
  { id: 'joke-off',          label: 'Joke-Off',          icon: '😂',  color: '#FFD700', description: 'Comedy battle — funniest wins' },
  { id: 'dance-off',         label: 'Dance-Off',         icon: '💃',  color: '#FF2DAA', description: 'Dance crew competition' },
  { id: 'dirty-dozens',      label: 'Dirty Dozens',      icon: '🔥',  color: '#FF6B35', description: 'Rapid-fire bars battle' },
  { id: 'beat-battle',       label: 'Beat Battle',       icon: '🎹',  color: '#00FFAA', description: 'Producers battle with live beats' },
  { id: 'producer-showcase', label: 'Producer Showcase', icon: '🎛️',  color: '#C0A0FF', description: 'Producers show off their catalog' },
  { id: 'dance-party',       label: 'World Dance Party', icon: '🎧',  color: '#FF69B4', description: 'DJ-led live dance floor for everyone', djOnly: true },
  { id: 'open-mic',          label: 'Open Mic',          icon: '🎤',  color: '#66FFAA', description: 'Anyone can step up and perform' },
  { id: 'talent-showcase',   label: 'Talent Showcase',   icon: '⭐',  color: '#FFD700', description: 'Multi-act showcase performance' },
  { id: 'custom',            label: 'Custom Event',      icon: '🎪',  color: '#fff',    description: 'Define your own event format' },
];

const HOST_OPTIONS: Array<{
  id: HostOptionId;
  name: string;
  icon: string;
  description: string;
  scriptIncluded: boolean;
}> = [
  {
    id: 'self',
    name: 'I Will Host',
    icon: '🎙️',
    description: 'You run the event. Full control.',
    scriptIncluded: false,
  },
  {
    id: 'avatar-host',
    name: 'Bobby Stanley',
    icon: '🤖',
    description: 'Avatar host handles intro, rounds, winners & sponsor mentions.',
    scriptIncluded: true,
  },
  {
    id: 'dj-host',
    name: 'DJ Record Ralph',
    icon: '🎧',
    description: 'DJ persona — keeps energy up, beat drops between rounds.',
    scriptIncluded: true,
  },
  {
    id: 'producer-host',
    name: 'Jay Paul Sanchez',
    icon: '🎛️',
    description: 'Producer host — technical commentary + beat selection.',
    scriptIncluded: true,
  },
  {
    id: 'platform-host',
    name: 'TMI Platform Host',
    icon: '🏆',
    description: 'Full automated host — handles everything including judging.',
    scriptIncluded: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', gap: 6, marginBottom: 8,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            height: 3, flex: 1, borderRadius: 999,
            background: i < step ? '#00E5FF' : 'rgba(255,255,255,0.12)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', letterSpacing: '.04em' }}>
        {title}
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
        Step {step} of {total}
      </div>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

interface WizardState {
  step: 'closed' | 'type' | 'host' | 'settings' | 'launching';
  eventType: EventTypeId | null;
  hostOption: HostOptionId | null;
  title: string;
  timerMinutes: number | 'unlimited';
  maxPerformers: number;
}

interface Props {
  userTier?: string;
  isDJ?: boolean;
  isVenue?: boolean;
  isPromoter?: boolean;
  isAdmin?: boolean;
}

export default function StartEventWizard({
  userTier = 'FREE',
  isDJ = false,
  isVenue = false,
  isPromoter = false,
  isAdmin = false,
}: Props) {
  const router = useRouter();
  const GOLD_TIERS = ['Gold', 'Platinum', 'Diamond'];
  const canStartEvents = GOLD_TIERS.includes(userTier) || isDJ || isVenue || isPromoter || isAdmin;

  const [wiz, setWiz] = useState<WizardState>({
    step: 'closed',
    eventType: null,
    hostOption: null,
    title: '',
    timerMinutes: 30,
    maxPerformers: 2,
  });

  const [error, setError] = useState<string | null>(null);

  const set = useCallback((patch: Partial<WizardState>) => {
    setWiz(prev => ({ ...prev, ...patch }));
  }, []);

  if (!canStartEvents) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 18px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
        cursor: 'default',
      }}>
        🔒 START EVENT — Gold tier required
      </div>
    );
  }

  async function launchEvent() {
    if (!wiz.eventType || !wiz.hostOption) return;
    set({ step: 'launching' });
    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: wiz.eventType,
          hostOption: wiz.hostOption,
          title: wiz.title || EVENT_TYPES.find(e => e.id === wiz.eventType)?.label,
          timerMinutes: wiz.timerMinutes,
          maxPerformers: wiz.maxPerformers,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json() as { roomId?: string; eventId?: string };
      if (data.roomId) {
        router.push(`/live/rooms/${data.roomId}`);
      } else {
        setError('Event created but no room ID returned. Contact support.');
        set({ step: 'settings' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      set({ step: 'settings' });
    }
  }

  const selectedType = EVENT_TYPES.find(e => e.id === wiz.eventType);
  const selectedHost = HOST_OPTIONS.find(h => h.id === wiz.hostOption);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Trigger button ── */}
      {wiz.step === 'closed' && (
        <button
          onClick={() => set({ step: 'type' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 22px',
            background: 'linear-gradient(135deg,#AA2DFF,#FF2DAA)',
            border: 'none', borderRadius: 24,
            fontSize: 12, fontWeight: 900, color: '#fff',
            letterSpacing: '.06em', cursor: 'pointer',
            boxShadow: '0 0 24px rgba(170,45,255,0.5)',
          }}
        >
          ▸ START EVENT
        </button>
      )}

      {/* ── Wizard overlay ── */}
      <AnimatePresence>
        {wiz.step !== 'closed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            style={{
              position: 'absolute', bottom: '110%', left: 0,
              width: 380,
              background: 'linear-gradient(160deg,#0e0820,#0a0614)',
              border: '1px solid rgba(170,45,255,0.4)',
              borderRadius: 16,
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(170,45,255,0.15)',
              padding: 20,
              zIndex: 1000,
            }}
          >
            {/* ── Step 1: Event Type ── */}
            {wiz.step === 'type' && (
              <>
                <StepHeader step={1} total={3} title="Choose Event Type" />
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 8, maxHeight: 320, overflowY: 'auto',
                }}>
                  {EVENT_TYPES
                    .filter(e => !e.djOnly || isDJ || isAdmin)
                    .map(et => (
                      <button
                        key={et.id}
                        onClick={() => set({ step: 'host', eventType: et.id, title: et.label })}
                        style={{
                          background: `${et.color}0e`,
                          border: `1px solid ${et.color}33`,
                          borderRadius: 10, padding: '10px 12px',
                          textAlign: 'left', cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = `${et.color}1e`)}
                        onMouseLeave={e => (e.currentTarget.style.background = `${et.color}0e`)}
                      >
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{et.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 900, color: et.color, marginBottom: 2 }}>{et.label}</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1.3 }}>{et.description}</div>
                      </button>
                    ))}
                </div>
                <button onClick={() => set({ step: 'closed' })} style={cancelBtn}>Cancel</button>
              </>
            )}

            {/* ── Step 2: Host Selection ── */}
            {wiz.step === 'host' && selectedType && (
              <>
                <StepHeader step={2} total={3} title="Who Will Host?" />
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{selectedType.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: selectedType.color }}>{selectedType.label}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {HOST_OPTIONS.map(h => (
                    <button
                      key={h.id}
                      onClick={() => set({ step: 'settings', hostOption: h.id })}
                      style={{
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, padding: '10px 14px',
                        textAlign: 'left', cursor: 'pointer',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(170,45,255,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                    >
                      <span style={{ fontSize: 22 }}>{h.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{h.name}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{h.description}</div>
                        {h.scriptIncluded && (
                          <div style={{ fontSize: 8, color: '#AA2DFF', marginTop: 3 }}>✓ Intro + rounds + winner script included</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => set({ step: 'type' })} style={backBtn}>← Back</button>
                  <button onClick={() => set({ step: 'closed' })} style={cancelBtn}>Cancel</button>
                </div>
              </>
            )}

            {/* ── Step 3: Settings ── */}
            {wiz.step === 'settings' && selectedType && selectedHost && (
              <>
                <StepHeader step={3} total={3} title="Event Settings" />
                <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 9, fontWeight: 900, color: selectedType.color,
                    background: `${selectedType.color}14`, border: `1px solid ${selectedType.color}33`,
                    borderRadius: 6, padding: '3px 8px',
                  }}>
                    {selectedType.icon} {selectedType.label}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 900, color: '#fff',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6, padding: '3px 8px',
                  }}>
                    {selectedHost.icon} {selectedHost.name}
                  </span>
                </div>

                <label style={fieldLabel}>Event Title</label>
                <input
                  value={wiz.title}
                  onChange={e => set({ title: e.target.value })}
                  placeholder={selectedType.label}
                  style={fieldInput}
                  maxLength={60}
                />

                <label style={fieldLabel}>Time Limit</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
                  {([5, 10, 15, 30, 60, 'unlimited'] as const).map(t => (
                    <button
                      key={String(t)}
                      onClick={() => set({ timerMinutes: t })}
                      style={{
                        padding: '7px 4px', borderRadius: 8, border: 'none',
                        background: wiz.timerMinutes === t ? '#AA2DFF' : 'rgba(255,255,255,0.06)',
                        color: wiz.timerMinutes === t ? '#fff' : 'rgba(255,255,255,0.5)',
                        fontSize: 10, fontWeight: 900, cursor: 'pointer',
                      }}
                    >
                      {t === 'unlimited' ? '∞' : `${t}m`}
                    </button>
                  ))}
                </div>

                <label style={fieldLabel}>Max Performers</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[2, 4, 6, 8].map(n => (
                    <button
                      key={n}
                      onClick={() => set({ maxPerformers: n })}
                      style={{
                        flex: 1, padding: '7px', borderRadius: 8, border: 'none',
                        background: wiz.maxPerformers === n ? '#AA2DFF' : 'rgba(255,255,255,0.06)',
                        color: wiz.maxPerformers === n ? '#fff' : 'rgba(255,255,255,0.5)',
                        fontSize: 11, fontWeight: 900, cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {error && (
                  <div style={{ fontSize: 10, color: '#FF4040', marginBottom: 10, padding: '8px 12px', background: 'rgba(255,32,32,0.08)', borderRadius: 6 }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={launchEvent}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'linear-gradient(135deg,#AA2DFF,#FF2DAA)',
                    border: 'none', borderRadius: 10,
                    fontSize: 12, fontWeight: 900, color: '#fff',
                    letterSpacing: '.08em', cursor: 'pointer',
                    boxShadow: '0 0 24px rgba(170,45,255,0.4)',
                    marginBottom: 8,
                  }}
                >
                  🚀 LAUNCH EVENT
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => set({ step: 'host' })} style={backBtn}>← Back</button>
                  <button onClick={() => set({ step: 'closed' })} style={cancelBtn}>Cancel</button>
                </div>
              </>
            )}

            {/* ── Launching ── */}
            {wiz.step === 'launching' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: 'wizSpin 1s linear infinite' }}>🚀</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Launching your event…</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Registering with live session engine</div>
                <style>{`@keyframes wizSpin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared style helpers ─────────────────────────────────────────────────────
const cancelBtn: React.CSSProperties = {
  flex: 1, padding: '8px', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
};

const backBtn: React.CSSProperties = {
  flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
  cursor: 'pointer',
};

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)',
  letterSpacing: '.12em', marginBottom: 5, textTransform: 'uppercase',
};

const fieldInput: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, color: '#fff', fontSize: 12,
  outline: 'none', marginBottom: 12,
  boxSizing: 'border-box',
};
