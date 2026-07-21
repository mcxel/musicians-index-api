'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  FLEX_STORE_CATALOG,
  FlexStoreItem,
  FlexItemType,
  getOwnedEntitlementIds,
  isItemOwned,
  purchaseFlexItem,
  formatFlexPrice,
} from '@/lib/store/FlexStoreLedger';

const AvatarLobbyCanvas = dynamic(() => import('@/components/3d/AvatarLobbyCanvas'), { ssr: false });

interface FlexStoreShowroomProps {
  initialWing?: 'apparel' | 'emotes' | 'yopho' | 'beats' | 'passes' | 'locker';
  initialTrackId?: string;
}

export default function FlexStoreShowroom({ initialWing = 'apparel', initialTrackId }: FlexStoreShowroomProps) {
  const [activeWing, setActiveWing] = useState<'apparel' | 'emotes' | 'yopho' | 'beats' | 'passes' | 'locker'>(initialWing);
  const [selectedItem, setSelectedItem] = useState<FlexStoreItem>(FLEX_STORE_CATALOG[0]!);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);
  const [activeEmoteAnimation, setActiveEmoteAnimation] = useState<string | null>(null);

  useEffect(() => {
    setOwnedIds(getOwnedEntitlementIds());
  }, []);

  const handleBuy = (item: FlexStoreItem) => {
    const res = purchaseFlexItem(item.id);
    setPurchaseMsg(res.message);
    setOwnedIds(getOwnedEntitlementIds());
    setTimeout(() => setPurchaseMsg(null), 3000);
  };

  const handlePreviewEmote = (item: FlexStoreItem) => {
    setActiveEmoteAnimation(item.preview.animationUrl || 'hearts_burst');
    setTimeout(() => setActiveEmoteAnimation(null), 2500);
  };

  // Filter Catalog by active Wing
  const getFilteredItems = (): FlexStoreItem[] => {
    switch (activeWing) {
      case 'apparel':
        return FLEX_STORE_CATALOG.filter((i) => i.itemType === 'APPAREL' || i.itemType === 'HAIR' || i.itemType === 'ACCESSORY');
      case 'emotes':
        return FLEX_STORE_CATALOG.filter((i) => i.itemType === 'EMOTE');
      case 'yopho':
        return FLEX_STORE_CATALOG.filter((i) => i.itemType === 'YOPHO_TEMPLATE' || i.itemType === 'PLAYLIST_SKIN' || i.itemType === 'PROMOTION_BOOSTER');
      case 'beats':
        return FLEX_STORE_CATALOG.filter((i) => i.itemType === 'BEAT_LICENSE' || i.itemType === 'NFT_COLLECTIBLE');
      case 'passes':
        return FLEX_STORE_CATALOG.filter((i) => i.itemType === 'SEASON_PASS');
      case 'locker':
        return FLEX_STORE_CATALOG.filter((i) => ownedIds.includes(i.id));
      default:
        return FLEX_STORE_CATALOG;
    }
  };

  const filteredItems = getFilteredItems();
  const ownedCount = ownedIds.length;
  const totalCatalogCount = FLEX_STORE_CATALOG.length;
  const collectionCompletionPercent = Math.round((ownedCount / totalCatalogCount) * 100);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#04020a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Header Bar ── */}
      <div
        style={{
          padding: '16px 28px',
          background: 'rgba(6, 2, 20, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>🏛️</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>
              TMI 3D PHOTOREALISTIC FLEX STORE
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              Photorealistic Avatar Apparel · Animated Emotes · YoPho Upgrades · Beats & NFTs · Micro-Pricing ($0.99 - $4.99)
            </div>
          </div>
        </div>

        {/* Collection Tracker Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: 'rgba(255, 215, 0, 0.12)',
              border: '1px solid #FFD700',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 10,
              fontWeight: 900,
              color: '#FFD700',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🏆 MY LOCKER: {ownedCount} OWNED</span>
            <span style={{ color: '#00E5FF' }}>({collectionCompletionPercent}% COMPLETE)</span>
          </div>

          <Link
            href="/hub/fan"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 10,
              fontWeight: 900,
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            RETURN TO HUB
          </Link>
        </div>
      </div>

      {/* ── Main Stage: 3D Showroom Stage (Left) & Wings Catalog (Right) ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Column: Photorealistic 3D Inspection Canvas */}
        <div
          style={{
            flex: 1.3,
            position: 'relative',
            background: 'radial-gradient(ellipse at 50% 40%, rgba(0, 229, 255, 0.15) 0%, rgba(255, 45, 170, 0.08) 50%, #020108 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 24,
          }}
        >
          {/* 3D Canvas Mount */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <AvatarLobbyCanvas />
          </div>

          {/* Top Stage Overlay Info */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(5,3,18,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 12, padding: '10px 16px' }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.15em' }}>
                SHOWROOM STAGE INSPECTOR
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 2 }}>
                {selectedItem.name}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                {selectedItem.description}
              </div>
            </div>

            {/* 7-Day Rotation Countdown */}
            {selectedItem.rotationExpiresAt && (
              <div style={{ background: 'rgba(255,45,170,0.2)', border: '1px solid #FF2DAA', borderRadius: 20, padding: '6px 14px', fontSize: 10, fontWeight: 900, color: '#FF2DAA' }}>
                ⏰ ROTATION EXPIRES IN 5 DAYS
              </div>
            )}
          </div>

          {/* Emote Particle Animation Trigger Effect */}
          {activeEmoteAnimation && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 72, animation: 'emoteBurst 1.2s infinite ease-in-out' }}>
                💖 🔥 ✨ 👑 💖
              </div>
            </div>
          )}

          {/* Bottom Stage Action Rail */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5,3,18,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 20px' }}>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>MICRO-PRICE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#FFD700' }}>
                {formatFlexPrice(selectedItem.priceCents)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {selectedItem.itemType === 'EMOTE' && (
                <button
                  onClick={() => handlePreviewEmote(selectedItem)}
                  style={{
                    background: 'rgba(0,229,255,0.2)',
                    border: '1px solid #00E5FF',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 11,
                    fontWeight: 900,
                    color: '#00E5FF',
                    cursor: 'pointer',
                  }}
                >
                  ✨ TEST 3D ANIMATION
                </button>
              )}

              {isItemOwned(selectedItem.id) ? (
                <button
                  style={{
                    background: '#00FF88',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: 12,
                    fontWeight: 900,
                    color: '#000',
                  }}
                >
                  ✓ EQUIPPED IN LOCKER
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(selectedItem)}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FF9500)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: 12,
                    fontWeight: 900,
                    color: '#050510',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255,215,0,0.6)',
                  }}
                >
                  ⚡ UNLOCK FOR {formatFlexPrice(selectedItem.priceCents)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Showroom Wings & Item Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090518', borderLeft: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {/* Wing Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', background: 'rgba(4,2,12,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'apparel', label: '👗 APPAREL', icon: '🧥' },
              { id: 'emotes', label: '💃 EMOTES', icon: '💖' },
              { id: 'yopho', label: '🎨 YOPHO', icon: '🖼️' },
              { id: 'beats', label: '🎧 BEATS & NFTS', icon: '🎹' },
              { id: 'passes', label: '🎟️ PASSES', icon: '🎫' },
              { id: 'locker', label: '🏆 LOCKER', icon: '🔑' },
            ].map((wing) => (
              <button
                key={wing.id}
                onClick={() => setActiveWing(wing.id as any)}
                style={{
                  padding: '14px 4px',
                  fontSize: 9,
                  fontWeight: 900,
                  color: activeWing === wing.id ? '#00E5FF' : 'rgba(255,255,255,0.5)',
                  background: activeWing === wing.id ? 'rgba(0,229,255,0.14)' : 'transparent',
                  border: 'none',
                  borderBottom: activeWing === wing.id ? '2px solid #00E5FF' : 'none',
                  cursor: 'pointer',
                }}
              >
                {wing.label}
              </button>
            ))}
          </div>

          {/* Feedback Purchase Banner */}
          {purchaseMsg && (
            <div style={{ background: 'rgba(0,255,136,0.2)', borderBottom: '1px solid #00FF88', padding: '8px 16px', fontSize: 11, fontWeight: 900, color: '#00FF88', textAlign: 'center' }}>
              ✨ {purchaseMsg}
            </div>
          )}

          {/* Catalog Grid */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {filteredItems.map((item) => {
              const isSelected = selectedItem.id === item.id;
              const owned = isItemOwned(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    position: 'relative',
                    background: isSelected ? 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(255,45,170,0.15))' : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '2px solid #00E5FF' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 20px rgba(0,229,255,0.3)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                    {item.badge && (
                      <span style={{ fontSize: 8, fontWeight: 900, padding: '2px 6px', borderRadius: 4, background: item.badge === '7-DAY ROTATION' ? '#FF2DAA' : '#FFD700', color: '#000' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.3 }}>
                      {item.description}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#FFD700' }}>
                      {formatFlexPrice(item.priceCents)}
                    </div>
                    {owned ? (
                      <span style={{ fontSize: 9, fontWeight: 900, color: '#00FF88' }}>✓ OWNED</span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuy(item); }}
                        style={{ padding: '4px 10px', background: 'rgba(255,215,0,0.2)', border: '1px solid #FFD700', color: '#FFD700', borderRadius: 6, fontSize: 9, fontWeight: 900, cursor: 'pointer' }}
                      >
                        BUY
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
