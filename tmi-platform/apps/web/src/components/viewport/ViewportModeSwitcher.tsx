'use client';

import React from 'react';
import type { ViewportMode } from './UniversalViewportEngine';

interface ViewportModeSwitcherProps {
  currentMode: ViewportMode;
  setMode: (mode: ViewportMode) => void;
  modes: { mode: ViewportMode; label: string; icon: string }[];
}

const C = {
  buttonBg: 'rgba(20, 20, 40, 0.5)',
  buttonBorder: '1px solid rgba(170, 45, 255, 0.2)',
  buttonHoverBg: 'rgba(40, 40, 80, 0.7)',
  activeButtonBg: 'rgba(170, 45, 255, 0.2)',
  activeButtonBorder: '1px solid rgba(170, 45, 255, 0.5)',
  textColor: 'rgba(255, 255, 255, 0.7)',
  activeTextColor: '#fff',
};

export function ViewportModeSwitcher({ currentMode, setMode, modes }: ViewportModeSwitcherProps) {
  return (
    <div className="flex justify-center items-center gap-2 p-2 mb-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
      {modes.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => setMode(mode)}
          style={{
            background: currentMode === mode ? C.activeButtonBg : C.buttonBg,
            border: currentMode === mode ? C.activeButtonBorder : C.buttonBorder,
            color: currentMode === mode ? C.activeTextColor : C.textColor,
            transition: 'all 0.2s ease-in-out',
          }}
          className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 backdrop-blur-sm hover:bg-purple-400/20"
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}