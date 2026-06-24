'use client';

/**
 * EventOwnerControls — control panel for the person who started an event.
 *
 * The event owner (not the host) can:
 *   Pause / Resume / Extend / End the event
 *   Extend for a fixed duration OR unlimited
 *   Replace Host / Invite Performer / Remove Performer
 *   Pin sponsor / Pin beat
 *
 * Rule 21: Event Runtime owns all event records.
 *          This panel sends instructions to /api/events/[eventId]/owner-action.
 *          The Runtime applies them — the owner never writes directly to seats/sessions.
 */

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type EventStatus = 'live' | 'paused' | 'ended';

type OwnerAction =
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'extend'; minutes: number | 'unlimited' }
  | { type: 'end' }
  | { type: 'replace-host'; newHostId: string }
  | { type: 'invite-performer'; userId: string }
  | { type: 'remove-performer'; userId: string }
  | { type: 'pin-sponsor'; sponsorId: string }
  | { type: 'pin-beat'; beatId: string };

interface Props {
  eventId: string;
  status?: EventStatus;
  onStatusChange?: (status: EventStatus) => void;
  className?: string;
  inline?: boolean;
}

const EXTEND_OPTIONS = [
  { label: '+5m',  minutes: 5  as const },
  { label: '+10m', minutes: 10 as const },
  { label: '+15m', minutes: 15 as const },
  { label: '+30m', minutes: 30 as const },
  { label: '+1h',  minutes: 60 as const },
  { label: '∞',    minutes: 'unlimited' as const },
] satisfies Array<{ label: string; minutes: number | 'unlimited' }>;

export default function EventOwnerControls({
  eventId,
  status: initialStatus = 'live',
  onStatusChange,
  inline = false,
}: Props) {
  const [status, setStatus] = useState<EventStatus>(initialStatus);
  const [open, setOpen] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [extendedTotal, setExtendedTotal] = useState(0);

  const sendAction = useCallback(async (action: OwnerAction) => {
    setPending(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/events/${eventId}/owner-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as { ok?: boolean; status?: EventStatus; message?: string };
      if (data.status) {
        setStatus(data.status);
        onStatusChange?.(data.status);
      }
      if (data.message) {
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Action failed');
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setPending(false);
      setShowExtend(false);
      setShowEndConfirm(false);
    }
  }, [eventId, onStatusChange]);

  const handleExtend = useCallback((minutes: number | 'unlimited') => {
    setExtendedTotal(prev => minutes === 'unlimited' ? prev : prev + minutes);
    sendAction({ type: 'extend', minutes });
  }, [sendAction]);

  const statusColor = status === 'live' ? '#00FF88' : status === 'paused' ? '#FFD700' : '#FF4040';
  const accentColor = '#AA2DFF';

  const panel = (
    <div style={{
      background: 'linear-gradient(160deg,#0e0820,#0a0614)',
      border: `1px solid ${accentColor}44`,
      borderRadius: 14,
      padding: 16,
      minWidth: 260,
      boxShadow: '0 12px 60px rgba(0,0,0,0.7)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: '.18em' }}>
            EVENT OWNER
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: statusColor }}>
              {status.toUpperCase()}
            </span>
            {extendedTotal > 0 && (
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                +{extendedTotal}m extended
              </span>
            )}
          </div>
        </div>
        {inline && (
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              fontSize: 10, color: '#00FF88',
              background: 'rgba(0,255,136,0.06)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 6, padding: '6px 10px', marginBottom: 10,
            }}
          >
            ✓ {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {status === 'live' && (
          <ActionBtn
            label="⏸ PAUSE"
            color="#FFD700"
            disabled={pending}
            onClick={() => sendAction({ type: 'pause' })}
          />
        )}
        {status === 'paused' && (
          <ActionBtn
            label="▶ RESUME"
            color="#00FF88"
            disabled={pending}
            onClick={() => sendAction({ type: 'resume' })}
          />
        )}
        <ActionBtn
          label="⏱ EXTEND"
          color={accentColor}
          disabled={pending || status === 'ended'}
          onClick={() => { setShowExtend(true); setShowEndConfirm(false); }}
        />
        <ActionBtn
          label="🔚 END EVENT"
          color="#FF4040"
          disabled={pending || status === 'ended'}
          onClick={() => { setShowEndConfirm(true); setShowExtend(false); }}
        />
      </div>

      {/* Extend time picker */}
      <AnimatePresence>
        {showExtend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: '.12em', marginBottom: 6 }}>
                EXTEND EVENT BY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {EXTEND_OPTIONS.map(o => (
                  <button
                    key={String(o.minutes)}
                    onClick={() => handleExtend(o.minutes)}
                    disabled={pending}
                    style={{
                      padding: '8px 4px', borderRadius: 8,
                      background: o.minutes === 'unlimited' ? 'rgba(170,45,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${o.minutes === 'unlimited' ? accentColor + '66' : 'rgba(255,255,255,0.12)'}`,
                      color: o.minutes === 'unlimited' ? accentColor : '#fff',
                      fontSize: 11, fontWeight: 900, cursor: pending ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 6, lineHeight: 1.5 }}>
                ∞ = Unlimited — event runs until you end it manually.
                Audience, scores, and chat are preserved across all extensions.
              </div>
              <button onClick={() => setShowExtend(false)} style={{ ...smallCancelBtn, marginTop: 8 }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End confirm */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'rgba(255,64,64,0.08)', border: '1px solid rgba(255,64,64,0.3)',
              borderRadius: 10, padding: '12px', marginBottom: 10,
            }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#FF4040', marginBottom: 6 }}>
                End this event?
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginBottom: 10, lineHeight: 1.4 }}>
                Scores will be finalized. Winners declared. Audience exits. This cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { sendAction({ type: 'end' }); setStatus('ended'); }}
                  disabled={pending}
                  style={{
                    flex: 1, padding: '8px', background: '#FF4040',
                    border: 'none', borderRadius: 8, color: '#fff',
                    fontSize: 10, fontWeight: 900, cursor: 'pointer',
                  }}
                >
                  END EVENT
                </button>
                <button onClick={() => setShowEndConfirm(false)} style={{ ...smallCancelBtn, flex: 1 }}>
                  Keep Going
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary controls */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
        <div style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '.12em', marginBottom: 8 }}>
          MANAGE PARTICIPANTS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SecondaryBtn label="🎙️ Replace Host" disabled={pending} />
          <SecondaryBtn label="➕ Invite Performer" disabled={pending} />
          <SecondaryBtn label="➖ Remove Performer" disabled={pending} />
        </div>
      </div>
    </div>
  );

  if (inline) return panel;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          padding: '8px 14px',
          background: open ? `${accentColor}22` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? accentColor : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 8, cursor: 'pointer',
          fontSize: 9, fontWeight: 900, color: '#fff',
          letterSpacing: '.06em',
        }}
      >
        ⚙️ OWNER CONTROLS
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              position: 'absolute', top: '110%', right: 0,
              zIndex: 1000, minWidth: 260,
            }}
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({
  label, color, disabled, onClick,
}: { label: string; color: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '9px 8px', borderRadius: 8,
        background: `${color}14`,
        border: `1px solid ${color}44`,
        color, fontSize: 10, fontWeight: 900,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '.04em', opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function SecondaryBtn({ label, disabled }: { label: string; disabled: boolean }) {
  return (
    <button
      disabled={disabled}
      style={{
        padding: '7px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 7, textAlign: 'left',
        color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
}

const smallCancelBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6, color: 'rgba(255,255,255,0.4)',
  fontSize: 9, fontWeight: 700, cursor: 'pointer',
};
