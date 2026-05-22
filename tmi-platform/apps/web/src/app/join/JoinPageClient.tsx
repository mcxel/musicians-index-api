'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ROLES = [
  {
    key: 'performer',
    icon: '🎤',
    label: 'Performer',
    sub: 'Artist · Singer · Comedian · Dancer · Any talent',
    bullets: ['Go live tonight', 'Enter battles & win cash prizes', 'Earn tips from fans', 'Get sponsored'],
    accent: '#FF2DAA',
    href: '/signup/performer',
    primary: true,
  },
  {
    key: 'fan',
    icon: '🎧',
    label: 'Fan',
    sub: 'Viewer · Voter · Supporter',
    bullets: ['Watch live battles & ciphers', 'Vote and earn XP', 'Send tips to artists', 'Win giveaways'],
    accent: '#00FFFF',
    href: '/signup/fan',
    primary: true,
  },
  {
    key: 'writer',
    icon: '📰',
    label: 'Writer / Reporter',
    sub: 'Journalist · Blogger · Critic',
    bullets: ['Cover live events', 'Interview artists', 'Get paid per verified article'],
    accent: '#AA2DFF',
    href: '/signup?role=artist',
    primary: false,
  },
  {
    key: 'sponsor',
    icon: '🤝',
    label: 'Sponsor',
    sub: 'Brand · Business · Patron',
    bullets: ['Fund prize pools', 'Logo in artist orbit', 'Starting $25/mo'],
    accent: '#FFD700',
    href: '/signup/sponsor',
    primary: false,
  },
  {
    key: 'venue',
    icon: '🏟️',
    label: 'Venue',
    sub: 'Club · Studio · Event space',
    bullets: ['List events + sell tickets', 'Broadcast live', 'Print branded tickets'],
    accent: '#FF6B35',
    href: '/signup?role=venue',
    primary: false,
  },
  {
    key: 'advertiser',
    icon: '📢',
    label: 'Advertiser',
    sub: 'Brand · Agency · Media buyer',
    bullets: ['Reach music fans', 'Ads from $0.99/day', 'Analytics dashboard'],
    accent: '#00FF88',
    href: '/signup/advertiser',
    primary: false,
  },
];

const MONDAY_LINES = [
  'Singers. Comedians. Dancers. Actors. Show us what you got.',
  "If you've got talent, this stage is yours.",
  'From your room to the world — perform live tonight.',
  "Tonight's stage could change your life.",
  'Any skill. Any style. Everyone is welcome.',
];

function JoinInner() {
  const params = useSearchParams();
  const ref = params?.get('ref') ?? '';

  function buildHref(base: string) {
    const sep = base.includes('?') ? '&' : '?';
    return ref ? `${base}${sep}ref=${encodeURIComponent(ref)}` : base;
  }

  const primary = ROLES.filter((r) => r.primary);
  const secondary = ROLES.filter((r) => !r.primary);

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(170,45,255,0.18), transparent 55%), #050510', color: '#fff' }}>
      {/* ── Hero ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 32px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#AA2DFF', fontWeight: 800, marginBottom: 14 }}>
            THE MUSICIAN&apos;S INDEX · FREE TO JOIN
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,6vw,3.6rem)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.08 }}>
            Go Live. Get Discovered.<br />
            <span style={{ color: '#FFD700' }}>Earn. Compete. Collaborate.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
            The global stage for every talent. Live battles. Real prize pools.
            Fan voting. No equipment needed — just show up.
          </p>
        </motion.div>

        {/* ── Primary CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}
        >
          {primary.map((role) => (
            <Link
              key={role.key}
              href={buildHref(role.href)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '22px 36px', borderRadius: 14,
                background: `linear-gradient(135deg, ${role.accent}28, ${role.accent}12)`,
                border: `2px solid ${role.accent}80`,
                textDecoration: 'none', color: '#fff', minWidth: 220,
                boxShadow: `0 0 32px ${role.accent}25`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 48px ${role.accent}45`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 32px ${role.accent}25`; }}
            >
              <span style={{ fontSize: 36, marginBottom: 8 }}>{role.icon}</span>
              <span style={{ fontSize: 18, fontWeight: 900, marginBottom: 4, color: role.accent }}>{role.label}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>{role.sub}</span>
              {role.bullets.map((b) => (
                <span key={b} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', alignSelf: 'flex-start', marginBottom: 2 }}>
                  ✓ {b}
                </span>
              ))}
              <div style={{ marginTop: 14, width: '100%', padding: '10px', background: role.accent, color: role.accent === '#00FFFF' || role.accent === '#FFD700' ? '#000' : '#fff', borderRadius: 8, fontWeight: 900, fontSize: 13, textAlign: 'center', letterSpacing: '0.08em' }}>
                JOIN FREE →
              </div>
            </Link>
          ))}
        </motion.div>

        {/* ── Live stats strip ── */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {[
            { label: 'Live Rooms', value: '24' },
            { label: 'Active Battles', value: '12' },
            { label: 'Prize Pools', value: '$28K+' },
            { label: 'Genres', value: '10+' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#AA2DFF' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em' }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* ── Monday Night Stage callout ── */}
        <div style={{ background: 'rgba(0,255,255,0.07)', border: '1px solid rgba(0,255,255,0.25)', borderRadius: 12, padding: '20px 24px', marginBottom: 40, maxWidth: 640, margin: '0 auto 40px' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 8 }}>
            🎶 MONDAY NIGHT STAGE — EVERY MONDAY
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            {MONDAY_LINES[Math.floor(Date.now() / 86400000) % MONDAY_LINES.length]}
          </div>
          <Link href={buildHref('/signup/performer')} style={{ display: 'inline-block', marginTop: 12, padding: '8px 20px', background: '#00FFFF', color: '#000', borderRadius: 6, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
            CLAIM YOUR SPOT
          </Link>
        </div>
      </section>

      {/* ── Secondary roles ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>
          ALSO JOINING AS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {secondary.map((role) => (
            <Link
              key={role.key}
              href={buildHref(role.href)}
              style={{
                padding: '16px 18px', borderRadius: 10, textDecoration: 'none', color: '#fff',
                background: `${role.accent}10`,
                border: `1px solid ${role.accent}35`,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{role.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: role.accent }}>{role.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{role.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer trust line ── */}
      <div style={{ textAlign: 'center', padding: '0 24px 40px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        Free forever on the basic tier · No credit card needed · Built by BernoutGlobal
        {ref && <span style={{ marginLeft: 12, color: 'rgba(170,45,255,0.5)' }}>Invited by {ref}</span>}
      </div>
    </main>
  );
}

export default function JoinPageClient() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading...
      </div>
    }>
      <JoinInner />
    </Suspense>
  );
}
