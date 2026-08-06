'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundSettingsStore, SoundPresetId } from '@/lib/sound/SoundSettingsStore';
import { SOUND_THEMES } from '@/lib/sound/SoundThemeRegistry';
import { SoundSystemEngine } from '@/lib/sound/SoundSystemEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettingsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const store = useSoundSettingsStore();

  if (!isOpen) return null;

  const handleSliderChange = (key: any, val: number) => {
    if (key === 'masterVolume') {
      store.setMasterVolume(val);
    } else {
      store.setCategoryVolume(key, val);
    }
    SoundSystemEngine.testSound('click_primary');
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'relative',
            width: 420,
            height: '100vh',
            background: 'rgba(10, 14, 30, 0.96)',
            borderLeft: '1px solid rgba(0, 255, 255, 0.2)',
            boxShadow: '-12px 0 40px rgba(0,0,0,0.8)',
            padding: 24,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '0.08em' }}>🔊 UI SOUNDS & THEMES</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Custom audio feedback & music platform themes</p>
            </div>
            <button
              onClick={() => {
                SoundSystemEngine.play('drawer_close');
                onClose();
              }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#00FFFF', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              QUICK PRESETS
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {(['silent', 'soft', 'normal', 'strong', 'immersive'] as SoundPresetId[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    store.applyPreset(preset);
                    SoundSystemEngine.play('click_primary');
                  }}
                  style={{
                    background: store.activePreset === preset ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid ' + (store.activePreset === preset ? '#00FFFF' : 'rgba(255,255,255,0.08)'),
                    color: store.activePreset === preset ? '#00FFFF' : '#fff',
                    borderRadius: 6,
                    padding: '8px 2px',
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {preset === 'silent' ? '🔇' : null}
                  {preset === 'soft' ? '🤫' : null}
                  {preset === 'normal' ? '🔉' : null}
                  {preset === 'strong' ? '🔊' : null}
                  {preset === 'immersive' ? '🎧' : null}
                  <div style={{ marginTop: 2 }}>{preset}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#00FFFF', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              TMI SOUND THEME
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.values(SOUND_THEMES).map((theme) => {
                const isActive = store.activeTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      store.setTheme(theme.id);
                      SoundSystemEngine.play('success', theme.id);
                    }}
                    style={{
                      background: isActive ? 'rgba(0,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid ' + (isActive ? '#00FFFF' : 'rgba(255,255,255,0.08)'),
                      borderRadius: 8,
                      padding: 10,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{theme.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? '#00FFFF' : '#fff' }}>{theme.name}</span>
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{theme.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#00FFFF', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>
              VOLUME CATEGORIES
            </label>
            {[
              { key: 'masterVolume', label: 'Master UI Volume', cat: 'click_primary' },
              { key: 'clickVolume', label: 'Button Click Volume', cat: 'click_primary' },
              { key: 'notificationVolume', label: 'Notification Volume', cat: 'notification' },
              { key: 'messageVolume', label: 'Message Volume', cat: 'notification' },
              { key: 'liveEventVolume', label: 'Live Event Volume', cat: 'broadcast_start' },
              { key: 'purchaseVolume', label: 'Purchase Confirmation', cat: 'success' },
              { key: 'achievementVolume', label: 'Achievement Volume', cat: 'reward_spawn' },
            ].map((item) => (
              <div key={item.key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#fff', marginBottom: 4 }}>
                  <span>{item.label}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{(store as any)[item.key]}%</span>
                    <button
                      onClick={() => SoundSystemEngine.testSound(item.cat as any)}
                      style={{
                        background: 'rgba(0,255,255,0.15)',
                        border: '1px solid rgba(0,255,255,0.4)',
                        color: '#00FFFF',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 8,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      TEST
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={(store as any)[item.key]}
                  onChange={(e) => handleSliderChange(item.key, Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00FFFF', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#00FFFF', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              ACCESSIBILITY & PREFERENCES
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: '#fff', cursor: 'pointer' }}>
                <input type="checkbox" checked={store.reducedMotion} onChange={store.toggleReducedMotion} style={{ accentColor: '#00FFFF' }} />
                <span>Reduced Motion (Disable flight particles)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: '#fff', cursor: 'pointer' }}>
                <input type="checkbox" checked={store.instantCounters} onChange={store.toggleInstantCounters} style={{ accentColor: '#00FFFF' }} />
                <span>Instant Counter Updates (Skip reward animations)</span>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SoundSettingsDrawer;