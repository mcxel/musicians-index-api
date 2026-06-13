'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminUnifiedInbox() {
  const [messages, setMessages] = useState([
    { name: 'Big Ace', count: 3, role: 'Owner', color: '#FF4444', id: '1' },
    { name: 'Jay Paul Beats', count: 1, role: 'Artist', color: '#FF4444', id: '2' },
    { name: 'BJM The Rapper', count: 2, role: 'Artist', color: '#FF9500', id: '3' },
    { name: 'FBi Ace', count: 1, role: 'Partner', color: '#FF4444', id: '4' },
  ]);
  const [user, setUser] = useState<{name?: string; role?: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Connect to live NextAuth session
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (sessionRes.ok) {
          const data = await sessionRes.json();
          if (data?.user) setUser(data.user);
        }
        
        // Fetch real notification data
        const inboxRes = await fetch('/api/admin/inbox', { cache: 'no-store' });
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          if (inboxData.messages) setMessages(inboxData.messages);
        }
      } catch (err) {
        console.error('Failed to load inbox data:', err);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, flex: 1 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>UNIFIED INBOX</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: 10, textAlign: 'center' }}>Syncing Secure Feed...</div>
        ) : (
          <>
        {messages.map((m, i) => (
          <div key={m.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: `rgba(230,48,0,0.0${7 - i})`, borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{m.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{m.role}</div>
            </div>
            <div style={{ background: m.color, borderRadius: 12, fontSize: 9, padding: '3px 8px', color: '#fff', fontWeight: 900 }}>{m.count} NEW</div>
          </div>
        ))}
          </>
        )}
      </div>
      <Link href="/admin/inbox" style={{ display: 'block', textAlign: 'center', width: '100%', marginTop: 16, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 8, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' }}>OPEN FULL INBOX →</Link>
    </div>
  );
}