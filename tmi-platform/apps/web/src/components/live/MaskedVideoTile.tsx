import React from 'react';
import { VibeState } from '../../types/vibe';

interface MaskedVideoTileProps {
  participantId: string;
  videoStreamUrl?: string; // WebRTC media stream reference goes here
  vibeState: VibeState;
  isAudioActive?: boolean;
  participantName: string;
}

export const MaskedVideoTile: React.FC<MaskedVideoTileProps> = ({ 
  participantId, 
  videoStreamUrl, 
  vibeState, 
  isAudioActive,
  participantName 
}) => {
  // Layer 1: Underlay logic (maps to canvas shaders/CSS classes)
  const getUnderlayClass = () => {
    switch (vibeState.underlay) {
      case 'stellar-drift': return 'bg-gradient-to-b from-indigo-900 to-black animate-pulse'; // Placeholder for shader
      case 'neon-pulse': return 'bg-fuchsia-900 animate-pulse';
      case 'city-lights': return 'bg-blue-900';
      case 'green-screen-virtual': return 'bg-[url("/assets/stages/virtual-chroma.jpg")] bg-cover bg-center';
      case 'gradient-flow': return 'bg-gradient-to-tr from-amber-400 via-orange-300 to-rose-500 opacity-90';
      default: return 'bg-gray-900';
    }
  };

  // Layer 3: Overlay logic
  const getOverlayClass = () => {
    switch (vibeState.overlay) {
      case 'strobe-pulse': return 'mix-blend-overlay bg-white animate-ping';
      case 'spotlight-flare': return 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent';
      case 'holographic-rain': return 'bg-[url("/assets/fx/rain-overlay.png")] mix-blend-screen opacity-50';
      case 'crowd-particles': return 'bg-[url("/assets/fx/sparks.png")] mix-blend-screen opacity-60 animate-pulse';
      default: return '';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ease-in-out ${isAudioActive ? 'scale-[1.02] z-20 ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : 'ring-1 ring-white/10 hover:ring-white/30 shadow-2xl'} bg-black`}>
      
      {/* Layer 1: Underlay (Environment) */}
      <div className={`absolute inset-0 z-0 ${getUnderlayClass()} transition-colors duration-700`} style={{ opacity: vibeState.shaderQuality === 'low' ? 0.7 : 1 }}></div>
      
      {/* Physical Monitor Inner Vignette / CRT Shadow */}
      <div className="absolute inset-0 z-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"></div>

      {/* Layer 2: Subject (Video Feed prioritizes first) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {videoStreamUrl ? (
          <div className="relative w-full h-full">
             <video src={videoStreamUrl} autoPlay muted className="w-full h-full object-cover mix-blend-screen" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center backdrop-blur-sm bg-black/20">
             {/* High-Fidelity Avatar component injected here if no video */}
             <span className="text-gray-500 font-bold tracking-widest text-xs uppercase">Connecting Video...</span>
          </div>
        )}
      </div>

      {/* Layer 3: Overlay (Energy) */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-200 ${getOverlayClass()}`} style={{ opacity: vibeState.strobeIntensity }}></div>

      {/* Glass Reflection / Glare Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-50"></div>

      {/* Spotlight Assist */}
      {vibeState.spotlightMode && (
        <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-white/20 mix-blend-screen"></div>
      )}

      {/* Performer Metadata HUD */}
      <div className="absolute bottom-4 left-4 z-40 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-lg text-white text-xs font-black tracking-widest flex items-center space-x-3 border border-white/10 shadow-lg">
        <span className="drop-shadow-md">{participantName}</span>
        {isAudioActive && <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,1)] animate-pulse"></span>}
      </div>
    </div>
  );
};