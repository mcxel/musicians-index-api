'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  accentColor?: string;
  children: React.ReactNode;
  width?: number;
  position?: 'left' | 'right';
  style?: React.CSSProperties;
}

export default function FloatingPanel({
  isOpen,
  onClose,
  title,
  icon = '📊',
  accentColor = '#AA2DFF',
  children,
  width = 320,
  position = 'right',
  style,
}: FloatingPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: position === 'right' ? 80 : -80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: position === 'right' ? 80 : -80, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'fixed',
            top: '80px',
            [position]: '20px',
            width: `${width}px`,
            maxHeight: 'calc(100vh - 180px)',
            zIndex: 8500,
            background: 'rgba(5, 5, 20, 0.85)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${accentColor}50`,
            borderRadius: '16px',
            boxShadow: `0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px ${accentColor}15`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
            color: '#fff',
            ...style,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: `linear-gradient(90deg, ${accentColor}10, transparent)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>
                {title}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 14,
                cursor: 'pointer',
                padding: '4px',
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div
            style={{
              padding: '16px 18px',
              overflowY: 'auto',
              flex: 1,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
