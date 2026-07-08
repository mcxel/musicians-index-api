'use client';

/**
 * /auth/reset-password/[token]
 *
 * Clean 4-state reset password page. No debug/routing panels.
 * All technical details go to console only.
 *
 * State 1 — form:     Enter new password
 * State 2 — success:  Password updated, countdown + redirect
 * State 3 — expired:  Link expired, request new one
 * State 4 — sending:  Resend flow
 */

import { useState, useEffect, useCallback, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type PageState = 'validating' | 'form' | 'success' | 'expired' | 'sending' | 'sent' | 'offline';

interface Props {
  params: { token: string };
  searchParams?: { email?: string };
}

// ── Ambient orb background ────────────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(170,45,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(0,255,136,0.1) 0%, transparent 50%)',
      }} />
      {[
        { w: 320, h: 320, left: '5%',  top: '10%', color: '#AA2DFF', dur: '8s'  },
        { w: 200, h: 200, left: '75%', top: '60%', color: '#00FF88', dur: '11s' },
        { w: 260, h: 260, left: '55%', top: '5%',  color: '#00FFFF', dur: '9s'  },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'absolute', width: orb.w, height: orb.h, borderRadius: '50%',
          left: orb.left, top: orb.top,
          background: `radial-gradient(circle, ${orb.color}22 0%, transparent 70%)`,
          animation: `tmiOrb ${orb.dur} ease-in-out infinite alternate`,
          transform: 'translate(-50%, -50%)',
        }} />
      ))}
      <style>{`@keyframes tmiOrb{0%{transform:translate(-50%,-50%) scale(.8);opacity:.5}100%{transform:translate(-50%,-50%) scale(1.2);opacity:1}}`}</style>
    </div>
  );
}

// ── Glass card ────────────────────────────────────────────────────────────────

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(5,5,22,0.88)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      padding: '40px 36px',
      width: '100%', maxWidth: 420,
      boxShadow: '0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(170,45,255,0.15)',
      position: 'relative', zIndex: 1,
    }}>
      {children}
    </div>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────

function PasswordInput({ label, value, onChange, disabled }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>
        {label.toUpperCase()}
      </span>
      <input
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="new-password"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, color: '#fff',
          padding: '12px 14px', fontSize: 14,
          outline: 'none', transition: 'border-color 0.2s',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(170,45,255,0.6)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
    </label>
  );
}

// ── Password strength bar ─────────────────────────────────────────────────────

