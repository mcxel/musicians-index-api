'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Radio, Loader2, X } from 'lucide-react';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type CommandResult = {
  action: string;
  target: string | null;
  confirmation: string;
  urgency: 'low' | 'medium' | 'high';
  transcript: string;
};

const URGENCY_COLOR = { low: '#00FFFF', medium: '#FFD700', high: '#FF2020' };

const ACTION_ROUTES: Record<string, string> = {
  navigate: '/admin/overseer',
  go_live: '/broadcast/studio',
  pull_analytics: '/analytics',
  summon_big_ace: '/admin/overseer#chain-command',
  start_meeting: '/admin/overseer#live-feed-router',
  open_curtains: '/broadcast/studio',
};

export default function VoiceDirector({ role = 'admin' }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isAdminRole = role === 'admin' || role === 'superadmin';

  const handleAction = useCallback((res: CommandResult) => {
    // Fire browser events so other components can react
    if (typeof window !== 'undefined') {
      if (res.action === 'go_live') window.dispatchEvent(new CustomEvent('tmi:golive'));
      if (res.action === 'end_broadcast') window.dispatchEvent(new CustomEvent('tmi:endbroadcast'));
      if (res.action === 'open_curtains') window.dispatchEvent(new CustomEvent('tmi:open-curtains'));
      if (res.action === 'trigger_giveaway') window.dispatchEvent(new CustomEvent('tmi:giveaway'));
      if (res.action === 'panic_cut') window.dispatchEvent(new CustomEvent('tmi:panic-cut'));

      // Navigate
      const route = ACTION_ROUTES[res.action];
      if (route && res.action !== 'navigate') {
        // non-destructive navigation actions handled by event; navigate only for explicit route jumps
      }
      if (res.action === 'navigate' && res.target) {
        window.location.href = `/${res.target.replace(/^\//, '')}`;
      }
    }
  }, []);

  const sendToAI = useCallback(async (text: string) => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/voice/command', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transcript: text, role }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data as CommandResult);
        handleAction(data as CommandResult);
      } else {
        setError(data.error ?? 'Command failed');
      }
    } catch {
      setError('Connection error — check your API key');
    } finally {
      setProcessing(false);
    }
  }, [role, handleAction]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported in this browser'); return; }

    const rec: SpeechRecognitionInstance = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
    };
    rec.onerror = (e) => {
      setError(`Mic error: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      if (transcript.trim()) sendToAI(transcript.trim());
    };

    rec.start();
    setListening(true);
    setTranscript('');
    setResult(null);
    setError(null);
  }, [transcript, sendToAI]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  // Dismiss result after 6s
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), 6000);
    return () => clearTimeout(t);
  }, [result]);

  if (!isAdminRole) return null;

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Voice Director — speak commands to the platform"
        style={{
          position: 'fixed',
          bottom: 88,
          right: 20,
          zIndex: 9999,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `1px solid ${listening ? '#FF2020' : 'rgba(255,45,170,0.4)'}`,
          background: listening ? 'rgba(255,32,32,0.2)' : 'rgba(255,45,170,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: listening ? '0 0 20px rgba(255,32,32,0.5)' : '0 0 12px rgba(255,45,170,0.2)',
          cursor: 'pointer',
        }}
      >
        {listening
          ? <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
              <Radio size={18} color="#FF2020" />
            </motion.div>
          : <Mic size={18} color="#FF2DAA" />
        }
      </motion.button>

      {/* Voice Director Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: 148,
              right: 20,
              zIndex: 9998,
              width: 320,
              borderRadius: 16,
              border: '1px solid rgba(255,45,170,0.3)',
              background: 'rgba(5,5,16,0.96)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,45,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,45,170,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio size={12} color="#FF2DAA" />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: '#FF2DAA', textTransform: 'uppercase' }}>
                  Voice Director
                </span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={12} color="rgba(255,255,255,0.4)" />
              </button>
            </div>

            <div style={{ padding: 14 }}>
              {/* Mic area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <motion.button
                  onClick={listening ? stopListening : startListening}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: `2px solid ${listening ? '#FF2020' : 'rgba(255,45,170,0.5)'}`,
                    background: listening ? 'rgba(255,32,32,0.15)' : 'rgba(255,45,170,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: listening ? '0 0 30px rgba(255,32,32,0.4)' : '0 0 15px rgba(255,45,170,0.15)',
                  }}
                >
                  {listening
                    ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
                        <MicOff size={24} color="#FF2020" />
                      </motion.div>
                    : <Mic size={24} color="#FF2DAA" />
                  }
                </motion.button>
                <span style={{ fontSize: 10, color: listening ? '#FF2020' : 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.14em' }}>
                  {listening ? '● LISTENING' : 'TAP TO SPEAK'}
                </span>
              </div>

              {/* Transcript */}
              <div style={{ minHeight: 36, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: transcript ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }}>
                  {transcript || 'Say a command…'}
                </span>
              </div>

              {/* Processing */}
              {processing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Loader2 size={12} color="#00FFFF" className="animate-spin" />
                  <span style={{ fontSize: 10, color: '#00FFFF' }}>Processing command…</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(255,32,32,0.1)', border: '1px solid rgba(255,32,32,0.3)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: '#FF2020' }}>{error}</span>
                </div>
              )}

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: `${URGENCY_COLOR[result.urgency]}10`,
                      border: `1px solid ${URGENCY_COLOR[result.urgency]}30`,
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: URGENCY_COLOR[result.urgency], marginBottom: 4 }}>
                      {result.action.replace(/_/g, ' ').toUpperCase()}
                      {result.target && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}> → {result.target}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{result.confirmation}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick commands */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>QUICK COMMANDS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['Go live', 'Open overseer', 'Pull analytics', 'Trigger giveaway', 'Summon Big Ace'].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => sendToAI(cmd)}
                      style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                        border: '1px solid rgba(255,45,170,0.25)', background: 'rgba(255,45,170,0.08)',
                        color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                      }}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
