'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGamificationEngine } from '@/hooks/useGamificationEngine';

const CREDIT_AMOUNTS: Record<string, number> = {
  price_credits_starter: 500,
  price_credits_popular: 2000,
  price_credits_pro: 5000,
  // season passes grant monthly credits via subscription
  price_fan_monthly: 500,
  price_artist_monthly: 1000,
  price_vip_monthly: 10000,
};

type State = 'loading' | 'granted' | 'duplicate' | 'pass' | 'unknown';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const sessionId = params?.get('session_id') ?? '';
  const priceId = params?.get('priceId') ?? '';
  const mode = params?.get('mode') ?? 'payment';

  const { walletCredits, spendCredits: _s, trackAction, ...engine } = useGamificationEngine();
  // spendCredits not used here — we're adding credits
  const addCredits = engine.claimReward; // reuse claimReward as idempotency gate

  const [status, setStatus] = useState<State>('loading');
  const [creditsGranted, setCreditsGranted] = useState(0);

  useEffect(() => {
    if (!sessionId) { setStatus('unknown'); return; }

    // Idempotency: only grant once per session ID
    const grantKey = `tmi_paid_${sessionId}`;
    if (localStorage.getItem(grantKey)) { setStatus('duplicate'); return; }

    const credits = CREDIT_AMOUNTS[priceId] ?? 0;

    // Send purchase confirmation email (fire-and-forget)
    const emailType = mode === 'subscription' ? 'subscription'
      : (params?.get('type') ?? 'generic') as 'nft' | 'ticket' | 'generic';
    fetch('/api/email/purchase-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, type: emailType }),
    }).catch(() => undefined);

    if (mode === 'subscription') {
      localStorage.setItem(grantKey, '1');
      // Activate tier server-side (sets tmi_tier cookie + queues email)
      fetch('/api/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priceId }),
      }).catch(() => undefined);
      setStatus('pass');
      return;
    }

    if (credits > 0) {
      // Inject credits directly into gamification state by firing trackAction N times
      // We use a localStorage-direct write to avoid N action fires
      const stored = localStorage.getItem('tmi_gam_v1');
      const state = stored ? JSON.parse(stored) : { totalXp: 0, walletCredits: 1000, earnedRewards: [] };
      state.walletCredits += credits;
      state.totalXp += Math.floor(credits / 10); // bonus XP for purchase
      localStorage.setItem('tmi_gam_v1', JSON.stringify(state));
      localStorage.setItem(grantKey, '1');
      setCreditsGranted(credits);
      setStatus('granted');
    } else {
      setStatus('unknown');
    }
  }, [sessionId, priceId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const colors: Record<State, string> = {
    loading: '#888', granted: '#00FF88', duplicate: '#FFD700', pass: '#AA2DFF', unknown: '#FF4444',
  };
  const accent = colors[status] ?? '#888';

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {status === 'loading' ? '⏳' : status === 'granted' ? '🎉' : status === 'pass' ? '🎸' : status === 'duplicate' ? '✅' : '❓'}
        </div>

        {status === 'loading' && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Confirming payment…</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Please wait a moment.</p>
          </>
        )}

        {status === 'granted' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: accent, fontWeight: 800, marginBottom: 10 }}>PAYMENT CONFIRMED</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>+{creditsGranted.toLocaleString()} TM Credits Added</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              Your balance has been updated. Head to the shop to spend them.
            </p>
            <div style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, fontSize: 12, color: accent, fontWeight: 700, marginBottom: 28 }}>
              New balance: {(walletCredits).toLocaleString()} TM Credits
            </div>
          </>
        )}

        {status === 'pass' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: accent, fontWeight: 800, marginBottom: 10 }}>SUBSCRIPTION ACTIVE</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Season Pass Unlocked</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              Your pass is active. Perks and credits will appear in your account within a few minutes.
            </p>
          </>
        )}

        {status === 'duplicate' && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Already Applied</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              This payment was already credited to your account.
            </p>
          </>
        )}

        {status === 'unknown' && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Something Went Wrong</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              Your payment may have gone through. Contact support if credits don&apos;t appear.
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#050510', background: accent, borderRadius: 8, textDecoration: 'none' }}>
            GO TO SHOP
          </Link>
          <Link href="/season-pass" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: accent, background: 'transparent', border: `1px solid ${accent}`, borderRadius: 8, textDecoration: 'none' }}>
            SEASON PASS
          </Link>
        </div>
      </div>
    </main>
  );
}
