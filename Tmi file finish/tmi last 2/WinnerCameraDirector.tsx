/**
 * WinnerCameraDirector.tsx
 * Repo: apps/web/src/components/contest/WinnerCameraDirector.tsx
 * Action: CREATE | Wave: A10
 * Dependencies: reveal.presets.ts
 *
 * Manages camera preset rotation and adaptive transition weighting.
 * Only rotates within admin-approved preset pool.
 * No uncontrolled self-modification — all changes are logged.
 */
'use client';
import { useState, useEffect, useRef } from 'react';
import { CAMERA_PRESETS, type CameraPreset, type TransitionPreset } from '../../config/reveal.presets';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CameraDirectorConfig {
  presetPool: string[];            // Only use these preset IDs (admin-approved)
  transitionWeights: Record<string, number>; // transition ID → weight (0–100)
  weightingEnabled: boolean;       // if false, round-robin only
  minPresetDwellMs: number;        // min time before switching preset
  seasonLocked?: boolean;          // if true, no rotation during active season
  adminOverridePreset?: string;    // admin can force a specific preset
}

export interface CameraDirectorState {
  currentPreset: CameraPreset | null;
  currentTransition: TransitionPreset | null;
  phase: 'group_shot' | 'fun_rotation' | 'hero_zoom' | 'idle';
  history: Array<{ presetId: string; transitionId: string; timestamp: number }>;
}

// ─── Default config ───────────────────────────────────────────────────────────

export const DEFAULT_CAMERA_CONFIG: CameraDirectorConfig = {
  presetPool: ['hero_zoom', 'group_celebration', 'podium_pan', 'winner_isolation'],
  transitionWeights: {
    fade_gold: 70,
    cut_sharp: 50,
    push_dramatic: 80,
    dissolve_soft: 40,
  },
  weightingEnabled: true,
  minPresetDwellMs: 2000,
  seasonLocked: false,
};

// ─── Weighted selection (approved presets only) ───────────────────────────────

function pickWeightedPreset(
  pool: string[],
  weights: Record<string, number>,
  exclude?: string,
): string {
  const candidates = pool.filter(id => id !== exclude);
  if (!candidates.length) return pool[0] ?? 'hero_zoom';

  const totalWeight = candidates.reduce((sum, id) => sum + (weights[id] ?? 50), 0);
  let random = Math.random() * totalWeight;

  for (const id of candidates) {
    random -= weights[id] ?? 50;
    if (random <= 0) return id;
  }
  return candidates[candidates.length - 1];
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useWinnerCameraDirector(config: Partial<CameraDirectorConfig> = {}) {
  const fullConfig = { ...DEFAULT_CAMERA_CONFIG, ...config };
  const [state, setState] = useState<CameraDirectorState>({
    currentPreset: null,
    currentTransition: null,
    phase: 'idle',
    history: [],
  });
  const historyRef = useRef(state.history);

  const setPhase = (phase: CameraDirectorState['phase']) => {
    setState(prev => ({ ...prev, phase }));
  };

  const activatePreset = (presetId?: string) => {
    if (fullConfig.seasonLocked) return; // No rotation during season lock

    const targetId = fullConfig.adminOverridePreset
      ?? presetId
      ?? pickWeightedPreset(
          fullConfig.presetPool,
          fullConfig.weightingEnabled ? fullConfig.transitionWeights : {},
          state.currentPreset?.id,
        );

    const preset = CAMERA_PRESETS.find(p => p.id === targetId);
    if (!preset) return;

    const logEntry = { presetId: targetId, transitionId: preset.defaultTransition ?? 'fade_gold', timestamp: Date.now() };
    historyRef.current = [...historyRef.current.slice(-20), logEntry]; // Keep last 20

    setState(prev => ({
      ...prev,
      currentPreset: preset,
      history: historyRef.current,
    }));
  };

  return { state, setPhase, activatePreset, config: fullConfig };
}

// ─── Camera Director UI overlay (admin/host view) ────────────────────────────

interface WinnerCameraDirectorProps {
  config?: Partial<CameraDirectorConfig>;
  adminMode?: boolean;
  onPresetChange?: (presetId: string) => void;
  onWeightUpdate?: (transitionId: string, newWeight: number) => void;
  onResetWeights?: () => void;
}

export function WinnerCameraDirector({
  config: configProp,
  adminMode = false,
  onPresetChange,
  onWeightUpdate,
  onResetWeights,
}: WinnerCameraDirectorProps) {
  const { state, activatePreset, config } = useWinnerCameraDirector(configProp);

  if (!adminMode) return null; // Non-admin sees nothing — camera runs silently

  return (
    <div style={{
      background: '#0a0d14', border: '1px solid rgba(0,229,255,.2)',
      borderRadius: 12, padding: 20, color: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#00e5ff', margin: 0 }}>Camera Director</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {config.seasonLocked && (
            <span style={{ fontSize: 10, background: 'rgba(255,215,0,.1)', border: '1px solid rgba(255,215,0,.3)', color: '#ffd700', padding: '3px 8px', borderRadius: 10, fontWeight: 700 }}>
              SEASON LOCKED
            </span>
          )}
          <span style={{ fontSize: 10, background: `${config.weightingEnabled ? 'rgba(0,255,136' : 'rgba(255,255,255'}.1)`, border: `1px solid ${config.weightingEnabled ? 'rgba(0,255,136' : 'rgba(255,255,255'}.3)`, color: config.weightingEnabled ? '#00ff88' : 'rgba(255,255,255,.4)', padding: '3px 8px', borderRadius: 10, fontWeight: 700 }}>
            {config.weightingEnabled ? 'ADAPTIVE' : 'ROUND ROBIN'}
          </span>
        </div>
      </div>

      {/* Current preset */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', marginBottom: 6 }}>ACTIVE PRESET</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: state.currentPreset ? '#00e5ff' : 'rgba(255,255,255,.3)' }}>
          {state.currentPreset?.label ?? 'None selected'}
        </div>
      </div>

      {/* Preset pool */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', marginBottom: 8 }}>APPROVED PRESET POOL</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {config.presetPool.map(id => {
            const preset = CAMERA_PRESETS.find(p => p.id === id);
            const isActive = state.currentPreset?.id === id;
            return (
              <button key={id} onClick={() => { activatePreset(id); onPresetChange?.(id); }} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: isActive ? 'rgba(0,229,255,.15)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${isActive ? 'rgba(0,229,255,.5)' : 'rgba(255,255,255,.1)'}`,
                color: isActive ? '#00e5ff' : 'rgba(255,255,255,.6)',
                cursor: config.seasonLocked ? 'not-allowed' : 'pointer', opacity: config.seasonLocked ? .5 : 1,
              }}>
                {preset?.label ?? id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transition weights */}
      {config.weightingEnabled && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em' }}>TRANSITION WEIGHTS</div>
            <button onClick={onResetWeights} style={{ fontSize: 10, color: 'rgba(255,107,26,.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Reset to default
            </button>
          </div>
          {Object.entries(config.transitionWeights).map(([id, weight]) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', width: 110, flexShrink: 0 }}>{id.replace(/_/g, ' ')}</span>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${weight}%`, height: '100%', background: 'rgba(0,229,255,.6)', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, color: '#00e5ff', width: 30, textAlign: 'right' }}>{weight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent history */}
      {state.history.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.08em', marginBottom: 6 }}>RECENT LOG (last 5)</div>
          {state.history.slice(-5).reverse().map((h, i) => (
            <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span>{h.presetId} → {h.transitionId}</span>
              <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WinnerCameraDirector;
