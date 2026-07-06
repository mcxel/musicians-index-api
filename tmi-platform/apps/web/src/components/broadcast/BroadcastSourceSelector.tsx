"use client";

// BroadcastSourceSelector — the standard per-monitor "SRC" dropdown.
// Every monitor surface uses this instead of inventing its own switcher.
export interface BroadcastSourceOption {
  value: string;
  label: string;
}

export function BroadcastSourceSelector({
  value,
  options,
  onSelect,
  size = 'big',
}: {
  value: string;
  options: BroadcastSourceOption[];
  onSelect: (value: string) => void;
  size?: 'big' | 'mini';
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 6,
        left: 7,
        zIndex: 6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'rgba(0,0,0,0.58)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 6,
        padding: '2px 5px',
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <span style={{ fontSize: size === 'big' ? 8 : 7, letterSpacing: '0.08em', fontWeight: 800, color: 'rgba(255,255,255,0.74)' }}>
        SRC
      </span>
      <select
        aria-label="Monitor source"
        value={value}
        onChange={(event) => onSelect(event.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#f7f2ff',
          fontSize: size === 'big' ? 8 : 7,
          fontWeight: 700,
          outline: 'none',
          maxWidth: size === 'big' ? 118 : 90,
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BroadcastSourceSelector;
