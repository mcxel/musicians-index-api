'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  YOPHO_SKIN_CATALOG,
  YoPhoSkin,
  YoPhoHotspot,
  getUnlockedSkinIds,
  unlockSkinById,
} from '@/lib/yopho/YoPhoSkinRegistry';
import YoPhoPortraitEditorDrawer from './YoPhoPortraitEditorDrawer';

interface YoPhoLivingCanvasOSProps {
  performerName: string;
  performerSlug: string;
  performerCategory?: string;
  performerImageUrl?: string;
  performerBio?: string;
  isLive?: boolean;
  activeTracks?: Array<{ title: string; durationSec: number }>;
}

/**
 * YoPho Living Canvas OS & $0.99 Skin Marketplace Runtime
 *
 * Layers:
 * - Layer 0 (z:0): Ambient Looping MP4 Room Background
 * - Layer 1 (z:1): Weather & Lightning MP4 Underlay (Showering Lightning Video)
 * - Layer 2 (z:2): Audio-Reactive Micro-Animations (Vinyl Spin, Neon Pulse, Speaker Shake)
 * - Layer 3 (z:3): Performer Subject Cutout Layer (3D room stage framing)
 * - Layer 4 (z:4): Interactive Hotspot Bounding Boxes (Monitors, TV, Laptop, Trophies, Merch, Door, Window)
 * - Layer 5 (z:5): Audio Player & Ambience Control Rail
 * - Layer 6 (z:6): $0.99 Skin Marketplace & Customizer Drawer
 */