function StrengthBar({ password }: { password: string }) {
  const score = [/.{10,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/]
    .filter(r => r.test(password)).length;
  const colors = ['transparent', '#E63000', '#FFD700', '#FFD700', '#00FF88', '#00FF88'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  if (!password) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${(score / 5) * 100}%`, background: colors[score], borderRadius: 2, transition: 'all 0.3s' }} />
      </div>
      <span style={{ fontSize: 9, color: colors[score], fontWeight: 700, letterSpacing: '0.08em', width: 44 }}>
        {labels[score]}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResetPasswordPage({ params, searchParams }: Props) {
  const router = useRouter();
  const token = params.token;
  const email = (searchParams?.email ?? '').trim().toLowerCase();

  const [pageState, setPageState]   = useState<PageState>('validating');
  const [password,  setPassword]    = useState('');
  const [confirm,   setConfirm]     = useState('');
  const [error,     setError]       = useState('');
  const [loading,   setLoading]     = useState(false);
  const [countdown, setCountdown]   = useState(5);
  const [resendEmail, setResendEmail] = useState(email);

  // ── State 0: Pre-validate token before showing the form ──────────────────
  useEffect(() => {
    if (!token) { setPageState('expired'); return; }
    // If no email param, skip DB check and show form (POST will catch it)
    if (!email) { setPageState('form'); return; }

    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
      cache: 'no-store',
    })
      .then(r => r.json())
      .then((data: { valid: boolean; reason?: string }) => {
        if (data.valid) {
          setPageState('form');
        } else {
          console.warn('[reset-password] token invalid:', data.reason);
          setPageState('expired');
        }
      })
      .catch(() => {
        // Network error — show form and let POST catch any real issue
        setPageState('form');
      });
  }, [token, email]);

  // ── Auto-redirect countdown after success ─────────────────────────────────
  useEffect(() => {
    if (pageState !== 'success') return;
    const t = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) { router.replace('/auth/signin?reset=success'); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pageState, router]);

  const canSubmit = !loading && password.length >= 10 && confirm.length >= 10;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password, confirmPassword: confirm }),
      });
      const data = await res.json() as { ok: boolean; reason?: string };

      if (!data.ok) {
        // Log technical details privately — never show to user
        console.warn('[reset-password] API error:', data.reason);

        const expired = data.reason === 'expired_token' || data.reason === 'used_token';
        if (expired) { setPageState('expired'); return; }

        const msg: Record<string, string> = {
          weak_password:     'Password too weak — include upper/lowercase, a number, and a symbol.',
          password_mismatch: 'Passwords do not match.',
        };
        setError(msg[data.reason ?? ''] ?? 'Something went wrong. Please try again.');
        return;
      }

      setPageState('success');

      // Attempt session refresh — if already authenticated, redirect to homepage
      // instead of sign-in. Non-fatal: success state handles redirect regardless.
      fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
        .then(r => r.json())
        .then((s: { authenticated?: boolean }) => {
          if (s.authenticated) router.replace('/?reset=success');
        })
        .catch(() => {});

    } catch (err) {
      console.error('[reset-password] network error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(e: FormEvent) {
    e.preventDefault();
    if (!resendEmail) return;
    setPageState('sending');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
    } catch (err) {
      console.error('[reset-password] resend error:', err);
    }
    setPageState('sent');
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#030310', fontFamily: "'Inter', sans-serif", padding: '24px 16px',
      position: 'relative',
    }}>
      <AmbientBackground />

      <AnimatePresence mode="wait">
        {/* ── STATE 0: VALIDATING TOKEN ──────────────────────────────────── */}
        {pageState === 'validating' && (
          <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.35em', color: '#AA2DFF', marginBottom: 16 }}>THE MUSICIAN'S INDEX</div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid transparent', borderTopColor: '#AA2DFF', margin: '0 auto 16px' }} />
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Verifying your reset link…</div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── STATE 1: FORM ──────────────────────────────────────────────── */}
        {pageState === 'form' && (
          <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GlassCard>
              {/* TMI logo mark */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.35em', color: '#AA2DFF', marginBottom: 6 }}>THE MUSICIAN'S INDEX</div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.04em' }}>Reset Your Password</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
                  {email ? `Resetting account: ${email}` : 'Create a new secure password.'}
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <PasswordInput label="New password" value={password} onChange={setPassword} disabled={loading} />
                <StrengthBar password={password} />
                <PasswordInput label="Confirm password" value={confirm} onChange={setConfirm} disabled={loading} />

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ background: 'rgba(230,48,0,0.12)', border: '1px solid rgba(230,48,0,0.35)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ff8a75' }}>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={!canSubmit} style={{
                  marginTop: 4, padding: '13px 20px', borderRadius: 10, border: 'none',
                  background: canSubmit ? 'linear-gradient(135deg, #AA2DFF, #00FFFF44)' : 'rgba(255,255,255,0.08)',
                  color: canSubmit ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: canSubmit ? '0 0 24px rgba(170,45,255,0.3)' : 'none',
                }}>
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Link href="/auth/signin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                  Return to Sign In
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── STATE 2: SUCCESS ───────────────────────────────────────────── */}
        {pageState === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.15 }}
                  style={{ fontSize: 56, marginBottom: 16 }}>
                  ✅
                </motion.div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#00FF88', marginBottom: 8 }}>Password Updated</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 28 }}>
                  Your password has been changed successfully.<br />You're all set.
                </div>

                {/* Countdown bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
                  <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 5, ease: 'linear' }}
                    style={{ height: '100%', background: '#00FF88', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
                  Returning to Sign In in {countdown}…
                </div>

                <button onClick={() => router.replace('/auth/signin')} style={{
                  width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none',
                  background: 'rgba(0,255,136,0.15)', color: '#00FF88',
                  fontSize: 13, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.08em',
                  boxShadow: '0 0 20px rgba(0,255,136,0.2)',
                }}>
                  Sign In Now
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── STATE 3: EXPIRED / INVALID ─────────────────────────────────── */}
        {pageState === 'expired' && (
          <motion.div key="expired" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.3em', color: '#AA2DFF', marginBottom: 8 }}>THE MUSICIAN'S INDEX</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Reset Link Expired</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 28 }}>
                  For your security, reset links expire after use or after a short time.<br />
                  Request a fresh link below.
                </div>

                <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {!email && (
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={resendEmail}
                      onChange={e => setResendEmail(e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10, color: '#fff', padding: '12px 14px', fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  )}
                  <button type="submit" disabled={!resendEmail} style={{
                    padding: '12px 20px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #AA2DFF, #00FFFF44)',
                    color: '#fff', fontSize: 13, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.08em',
                    boxShadow: '0 0 24px rgba(170,45,255,0.3)',
                  }}>
                    Send New Reset Email
                  </button>
                </form>

                <div style={{ marginTop: 20 }}>
                  <Link href="/auth/signin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                    Return to Sign In
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── STATE 4: EMAIL SENT ────────────────────────────────────────── */}
        {(pageState === 'sent' || pageState === 'sending') && (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GlassCard>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{pageState === 'sending' ? '📤' : '📬'}</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>
                  {pageState === 'sending' ? 'Sending…' : 'Check Your Email'}
                </div>
                {pageState === 'sent' && (
                  <>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>
                      We've sent a fresh reset link to <strong style={{ color: '#fff' }}>{resendEmail}</strong>.<br />
                      Check your inbox (and spam folder).
                    </div>
                    <button onClick={() => setPageState('expired')} style={{
                      padding: '10px 20px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                      color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', marginBottom: 16,
                    }}>
                      Didn't receive it? Send Again
                    </button>
                    <br />
                    <Link href="/auth/signin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                      Return to Sign In
                    </Link>
                  </>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
