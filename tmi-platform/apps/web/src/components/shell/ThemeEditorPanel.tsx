'use client';

/**
 * ThemeEditorPanel — Settings → Appearance → My Venue
 *
 * Users pick and live-preview themes without a page reload.
 * Shows owned themes, theme store preview, and quick controls.
 * Calling ThemeEngine.apply() updates every component instantly.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeEngine, THEME_CATALOG, type ThemeTokens } from '@/lib/design/ThemeEngine';
import { VisualSettingsPanel } from './AmbientVisualizer';
import { useVisualSettings, type PerformanceQuality } from '@/lib/experience/VisualSettingsStore';

interface ThemeEditorPanelProps {
  accentColor?: string;
}

const TIER_LABEL: Record<ThemeTokens['tier'], string> = {
  free:     'FREE',
  premium:  'PREMIUM',
  limited:  'LIMITED',
  seasonal: 'SEASONAL',
  artist:   'ARTIST',
  venue:    'VENUE',
};

const TIER_COLOR: Record<ThemeTokens['tier'], string> = {
  free:     '#00FF88',
  premium:  '#AA2DFF',
  limited:  '#FFD700',
  seasonal: '#FF6B35',
  artist:   '#FF2DAA',
  venue:    '#00FFFF',
};

export default function ThemeEditorPanel({ accentColor }: ThemeEditorPanelProps) {
  const [activeId, setActiveId]   = useState(ThemeEngine.getActiveId());  // currently equipped
  const [ownedIds, setOwnedIds]   = useState<string[]>(() => ThemeEngine.getOwnedIds());
  const [previewId, setPreviewId] = useState<string | null>(null);         // temp preview (not saved)
  const [savedId, setSavedId]     = useState(ThemeEngine.getActiveId());   // last explicitly saved
  const [tab, setTab]             = useState<'themes' | 'effects' | 'motion' | 'accessibility' | 'performance'>('themes');
  const [settings, updateSettings] = useVisualSettings();

  useEffect(() => {
    return ThemeEngine.subscribe(() => {
      setActiveId(ThemeEngine.getActiveId());
      setOwnedIds(ThemeEngine.getOwnedIds());
    });
  }, []);

  const previewTheme = previewId ? (THEME_CATALOG[previewId] ?? null) : null;
  const activeTheme = THEME_CATALOG[activeId] ?? THEME_CATALOG['neon-royal']!;
  const accent = accentColor ?? activeTheme.primary;

  // Preview: live-apply without committing. Save explicitly restores savedId on dismiss.
  function startPreview(id: string) {
    setPreviewId(id);
    ThemeEngine.apply(id); // live preview — applies immediately but not saved
  }

  function cancelPreview() {
    setPreviewId(null);
    ThemeEngine.apply(savedId); // revert to last saved
  }

  function saveTheme() {
    if (!previewId) return;
    setSavedId(previewId);
    setPreviewId(null);
    // savedId is persisted via ThemeEngine.apply (localStorage)
  }

  // Direct apply (owned themes, no confirmation needed)
  function applyTheme(id: string) {
    ThemeEngine.apply(id);
    setSavedId(id);
    setPreviewId(null);
  }

  const themes = Object.values(THEME_CATALOG);
  const owned = themes.filter(t => ownedIds.includes(t.id));
  const store  = themes.filter(t => !ownedIds.includes(t.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 300 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
        {([['themes','🎨','Themes'],['effects','✨','Effects'],['motion','🌊','Motion'],['accessibility','♿','Access'],['performance','⚡','Perf']] as const).map(([key, icon, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '9px 4px', background: 'none', border: 'none', cursor: 'pointer',
            color: tab === key ? '#fff' : 'rgba(255,255,255,0.35)',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            borderBottom: tab === key ? `2px solid ${accent}` : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {icon} {label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab: Themes */}
      {tab === 'themes' && (
        <div>
          {/* Active theme summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 16,
            background: `${activeTheme.primary}18`, border: `1.5px solid ${activeTheme.primary}44`,
            borderRadius: 10,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{activeTheme.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{activeTheme.description}</div>
            </div>
            <span style={{ fontSize: 8, fontWeight: 900, color: '#00FF88', letterSpacing: '0.1em' }}>ACTIVE</span>
          </div>

          {/* Owned themes */}
          {owned.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>YOUR THEMES</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {owned.map(theme => (
                  <ThemeCard
                    key={theme.id} theme={theme}
                    isActive={theme.id === savedId}
                    isPreviewing={theme.id === previewId}
                    onApply={() => applyTheme(theme.id)}
                    onPreview={() => startPreview(theme.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Store themes */}
          {store.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>THEME STORE</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {store.map(theme => (
                  <ThemeCard
                    key={theme.id} theme={theme}
                    isActive={false}
                    isPreviewing={theme.id === previewId}
                    locked
                    onApply={() => {/* route to store */}}
                    onPreview={() => startPreview(theme.id)}
                  />
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                  Artist + Venue + Seasonal packs coming to the Theme Store
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Preview banner */}
      {previewId && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', marginBottom: 12, borderRadius: 8,
          background: `${accent}18`, border: `1px solid ${accent}44`,
          fontSize: 10,
        }}>
          <span style={{ color: accent, fontWeight: 700 }}>Previewing: {THEME_CATALOG[previewId]?.name}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={cancelPreview} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 9, fontWeight: 700 }}>Cancel</button>
            <button onClick={saveTheme} style={{ background: accent, border: 'none', color: '#000', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 9, fontWeight: 900 }}>Save Theme</button>
          </div>
        </div>
      )}

      {/* Tab: Effects */}
      {tab === 'effects' && (
        <VisualSettingsPanel accentColor={accent} />
      )}

      {/* Tab: Motion */}
      {tab === 'motion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>MOTION SETTINGS</div>
          <VisualSettingsPanel accentColor={accent} />
        </div>
      )}

      {/* Tab: Accessibility */}
      {tab === 'accessibility' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 8 }}>
            Reduce visual intensity for a more comfortable experience.
          </div>
          <VisualSettingsPanel accentColor={accent} />
        </div>
      )}

      {/* Tab: Performance */}
      {tab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>RENDERING QUALITY</div>
          {(['auto','high','balanced','performance'] as PerformanceQuality[]).map(q => (
            <div
              key={q}
              onClick={() => updateSettings({ qualityOverride: q })}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                background: settings.qualityOverride === q ? `${accent}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${settings.qualityOverride === q ? accent + '55' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: settings.qualityOverride === q ? accent : '#fff' }}>
                  {q === 'auto' ? '🤖 Auto (Recommended)' : q === 'high' ? '⚡ High Quality' : q === 'balanced' ? '⚖️ Balanced' : '🐢 Performance'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {q === 'auto' ? 'Automatically matches your device' : q === 'high' ? 'Maximum particles, lighting, and effects' : q === 'balanced' ? 'Smooth on most devices' : 'Minimal effects for older hardware'}
                </div>
              </div>
              {settings.qualityOverride === q && <span style={{ fontSize: 8, color: accent, fontWeight: 900, letterSpacing: '0.1em' }}>ACTIVE</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Theme card ──────────────────────────────────────────────────────────────────

function ThemeCard({ theme, isActive, isPreviewing, locked, onApply, onPreview }: {
  theme: ThemeTokens; isActive: boolean; isPreviewing?: boolean; locked?: boolean;
  onApply: () => void; onPreview: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
        border: `1.5px solid ${isActive ? theme.primary : 'rgba(255,255,255,0.08)'}`,
        background: isActive ? `${theme.primary}18` : 'rgba(255,255,255,0.03)',
        transition: 'all 0.15s', position: 'relative',
      }}
      onClick={locked ? onPreview : onApply}
      onMouseEnter={onPreview}
    >
      {/* Color swatch */}
      <div style={{
        height: 40,
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.tertiary} 100%)`,
        position: 'relative',
      }}>
        {locked && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>🔒</div>
        )}
        <div style={{
          position: 'absolute', top: 4, right: 5,
          background: 'rgba(0,0,0,0.6)', borderRadius: 3,
          padding: '1px 5px', fontSize: 7, fontWeight: 900,
          color: TIER_COLOR[theme.tier] ?? '#fff', letterSpacing: '0.08em',
        }}>
          {TIER_LABEL[theme.tier]}
        </div>
      </div>
      <div style={{ padding: '6px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 700 }}>{theme.name}</div>
        {isActive && !isPreviewing && <div style={{ fontSize: 8, color: '#00FF88', marginTop: 2, fontWeight: 900 }}>SAVED</div>}
        {isPreviewing && <div style={{ fontSize: 8, color: '#FFD700', marginTop: 2, fontWeight: 900 }}>PREVIEWING</div>}
        {locked && !isPreviewing && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Tap to preview</div>}
      </div>
    </div>
  );
}
