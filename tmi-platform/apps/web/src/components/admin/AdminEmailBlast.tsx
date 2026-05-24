'use client';

import { useState } from 'react';

interface SendResult {
  to:       string;
  ok:       boolean;
  id?:      string;
  provider?: string;
  devMode?: boolean;
  error?:   string;
}

export default function AdminEmailBlast() {
  const [testTo,        setTestTo]        = useState('');
  const [blastText,     setBlastText]     = useState('');
  const [testLoading,   setTestLoading]   = useState(false);
  const [blastLoading,  setBlastLoading]  = useState(false);
  const [testResult,    setTestResult]    = useState<SendResult | null>(null);
  const [blastResults,  setBlastResults]  = useState<SendResult[]>([]);

  async function sendTest() {
    if (!testTo.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const res  = await fetch('/api/email/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: testTo.trim() }) });
      const data = await res.json() as { ok: boolean; id?: string; provider?: string; devMode?: boolean; error?: string };
      setTestResult({ to: testTo.trim(), ...data });
    } catch (e) {
      setTestResult({ to: testTo.trim(), ok: false, error: String(e) });
    } finally {
      setTestLoading(false);
    }
  }

  async function sendBlast() {
    const emails = blastText.split(/[\n,;]+/).map(e => e.trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (emails.length === 0) return;
    setBlastLoading(true);
    setBlastResults([]);
    const results: SendResult[] = [];
    for (const to of emails) {
      try {
        const res  = await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'invite', to, data: { name: 'there', link: 'https://themusiciansindex.com' } }) });
        const data = await res.json() as { ok: boolean; id?: string; error?: string };
        results.push({ to, ...data });
      } catch (e) {
        results.push({ to, ok: false, error: String(e) });
      }
      setBlastResults([...results]);
    }
    setBlastLoading(false);
  }

  const providerLabel = testResult?.provider ? testResult.provider.toUpperCase() : null;
  const isDevMode     = testResult?.devMode;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 32 }}>

      {/* Provider status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.18)', borderRadius: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 6px #00FF88', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>EMAIL PROVIDER</div>
          <div style={{ fontSize: 13, color: '#00FFFF', fontWeight: 700 }}>Resend (primary) · SendGrid (fallback)</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>FROM: noreply@themusiciansindex.com</div>
      </div>

      {/* Test email */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,255,0.15)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>SEND TEST EMAIL</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="email"
            value={testTo}
            onChange={e => setTestTo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && void sendTest()}
            placeholder="recipient@example.com"
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
          />
          <button
            onClick={() => void sendTest()}
            disabled={testLoading || !testTo.trim()}
            style={{ padding: '10px 20px', background: testLoading || !testTo.trim() ? 'rgba(0,255,255,0.1)' : '#00FFFF', color: testLoading || !testTo.trim() ? 'rgba(255,255,255,0.3)' : '#060410', border: 'none', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: testLoading || !testTo.trim() ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}
          >
            {testLoading ? 'SENDING...' : 'SEND TEST'}
          </button>
        </div>

        {testResult && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: testResult.ok ? 'rgba(0,255,136,0.08)' : 'rgba(255,60,60,0.08)', border: `1px solid ${testResult.ok ? 'rgba(0,255,136,0.25)' : 'rgba(255,60,60,0.25)'}` }}>
            {testResult.ok ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div>
                  <div style={{ fontSize: 12, color: '#00FF88', fontWeight: 700 }}>
                    Sent via {providerLabel}{isDevMode ? ' (DEV MODE — no real email)' : ''}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>ID: {testResult.id}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>❌</span>
                <div style={{ fontSize: 12, color: '#FF6B6B' }}>{testResult.error ?? 'Send failed'}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk invite blast */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 800, marginBottom: 6 }}>BULK INVITE BLAST</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>One email per line (or comma / semicolon separated)</div>
        <textarea
          value={blastText}
          onChange={e => setBlastText(e.target.value)}
          rows={5}
          placeholder={"artist@email.com\nfan@domain.com\nvenue@place.com"}
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }}
        />
        <button
          onClick={() => void sendBlast()}
          disabled={blastLoading || !blastText.trim()}
          style={{ marginTop: 10, padding: '10px 22px', background: blastLoading || !blastText.trim() ? 'rgba(255,215,0,0.08)' : 'linear-gradient(90deg,#FFD700,#FF9500)', color: blastLoading || !blastText.trim() ? 'rgba(255,255,255,0.3)' : '#060410', border: 'none', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: blastLoading || !blastText.trim() ? 'not-allowed' : 'pointer', letterSpacing: '0.08em' }}
        >
          {blastLoading ? 'SENDING...' : 'SEND INVITES →'}
        </button>

        {blastResults.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 4 }}>
              RESULTS — {blastResults.filter(r => r.ok).length}/{blastResults.length} sent
            </div>
            {blastResults.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: r.ok ? 'rgba(0,255,136,0.06)' : 'rgba(255,60,60,0.06)', border: `1px solid ${r.ok ? 'rgba(0,255,136,0.15)' : 'rgba(255,60,60,0.15)'}` }}>
                <span style={{ fontSize: 12 }}>{r.ok ? '✅' : '❌'}</span>
                <span style={{ fontSize: 11, color: r.ok ? '#00FF88' : '#FF6B6B', flex: 1 }}>{r.to}</span>
                {!r.ok && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{r.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
