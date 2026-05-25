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

// Template types with display info and sample preview data
const TEMPLATE_TYPES = [
  { type: 'welcome_artist',        label: 'Artist Welcome',      color: '#a855f7', emoji: '🎤', data: { name: 'Test Artist', slug: 'test-artist' } },
  { type: 'welcome_fan',           label: 'Fan Welcome',         color: '#06b6d4', emoji: '🎧', data: { name: 'Test Fan' } },
  { type: 'welcome_diamond',       label: 'Diamond Welcome',     color: '#38bdf8', emoji: '💎', data: { name: 'Test User' } },
  { type: 'invite',                label: 'Platform Invite',     color: '#FF2DAA', emoji: '✉️', data: { inviterName: 'Big Ace', inviteCode: 'TMI-2026', inviteLink: 'https://themusiciansindex.com/signup' } },
  { type: 'profile_reminder',      label: 'Re-engagement',       color: '#FFD700', emoji: '⚡', data: { name: 'Test User', statXP: '4,200', statRank: 'Top 500' } },
  { type: 'sponsor_confirmation',  label: 'Sponsor Confirmed',   color: '#FFD700', emoji: '🤝', data: { sponsorName: 'Acme Corp', packageName: 'Gold Sponsor', monthlyBudget: '2000' } },
  { type: 'ticket_confirmation',   label: 'Ticket Confirm',      color: '#22c55e', emoji: '🎟️', data: { eventName: 'World Dance Party', date: 'June 21, 2026', venue: 'TMI Main Stage', seat: 'GA-42', confirmationCode: 'TMI-042-XTEST', ticketId: 'test-ticket-1' } },
  { type: 'subscription_start',    label: 'Subscription Start',  color: '#94a3b8', emoji: '✅', data: { plan: 'Pro', priceMonthly: '19.99', renewalDate: 'July 25, 2026' } },
  { type: 'battle_invite',         label: 'Battle Invite',       color: '#ef4444', emoji: '⚔️', data: { challenger: 'Charro Ace', genre: 'Hip-Hop', format: 'Text Battle', inviteId: 'test-invite-1' } },
  { type: 'tip_received',          label: 'Tip Received',        color: '#fbbf24', emoji: '💰', data: { fanName: 'A Fan', amount: '5.00', roomName: 'Main Lobby', message: 'Great set!' } },
  { type: 'magazine_drop',         label: 'Magazine Drop',       color: '#ec4899', emoji: '📖', data: { issueName: 'Issue 32 — Summer Drop', teaser: 'Charro Ace cover story + 5 exclusives', articleCount: 8, featuredArtist: 'Charro Ace' } },
  { type: 'verify_email',          label: 'Email Verify',        color: '#06b6d4', emoji: '📧', data: { token: 'test-verify-token-abc123' } },
] as const;

type TemplateName = typeof TEMPLATE_TYPES[number]['type'];

