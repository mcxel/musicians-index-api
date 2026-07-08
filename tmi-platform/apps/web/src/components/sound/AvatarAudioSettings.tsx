'use client';

/**
 * AvatarAudioSettings
 * User-facing controls for the Avatar Audio Runtime.
 * Embeds into any settings panel, profile page, or dressing room.
 *
 * Usage:
 *   <AvatarAudioSettings profileId="default" />
 *   <AvatarAudioSettings profileId="bigace" compact />
 */

import { useAvatarAudio } from '@/hooks/useAvatarAudio';
import type { AvatarAudioSettings as Settings } from '@/hooks/useAvatarAudio';

interface Props {
  profileId?: string;
  /** Compact mode shows only master toggle + volume */
  compact?: boolean;
}

type BoolKey = keyof {
  [K in keyof Settings as Settings[K] extends boolean ? K : never]: true;
};

const TOGGLE_LABELS: Array<{ key: BoolKey; label: string }> = [
  { key: 'movementSounds', label: 'Movement (sit / stand / walk)' },
  { key: 'clothingSounds', label: 'Clothing (fabric / leather / jewelry)' },
  { key: 'emoteSounds',    label: 'Emotes (wave / dance / cheer)' },
  { key: 'gestureSounds',  label: 'Gestures (point / thumbs-up)' },
  { key: 'uiSounds',       label: 'Dressing room (equip / outfit)' },
  { key: 'hostSounds',     label: 'Host character sounds' },
];

export default function AvatarAudioSettings({ profileId = 'default', compact = false }: Props) {
  const { settings, updateSettings, context } = useAvatarAudio(profileId);

  const isBlocked = context === 'live_performance' || context === 'host_speaking';

  return (
    <div
      style={{
        background: 'rgba(10,6,20,0.85)',
        border: '1px solid rgba(0,255,255,0.15)',
        borderRadius: 10,
        padding: compact ? '10px 14px' : '16px 18px',
        display: 'grid',
        gap: 10,
        fontSize: 12,
        color: '#e0e0e0',
        fontFamily: 'var(--font-tmi-inter, sans-serif)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#00FFFF' }}>
          Avatar Sounds
        </span>
        {isBlocked && (
          <span
            style={{
              fontSize: 9,
              background: 'rgba(255,0,64,0.2)',
              border: '1px solid rgba(255,0,64,0.4)',
              color: '#FF4060',
              borderRadius: 4,
              padding: '2px 6px',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            MUTED DURING PERFORMANCE
          </span>
        )}
      </div>

      {/* Master toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <Toggle
          checked={settings.enabled}
          onChange={(v) => updateSettings({ enabled: v })}
        />
        <span style={{ fontWeight: 600 }}>Enable avatar sounds</span>
      </label>

      {!compact && settings.enabled && (
        <>
          {/* Volume slider */}
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
              <span>Volume</span>
              <span>{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                accentColor: '#00FFFF',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.4 }}>
              <span>Silent</span>
              <span>Subtle (recommended)</span>
              <span>Full</span>
            </div>
          </div>

          {/* Per-category toggles */}
          <div style={{ display: 'grid', gap: 6, paddingTop: 4 }}>
            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Categories
            </div>
            {TOGGLE_LABELS.map(({ key, label }) => (
              <label
                key={key}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', opacity: settings.enabled ? 1 : 0.4 }}
              >
                <Toggle
                  checked={!!settings[key]}
                  onChange={(v) => updateSettings({ [key]: v } as Partial<Settings>)}
                  disabled={!settings.enabled}
                  small
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {/* Context note */}
      {isBlocked && (
        <div style={{ fontSize: 10, opacity: 0.5, paddingTop: 2 }}>
          Avatar sounds are automatically muted while a live performance is active.
          They restore when you leave the venue.
        </div>
      )}
    </div>
  );
}

// ── Minimal toggle component ────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled = false,
  small = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  small?: boolean;
}) {
  const w = small ? 28 : 36;
  const h = small ? 16 : 20;
  const r = small ? 8 : 10;
  const knob = small ? 12 : 16;
  const offset = small ? 2 : 2;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: checked ? '#00FFFF' : 'rgba(255,255,255,0.15)',
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s',
        outline: 'none',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: offset,
          left: checked ? w - knob - offset : offset,
          width: knob,
          height: knob,
          borderRadius: '50%',
          background: checked ? '#050510' : 'rgba(255,255,255,0.6)',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}
