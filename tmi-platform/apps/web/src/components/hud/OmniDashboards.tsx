'use client';

import React, { useState } from 'react';
import MonitorSatelliteSystem from '@/components/canisters/MonitorSatelliteSystem';

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
        {/* OVERSEER DECK - BROADCAST COMMAND CENTER */}
        {activeTab === 'overseer' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(0,255,255,0.5)', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px' }}>
              <h2 style={{ color: '#00FFFF', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>OVERSEER DECK — BROADCAST COMMAND CENTER</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#00FF7F', fontSize: '12px', fontWeight: 800 }}>● NETWORK LIVE</span>
                <button style={{ background: '#E63000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 800, cursor: 'pointer', letterSpacing: '1px' }}>⚠ TRUST KILLER FEED</button>
              </div>
            </div>

            {/* Multi-Monitor Observatory Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <MonitorSatelliteSystem 
                mainLabel="ARENA TELEMETRY" 
                isLive={true} 
                staticImageUrl="/assets/generated/venues/the-underground-profile.jpg"
                accentColor="#E63000"
                adZone="admin-overseer-1"
                audienceCount={18500}
              />
              <MonitorSatelliteSystem 
                mainLabel="CYPHER FEED" 
                isLive={true} 
                staticImageUrl="/assets/generated/venues/cypher-dome-profile.jpg"
                accentColor="#00FFFF"
                adZone="admin-overseer-2"
                audienceCount={2730}
              />
              <MonitorSatelliteSystem 
                mainLabel="CHALLENGE FEED" 
                isLive={true} 
                staticImageUrl="/assets/generated/venues/battle-amphitheater-profile.jpg"
                accentColor="#FFD700"
                adZone="admin-overseer-3"
                audienceCount={5000}
              />
              <MonitorSatelliteSystem 
                mainLabel="FAN LOBBY FEED" 
                isLive={true} 
                staticImageUrl="/assets/generated/venues/neon-pit-profile.jpg"
                accentColor="#FF2DAA"
                adZone="admin-overseer-4"
                audienceCount={800}
              />
            </div>

            {/* Broadcast Telemetry */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: '👥', label: 'Network Audience', val: '27,030', trend: 'Live', color: '#00FF7F' },
                { icon: '🎤', label: 'Active Streams', val: '42', trend: '+5', color: '#00FFFF' },
                { icon: '⚔️', label: 'Battles Now', val: '8', trend: 'Steady', color: '#FFD700' },
                { icon: '🔥', label: 'Cyphers Now', val: '14', trend: '+2', color: '#FF2DAA' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(0,255,255,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(0,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '20px', color: '#fff', fontWeight: 900 }}>{stat.val}</div>
                  <div style={{ fontSize: '10px', color: stat.color, marginTop: '4px', fontWeight: 800 }}>{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN HUB */}
        {activeTab === 'admin' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,14,38,0.95)', border: '1px solid rgba(220,70,0,0.5)', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px' }}>
              <h2 style={{ color: '#E63000', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>SYSTEM ADMINISTRATION</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#00FF7F', fontSize: '12px', fontWeight: 800 }}>● CORE HEALTHY</span>
              </div>
            </div>

            {/* Financial & User Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: '👥', label: 'Total Users', val: '12,841', trend: '+124', color: '#00FF7F' },
                { icon: '🟢', label: 'Online Now', val: '1,204', trend: '+8', color: '#00FF7F' },
                { icon: '💳', label: 'Paid Members', val: '3,271', trend: '+22', color: '#00FF7F' },
                { icon: '💰', label: 'Revenue Today', val: '$8,940', trend: '+$1.2k', color: '#00FF7F' },
                { icon: '🎤', label: 'Live Now', val: '14', trend: '+3', color: '#00FF7F' },
                { icon: '📢', label: 'Ad Revenue', val: '$520', trend: '+$80', color: '#00E5FF' },
                { icon: '🤝', label: 'Pending Sponsors', val: '12', trend: 'Needs review', color: '#FFD700' },
                { icon: '⭐', label: 'Active Sponsors', val: '45', trend: '+3', color: '#00FF7F' },
                { icon: '⏳', label: 'Expired Sponsors', val: '8', trend: '-2', color: '#FF4444' },
                { icon: '📅', label: 'Booking Requests', val: '28', trend: '8 pending', color: '#FF2DAA' },
                { icon: '🚚', label: 'Logistics Quotes', val: '15', trend: '+$4.2k est', color: '#00FFFF' },
                { icon: '💎', label: 'Sponsor Rev', val: '$12,450', trend: '+$2.1k', color: '#00FF88' },
                { icon: '🎟️', label: 'Booking Rev', val: '$8,200', trend: '+$900', color: '#00FF88' },
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
        {activeTab !== 'admin' && activeTab !== 'overseer' && <div style={{ color: '#FFD700', textAlign: 'center', padding: '40px', fontSize: '18px', fontWeight: 900 }}>[ {activeTab.toUpperCase()} MODULE LOADED ]</div>}
      </div>
    </div>
  );
}