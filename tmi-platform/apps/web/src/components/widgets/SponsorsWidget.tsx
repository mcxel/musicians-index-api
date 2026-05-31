"use client";
import { useState } from 'react';

export default function SponsorsWidget() {
  const [activeSponsors] = useState([
    { id: 'pizza-guys', name: 'Pizza Guys', status: 'Active', earnings: '$124.50' },
    { id: 'habit-burger', name: 'Habit Burger', status: 'Pending', earnings: '$0.00' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 10 }}>
        <h4 style={{ margin: '0 0 12px', color: '#00FFFF', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 900 }}>Active Ad Campaigns</h4>
        {activeSponsors.map(s => (
          <div key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Earnings: {s.earnings}</div>
            </div>
            <span style={{ fontSize: 9, padding: '4px 8px', borderRadius: 4, background: s.status === 'Active' ? 'rgba(0,255,136,0.2)' : 'rgba(255,215,0,0.2)', color: s.status === 'Active' ? '#00FF88' : '#FFD700' }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
      <button style={{ width: '100%', padding: 12, background: '#FFD700', color: '#000', borderRadius: 6, fontWeight: 800, fontSize: 11, cursor: 'pointer', border: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Request New Sponsor
      </button>
    </div>
  );
}