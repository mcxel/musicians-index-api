'use client';

import React, { useState } from 'react';

export interface InventoryPanelOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAvatarStudio?: () => void;
  /** Opens full Avatar Inventory in floating workspace */
  onViewAll?: () => void;
}

export default function InventoryPanelOverlay({
  isOpen,
  onClose,
  onOpenAvatarStudio,
  onViewAll,
}: InventoryPanelOverlayProps) {
  const [activeTab, setActiveTab] = useState<'avatar' | 'wearables' | 'items' | 'emotes'>('avatar');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 110,
        zIndex: 9500,
        width: 'auto',
        maxWidth: 360,
        maxHeight: 'min(70dvh, 520px)',
        marginLeft: 'auto',
        marginRight: 'auto',
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 45, 170, 0.35)',
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 45, 170, 0.2)',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', color: '#fff', margin: 0 }}>
          INVENTORY
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 16,
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs + body scroll as one owner (P0-04 · 390×844 reachable) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
      {/* Sub Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: 3,
          marginBottom: 16,
        }}
      >
        {(['avatar', 'wearables', 'items', 'emotes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: 'none',
              background: activeTab === tab ? 'linear-gradient(135deg,#FF2DAA,#AA2DFF)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3D Avatar Pedestal Preview */}
      <div
        style={{
          width: '100%',
          height: 200,
          borderRadius: 12,
          background: 'radial-gradient(circle at 50% 70%, rgba(170,45,255,0.3) 0%, rgba(5,5,16,0.9) 70%)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: 14,
          overflow: 'hidden',
        }}
      >
        {/* Illuminated Pedestal Platform */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            width: 140,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(170,45,255,0.2)',
            border: '2px solid #AA2DFF',
            boxShadow: '0 0 20px #AA2DFF, inset 0 0 10px #AA2DFF',
          }}
        />

        {/* Honest empty pedestal — no stock/Unsplash stand-in (Rule 20) */}
        <div
          style={{
            width: 110,
            height: 140,
            borderRadius: 16,
            border: '1.5px dashed rgba(0,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            fontSize: 9,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.08em',
            textAlign: 'center',
            padding: 8,
          }}
        >
          OPEN AVATAR STUDIO
        </div>
      </div>

      {/* Item Selector Slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {['🧢 Cap', '🕶️ Glasses', '🧥 Jacket', '👟 Kicks'].map((slot, idx) => (
          <div
            key={idx}
            style={{
              height: 48,
              borderRadius: 8,
              background: idx === 0 ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: idx === 0 ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {slot}
          </div>
        ))}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onOpenAvatarStudio || onClose}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 10,
          background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)',
          border: 'none',
          color: '#fff',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255,45,170,0.4)',
        }}
      >
        CUSTOMIZE AVATAR
      </button>
      {onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '10px 0',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(170,45,255,0.4)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          VIEW ALL INVENTORY
        </button>
      ) : null}
      </div>
    </div>
  );
}
