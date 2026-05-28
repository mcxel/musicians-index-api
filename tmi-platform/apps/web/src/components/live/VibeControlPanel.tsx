import React from 'react';
import { VibeState, RoomRole, ShaderQuality, VIBE_PRESETS } from '../../types/vibe';

interface VibeControlPanelProps {
  role: RoomRole;
  vibeState: VibeState;
  onVibeChange: (newState: Partial<VibeState>) => void;
}

export const VibeControlPanel: React.FC<VibeControlPanelProps> = ({ role, vibeState, onVibeChange }) => {
  if (role === 'fan') {
    return (
      <div className="vibe-control-panel read-only p-5 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <h3 className="text-sm font-black mb-3 uppercase tracking-[0.2em] text-gray-400 drop-shadow-md">Live Atmosphere</h3>
        <p className="text-sm flex justify-between items-center mb-1">Environment <span className="text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] uppercase text-xs">{vibeState.underlay}</span></p>
        <p className="text-sm flex justify-between items-center mb-1">Energy <span className="text-pink-500 font-bold drop-shadow-[0_0_8px_rgba(236,72,153,0.6)] uppercase text-xs">{vibeState.overlay || 'None'}</span></p>
        <p className="text-sm flex justify-between items-center">Spotlight <span className="text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] uppercase text-xs">{vibeState.spotlightMode ? 'Active' : 'Off'}</span></p>
      </div>
    );
  }

  return (
    <div className="vibe-control-panel p-5 bg-black/50 backdrop-blur-3xl text-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 relative">
      <h3 className="text-xs font-black mb-5 text-cyan-400 uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Stage Energy Director</h3>
      
      <div className="mb-5 pb-5 border-b border-white/10">
        <label className="block mb-3 text-[10px] uppercase tracking-widest font-bold text-gray-400">Cinematic Presets</label>
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => onVibeChange(VIBE_PRESETS['gospel-lift'])}
            className="px-4 py-3 bg-gradient-to-r from-white/5 to-transparent hover:from-amber-500/20 border border-white/5 hover:border-amber-500/50 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-3 shadow-lg"
          >
            ✨ Gospel Lift
          </button>
          <button 
            onClick={() => onVibeChange(VIBE_PRESETS['hip-hop-cypher'])}
            className="px-4 py-3 bg-gradient-to-r from-white/5 to-transparent hover:from-fuchsia-500/20 border border-white/5 hover:border-fuchsia-500/50 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-3 shadow-lg"
          >
            🔥 Hip-Hop Cypher
          </button>
          <button 
            onClick={() => onVibeChange(VIBE_PRESETS['lofi-writing'])}
            className="px-4 py-3 bg-gradient-to-r from-white/5 to-transparent hover:from-indigo-500/20 border border-white/5 hover:border-indigo-500/50 rounded-lg text-xs font-bold transition-all text-left flex items-center gap-3 shadow-lg"
          >
            🌌 Lo-Fi Writing Room
          </button>
        </div>
      </div>

      <div className="mb-5">
        <label className="block mb-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">Environment</label>
        <select 
          className="w-full p-3 bg-black/40 rounded-lg border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all shadow-inner text-sm appearance-none"
          value={vibeState.underlay}
          onChange={(e) => onVibeChange({ underlay: e.target.value })}
        >
          <option value="none">None</option>
          <option value="stellar-drift">Stellar Drift</option>
          <option value="neon-pulse">Neon Pulse</option>
          <option value="fog-tunnel">Fog Tunnel</option>
          <option value="city-lights">City Lights</option>
          <option value="green-screen-virtual">Virtual Stage (Chroma Assist)</option>
          <option value="gradient-flow">Gradient Flow</option>
        </select>
      </div>

      <div className="mb-5">
        <label className="block mb-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">Energy FX</label>
        <select 
          className="w-full p-3 bg-black/40 rounded-lg border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition-all shadow-inner text-sm appearance-none"
          value={vibeState.overlay}
          onChange={(e) => onVibeChange({ overlay: e.target.value })}
        >
          <option value="none">None</option>
          <option value="strobe-pulse">Strobe Pulse</option>
          <option value="spotlight-flare">Spotlight Flare</option>
          <option value="holographic-rain">Holographic Rain</option>
          <option value="crowd-particles">Audience Particles</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 flex justify-between">Strobe Pulse <span className="text-pink-400">{Math.round(vibeState.strobeIntensity * 100)}%</span></label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05"
          value={vibeState.strobeIntensity}
          onChange={(e) => onVibeChange({ strobeIntensity: parseFloat(e.target.value) })}
          className="w-full accent-pink-500 h-1 bg-white/10 rounded-full appearance-none outline-none cursor-pointer"
        />
      </div>

      <div className="mb-4 flex items-center bg-black/30 p-3 rounded-lg border border-white/5 hover:border-yellow-400/30 transition-colors">
        <input 
          type="checkbox" 
          id="spotlightToggle"
          checked={vibeState.spotlightMode}
          onChange={(e) => onVibeChange({ spotlightMode: e.target.checked })}
          className="mr-3 accent-yellow-400 w-5 h-5 cursor-pointer"
        />
        <label htmlFor="spotlightToggle" className="text-sm font-bold text-gray-200 cursor-pointer w-full tracking-wide">Spotlight Array</label>
      </div>
      
      <div className="mt-6 pt-5 border-t border-white/10">
        <label className="block mb-2 text-[9px] uppercase tracking-widest font-bold text-gray-500">Render Engine Quality</label>
        <select 
          className="w-full p-2 bg-transparent rounded border border-white/10 text-xs text-gray-400 focus:outline-none appearance-none cursor-pointer"
          value={vibeState.shaderQuality}
          onChange={(e) => onVibeChange({ shaderQuality: e.target.value as ShaderQuality })}
        >
          <option value="low">Low (Mobile Safe / High FPS)</option>
          <option value="medium">Medium</option>
          <option value="high">High (Performance Rig)</option>
        </select>
      </div>
    </div>
  );
};