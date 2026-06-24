'use client';

/**
 * FriendSeatFlow — "Sit With Friends" group seating UI.
 *
 * The backend logic already exists:
 *   audienceRuntimeEngine.assignNextSeat(venueSlug, groupId)
 *   seats new joiners adjacent to existing group members.
 *
 * This component provides the UI:
 *   1. Generate a group code (UUID-based, shareable)
 *   2. Copy invite link / show code
 *   3. Enter a friend's code to join their group
 *   4. Group code is stored in AudiencePresenceEngine entity (groupId field)
 *   5. Passed through to joinAudience() on room entry
 *
 * Use inside GoLiveRuntime or any live room surface.
 */

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAudiencePresence } from '@/components/live/AudiencePresenceProvider';

// ─── Simple group code generator ─────────────────────────────────────────────

function generateGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FriendSeatFlowProps {
  roomId: string;
  accentColor?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FriendSeatFlow({ roomId, accentColor = '#00E5FF' }: FriendSeatFlowProps) {
  const { entity, setEntity } = useAudiencePresence();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [myCode, setMyCode] = useState<string | null>(entity?.groupId ?? null);
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = useCallback(() => {
    const code = generateGroupCode();
    setMyCode(code);
    // Persist into the current user's audience entity so it flows into joinAudience()
    if (entity) {
      setEntity({ ...entity, groupId: code });
    }
    setMode('create');
  }, [entity, setEntity]);

  const handleCopy = useCallback(async () => {
    if (!myCode) return;
    const link = `${window.location.origin}/live/rooms/${roomId}?group=${myCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — show code to copy manually
    }
  }, [myCode, roomId]);

  const handleJoinGroup = useCallback(() => {
    const code = joinInput.trim().toUpperCase();
    if (code.length < 4) {
      setError('Enter a valid group code.');
      return;
    }
    setError(null);
    // Persist into entity — server uses groupId in assignNextSeat()
    if (entity) {
      setEntity({ ...entity, groupId: code });
    }
    setMyCode(code);
    setJoined(true);
  }, [joinInput, entity, setEntity]);

  const currentGroupId = entity?.groupId;

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
          background: currentGroupId ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${currentGroupId ? accentColor : 'rgba(255,255,255,0.15)'}`,
          color: currentGroupId ? accentColor : 'rgba(255,255,255,0.6)',
          fontSize: 10, fontWeight: 900, cursor: 'pointer', letterSpacing: '.06em',
          boxShadow: currentGroupId ? `0 0 12px ${accentColor}33` : 'none',
          transition: 'all 0.2s',
        }}
      >
        👥 {currentGroupId ? `GROUP: ${currentGroupId}` : 'SIT WITH FRIENDS'}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
              width: 280,
              background: 'linear-gradient(160deg, #0e0820, #0a0614)',
              border: `1.5px solid ${accentColor}44`,
              borderRadius: 14,
              padding: 16,
              boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 40px ${accentColor}18`,
              zIndex: 500,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 900, color: accentColor, letterSpacing: '.12em', marginBottom: 12 }}>
              👥 SIT WITH FRIENDS
            </div>

            {mode === 'choose' && !joined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', lineHeight: 1.5 }}>
                  Create a group to sit together with friends in the same seat area.
                </p>
                <button
                  onClick={handleCreateGroup}
                  style={{ padding: '10px', background: `${accentColor}18`, border: `1px solid ${accentColor}44`, borderRadius: 9, color: accentColor, fontSize: 11, fontWeight: 900, cursor: 'pointer', letterSpacing: '.06em' }}
                >
                  ✨ CREATE A GROUP
                </button>
                <button
                  onClick={() => setMode('join')}
                  style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 900, cursor: 'pointer' }}
                >
                  🔗 JOIN FRIEND'S GROUP
                </button>
              </div>
            )}

            {mode === 'create' && myCode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                  Share this code with friends. You'll be seated together.
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '14px',
                  background: `${accentColor}0C`,
                  border: `1.5px solid ${accentColor}55`,
                  borderRadius: 10,
                  fontSize: 26, fontWeight: 900, color: accentColor,
                  letterSpacing: '.2em',
                  fontFamily: 'monospace',
                }}>
                  {myCode}
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '9px', background: copied ? `${accentColor}22` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${copied ? accentColor : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 8, color: copied ? accentColor : 'rgba(255,255,255,0.55)',
                    fontSize: 10, fontWeight: 900, cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ LINK COPIED' : '📋 COPY INVITE LINK'}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 9, cursor: 'pointer' }}
                >
                  Done — share the code above
                </button>
              </div>
            )}

            {mode === 'join' && !joined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                  Enter the group code your friend shared with you.
                </p>
                <input
                  value={joinInput}
                  onChange={e => { setJoinInput(e.target.value.toUpperCase().slice(0, 6)); setError(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleJoinGroup(); }}
                  placeholder="ENTER CODE"
                  maxLength={6}
                  style={{
                    width: '100%', padding: '12px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${error ? '#FF4040' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 8, color: '#fff', fontSize: 20, fontWeight: 900,
                    textAlign: 'center', letterSpacing: '.2em', fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                {error && <div style={{ fontSize: 9, color: '#FF4040', textAlign: 'center' }}>{error}</div>}
                <button
                  onClick={handleJoinGroup}
                  disabled={joinInput.length < 4}
                  style={{
                    padding: '10px', background: joinInput.length >= 4 ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${joinInput.length >= 4 ? accentColor : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 9, color: joinInput.length >= 4 ? accentColor : 'rgba(255,255,255,0.25)',
                    fontSize: 11, fontWeight: 900, cursor: joinInput.length >= 4 ? 'pointer' : 'not-allowed',
                  }}
                >
                  JOIN GROUP →
                </button>
                <button
                  onClick={() => setMode('choose')}
                  style={{ padding: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 9, cursor: 'pointer' }}
                >
                  ← Back
                </button>
              </div>
            )}

            {joined && myCode && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: 'center', padding: '10px 0' }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: accentColor, letterSpacing: '.06em', marginBottom: 6 }}>
                  GROUP JOINED
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '.15em', fontFamily: 'monospace', marginBottom: 8 }}>
                  {myCode}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  You'll be seated near your friends when you enter the venue.
                </div>
                <button
                  onClick={() => { setOpen(false); setJoined(false); setMode('choose'); }}
                  style={{ marginTop: 12, padding: '7px 14px', background: 'transparent', border: `1px solid ${accentColor}33`, borderRadius: 7, color: accentColor, fontSize: 9, fontWeight: 900, cursor: 'pointer' }}
                >
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
