'use client';

import { useEffect, useState } from 'react';

interface ShareEvent {
  userId: string;
  memoryId: string;
  userName: string;
}

interface ToastEntry extends ShareEvent {
  id: string;
}

export default function MemoryShareToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  useEffect(() => {
    function handleShare(e: Event) {
      const detail = (e as CustomEvent<ShareEvent>).detail;
      const entry: ToastEntry = {
        ...detail,
        id: `toast_${Date.now()}`,
      };
      setToasts(prev => [...prev, entry].slice(-3));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== entry.id));
      }, 5200);
    }

    window.addEventListener('TMI_MEMORY_SHARED', handleShare);
    return () => window.removeEventListener('TMI_MEMORY_SHARED', handleShare);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 60, right: 12, zIndex: 99985,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: 'rgba(5,5,16,0.94)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,45,170,0.35)',
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            minWidth: 220, maxWidth: 280,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,45,170,0.15)',
            animation: 'tmiShareCardIn 0.32s cubic-bezier(0.22,1,0.36,1)',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>📸</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 8, fontWeight: 900, letterSpacing: '0.14em',
              color: '#FF2DAA', marginBottom: 2,
            }}>
              MEMORY SHARED
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {toast.userName} shared a memory
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button style={{
              background: 'rgba(255,45,170,0.15)', border: '1px solid rgba(255,45,170,0.3)',
              borderRadius: 4, padding: '3px 7px',
              fontSize: 9, fontWeight: 800, color: '#FF2DAA', cursor: 'pointer',
            }}>
              ♡
            </button>
            <button style={{
              background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)',
              borderRadius: 4, padding: '3px 7px',
              fontSize: 9, fontWeight: 800, color: '#00FF88', cursor: 'pointer',
            }}>
              +
            </button>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes tmiShareCardIn {
          from { opacity: 0; transform: translateX(24px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
