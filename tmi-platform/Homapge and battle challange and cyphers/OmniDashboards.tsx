'use client';

import React, { useState } from 'react';

export default function OmniDashboards() {
  const [activeTab, setActiveTab] = useState<'fan' | 'artist' | 'overseer' | 'admin'>('admin');
  
  return (
    <div style={{ background: '#050815', minHeight: '100vh', color: '#FF8C00', fontFamily: 'var(--font-orbitron), sans-serif' }}>
      {/* Navigation */}
      <div style={{ display: 'flex', background: '#030610', borderBottom: '1px solid rgba(220,70,0,0.5)', padding: '10px 20px', gap: '12px' }}>
        {[
          { id: 'fan', label: '🎭 FAN THEATER' },
          { id: 'artist', label: '🎤 ARTIST STUDIO' },
          { id: 'overseer', label: '👁 OVERSEER DECK' },
          { id: 'admin', label: '⚙️ ADMIN HUB' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            style={{ 
              background: activeTab === tab.id ? 'rgba(230,48,0,0.2)' : 'transparent',
              color: activeTab === tab.id ? '#FFD700' : 'rgba(255,140,0,0.5)',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid #E63000' : 'none',
              padding: '8px 16px', fontWeight: 800, cursor: 'pointer', borderRadius: '4px'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>
        {/* ADMIN HUB */}
        {activeTab === 'admin' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h2 style={{ color: '#E63000', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>BerntoutGlobal — Administration Hub</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#00FF7F', fontSize: '12px', fontWeight: 800 }}>● SYSTEM ONLINE</span>
                <button style={{ background: '#E63000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 800, cursor: 'pointer' }}>⚠ Trust Killer Feed</button>
              </div>
            </div>

            {/* Live Telemetry Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: '👥', label: 'Total Users', val: '12,841', trend: '+124', color: '#00FF7F' },
                { icon: '🟢', label: 'Online Now', val: '1,204', trend: '+8', color: '#00FF7F' },
                { icon: '💳', label: 'Paid Members', val: '3,271', trend: '+22', color: '#00FF7F' },
                { icon: '💰', label: 'Revenue Today', val: '$8,940', trend: '+$1.2k', color: '#00FF7F' },
                { icon: '🎤', label: 'Live Now', val: '14', trend: '+3', color: '#00FF7F' },
                { icon: '📢', label: 'Ad Revenue', val: '$520', trend: '+$80', color: '#00E5FF' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,140,0,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '20px', color: '#FFD700', fontWeight: 900 }}>{stat.val}</div>
                  <div style={{ fontSize: '10px', color: stat.color, marginTop: '4px', fontWeight: 800 }}>{stat.trend}</div>
                </div>
              ))}
            </div>

            {/* System Health Monitors */}
            <div style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#FF8C00', fontSize: '14px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>System Health Monitors</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Auth Service', status: 'Operational', color: '#00FF7F' },
                  { label: 'PostgreSQL', status: 'Operational', color: '#00FF7F' },
                  { label: 'Stripe Hooks', status: 'Operational', color: '#00FF7F' },
                  { label: 'WebRTC', status: 'Operational', color: '#00FF7F' },
                  { label: 'Redis Cache', status: 'Degraded', color: '#FFD700' },
                  { label: 'CDN Storage', status: 'Operational', color: '#00FF7F' },
                ].map(sys => (
                  <div key={sys.label} style={{ background: 'rgba(12,20,50,0.9)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(220,70,0,0.3)', textAlign: 'center' }}>
                    <div style={{ color: sys.color, marginBottom: '6px', fontSize: '14px' }}>●</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,140,0,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>{sys.label}</div>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: sys.color }}>{sys.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Other tabs can be expanded similarly */}
        {activeTab !== 'admin' && <div style={{ color: '#FFD700', textAlign: 'center', padding: '40px', fontSize: '18px', fontWeight: 900 }}>[ {activeTab.toUpperCase()} MODULE LOADED ]</div>}
      </div>
    </div>
  );
}