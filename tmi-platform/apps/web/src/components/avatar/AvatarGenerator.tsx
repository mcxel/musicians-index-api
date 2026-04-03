"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFromFace, defaultAvatar, saveAvatar } from '@/lib/avatar/avatarEngine';
import type { AvatarConfig, SkinTone, HairStyle, HatStyle, GlassesStyle, ClothesStyle } from '@/lib/avatar/avatarEngine';

interface AvatarGeneratorProps {
  avatarSeed?: string;
  userId?: string;
  onComplete: (avatar: AvatarConfig) => void;
}

const SKIN_TONES: { tone: SkinTone; color: string }[] = [
  { tone: 'fair',   color: '#F8D5A0' },
  { tone: 'light',  color: '#ECC07A' },
  { tone: 'medium', color: '#D4954A' },
  { tone: 'olive',  color: '#C07830' },
  { tone: 'tan',    color: '#A86028' },
  { tone: 'brown',  color: '#8B4010' },
  { tone: 'dark',   color: '#5A2A08' },
  { tone: 'deep',   color: '#2A1004' },
];

const NEONS = ['#00FFFF', '#FF2DAA', '#AA2DFF', '#FFD700', '#FF9500', '#00FF88', '#FF2200', '#0088FF', '#FFFFFF', '#888888'];

const HAIR_STYLES: HairStyle[] = ['short-fade', 'afro', 'box-braids', 'locs', 'coils', 'waves', 'cornrows', 'tapered', 'long-straight', 'curly-fro', 'bald', 'ponytail'];
const HAT_STYLES: HatStyle[] = ['none', 'snapback', 'fitted', 'beanie', 'duraq', 'do-rag', 'fitted-tilt', 'bucket'];
const GLASSES_STYLES: GlassesStyle[] = ['none', 'shades', 'frames', 'tinted', 'visor'];
const CLOTHES_STYLES: ClothesStyle[] = ['hoodie', 'tee', 'jersey', 'tracksuit', 'puffy-jacket', 'vest', 'button-up', 'bomber', 'tank'];

