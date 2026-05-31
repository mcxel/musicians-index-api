'use client';
import { useState } from 'react';
import Link from 'next/link';

const CFG = { label: 'Promoter', accent: '#FF6B35', hub: '/hub/promoter' };

export default function PromoterSettingsPage() {
  const [notifs, setNotifs] = useState({ battles: false, messages: true, revenue: true, news: true });
  const [visibility, setVisibility] = useState('public');

  return (
    <div style={{ minHeight: '100vh', background: '#07071a', color: '#fff', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href={CFG.hub} style={{ color: CFG.accent, textDecoration: 'none', fontSize: 14 }}>
          ← Back to {CFG.label} Hub
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: '1rem' }}>Settings</h1>

        <Section title="Account" accent={CFG.accent}>
          <Field label="Email Address" name="email" type="email" placeholder="you@example.com" />
          <Field label="New Password" name="password" type="password" placeholder="Leave blank to keep current" />
          <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat new password" />
          <SaveBtn accent={CFG.accent} />
        </Section>

        <Section title="Notifications" accent={CFG.accent}>
          {(Object.keys(notifs) as Array<keyof typeof notifs>).map(key => (
            <Toggle key={key} label={`Notify me about ${key}`} checked={notifs[key]}
              onChange={v => setNotifs(n => ({ ...n, [key]: v }))} accent={CFG.accent} />
          ))}
        </Section>

        <Section title="Privacy" accent={CFG.accent}>
          <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 8 }}>Profile Visibility</label>
          {(['public', 'followers', 'private'] as const).map(opt => (
            <label key={opt} style={{ display: 'block', cursor: 'pointer', marginBottom: 8 }}>
              <input type="radio" name="visibility" value={opt} checked={visibility === opt}
                onChange={() => setVisibility(opt)} style={{ marginRight: 8 }} />
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </label>
          ))}
        </Section>

        <Section title="Subscription" accent={CFG.accent}>
          <p style={{ color: '#888', fontSize: 14, marginBottom: '1rem' }}>Current plan: <strong style={{ color: CFG.accent }}>Free</strong></p>
          <Link href="/subscribe" style={{ background: CFG.accent, color: '#fff', borderRadius: 8, padding: '0.6rem 1.5rem', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
            Upgrade Plan
          </Link>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/settings/billing" style={{ color: CFG.accent, fontSize: 14 }}>Manage Billing →</Link>
          </div>
        </Section>

        <Section title="Danger Zone" accent="#ff4444">
          <p style={{ color: '#888', fontSize: 14, marginBottom: '1rem' }}>Permanently deactivate your account and remove your data.</p>
          <Link href="/account/deactivate" style={{ background: '#ff4444', color: '#fff', borderRadius: 8, padding: '0.6rem 1.5rem', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
            Deactivate Account
          </Link>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${accent}33`, borderRadius: 10, padding: '1.25rem', marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, name, placeholder = '', type = 'text' }: { label: string; name: string; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 4 }}>{label}</label>
      <input type={type} name={name} placeholder={placeholder}
        style={{ width: '100%', background: '#07071a', border: '1px solid #333', borderRadius: 6, color: '#fff', padding: '0.5rem 0.75rem', fontSize: 15, boxSizing: 'border-box' }} />
    </div>
  );
}

function Toggle({ label, checked, onChange, accent }: { label: string; checked: boolean; onChange: (v: boolean) => void; accent: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? accent : '#333', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </div>
    </div>
  );
}

function SaveBtn({ accent }: { accent: string }) {
  return (
    <button type="button" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem', fontSize: 14, cursor: 'pointer', fontWeight: 700, marginTop: 8 }}>
      Update Account
    </button>
  );
}
