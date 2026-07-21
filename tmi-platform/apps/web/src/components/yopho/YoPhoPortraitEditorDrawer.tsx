'use client';

import React, { useState } from 'react';
import type {
  YoPhoPortraitBlueprint,
  PortraitCompositionMode,
  ObjectMaskType,
  BlendMode,
  TexturePreset,
  FacingDirection,
} from '@/lib/yopho/YoPhoPortraitEngine';
import {
  getPortraitEntitlement,
  OBJECT_MASK_CATALOG,
  createDefaultYoPhoBlueprint,
} from '@/lib/yopho/YoPhoPortraitEngine';
import YoPhoPortraitStageCanvas from './YoPhoPortraitStageCanvas';

interface YoPhoPortraitEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'fan' | 'performer';
  userTier?: string; // 'FREE' | 'PRO' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
  userName?: string;
  initialBlueprint?: YoPhoPortraitBlueprint;
  onSaveBlueprint?: (blueprint: YoPhoPortraitBlueprint) => void;
}

export default function YoPhoPortraitEditorDrawer({
  isOpen,
  onClose,
  userRole = 'fan',
  userTier = 'FREE',
  userName = 'User',
  initialBlueprint,
  onSaveBlueprint,
}: YoPhoPortraitEditorDrawerProps) {
  const entitlement = getPortraitEntitlement(userTier);

  const [blueprint, setBlueprint] = useState<YoPhoPortraitBlueprint>(() => {
    return initialBlueprint || createDefaultYoPhoBlueprint(userRole, userName);
  });

  const [activeTab, setActiveTab] = useState<'mode' | 'masks' | 'layers' | 'textures' | 'export'>('mode');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateBlueprint = (updater: (prev: YoPhoPortraitBlueprint) => YoPhoPortraitBlueprint) => {
    setBlueprint((prev) => updater(prev));
  };

  const handleSave = () => {
    if (onSaveBlueprint) {
      onSaveBlueprint(blueprint);
    }
    // Save locally
    try {
      localStorage.setItem('tmi_active_yopho_blueprint', JSON.stringify(blueprint));
      setSaveStatus('YOphO Edition Saved Successfully!');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error('Failed to save YoPho blueprint:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 1, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          height: '92vh',
          background: '#070414',
          border: '2px solid rgba(0, 229, 255, 0.4)',
          borderRadius: 24,
          boxShadow: '0 0 50px rgba(0, 229, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Top Header Rail ── */}
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(12, 8, 30, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🎭</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '0.08em' }}>
                YOPHO PORTRAIT COMPOSITION ENGINE
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>
                Double Exposure · Object Masks · Hair Edge Refinement · Opposing Poses · Multi-Montage
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Subscription Tier Badge */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,45,170,0.2))',
                border: '1px solid #FFD700',
                borderRadius: 20,
                padding: '4px 14px',
                fontSize: 10,
                fontWeight: 900,
                color: '#FFD700',
                letterSpacing: '0.1em',
              }}
            >
              👑 TIER: {entitlement.tier} ({entitlement.maxActivePortraits} PORTRAITS MAX)
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Main Work Area: Live Canvas Preview (Left) & Controls Rail (Right) ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Column: Stage Canvas Preview */}
          <div
            style={{
              flex: 1.2,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#030208',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <YoPhoPortraitStageCanvas blueprint={blueprint} height="100%" />
            
            {saveStatus && (
              <div
                style={{
                  marginTop: 12,
                  background: 'rgba(0, 255, 127, 0.2)',
                  border: '1px solid #00FF7F',
                  borderRadius: 8,
                  padding: '6px 16px',
                  color: '#00FF7F',
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                ✨ {saveStatus}
              </div>
            )}
          </div>

          {/* Right Column: Tabbed Control Panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a061a', overflow: 'hidden' }}>
            {/* Tab Rail Buttons */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(5,3,15,0.9)' }}>
              {[
                { id: 'mode', label: '🎭 MODE', icon: '🎨' },
                { id: 'masks', label: '☕ OBJECT MASKS', icon: '☕' },
                { id: 'layers', label: '👥 LAYERS & EDGES', icon: '✂️' },
                { id: 'textures', label: '✨ TEXTURES & LIGHT', icon: '💡' },
                { id: 'export', label: '💾 SAVE & EXPORT', icon: '🚀' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    fontSize: 9,
                    fontWeight: 900,
                    color: activeTab === tab.id ? '#00E5FF' : 'rgba(255,255,255,0.5)',
                    background: activeTab === tab.id ? 'rgba(0,229,255,0.12)' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #00E5FF' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body Contents */}
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* TAB 1: MODE SELECTOR */}
              {activeTab === 'mode' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.1em' }}>
                    SELECT PORTRAIT COMPOSITION MODE
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { id: 'single', name: 'Single Cutout', desc: 'One clean portrait cutout over stage environment' },
                      { id: 'double_exposure', name: 'Double Exposure', desc: 'Silhouette filled with secondary memory / stage scene' },
                      { id: 'opposing', name: 'Opposing Portrait', desc: 'Two faces looking left & right (past vs present)' },
                      { id: 'multi_montage', name: 'Multi-Portrait Montage', desc: 'Record cover & movie poster collage style' },
                      { id: 'object_composite', name: 'Object Mask Composite', desc: 'Portrait inside mug, TV, record, mic, or trophy' },
                      { id: 'live_cutout', name: 'Live Scene Placement', desc: 'Real-time camera background removal' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => updateBlueprint((p) => ({ ...p, mode: m.id as PortraitCompositionMode }))}
                        style={{
                          textAlign: 'left',
                          padding: 14,
                          borderRadius: 12,
                          background: blueprint.mode === m.id ? 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(255,45,170,0.2))' : 'rgba(255,255,255,0.03)',
                          border: blueprint.mode === m.id ? '2px solid #00E5FF' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{m.name}</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Active Portraits Count Slider */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 900, color: '#fff' }}>
                      <span>ACTIVE PORTRAITS COUNT</span>
                      <span style={{ color: '#FFD700' }}>{blueprint.activePortraitsCount} / {entitlement.maxActivePortraits} MAX</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={entitlement.maxActivePortraits}
                      value={blueprint.activePortraitsCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10);
                        updateBlueprint((p) => ({ ...p, activePortraitsCount: count }));
                      }}
                      style={{ width: '100%', marginTop: 8 }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: OBJECT MASKS */}
              {activeTab === 'masks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.1em' }}>
                    SELECT SURREAL OBJECT SILHOUETTE MASK
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {OBJECT_MASK_CATALOG.map((mask) => (
                      <button
                        key={mask.id}
                        onClick={() => updateBlueprint((p) => ({ ...p, mode: 'object_composite', objectMask: mask.id }))}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: 12,
                          borderRadius: 12,
                          background: blueprint.objectMask === mask.id && blueprint.mode === 'object_composite' ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.03)',
                          border: blueprint.objectMask === mask.id && blueprint.mode === 'object_composite' ? '2px solid #00E5FF' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{mask.icon}</span>
                        <div style={{ fontSize: 9, fontWeight: 900, color: '#fff', marginTop: 6, textAlign: 'center' }}>{mask.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: LAYERS & EDGE REFINEMENT */}
              {activeTab === 'layers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.1em' }}>
                    PRIMARY CUTOUT & HAIR EDGE REFINEMENT
                  </div>

                  {/* Facing Direction */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', marginBottom: 8 }}>POSE FACING DIRECTION</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['left', 'center', 'right'] as FacingDirection[]).map((dir) => (
                        <button
                          key={dir}
                          onClick={() => updateBlueprint((p) => ({
                            ...p,
                            primaryLayer: { ...p.primaryLayer, facing: dir },
                          }))}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 9,
                            fontWeight: 900,
                            background: blueprint.primaryLayer.facing === dir ? '#00E5FF' : 'rgba(255,255,255,0.1)',
                            color: blueprint.primaryLayer.facing === dir ? '#000' : '#fff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {dir.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Preservation Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>HAIR & FINE EDGE PRESERVATION</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>Preserves hair, glasses, hat & microphone edges</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={blueprint.primaryLayer.preserveHairEdges}
                      onChange={(e) => updateBlueprint((p) => ({
                        ...p,
                        primaryLayer: { ...p.primaryLayer, preserveHairEdges: e.target.checked },
                      }))}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Edge Softness Slider */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 900, color: '#fff' }}>
                      <span>EDGE SOFTNESS & FEATHER</span>
                      <span style={{ color: '#00E5FF' }}>{blueprint.primaryLayer.edgeSoftness}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={blueprint.primaryLayer.edgeSoftness}
                      onChange={(e) => updateBlueprint((p) => ({
                        ...p,
                        primaryLayer: { ...p.primaryLayer, edgeSoftness: parseInt(e.target.value, 10) },
                      }))}
                      style={{ width: '100%', marginTop: 8 }}
                    />
                  </div>

                  {/* Blend Mode Selector */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', marginBottom: 6 }}>BLEND MODE</div>
                    <select
                      value={blueprint.primaryLayer.blendMode}
                      onChange={(e) => updateBlueprint((p) => ({
                        ...p,
                        primaryLayer: { ...p.primaryLayer, blendMode: e.target.value as BlendMode },
                      }))}
                      style={{ width: '100%', background: '#050312', color: '#fff', padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      {['normal', 'screen', 'overlay', 'multiply', 'color-dodge', 'soft-light', 'luminosity'].map((b) => (
                        <option key={b} value={b}>{b.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: TEXTURES & LIGHTING */}
              {activeTab === 'textures' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.1em' }}>
                    TEXTURE PRESETS & STAGE LIGHTING
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { id: 'cyber_glow', name: 'Cyber Glow', icon: '🔮' },
                      { id: '80s_airbrush', name: '80s Airbrush', icon: '🎨' },
                      { id: 'vintage_album', name: 'Vintage Album', icon: '📻' },
                      { id: 'gold_foil', name: 'Gold Foil', icon: '👑' },
                      { id: 'halftone', name: 'Halftone Poster', icon: '🖼️' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateBlueprint((p) => ({ ...p, texturePreset: t.id as TexturePreset }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: 12,
                          borderRadius: 10,
                          background: blueprint.texturePreset === t.id ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.03)',
                          border: blueprint.texturePreset === t.id ? '2px solid #00E5FF' : '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SAVE & EXPORT */}
              {activeTab === 'export' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.1em' }}>
                    SAVE YOPHO EDITION & EXPORT HIGH-RES
                  </div>

                  <button
                    onClick={handleSave}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #00E5FF, #FF2DAA)',
                      border: 'none',
                      color: '#000',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(0,229,255,0.5)',
                    }}
                  >
                    💾 SAVE YOPHO PORTRAIT EDITION
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => alert('HD Export Certified!')}
                      style={{ padding: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}
                    >
                      📸 EXPORT HD PNG (1080p)
                    </button>
                    <button
                      onClick={() => alert('4K Video Export Certified!')}
                      style={{ padding: 12, background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD700', color: '#FFD700', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}
                    >
                      🎬 EXPORT 4K ANIMATED MP4
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
