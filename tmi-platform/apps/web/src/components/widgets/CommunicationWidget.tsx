"use client";
import { useState } from 'react';
import MessagesWidget from './MessagesWidget';

type CommTab = 'CHAT' | 'FRIENDS' | 'GROUPS' | 'CALLS';

export default function CommunicationWidget() {
  const [activeTab, setActiveTab] = useState<CommTab>('CHAT');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Terminal Header Tabs */}
      <div style={{ 
        display: 'flex', gap: 4, background: 'rgba(5,5,16,0.8)', 
        padding: '6px', borderRadius: 10, border: '1px solid rgba(0,255,255,0.2)', marginBottom: 16 
      }}>
        {(['CHAT', 'FRIENDS', 'GROUPS', 'CALLS'] as CommTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 0', fontSize: 10, fontWeight: 800, cursor: 'pointer',
              borderRadius: 6, border: 'none', transition: 'all 0.2s', letterSpacing: '0.1em',
              background: activeTab === tab ? 'rgba(0,255,255,0.15)' : 'transparent',
              color: activeTab === tab ? '#00FFFF' : 'rgba(255,255,255,0.4)',
              boxShadow: activeTab === tab ? 'inset 0 0 10px rgba(0,255,255,0.1)' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Terminal Screen Surface */}
      <div style={{ 
        flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.4)', 
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
      }} className="tmi-scroll">
        
        {activeTab === 'CHAT' && <MessagesWidget />}
        
        {activeTab === 'FRIENDS' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 11, color: '#00FFFF', fontWeight: 800, letterSpacing: '0.1em' }}>FRIENDS NETWORK</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>12 Online Now</div>
          </div>
        )}

        {activeTab === 'GROUPS' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
            <div style={{ fontSize: 11, color: '#AA2DFF', fontWeight: 800, letterSpacing: '0.1em' }}>COMMUNITY LOUNGES</div>
            <button style={{ 
              marginTop: 16, padding: '10px 20px', background: 'rgba(170,45,255,0.15)', 
              border: '1px solid #AA2DFF', color: '#AA2DFF', borderRadius: 8, 
              fontSize: 10, fontWeight: 900, cursor: 'pointer' 
            }}>
              + CREATE GROUP
            </button>
          </div>
        )}

        {activeTab === 'CALLS' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📹</div>
            <div style={{ fontSize: 11, color: '#00FF88', fontWeight: 800, letterSpacing: '0.1em' }}>TMI CONNECT</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button style={{ padding: '8px 16px', background: 'rgba(0,255,136,0.15)', border: '1px solid #00FF88', color: '#00FF88', borderRadius: 8, fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>1-ON-1</button>
              <button style={{ padding: '8px 16px', background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD700', color: '#FFD700', borderRadius: 8, fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>GROUP</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}