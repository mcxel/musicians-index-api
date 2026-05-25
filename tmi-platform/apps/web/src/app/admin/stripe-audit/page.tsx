import { getProductAudit, getWorkingProducts } from '@/lib/stripe/products';

export default function StripeAuditPage() {
  const audit    = getProductAudit();
  const working  = getWorkingProducts();
  const broken   = audit.filter(p => !p.isReal);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter',sans-serif", padding: '32px clamp(16px,4vw,48px) 80px' }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#00C8FF', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>
          ADMIN · STRIPE
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 'clamp(28px,5vw,48px)', letterSpacing: '0.04em', margin: '0 0 8px', color: '#00C8FF' }}>
          STRIPE PRICE ID AUDIT
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', maxWidth: 560 }}>
          Only price IDs matching the Stripe format <code style={{ color: '#FFD700' }}>price_1...</code> are live.
          Placeholder IDs will fail at checkout. Create the missing products in your{' '}
          <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" style={{ color: '#00C8FF' }}>
            Stripe Dashboard
          </a>{' '}
          and paste the real price IDs into <code style={{ color: '#FFD700' }}>apps/web/src/lib/stripe/products.ts</code>.
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Products',   value: audit.length,   color: '#00C8FF' },
          { label: 'Live (real IDs)',   value: working.length, color: '#00C896' },
          { label: 'Need Setup',        value: broken.length,  color: '#FF2DAA' },
        ].map(s => (
          <div key={s.label} style={{ border: `1px solid ${s.color}22`, background: `${s.color}06`, padding: '14px 16px' }}>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 26, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Working products — these can accept payments NOW */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#00C896', marginBottom: 12, textTransform: 'uppercase' }}>
          ✓ LIVE — PAYMENTS WORKING NOW
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {working.map(p => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid rgba(0,200,150,0.2)', background: 'rgba(0,200,150,0.04)' }}>
              <span style={{ fontSize: 9, color: '#00C896', minWidth: 8 }}>✓</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', minWidth: 180 }}>{p.name}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{p.key}</span>
              <span style={{ fontSize: 10, color: '#FFD700', fontWeight: 700 }}>${(p.price / 100).toFixed(2)}</span>
              <code style={{ fontSize: 9, color: '#00C896', background: 'rgba(0,200,150,0.1)', padding: '2px 6px' }}>{p.priceId}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Broken products — need real price IDs */}
      <section>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#FF2DAA', marginBottom: 12, textTransform: 'uppercase' }}>
          ✗ NEED SETUP — WILL FAIL AT CHECKOUT
        </div>
        <div style={{ marginBottom: 14, padding: '12px 16px', background: 'rgba(255,45,170,0.06)', border: '1px solid rgba(255,45,170,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          For each row below: go to{' '}
          <a href="https://dashboard.stripe.com/products/create" target="_blank" rel="noopener noreferrer" style={{ color: '#00C8FF' }}>
            stripe.com/products/create
          </a>
          , create the product with the listed price, then copy the generated <code style={{ color: '#FFD700' }}>price_1...</code> ID
          into <code style={{ color: '#FFD700' }}>products.ts</code>.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {broken.map(p => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid rgba(255,45,170,0.15)', background: 'rgba(255,45,170,0.03)' }}>
              <span style={{ fontSize: 9, color: '#FF2DAA', minWidth: 8 }}>✗</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', minWidth: 180 }}>{p.name}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{p.key}</span>
              <span style={{ fontSize: 10, color: '#FFD700', fontWeight: 700 }}>${(p.price / 100).toFixed(2)}</span>
              <code style={{ fontSize: 9, color: '#FF2DAA', background: 'rgba(255,45,170,0.1)', padding: '2px 6px' }}>{p.priceId}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Env vars checklist */}
      <section style={{ marginTop: 36, border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.04)', padding: '20px 24px' }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 14, textTransform: 'uppercase' }}>
          VERCEL ENV VAR CHECKLIST
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'STRIPE_SECRET_KEY',     desc: 'Required for all Stripe operations (starts with sk_live_...)' },
            { key: 'STRIPE_WEBHOOK_SECRET', desc: 'Required to verify webhook signatures from Stripe (starts with whsec_...)' },
            { key: 'RESEND_API_KEY',        desc: 'Required to deliver emails to Diamond users (starts with re_...)' },
            { key: 'NEXT_PUBLIC_URL',       desc: 'Should be https://themusiciansindex.com' },
            { key: 'STRIPE_WEBHOOK_LOCAL_ONLY', desc: 'Set to "true" if you have no backend API server — prevents webhook 502 errors' },
          ].map(v => (
            <div key={v.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <code style={{ fontSize: 10, color: '#FFD700', background: 'rgba(255,215,0,0.1)', padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>{v.key}</code>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{v.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
