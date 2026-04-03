"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AvatarConfig, HairStyle, HatStyle, GlassesStyle, ClothesStyle, AccessoryStyle } from '@/lib/avatar/avatarEngine';

interface AvatarCustomizerProps {
  avatar: AvatarConfig;
  onChange: (updated: AvatarConfig) => void;
}

const NEONS = ['#00FFFF', '#FF2DAA', '#AA2DFF', '#FFD700', '#FF9500', '#00FF88', '#FF2200', '#0088FF', '#FFFFFF', '#888888', '#111111', '#222222'];
const GLASSES: GlassesStyle[] = ['none', 'shades', 'frames', 'tinted', 'visor'];
const ACCESSORIES: AccessoryStyle[] = ['none', 'chain', 'grill', 'earrings', 'nose-ring', 'crown'];

export default function AvatarCustomizer({ avatar, onChange }: AvatarCustomizerProps) {
  const [activeSection, setActiveSection] = useState<'glasses' | 'accessories' | 'animation'>('glasses');

  const up = (patch: Partial<AvatarConfig>) => onChange({ ...avatar, ...patch });

  const sectionStyle = (s: string): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 10, fontWeight: 700, letterSpacing: 1,
    background: activeSection === s ? '#FF9500' : '#0A0A1A',
    color: activeSection === s ? '#050510' : '#666',
  });

  return (
    <div style={{
      background: '#070718', border: '1px solid #1A1A3A',
      borderRadius: 14, overflow: 'hidden', width: '100%', maxWidth: 480,
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #1A1A3A', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚙️</span>
        <span style={{ color: '#FF9500', fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>AVATAR CUSTOMIZER</span>
      </div>

      {/* Section nav */}
      <div style={{ padding: '10px 18px', display: 'flex', gap: 6, borderBottom: '1px solid #111' }}>
        {(['glasses', 'accessories', 'animation'] as const).map(s => (
          <motion.button key={s} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActiveSection(s)} style={sectionStyle(s)}
          >{s.toUpperCase()}</motion.button>
        ))}
      </div>

      <div style={{ padding: 18 }}>
        <AnimatePresence mode="wait">
          {activeSection === 'glasses' && (
            <motion.div key="glasses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>EYEWEAR</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {GLASSES.map(g => (
                  <motion.button key={g}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={() => up({ glassesStyle: g })}
                    style={{
                      padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: avatar.glassesStyle === g ? '#00FFFF' : '#0A0A1A',
                      color: avatar.glassesStyle === g ? '#050510' : '#888',
                    }}
                  >{g.toUpperCase()}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'accessories' && (
            <motion.div key="acc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>ACCESSORY</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {ACCESSORIES.map(a => (
                  <motion.button key={a}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={() => up({ accessory: a })}
                    style={{
                      padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: avatar.accessory === a ? '#FFD700' : '#0A0A1A',
                      color: avatar.accessory === a ? '#050510' : '#888',
                    }}
                  >{a.toUpperCase()}</motion.button>
                ))}
              </div>
              <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>ACCESSORY COLOR</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {NEONS.map(c => (
                  <motion.button key={c}
                    whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    onClick={() => up({ accessoryColor: c })}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: c, border: 'none', cursor: 'pointer',
                      outline: avatar.accessoryColor === c ? `3px solid #FFFFFF` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'animation' && (
            <motion.div key="anim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>IDLE ANIMATION</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(['idle-bounce', 'sway', 'nod', 'freeze', 'vibe'] as const).map(a => (
                  <motion.button key={a}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={() => up({ animation: a })}
                    style={{
                      padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: avatar.animation === a ? '#AA2DFF' : '#0A0A1A',
                      color: avatar.animation === a ? '#FFF' : '#888',
                    }}
                  >{a.toUpperCase()}</motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
