import Link from 'next/link';

export const metadata = {
  title: 'Subscribe | TMI',
};

export default function SubscribePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'grid', placeItems: 'center', padding: 20 }}>
      <section style={{ width: '100%', maxWidth: 560, border: '1px solid rgba(0,255,255,0.25)', borderRadius: 14, background: 'rgba(255,255,255,0.02)', padding: 24 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.22em', color: '#00FFFF', fontWeight: 900, marginBottom: 8 }}>TMI SUBSCRIPTION</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900 }}>Starter Plan</h1>
        <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
          Test checkout in Stripe sandbox first, then promote to live after webhook validation.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: '#00FFFF', fontWeight: 800, letterSpacing: '0.1em' }}>STARTER PLAN</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>$2.99/mo</div>
          </div>
          <div style={{ fontSize: 28 }}>🎧</div>
        </div>

        <form action="/create-checkout-session" method="POST" style={{ marginBottom: 10 }}>
          <input type="hidden" name="lookup_key" value="starter_plan" />
          <button type="submit" style={{ width: '100%', border: 'none', borderRadius: 8, padding: '12px 14px', fontWeight: 900, letterSpacing: '0.12em', background: 'linear-gradient(135deg,#00FFFF,#00AAFF)', color: '#050510', cursor: 'pointer' }}>
            CHECKOUT
          </button>
        </form>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
          Stripe test-mode signals to confirm: <strong>checkout.session.completed</strong> and <strong>invoice.payment_succeeded</strong>.
          Then verify your webhook returns 200 at production URL.
        </div>

        <div style={{ marginTop: 14 }}>
          <Link href="/pricing" style={{ color: '#AA2DFF', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textDecoration: 'none' }}>
            VIEW ALL PLANS →
          </Link>
        </div>
      </section>
    </main>
  );
}
