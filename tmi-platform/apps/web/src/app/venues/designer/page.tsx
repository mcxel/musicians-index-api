"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import { getVenueSkin, applyVenueSkin, type VenueSkin } from '@/lib/venue/venueSkinEngine';

const BASE_SKINS = ['neon-club', 'red-theater', 'festival', 'warehouse', 'beach', 'tv-studio'];

const COLOR_SLOTS = [
  { key: 'primary', label: 'Primary', desc: 'Main accent color' },
  { key: 'accent', label: 'Accent', desc: 'Secondary highlights' },
  { key: 'floor', label: 'Floor', desc: 'Stage / floor glow' },
  { key: 'crowd', label: 'Crowd', desc: 'Crowd lighting' },
  { key: 'glow', label: 'Glow', desc: 'Particle / halo glow' },
];

const PRESET_COLORS = [
  '#00FFFF', '#FF2DAA', '#AA2DFF', '#FFD700', '#FF9500',
  '#00FF88', '#FF2200', '#0088FF', '#FF6600', '#88FF00',
  '#FF0088', '#00FFAA', '#AAFFFF', '#FFAAFF', '#FFFFFF',
];

export default function VenueDesignerPage() {
  const router = useRouter();
  const [baseSkinId, setBaseSkinId] = useState('neon-club');
  const [baseSkin] = useState<VenueSkin | null>(() => getVenueSkin('neon-club') ?? null);
  const [colors, setColors] = useState<Record<string, string>>({
    primary: '#00FFFF', accent: '#FF2DAA', floor: '#0a0040',
    crowd: '#1a0030', glow: '#00FFFF',
  });
  const [skinName, setSkinName] = useState('My Custom Skin');
  const [activeSlot, setActiveSlot] = useState<string>('primary');
  const [saved, setSaved] = useState(false);

  function loadBase(id: string) {
    setBaseSkinId(id);
    const skin = getVenueSkin(id);
    if (!skin) return;
    setColors({
      primary: skin.colorPalette.primary,
      accent: skin.colorPalette.accent,
      floor: skin.colorPalette.floor,
      crowd: skin.colorPalette.crowd,
      glow: skin.colorPalette.glow,
    });
  }

  function handlePreview() {
    const skin = getVenueSkin(baseSkinId);
    if (!skin) return;
    const customSkin: VenueSkin = {
      ...skin,
      id: 'custom-preview',
      name: skinName,
      colorPalette: { ...skin.colorPalette, ...colors },
    };
    applyVenueSkin(document.body, customSkin);
  }

  function handleSave() {
    // In production: POST /api/venue-skins with custom skin data
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/venues/skins'); }, 1500);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 26, fontWeight: 900, letterSpacing: 4, color: '#FFD700', margin: 0 }}
            >
              VENUE DESIGNER
            </motion.h1>
            <p style={{ color: '#555', fontSize: 13, marginTop: 6 }}>
              Build a custom venue skin from any base template
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
            {/* Left: settings */}
            <div style={{ flex: '1 1 320px', minWidth: 280 }}>

              {/* Skin name */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: '#555', fontSize: 11, letterSpacing: 3, display: 'block', marginBottom: 8 }}>
                  SKIN NAME
                </label>
                <input
                  value={skinName}
                  onChange={e => setSkinName(e.target.value)}
                  maxLength={40}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Base template picker */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: '#555', fontSize: 11, letterSpacing: 3, display: 'block', marginBottom: 8 }}>
                  BASE TEMPLATE
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {BASE_SKINS.map(id => {
                    const s = getVenueSkin(id);
                    if (!s) return null;
                    return (
                      <motion.button
                        key={id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => loadBase(id)}
                        style={{
                          padding: '6px 12px',
                          background: baseSkinId === id ? `${s.colorPalette.primary}33` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${baseSkinId === id ? s.colorPalette.primary : '#222'}`,
                          borderRadius: 6, color: baseSkinId === id ? s.colorPalette.primary : '#555',
                          fontSize: 11, letterSpacing: 1, cursor: 'pointer',
                        }}
                      >
                        {s.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Color customizer */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: '#555', fontSize: 11, letterSpacing: 3, display: 'block', marginBottom: 10 }}>
                  CUSTOMIZE COLORS
                </label>
                {/* Slot selector */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {COLOR_SLOTS.map(slot => (
                    <motion.button
                      key={slot.key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSlot(slot.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                        background: activeSlot === slot.key ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${activeSlot === slot.key ? '#444' : '#1a1a1a'}`,
                        borderRadius: 6, cursor: 'pointer',
                      }}
                    >
                      <div style={{ width: 14, height: 14, borderRadius: 3, background: colors[slot.key] ?? '#888' }} />
                      <span style={{ color: activeSlot === slot.key ? '#ccc' : '#555', fontSize: 11 }}>{slot.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Color palette */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ color: '#333', fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>
                    {COLOR_SLOTS.find(s => s.key === activeSlot)?.desc?.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PRESET_COLORS.map(color => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setColors(c => ({ ...c, [activeSlot]: color }))}
                        style={{
                          width: 32, height: 32, borderRadius: 6, background: color,
                          border: colors[activeSlot] === color ? '2px solid #fff' : '2px solid transparent',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>

                  {/* Custom hex input */}
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: colors[activeSlot] ?? '#888', border: '1px solid #333' }} />
                    <input
                      value={colors[activeSlot] ?? ''}
                      onChange={e => setColors(c => ({ ...c, [activeSlot]: e.target.value }))}
                      placeholder="#RRGGBB"
                      maxLength={7}
                      style={{
                        flex: 1, padding: '7px 10px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #2a2a2a', borderRadius: 6, color: '#ccc',
                        fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: preview panel */}
            <div style={{ flex: '0 0 240px', minWidth: 200 }}>
              <div style={{ color: '#333', fontSize: 10, letterSpacing: 3, marginBottom: 12 }}>PREVIEW</div>
              {/* Simulated venue */}
              <div style={{
                background: colors.floor,
                border: `2px solid ${colors.primary}`,
                borderRadius: 12, overflow: 'hidden', height: 200, position: 'relative',
              }}>
                {/* Stage glow */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                  background: `radial-gradient(ellipse at 50% 100%, ${colors.primary}44 0%, transparent 70%)`,
                }} />
                {/* Crowd zone */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 120,
                  background: `radial-gradient(ellipse at 50% 0%, ${colors.crowd}88 0%, transparent 70%)`,
                }} />
                {/* Accent beams */}
                <div style={{
                  position: 'absolute', top: 20, left: '30%', width: 3, height: 100,
                  background: `linear-gradient(to bottom, ${colors.glow}, transparent)`,
                  transform: 'rotate(-20deg)', opacity: 0.6,
                }} />
                <div style={{
                  position: 'absolute', top: 20, right: '30%', width: 3, height: 100,
                  background: `linear-gradient(to bottom, ${colors.accent}, transparent)`,
                  transform: 'rotate(20deg)', opacity: 0.6,
                }} />
                {/* Name label */}
                <div style={{
                  position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
                  color: colors.primary, fontSize: 11, fontWeight: 700, letterSpacing: 2,
                }}>
                  {skinName || 'CUSTOM VENUE'}
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handlePreview}
                  style={{
                    padding: '9px 0', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid #333', borderRadius: 8, color: '#888',
                    fontSize: 12, letterSpacing: 2, cursor: 'pointer',
                  }}
                >
                  APPLY PREVIEW
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave}
                  style={{
                    padding: '11px 0',
                    background: saved ? '#00FF88' : `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    border: 'none', borderRadius: 8,
                    color: saved ? '#050510' : '#fff',
                    fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                  }}
                >
                  {saved ? '✓ SAVED' : 'SAVE SKIN'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
