'use client';

import React, { useState } from 'react';

export interface ExpandableMotionPanelProps {
  title?: React.ReactNode;
  collapsedPreview: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'playlist' | 'monitor' | 'dashboard' | 'sponsor' | 'inventory';
  onExpand?: () => void;
  onCollapse?: () => void;
}

export default function ExpandableMotionPanel({
  title,
  collapsedPreview,
  children,
  defaultOpen = false,
  variant = 'playlist',
  onExpand,
  onCollapse
}: ExpandableMotionPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && onExpand) onExpand();
    if (!nextState && onCollapse) onCollapse();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'playlist': return { border: '#00FFFF', glow: 'rgba(0,229,255,0.4)' };
      case 'monitor': return { border: '#FF2DAA', glow: 'rgba(255,45,170,0.4)' };
      case 'sponsor': return { border: '#FFD700', glow: 'rgba(255,215,0,0.4)' };
      case 'dashboard': return { border: '#00FF88', glow: 'rgba(0,255,136,0.4)' };
      case 'inventory': return { border: '#AA2DFF', glow: 'rgba(170,45,255,0.4)' };
      default: return { border: '#444', glow: 'rgba(255,255,255,0.1)' };
    }
  };

  const colors = getVariantStyles();

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      background: isOpen ? 'rgba(8,14,38,0.75)' : 'rgba(8,14,38,0.95)',
      backdropFilter: isOpen ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: isOpen ? 'blur(20px)' : 'none',
      border: `1px solid ${isOpen ? colors.border : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '12px',
      boxShadow: isOpen ? `0 0 30px ${colors.glow}` : `0 0 10px rgba(0,0,0,0.5)`,
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      overflow: 'hidden',
      marginBottom: '20px',
      zIndex: isOpen ? 50 : 1
    }}>
      {/* Collapsed Header / Preview */}
      <div 
        onClick={toggleOpen}
        style={{ 
          cursor: 'pointer', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {title}
            <div style={{ 
              transform: `rotate(${isOpen ? 180 : 0}deg)`, 
              transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              fontSize: '14px',
              color: colors.border
            }}>
              ▼
            </div>
          </div>
        )}
        {collapsedPreview}
      </div>

      {/* Expanded Content with Grid Transition (Smooth Slide) */}
      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: isOpen ? '0 16px 16px 16px' : '0 16px', opacity: isOpen ? 1 : 0, transform: `translateY(${isOpen ? '0px' : '-10px'})`, transition: 'opacity 0.4s ease, transform 0.4s ease', transitionDelay: isOpen ? '0.1s' : '0s' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}