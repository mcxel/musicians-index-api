'use client';

import React from 'react';

export type VideoResolution = 'AUTO' | '720p' | '1080p' | '1440p' | '4K' | '8K';

export interface ActionRailProps {
  cameraOn: boolean;
  micOn: boolean;
  speakerOn: boolean;
  recording?: boolean;
  resolution?: VideoResolution;
  accentColor?: string;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onFullscreen?: () => void;
  onSwitchCamera?: () => void;
  onResolutionChange?: (res: VideoResolution) => void;
  onRecordToggle?: () => void;
  onLeave?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function ActionRail({
  cameraOn,
  micOn,
  speakerOn,
  recording = false,
  resolution = 'AUTO',
  accentColor = '#00FFFF',
  onToggleCamera,
  onToggleMic,
  onToggleSpeaker,
  onFullscreen,
  onSwitchCamera,
  onResolutionChange,
  onRecordToggle,
  onLeave,
  style,
  className
}: ActionRailProps) {
  const btnStyle = (isActive: boolean, isDanger = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: isActive ? (isDanger ? 'rgba(230,48,0,0.2)' : `rgba(255,255,255,0.1)`) : 'rgba(0,0,0,0.4)',
    border: `1px solid ${isActive ? (isDanger ? '#E63000' : 'rgba(255,255,255,0.3)') : 'rgba(255,255,255,0.1)'}`,
    color: isActive ? (isDanger ? '#E63000' : '#fff') : 'rgba(255,255,255,0.4)',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  });

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: 'rgba(5,5,16,0.85)',
        borderTop: `1px solid ${accentColor}44`,
        backdropFilter: 'blur(10px)',
        flexWrap: 'wrap',
        ...style
      }}
    >
      <button onClick={onToggleCamera} style={btnStyle(cameraOn)}>
        {cameraOn ? '🎥 CAM ON' : '🚫 CAM OFF'}
      </button>
      <button onClick={onToggleMic} style={btnStyle(micOn)}>
        {micOn ? '🎤 MIC ON' : '🔇 MIC OFF'}
      </button>
      <button onClick={onToggleSpeaker} style={btnStyle(speakerOn)}>
        {speakerOn ? '🔊 SPEAKER ON' : '🔈 SPEAKER OFF'}
      </button>
      
      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      
      {onSwitchCamera && <button onClick={onSwitchCamera} style={btnStyle(true)}>📷 SWITCH</button>}
      
      {onResolutionChange && (
        <select 
          value={resolution} 
          onChange={(e) => onResolutionChange(e.target.value as VideoResolution)}
          style={{ ...btnStyle(true), appearance: 'none', outline: 'none' }}
        >
          {['AUTO', '720p', '1080p', '1440p', '4K', '8K'].map(r => (
            <option key={r} value={r} style={{ background: '#050510', color: '#fff' }}>🎞 {r}</option>
          ))}
        </select>
      )}

      {onRecordToggle && (
        <button onClick={onRecordToggle} style={btnStyle(recording, true)}>
          {recording ? '⏹ RECORDING' : '💾 RECORD'}
        </button>
      )}
      {onFullscreen && <button onClick={onFullscreen} style={btnStyle(true)}>📺 FULLSCREEN</button>}

      {onLeave && (
        <>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          <button onClick={onLeave} style={{ ...btnStyle(true), background: 'rgba(230,48,0,0.15)', color: '#E63000', borderColor: 'rgba(230,48,0,0.4)' }}>❌ LEAVE</button>
        </>
      )}
    </div>
  );
}