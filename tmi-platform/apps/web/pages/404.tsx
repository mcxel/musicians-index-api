import React from 'react';

export default function Custom404Fallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050815', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '40px', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '12px', background: 'rgba(5, 8, 21, 0.8)' }}>
        <h1 style={{ fontSize: '48px', color: '#00E5FF', margin: '0 0 16px 0' }}>404</h1>
        <h2 style={{ fontSize: '20px', margin: '0 0 24px 0', color: 'rgba(255,255,255,0.8)' }}>Room Not Found</h2>
        <a href="/home/1" style={{ display: 'inline-block', padding: '12px 24px', background: '#FF2DAA', color: '#fff', textDecoration: 'none', borderRadius: '24px', fontWeight: 900, fontSize: '12px' }}>
          RETURN TO LOBBY
        </a>
      </div>
    </div>
  );
}