export default function YoPhoLivingCanvasOS({
  performerName,
  performerSlug,
  performerCategory = 'Hip-Hop',
  performerImageUrl = '/bot-images/Bot image 1.png',
  performerBio = 'Create, perform, headline. Welcome to my living stage.',
  isLive = false,
  activeTracks = [
    { title: 'TMI Anthem (YoPho Master Cut)', durationSec: 184 },
    { title: 'Universal Stage (Live Session)', durationSec: 210 },
    { title: 'Beat Lab Session (Midnight Mix)', durationSec: 165 },
  ],
}: YoPhoLivingCanvasOSProps) {
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(['urban-loft-starter']);
  const [activeSkin, setActiveSkin] = useState<YoPhoSkin>(YOPHO_SKIN_CATALOG[0]!);
  
  // Media states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [ambientSoundActive, setAmbientSoundActive] = useState(true);
  const [showeringLightningActive, setShoweringLightningActive] = useState(true);
  
  // UI Drawers & Modals
  const [activeHotspot, setActiveHotspot] = useState<YoPhoHotspot | null>(null);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isPortraitEditorOpen, setIsPortraitEditorOpen] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  
  // Audio reactivity pulse
  const [beatPulse, setBeatPulse] = useState(1);

  // Sync unlocked skins on mount
  useEffect(() => {
    const ids = getUnlockedSkinIds();
    setUnlockedSkinIds(ids);
  }, []);

  // Audio reactivity pulse ticker when music plays
  useEffect(() => {
    if (!isPlaying) {
      setBeatPulse(1);
      return;
    }
    const interval = setInterval(() => {
      setBeatPulse(1 + Math.random() * 0.15);
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentTrack = activeTracks[currentTrackIdx] || activeTracks[0]!;

  const handleBuySkin = (skin: YoPhoSkin) => {
    setPurchaseStatus(`Processing $${skin.priceUsd.toFixed(2)} purchase...`);
    setTimeout(() => {
      unlockSkinById(skin.id);
      setUnlockedSkinIds(getUnlockedSkinIds());
      setActiveSkin(skin);
      setPurchaseStatus(`🎉 Skin unlocked! Unlocked "${skin.name}". +100 XP Earned!`);
      setTimeout(() => setPurchaseStatus(null), 3000);
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '85vh',
        minHeight: 580,
        maxHeight: 900,
        borderRadius: 18,
        overflow: 'hidden',
        border: `3px solid ${activeSkin.accentColor}`,
        boxShadow: `0 0 35px ${activeSkin.accentColor}44, inset 0 0 20px rgba(0,0,0,0.8)`,
        background: '#03030c',
        fontFamily: "'Inter', sans-serif",
        userSelect: 'none',
      }}
    >
      {/* ── Keyframe Animations for Audio-Reactive Micro-Elements ── */}
      <style jsx global>{`
        @keyframes vinylSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes neonPulseGlow {
          0%, 100% { filter: drop-shadow(0 0 6px ${activeSkin.accentColor}); }
          50% { filter: drop-shadow(0 0 20px ${activeSkin.secondaryColor}); }
        }
        @keyframes lightningShowerPulse {
          0% { opacity: 0.2; transform: scaleY(0.95); }
          20% { opacity: 0.9; transform: scaleY(1.05); }
          40% { opacity: 0.3; }
          60% { opacity: 0.95; }
          100% { opacity: 0.2; transform: scaleY(1); }
        }
        @keyframes hotspotPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px ${activeSkin.accentColor}; }
          50% { transform: scale(1.12); box-shadow: 0 0 25px ${activeSkin.accentColor}; }
        }
      `}</style>

      {/* ── Layer 0: Looping Ambient MP4 Room Base ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <video
          key={activeSkin.videoBgUrl}
          src={activeSkin.videoBgUrl}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: `brightness(${0.85 * beatPulse}) contrast(1.05)`,
            transition: 'filter 0.3s ease',
          }}
        />
      </div>

      {/* ── Layer 1: Weather & Showering Lightning MP4 Underlay ── */}
      {showeringLightningActive && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.65 }}>
          <video
            src="/banners/lightning/28067-367411324_medium Lightning 1.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'hue-rotate(200deg) saturate(1.8)',
            }}
          />
        </div>
      )}

      {/* ── Layer 2: Audio-Reactive Micro-Animations (Vinyl Record & Equalizer) ── */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Spinning Vinyl Record Disc */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #111 20%, #222 40%, #000 70%)',
            border: `2px solid ${activeSkin.accentColor}`,
            boxShadow: `0 0 15px ${activeSkin.accentColor}77`,
            animation: isPlaying ? 'vinylSpin 3s linear infinite' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: activeSkin.secondaryColor }} />
        </div>

        {/* Audio Equalizer Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24 }}>
          {[18, 24, 12, 28, 20, 14].map((h, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: isPlaying ? `${Math.min(24, Math.max(6, h * beatPulse))}` : 6,
                background: activeSkin.accentColor,
                borderRadius: 2,
                transition: 'height 0.15s ease',
                boxShadow: `0 0 6px ${activeSkin.accentColor}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Layer 3: Subject Identity Cutout Layer ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 170,
            height: 230,
            filter: `drop-shadow(0 0 25px ${activeSkin.accentColor}aa)`,
            transition: 'transform 0.3s ease',
            transform: `scale(${beatPulse})`,
          }}
        >
          <Image
            src={performerImageUrl}
            alt={performerName}
            fill
            sizes="200px"
            style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
          />
        </div>
      </div>

      {/* ── Layer 4: Interactive Hotspot Bounding Boxes ── */}
      {activeSkin.hotspots.map((spot) => (
        <div
          key={spot.id}
          style={{
            position: 'absolute',
            left: `${spot.xPercent}%`,
            top: `${spot.yPercent}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 4,
            cursor: 'pointer',
          }}
          onClick={() => setActiveHotspot(spot)}
        >
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              background: 'rgba(5,5,18,0.85)',
              border: `2px solid ${activeSkin.accentColor}`,
              color: '#fff',
              fontSize: 10,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 0 14px ${activeSkin.accentColor}77`,
              animation: 'hotspotPulse 2.5s infinite',
              backdropFilter: 'blur(6px)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 13 }}>{spot.icon}</span>
            <span>{spot.name}</span>
          </div>
        </div>
      ))}

      {/* ── Header Branding & Skin Customizer Action ── */}
      <div style={{ position: 'absolute', top: 16, left: 18, zIndex: 5, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', color: activeSkin.accentColor, textTransform: 'uppercase' }}>
            YOPHO LIVING CANVAS OS
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', textShadow: '0 2px 8px #000' }}>
            {performerName} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>({activeSkin.name})</span>
          </div>
        </div>

        {isLive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,32,32,0.2)', border: '1px solid #FF2020', borderRadius: 12, padding: '3px 8px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2020', boxShadow: '0 0 6px #FF2020' }} />
            <span style={{ fontSize: 8, fontWeight: 900, color: '#FF2020', letterSpacing: '0.1em' }}>LIVE ON STAGE</span>
          </div>
        )}
      </div>

      {/* ── Layer 5: Audio Player & Ambience Control Bottom Rail ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 16,
          right: 16,
          zIndex: 5,
          background: 'rgba(4,2,14,0.88)',
          border: `1px solid ${activeSkin.accentColor}55`,
          borderRadius: 14,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(10px)',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Track Title & Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: `linear-gradient(135deg, ${activeSkin.accentColor}, ${activeSkin.secondaryColor})`,
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              color: '#000',
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${activeSkin.accentColor}`,
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{currentTrack.title}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
              Track {currentTrackIdx + 1} of {activeTracks.length} · {Math.floor(currentTrack.durationSec / 60)}:{(currentTrack.durationSec % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Ambience & Showering Lightning Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShoweringLightningActive(!showeringLightningActive)}
            style={{
              background: showeringLightningActive ? `${activeSkin.accentColor}33` : 'transparent',
              border: `1px solid ${showeringLightningActive ? activeSkin.accentColor : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 9,
              fontWeight: 800,
              color: showeringLightningActive ? activeSkin.accentColor : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            ⚡ Shower Lightning: {showeringLightningActive ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setIsPortraitEditorOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #00E5FF, #FF2DAA)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 10,
              fontWeight: 900,
              color: '#050510',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0,229,255,0.6)',
              letterSpacing: '0.05em',
            }}
          >
            🎭 PORTRAIT ENGINE
          </button>

          <button
            onClick={() => setIsMarketplaceOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FF9500)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 10,
              fontWeight: 900,
              color: '#050510',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255,215,0,0.5)',
              letterSpacing: '0.05em',
            }}
          >
            🏷️ $0.99 SKIN STORE ({YOPHO_SKIN_CATALOG.length} SKINS)
          </button>
        </div>
      </div>

      {/* ── Hotspot Drawer Modal ── */}
      {activeHotspot && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: 'rgba(3,1,10,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setActiveHotspot(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#090616',
              border: `2px solid ${activeSkin.accentColor}`,
              borderRadius: 16,
              padding: 24,
              boxShadow: `0 0 40px ${activeSkin.accentColor}55`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{activeHotspot.icon}</span> {activeHotspot.name}
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 20 }}>
              {activeHotspot.description}
            </div>

            {activeHotspot.actionType === 'playlist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {activeTracks.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentTrackIdx(idx); setIsPlaying(true); setActiveHotspot(null); }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: idx === currentTrackIdx ? `${activeSkin.accentColor}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${idx === currentTrackIdx ? activeSkin.accentColor : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <span>▶ {t.title}</span>
                    <span style={{ color: activeSkin.accentColor }}>{Math.floor(t.durationSec/60)}:{(t.durationSec%60).toString().padStart(2,'0')}</span>
                  </button>
                ))}
              </div>
            )}

            {activeHotspot.actionType === 'live' && (
              <Link
                href={`/live/rooms/performer-${performerSlug}`}
                style={{ display: 'block', padding: '12px', textAlign: 'center', background: 'linear-gradient(135deg,#FF2020,#FF5050)', color: '#fff', borderRadius: 8, fontWeight: 900, fontSize: 11, textDecoration: 'none' }}
              >
                ENTER STAGE LIVE NOW →
              </Link>
            )}

            {activeHotspot.actionType !== 'live' && (
              <button
                onClick={() => setActiveHotspot(null)}
                style={{ width: '100%', padding: 10, background: activeSkin.accentColor, color: '#000', fontWeight: 900, fontSize: 10, borderRadius: 8, border: 'none', cursor: 'pointer' }}
              >
                CLOSE HOTSPOT
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── $0.99 YoPho Skin Marketplace Drawer ── */}
      {isMarketplaceOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: 'rgba(2,1,8,0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#FFD700', letterSpacing: '0.15em' }}>
                YOPHO SKIN MARKETPLACE · $0.99 STORE
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>
                Customize Your YOphO Digital Stage World
              </div>
            </div>
            <button
              onClick={() => setIsMarketplaceOpen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', fontSize: 16 }}
            >
              ✕
            </button>
          </div>

          {purchaseStatus && (
            <div style={{ background: 'rgba(0,255,136,0.18)', border: '1px solid #00FF88', borderRadius: 10, padding: 12, color: '#00FF88', fontWeight: 800, fontSize: 11, marginBottom: 16, textAlign: 'center' }}>
              {purchaseStatus}
            </div>
          )}

          {/* Skin Catalog Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {YOPHO_SKIN_CATALOG.map((skin) => {
              const isUnlocked = unlockedSkinIds.includes(skin.id);
              const isActive = activeSkin.id === skin.id;

              return (
                <div
                  key={skin.id}
                  style={{
                    background: '#0a0718',
                    border: `2px solid ${isActive ? '#FFD700' : isUnlocked ? skin.accentColor : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8,
                    boxShadow: isActive ? '0 0 20px rgba(255,215,0,0.5)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{skin.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: skin.priceUsd === 0 ? '#00FF88' : '#FFD700', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                        {skin.priceUsd === 0 ? 'FREE' : `$${skin.priceUsd.toFixed(2)}`}
                      </span>
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                      {skin.tagline}
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <div style={{ padding: '6px', textAlign: 'center', background: '#FFD700', color: '#000', borderRadius: 6, fontWeight: 900, fontSize: 9 }}>
                        ✓ ACTIVE STAGE
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => { setActiveSkin(skin); setIsMarketplaceOpen(false); }}
                        style={{ width: '100%', padding: '6px', background: skin.accentColor, color: '#000', borderRadius: 6, fontWeight: 900, fontSize: 9, border: 'none', cursor: 'pointer' }}
                      >
                        EQUIP SKIN
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuySkin(skin)}
                        style={{ width: '100%', padding: '6px', background: 'linear-gradient(135deg,#FFD700,#FF9500)', color: '#050510', borderRadius: 6, fontWeight: 900, fontSize: 9, border: 'none', cursor: 'pointer' }}
                      >
                        BUY SKIN FOR $0.99
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── YoPho Portrait Composition Engine Drawer ── */}
      <YoPhoPortraitEditorDrawer
        isOpen={isPortraitEditorOpen}
        onClose={() => setIsPortraitEditorOpen(false)}
        userRole="performer"
        userTier="DIAMOND"
        userName={performerName}
      />
    </div>
  );
}
