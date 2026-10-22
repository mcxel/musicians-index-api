'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type State =
  | 'loading'
  | 'points_pack_verifying'
  | 'points_pack_fulfilled'
  | 'points_pack_unavailable'
  | 'tip'
  | 'duplicate'
  | 'pass'
  | 'sponsor'
  | 'media_player'
  | 'ad_purchase'
  | 'unknown';

// Rule 20 fix (2026-10-04, TMI Critical Gate: real-money credits fulfillment
// convergence): this page previously granted "TM Credits" purely from a URL
// price-id lookup by hand-writing a raw number into a client-side fake
// economy's browser storage — a fabrication reachable even with zero real
// payment (anyone could navigate here directly with a crafted param) and,
// separately, disconnected from the real Wallet.fanCredits ledger even when
// a real points-pack purchase did complete. This page is a VIEW, not a
// fulfillment authority — it now only
// polls the real GET /api/points/fulfillment to report what the canonical
// webhook (apps/web/src/app/api/stripe/webhook/route.ts, points_pack
// branch) actually did. It never writes a balance itself, never fabricates
// XP, and never claims success merely because the browser landed here.
const FULFILLMENT_POLL_MS = 2000;
const FULFILLMENT_MAX_ATTEMPTS = 6;

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const sessionId = params?.get('session_id') ?? '';
  const priceId = params?.get('priceId') ?? '';
  const mode = params?.get('mode') ?? 'payment';
  const paymentType = params?.get('type') ?? '';
  const chassisId = params?.get('chassisId') ?? '';

  const [status, setStatus] = useState<State>('loading');
  const [fulfillment, setFulfillment] = useState<{ granted: number; balance: number } | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    // Tip payments land without a session_id — show success directly
    if (!sessionId && paymentType === 'tip') { setStatus('tip'); return; }
    if (!sessionId) { setStatus('unknown'); return; }

    // Idempotency for the side-effect fetches below (email, sponsor attach,
    // subscription activation) only — there is no client-side credit/XP
    // grant left to gate. points_pack has its own server-side idempotent
    // status check (GET /api/points/fulfillment), so it skips this shortcut.
    const grantKey = `tmi_paid_${sessionId}`;
    if (localStorage.getItem(grantKey) && paymentType !== 'points_pack') { setStatus('duplicate'); return; }

    // Ad purchase (advertiser packages + à la carte placements) — payment is
    // recorded server-side by the webhook (see stripe/webhook route.ts's
    // ad_purchase branch); no AdCampaign/AdPlacement engine exists yet, so
    // this is an honest "received" confirmation, not a fake "live" state.
    if (paymentType === 'ad_purchase') {
      localStorage.setItem(grantKey, '1');
      setStatus('ad_purchase');
      return;
    }

    // Media Player chassis — ownership granted by Stripe webhook; confirm + hydrate inventory
    if (paymentType === 'media_player_chassis') {
      fetch('/api/media-players', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provision' }),
      }).catch(() => undefined);
      localStorage.setItem(grantKey, '1');
      setStatus('media_player');
      return;
    }

    // Battle sponsor path — auto-attach via API, no credit grant
    const battleId    = params?.get('battleId');
    const sponsorTier = params?.get('sponsorTier') ?? 'FEATURED';
    const sponsorName = params?.get('sponsorName') ?? 'Battle Sponsor';
    if (battleId) {
      fetch('/api/sponsor/attach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId, tier: sponsorTier, sponsorName }),
      }).finally(() => {
        localStorage.setItem(grantKey, '1');
        setStatus('sponsor');
      });
      return;
    }

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
        body: JSON.stringify({ sessionId }),
      }).catch(() => undefined);
      setStatus('pass');
      return;
    }

    if (paymentType === 'points_pack') {
      // Canonical fulfillment lives only in the signed Stripe webhook
      // (webhook/route.ts's points_pack branch -> grantPointPackFromStripeSession
      // -> Wallet.fanCredits). This page never grants anything itself — it
      // only asks that real authority what actually happened, below.
      setStatus('points_pack_verifying');
      return;
    }

    setStatus('unknown');
  }, [sessionId, priceId, mode, paymentType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bounded, non-destructive poll against the real fulfillment authority.
  // No infinite polling, and no browser-side fallback grant if it times out
  // — an unconfirmed purchase stays honestly "verifying", never a fake success.
  useEffect(() => {
    if (status !== 'points_pack_verifying' || !sessionId) return;
    let cancelled = false;

    const poll = () => {
      fetch(`/api/points/fulfillment?sessionId=${encodeURIComponent(sessionId)}`, {
        credentials: 'include',
        cache: 'no-store',
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { status?: string; granted?: number; balance?: number } | null) => {
          if (cancelled) return;
          if (d?.status === 'FULFILLED' && typeof d.granted === 'number' && typeof d.balance === 'number') {
            setFulfillment({ granted: d.granted, balance: d.balance });
            setStatus('points_pack_fulfilled');
            return;
          }
          attemptsRef.current += 1;
          if (attemptsRef.current >= FULFILLMENT_MAX_ATTEMPTS) { setStatus('points_pack_unavailable'); return; }
          setTimeout(poll, FULFILLMENT_POLL_MS);
        })
        .catch(() => {
          if (cancelled) return;
          attemptsRef.current += 1;
          if (attemptsRef.current >= FULFILLMENT_MAX_ATTEMPTS) { setStatus('points_pack_unavailable'); return; }
          setTimeout(poll, FULFILLMENT_POLL_MS);
        });
    };
    poll();
    return () => { cancelled = true; };
  }, [status, sessionId]);

  const colors: Record<State, string> = {
    loading: '#888',
    points_pack_verifying: '#888',
    points_pack_fulfilled: '#00FF88',
    points_pack_unavailable: '#FFD700',
    tip: '#FF2DAA', duplicate: '#FFD700', pass: '#AA2DFF', sponsor: '#FFD700', media_player: '#00FFFF', ad_purchase: '#FFD700', unknown: '#FF4444',
  };
  const accent = colors[status] ?? '#888';

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {status === 'loading' || status === 'points_pack_verifying' ? '⏳' : status === 'tip' ? '💸' : status === 'points_pack_fulfilled' ? '🎉' : status === 'points_pack_unavailable' ? '⏳' : status === 'pass' ? '🎸' : status === 'sponsor' ? '🤝' : status === 'media_player' ? '🎛️' : status === 'ad_purchase' ? '📢' : status === 'duplicate' ? '✅' : '❓'}
        </div>

        {status === 'tip' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FF2DAA', fontWeight: 800, marginBottom: 10 }}>TIP SENT</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Your tip went through!</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              The performer receives your support directly. Thank you for keeping the music alive.
            </p>
          </>
        )}

        {status === 'loading' && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Confirming payment…</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Please wait a moment.</p>
          </>
        )}

        {status === 'points_pack_verifying' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: accent, fontWeight: 800, marginBottom: 10 }}>VERIFYING PAYMENT</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Confirming your credits…</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              Your payment was received. We&apos;re verifying the credit grant with our ledger — this usually takes a few seconds.
            </p>
          </>
        )}

        {status === 'points_pack_fulfilled' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: accent, fontWeight: 800, marginBottom: 10 }}>PAYMENT CONFIRMED</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
              +{(fulfillment?.granted ?? 0).toLocaleString()} TM Credits Added
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              Your balance has been updated. Head to the shop to spend them.
            </p>
            <div style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 20, fontSize: 12, color: accent, fontWeight: 700, marginBottom: 28 }}>
              New balance: {(fulfillment?.balance ?? 0).toLocaleString()} TM Credits
            </div>
          </>
        )}

        {status === 'points_pack_unavailable' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: accent, fontWeight: 800, marginBottom: 10 }}>STILL PROCESSING</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Your payment is still processing</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              This can take a little longer than usual. Check your balance on the credits page in a minute, or contact support if it still hasn&apos;t appeared.
            </p>
          </>
        )}

        {status === 'pass' && (          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: accent, fontWeight: 800, marginBottom: 10 }}>SUBSCRIPTION ACTIVE</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Season Pass Unlocked</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              Your pass is active. Perks and credits will appear in your account within a few minutes.
            </p>
          </>
        )}

        {status === 'sponsor' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FFD700', fontWeight: 800, marginBottom: 10 }}>SPONSORSHIP CONFIRMED</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Battle Sponsorship Live!</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              Your brand is now active in the battle overlay. Logo and prize boost appear within 60 seconds.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <a href="/sponsor/battles" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#050510', background: '#FFD700', borderRadius: 8, textDecoration: 'none' }}>SPONSOR ANOTHER</a>
              <a href="/hub/sponsor" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 8, textDecoration: 'none' }}>SPONSOR HUB</a>
            </div>
          </>
        )}

        {status === 'media_player' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#00FFFF', fontWeight: 800, marginBottom: 10 }}>MEDIA PLAYER UNLOCKED</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Chassis added to your inventory</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              {chassisId
                ? `Ownership of “${chassisId}” is saved to your account. Equip it in the Media Player store or Playlist Studio.`
                : 'Your Media Player chassis is saved to your account. Equip it anytime from the store or studio.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/store/media-players" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#050510', background: '#00FFFF', borderRadius: 8, textDecoration: 'none' }}>
                EQUIP NOW
              </Link>
              <Link href="/playlist" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.4)', borderRadius: 8, textDecoration: 'none' }}>
                PLAYLIST STUDIO
              </Link>
            </div>
          </>
        )}

        {status === 'ad_purchase' && (
          <>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', color: accent, fontWeight: 800, marginBottom: 10 }}>PAYMENT RECEIVED</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Ad Placement Request Submitted</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
              Your payment went through. The TMI team will review your placement and follow up by email once it&apos;s activated.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <Link href="/advertiser/campaigns" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: '#050510', background: accent, borderRadius: 8, textDecoration: 'none' }}>VIEW CAMPAIGNS</Link>
              <Link href="/advertiser/dashboard" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: accent, border: `1px solid ${accent}`, borderRadius: 8, textDecoration: 'none' }}>ADVERTISER HUB</Link>
            </div>
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
          <Link href="/home/1" style={{ padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, textDecoration: 'none' }}>
            ⌂ HOME
          </Link>
        </div>
        {sessionId && (
          <div style={{ marginTop: 24, fontSize: 9, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' }}>
            Session: {sessionId.slice(0, 18)}…
          </div>
        )}
      </div>
    </main>
  );
}