export default function AvatarGenerator({ avatarSeed, userId, onComplete }: AvatarGeneratorProps) {
  const [avatar, setAvatar] = useState<AvatarConfig>(() =>
    avatarSeed ? generateFromFace(avatarSeed, userId) : defaultAvatar(userId)
  );
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'face' | 'hair' | 'style'>('face');

  const update = (patch: Partial<AvatarConfig>) => setAvatar(a => ({ ...a, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    await saveAvatar(avatar);
    setSaving(false);
    onComplete(avatar);
  };

  const skinEntry = SKIN_TONES.find(s => s.tone === avatar.skinTone);

  // Simple avatar face preview
  const faceColor = skinEntry?.color ?? '#D4954A';

  const TABS = [
    { key: 'face' as const, label: 'FACE & SKIN' },
    { key: 'hair' as const, label: 'HAIR & HAT' },
    { key: 'style' as const, label: 'CLOTHES' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', background: '#080818', borderRadius: 16, overflow: 'hidden', border: '1px solid #1A1A3A' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1A1A3A', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🎨</span>
        <span style={{ color: '#AA2DFF', fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>AVATAR GENERATOR</span>
        {avatarSeed && (
          <span style={{ marginLeft: 'auto', color: '#00FF88', fontSize: 11, background: '#001808', padding: '2px 8px', borderRadius: 4 }}>
            FACE-GENERATED
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Preview */}
        <div style={{
          width: 180, minHeight: 260,
          background: '#050510',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 16, gap: 10,
          borderRight: '1px solid #1A1A3A',
        }}>
          {/* Simple avatar illustration */}
          <div style={{ position: 'relative', width: 100, height: 120 }}>
            {/* Head */}
            <div style={{
              position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
              width: 70, height: 80,
              background: faceColor,
              borderRadius: '50% 50% 45% 45%',
              border: `2px solid ${avatar.clothesColor}44`,
            }}>
              {/* Eyes */}
              <div style={{ position: 'absolute', top: 28, left: 14, width: 10, height: 10, background: avatar.eyeColor, borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: 28, right: 14, width: 10, height: 10, background: avatar.eyeColor, borderRadius: '50%' }} />
              {/* Mouth */}
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 20, height: 4, background: '#8B4010', borderRadius: 4 }} />
            </div>
            {/* Hair swipe */}
            {avatar.hairStyle !== 'bald' && (
              <div style={{
                position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                width: 72, height: 30,
                background: avatar.hairColor,
                borderRadius: '50% 50% 0 0',
              }} />
            )}
            {/* Hat */}
            {avatar.hatStyle !== 'none' && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 80, height: 22,
                background: avatar.hatColor,
                borderRadius: 4,
              }} />
            )}
          </div>
          {/* Clothes swatch */}
          <div style={{
            width: 60, height: 30,
            background: avatar.clothesColor,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 9, color: '#000', fontWeight: 700 }}>{avatar.clothesStyle.toUpperCase()}</span>
          </div>
          <span style={{ color: '#666', fontSize: 10, textAlign: 'center' }}>{avatar.skinTone} · {avatar.hairStyle}</span>
        </div>

        {/* Controls */}
        <div style={{ flex: 1, padding: 16 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {TABS.map(t => (
              <motion.button key={t.key}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10,
                  fontWeight: 700, letterSpacing: 1,
                  background: tab === t.key ? '#AA2DFF' : '#0A0A1A',
                  color: tab === t.key ? '#FFF' : '#666',
                }}
              >{t.label}</motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'face' && (
              <motion.div key="face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>SKIN TONE</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {SKIN_TONES.map(s => (
                    <motion.button key={s.tone}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                      onClick={() => update({ skinTone: s.tone })}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: s.color, border: 'none', cursor: 'pointer',
                        outline: avatar.skinTone === s.tone ? `3px solid #00FFFF` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
                <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>EYE COLOR</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['#4A3020', '#2A5020', '#1A3060', '#885020', '#111111', '#AA7020'].map(c => (
                    <motion.button key={c}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                      onClick={() => update({ eyeColor: c })}
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: c, border: 'none', cursor: 'pointer',
                        outline: avatar.eyeColor === c ? `3px solid #FFD700` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'hair' && (
              <motion.div key="hair" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>HAIR STYLE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {HAIR_STYLES.map(h => (
                    <motion.button key={h}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => update({ hairStyle: h })}
                      style={{
                        padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9,
                        background: avatar.hairStyle === h ? '#FF2DAA' : '#0A0A1A',
                        color: avatar.hairStyle === h ? '#FFF' : '#888',
                      }}
                    >{h.toUpperCase()}</motion.button>
                  ))}
                </div>
                <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>HAIR COLOR</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {NEONS.map(c => (
                    <motion.button key={c}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                      onClick={() => update({ hairColor: c })}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: c, border: 'none', cursor: 'pointer',
                        outline: avatar.hairColor === c ? `3px solid #FFF` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
                <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>HAT</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {HAT_STYLES.map(h => (
                    <motion.button key={h}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => update({ hatStyle: h })}
                      style={{
                        padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9,
                        background: avatar.hatStyle === h ? '#FFD700' : '#0A0A1A',
                        color: avatar.hatStyle === h ? '#050510' : '#888',
                      }}
                    >{h.toUpperCase()}</motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'style' && (
              <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>CLOTHES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {CLOTHES_STYLES.map(c => (
                    <motion.button key={c}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => update({ clothesStyle: c })}
                      style={{
                        padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 9,
                        background: avatar.clothesStyle === c ? '#00FFFF' : '#0A0A1A',
                        color: avatar.clothesStyle === c ? '#050510' : '#888',
                      }}
                    >{c.toUpperCase()}</motion.button>
                  ))}
                </div>
                <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>CLOTHES COLOR</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {NEONS.map(c => (
                    <motion.button key={c}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                      onClick={() => update({ clothesColor: c })}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: c, border: 'none', cursor: 'pointer',
                        outline: avatar.clothesColor === c ? `3px solid #FFF` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #1A1A3A', display: 'flex', justifyContent: 'flex-end' }}>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 28px',
            background: saving ? '#333' : 'linear-gradient(135deg, #AA2DFF, #FF2DAA)',
            border: 'none', borderRadius: 8,
            color: '#FFF', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontSize: 13,
          }}
        >{saving ? 'SAVING...' : 'SAVE AVATAR →'}</motion.button>
      </div>
    </div>
  );
}
