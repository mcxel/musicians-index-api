import React from 'react';

export default function Custom500Fallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050815', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '40px', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: '12px', background: 'rgba(20, 0, 0, 0.8)' }}>
        <h1 style={{ fontSize: '48px', color: '#ff4444', margin: '0 0 16px 0' }}>500</h1>
        <h2 style={{ fontSize: '20px', margin: '0 0 24px 0', color: 'rgba(255,255,255,0.8)' }}>System Failure</h2>
        <a href="/home/1" style={{ display: 'inline-block', padding: '12px 24px', background: '#ff4444', color: '#fff', textDecoration: 'none', borderRadius: '24px', fontWeight: 900, fontSize: '12px' }}>
          REBOOT SYSTEM
        </a>
      </div>
    </div>
  );
}