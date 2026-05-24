'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribePage() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading');

  useEffect(() => {
    const token = params?.get('token');
    const email = params?.get('email');
    if (!token || !email) { setStatus('error'); return; }

    fetch(`/api/email/unsubscribe?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then((r) => {
        if (r.ok) setStatus('success');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [params]);

  const configs = {
    loading: { icon: '⏳', title: 'Processing…', msg: 'Please wait while we process your request.', color: '#888' },
    success: { icon: '✓', title: 'Unsubscribed', msg: 'You have been removed from all TMI marketing emails. Transactional emails (tickets, billing, security) will still be delivered.', color: '#00FF88' },
    already: { icon: '✓', title: 'Already Unsubscribed', msg: 'You were already unsubscribed from TMI emails.', color: '#00FFFF' },
    error:   { icon: '✗', title: 'Invalid Link', msg: 'This unsubscribe link is invalid or has expired. Contact support if you need help.', color: '#FF2DAA' },
  };

  const { icon, title, msg, color } = configs[status];

  return (
    <div style={{ background: '#050510', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 480, width: '100%', background: '#0a0a1a', border: `1px solid ${color}33`, borderTop: `3px solid ${color}`, borderRadius: 16, padding: '48px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#888', marginBottom: 24 }}>THE MUSICIANS INDEX</div>
        <div style={{ fontSize: 52, marginBottom: 20 }}>{icon}</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.15em', color, marginBottom: 16 }}>{title.toUpperCase()}</h1>
        <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>{msg}</p>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', background: color, color: '#050510', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', borderRadius: 8, textDecoration: 'none' }}>
          RETURN TO TMI
        </Link>
      </div>
    </div>
  );
}
