"use client";

import React from 'react';

export const ModuleContainer = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  return (
    <div style={{ position: 'relative', border: '2px solid transparent', padding: 12, background: 'rgba(10,10,12,0.9)', boxShadow: '0 6px 24px rgba(0,0,0,0.6)', borderRadius: 8, borderImageSource: 'linear-gradient(45deg, #d4af37, #f9f295)', borderImageSlice: 1 }}>
      {/* Crystal Corner Ornaments */}
      <div style={{ position: 'absolute', top: -8, left: -8, width: 16, height: 16, background: '#5b21b6', transform: 'rotate(45deg)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, background: '#5b21b6', transform: 'rotate(45deg)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', bottom: -8, left: -8, width: 16, height: 16, background: '#5b21b6', transform: 'rotate(45deg)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', bottom: -8, right: -8, width: 16, height: 16, background: '#5b21b6', transform: 'rotate(45deg)', borderRadius: 2 }} />

      {title && (
        <h3 style={{ color: '#FFD700', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 12, margin: '0 0 8px 0', borderBottom: '1px solid rgba(255,215,0,0.12)', paddingBottom: 6 }}>{title}</h3>
      )}

      <div style={{ padding: 4 }}>{children}</div>
    </div>
  );
};

export default ModuleContainer;
