'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TMI_ONBOARDING_CHECKLIST } from '@/lib/onboarding/tmiOnboardingChecklist';
import AutoPerformerWelcomeMessage from '@/components/onboarding/AutoPerformerWelcomeMessage';

export default function OnboardingPerformerPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <AutoPerformerWelcomeMessage displayName="" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10 text-white">
      <p style={{ fontSize: 11, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 8 }}>
        THE MUSICIAN&apos;S INDEX
      </p>
      <h1 className="mb-3 text-3xl font-bold text-[#ff6b35]">Performer Setup</h1>
      <p className="mb-6 text-gray-400">Complete your performer launch checklist to go live.</p>

      {/* Invite XP callout */}
      <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, maxWidth: 540 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 6 }}>
          🚀 LAUNCH BONUS — DOUBLE XP ON ALL INVITES
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
          Invite a fan or performer who joins free → <strong style={{ color: '#FFD700' }}>1,000 XP</strong> (normally 500)<br />
          They upgrade to a paid tier → up to <strong style={{ color: '#FFD700' }}>5,000 XP</strong> per invite<br />
          5 qualified invites → <strong style={{ color: '#FFD700' }}>+10,000 XP milestone bonus</strong>
        </div>
      </div>

      <ul className="space-y-2" style={{ maxWidth: 540 }}>
        {TMI_ONBOARDING_CHECKLIST.map((item) => (
          <li key={item.id} className="rounded border border-white/15 bg-white/5 px-3 py-2 text-sm">
            {item.label}
          </li>
        ))}
      </ul>

      <button
        onClick={async () => {
          try {
            await fetch('/api/onboarding/role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ role: 'PERFORMER' }),
            });
          } catch { /* non-fatal */ }
          setDone(true);
          setTimeout(() => router.replace('/dashboard/performer'), 2200);
        }}
        style={{ marginTop: 28, padding: '13px 28px', background: '#FF2DAA', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.06em' }}
      >
        I&apos;m Ready — Show Me My Stage →
      </button>
    </main>
  );
}