export default function AdminEmailBlast() {
  const [testTo,       setTestTo]       = useState('');
  const [blastText,    setBlastText]    = useState('');
  const [testLoading,  setTestLoading]  = useState(false);
  const [blastLoading, setBlastLoading] = useState(false);
  const [testResult,   setTestResult]   = useState<SendResult | null>(null);
  const [blastResults, setBlastResults] = useState<SendResult[]>([]);
  const [selectedTpl,  setSelectedTpl]  = useState<TemplateName | null>(null);
  const [tplLoading,   setTplLoading]   = useState(false);
  const [tplResult,    setTplResult]    = useState<SendResult | null>(null);

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

  async function sendTemplatePreview() {
    if (!testTo.trim() || !selectedTpl) return;
    const tpl = TEMPLATE_TYPES.find((t) => t.type === selectedTpl);
    if (!tpl) return;
    setTplLoading(true);
    setTplResult(null);
    try {
      const res  = await fetch('/api/email/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: testTo.trim(), type: tpl.type, data: tpl.data }) });
      const data = await res.json() as { ok: boolean; id?: string; error?: string };
      setTplResult({ to: testTo.trim(), ...data });
    } catch (e) {
      setTplResult({ to: testTo.trim(), ok: false, error: String(e) });
    } finally {
      setTplLoading(false);
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

      {/* Recipient field (shared) */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,255,0.12)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 12 }}>TEST RECIPIENT</div>
        <input
          type="email"
          value={testTo}
          onChange={e => setTestTo(e.target.value)}
          placeholder="recipient@example.com"
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
        <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
          <button
            onClick={() => void sendTest()}
            disabled={testLoading || !testTo.trim()}
            style={{ padding: '9px 18px', background: testLoading || !testTo.trim() ? 'rgba(0,255,255,0.08)' : '#00FFFF', color: testLoading || !testTo.trim() ? 'rgba(255,255,255,0.3)' : '#060410', border: 'none', borderRadius: 8, fontWeight: 900, fontSize: 11, cursor: testLoading || !testTo.trim() ? 'not-allowed' : 'pointer', letterSpacing: '0.08em' }}
          >
            {testLoading ? 'SENDING...' : 'SEND GENERIC TEST'}
          </button>
        </div>
        {testResult && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: testResult.ok ? 'rgba(0,255,136,0.08)' : 'rgba(255,60,60,0.08)', border: `1px solid ${testResult.ok ? 'rgba(0,255,136,0.25)' : 'rgba(255,60,60,0.25)'}` }}>
            {testResult.ok ? (
              <div style={{ fontSize: 12, color: '#00FF88', fontWeight: 700 }}>
                ✅ Sent via {providerLabel}{isDevMode ? ' (DEV MODE)' : ''} · ID: {testResult.id}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#FF6B6B' }}>❌ {testResult.error ?? 'Send failed'}</div>
            )}
          </div>
        )}
      </div>

      {/* Template preview grid */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,45,170,0.15)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 800, marginBottom: 14 }}>SEND TEMPLATE PREVIEW</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {TEMPLATE_TYPES.map(t => (
            <button
              key={t.type}
              onClick={() => setSelectedTpl(selectedTpl === t.type ? null : t.type)}
              style={{
                padding: '6px 12px', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em',
                border: `1px solid ${selectedTpl === t.type ? t.color : t.color + '40'}`,
                background: selectedTpl === t.type ? `${t.color}20` : 'transparent',
                color: selectedTpl === t.type ? t.color : 'rgba(255,255,255,0.5)',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        {selectedTpl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 }}>
              Selected: <strong style={{ color: '#fff' }}>{TEMPLATE_TYPES.find(t => t.type === selectedTpl)?.label}</strong>
            </div>
            <button
              onClick={() => void sendTemplatePreview()}
              disabled={tplLoading || !testTo.trim()}
              style={{ padding: '9px 18px', background: tplLoading || !testTo.trim() ? 'rgba(255,45,170,0.1)' : '#FF2DAA', color: tplLoading || !testTo.trim() ? 'rgba(255,255,255,0.3)' : '#050510', border: 'none', borderRadius: 8, fontWeight: 900, fontSize: 11, cursor: tplLoading || !testTo.trim() ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}
            >
              {tplLoading ? 'SENDING...' : 'SEND PREVIEW →'}
            </button>
          </div>
        )}
        {tplResult && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: tplResult.ok ? 'rgba(0,255,136,0.08)' : 'rgba(255,60,60,0.08)', border: `1px solid ${tplResult.ok ? 'rgba(0,255,136,0.25)' : 'rgba(255,60,60,0.25)'}` }}>
            {tplResult.ok ? (
              <div style={{ fontSize: 12, color: '#00FF88', fontWeight: 700 }}>✅ Preview sent · ID: {tplResult.id}</div>
            ) : (
              <div style={{ fontSize: 12, color: '#FF6B6B' }}>❌ {tplResult.error ?? 'Send failed'}</div>
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
          placeholder={'artist@email.com\nfan@domain.com\nvenue@place.com'}
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
