'use client';

import { useState } from 'react';
import Link from 'next/link';

const ROLES = ['performer', 'fan', 'promoter', 'advertiser', 'sponsor', 'venue'] as const;
type Role = typeof ROLES[number];

const VIP_TOKENS: Record<string, { email: string; name: string; role: Role }> = {
  'VIP-KREACH-2026':  { email: 'kreach@themusiciansindex.com',  name: 'Kreach',       role: 'performer' },
  'VIP-KG-2026':      { email: 'kg@themusiciansindex.com',      name: 'KG',           role: 'performer' },
  'VIP-SAVAGE-2026':  { email: 'savageguns@themusiciansindex.com', name: 'Savage Guns', role: 'performer' },
  'VIP-JASON-2026':   { email: 'sharingmyblessing1978@gmail.com', name: 'Jason Smith', role: 'promoter' },
  'VIP-SHEILA-2026':  { email: 'mystictrinity@yahoo.com',       name: 'Sheila',       role: 'fan'       },
  'VIP-SKEET-2026':   { email: 'facethebully916@gmail.com',     name: 'Skeet',        role: 'fan'       },
  'VIP-KEVEN-2026':   { email: 'kevenfobbsgrip@gmail.com',      name: 'Keven Fobbs',  role: 'performer' },
  'VIP-PARIS-2026':   { email: 'parisdcooper91@gmail.com',      name: 'Paris Cooper', role: 'performer' },
};

const ACCENT = '#FFD700';

export default function AdminInvitesPage() {
  const [email, setEmail]         = useState('');
  const [name, setName]           = useState('');
  const [role, setRole]           = useState<Role>('performer');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy]           = useState(false);
  const [result, setResult]       = useState<{ ok: boolean; msg: string } | null>(null);

  const send = async () => {
    if (!email || !name) return;
    setBusy(true);
    setResult(null);
    try {
      const code = inviteCode.trim() || `VIP-${name.toUpperCase().replace(/\s+/g, '-')}-${new Date().getFullYear()}`;
      const res = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: email, name, inviteCode: code, role }),
      });
      const data = await res.json() as { success?: boolean; inviteUrl?: string; error?: string };
      if (data.success) {
        setResult({ ok: true, msg: `Sent! Invite URL: ${data.inviteUrl ?? ''}` });
        setEmail(''); setName(''); setInviteCode('');
      } else {
        setResult({ ok: false, msg: data.error ?? 'Send failed' });
      }
    } catch (e) {
      setResult({ ok: false, msg: String(e) });
    } finally {
      setBusy(false);
    }
  };

  const quickSend = async (token: string) => {
    const p = VIP_TOKENS[token];
    if (!p) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: p.email, name: p.name, inviteCode: token, role: p.role }),
      });
      const data = await res.json() as { success?: boolean; inviteUrl?: string; error?: string };
      setResult(data.success
        ? { ok: true, msg: `Sent to ${p.name} (${p.email}) — ${data.inviteUrl ?? ''}` }
        : { ok: false, msg: data.error ?? 'Failed' });
    } catch (e) {
      setResult({ ok: false, msg: String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '28px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: ACCENT, fontWeight: 800, marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>VIP Invite Center</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Send invite links directly to people. They land on /auth?code= which auto-shows the signup flow.</p>
        </div>

        {/* Result */}
        {result && (
          <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, background: result.ok ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)', border: `1px solid ${result.ok ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`, fontSize: 12, color: result.ok ? '#00FF88' : '#FF4444', wordBreak: 'break-all' }}>
            {result.msg}
          </div>
        )}

        {/* Custom invite form */}
        <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 14, padding: '20px 22px', marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: ACCENT, fontWeight: 800, marginBottom: 16 }}>SEND NEW INVITE</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 5 }}>FULL NAME</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Micah Jones"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 5 }}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="micah@example.com"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 5 }}>ROLE</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 5 }}>INVITE CODE (optional)</label>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="VIP-NAME-2026 (auto-generated)"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={() => void send()} disabled={busy || !email || !name}
              style={{ padding: '13px', fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', background: (!email || !name || busy) ? 'rgba(255,215,0,0.2)' : `linear-gradient(135deg,${ACCENT},#FF9500)`, color: '#050510', border: 'none', borderRadius: 9, cursor: (!email || !name || busy) ? 'not-allowed' : 'pointer' }}>
              {busy ? 'SENDING...' : '💎 SEND VIP INVITE'}
            </button>
          </div>
        </div>

        {/* Quick resend — registered VIPs */}
        <div style={{ background: 'rgba(170,45,255,0.05)', border: '1px solid rgba(170,45,255,0.2)', borderRadius: 14, padding: '20px 22px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#AA2DFF', fontWeight: 800, marginBottom: 16 }}>RESEND TO REGISTERED VIPs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(VIP_TOKENS).map(([token, p]) => (
              <div key={token} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{p.email} · {p.role} · <span style={{ color: ACCENT }}>{token}</span></div>
                </div>
                <button onClick={() => void quickSend(token)} disabled={busy}
                  style={{ padding: '6px 14px', fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 6, color: ACCENT, cursor: busy ? 'wait' : 'pointer' }}>
                  RESEND
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <Link href="/admin/owner-dashboard" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Owner Dashboard</Link>
          <Link href="/admin/users/grants" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>User Grants</Link>
        </div>
      </div>
    </main>
  );
}
