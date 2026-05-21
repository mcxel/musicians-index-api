"use client";

import { directorEngine, DirectorState } from "@/lib/director/SmartCameraDirectorEngine";

export default function DirectorOverlayControls({ state }: { state: DirectorState }) {
  return (
    <div className="absolute top-6 right-6 z-[100] flex flex-col gap-3 bg-black/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl shadow-2xl">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-1">
        <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
          Director Panel
        </h3>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      </div>
      
      <select 
        className="bg-zinc-900 text-cyan-400 text-xs p-2 rounded-lg border border-zinc-800 outline-none focus:border-cyan-500 transition-colors"
        value={state.mode}
        onChange={(e) => directorEngine.setMode(e.target.value as any)}
      >
        <option value="world-release">Mode: World Release</option>
        <option value="versus-2026">Mode: Versus 2026</option>
        <option value="guest-jam">Mode: Guest Jam</option>
        <option value="dj-residency">Mode: DJ Residency</option>
        <option value="comedy-room">Mode: Comedy Room</option>
        <option value="dance-battle">Mode: Dance Battle</option>
        <option value="choir-ensemble">Mode: Choir / Ensemble</option>
        <option value="theater-play">Mode: Theater / Play Stage</option>
      </select>

      {state.mode === "world-release" && (
        <button 
          onClick={() => directorEngine.setMedia("MUSIC_VIDEO_HD", !state.isMediaPlaying)}
          className="bg-magenta-500/10 border border-magenta-500/30 text-magenta-400 hover:bg-magenta-500/30 text-xs py-2 px-3 rounded-lg transition-colors font-bold uppercase tracking-wider"
        >
          {state.isMediaPlaying ? "Stop Video (Pop Artist)" : "Play Video (PiP Artist)"}
        </button>
      )}

      {state.mode === "versus-2026" && (
        <>
          <button 
            onClick={() => directorEngine.setParticipants(state.secondaryCameraId || "Opponent", state.primaryCameraId || "Main")}
            className="bg-zinc-800 text-white hover:bg-zinc-700 text-xs py-2 px-3 rounded-lg transition-colors font-bold uppercase tracking-wider"
          >
            Swap Focus
          </button>
          <button 
            onClick={() => directorEngine.toggleVoting(!state.votingActive)}
            className={`border text-xs py-2 px-3 rounded-lg transition-colors font-bold uppercase tracking-wider ${state.votingActive ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30' : 'bg-zinc-800 border-transparent text-zinc-400 hover:text-white'}`}
          >
            {state.votingActive ? "Close Voting" : "Open Voting (Split)"}
          </button>
        </>
      )}

      {state.mode === "guest-jam" && (
        <>
          <button 
            onClick={() => directorEngine.setActiveSpeaker(state.activeSpeakerId === "both" ? "main" : "both")}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs py-2 px-3 rounded-lg transition-colors font-bold uppercase tracking-wider"
          >
            {state.layout === 'split' ? "Focus Main" : "Split View"}
          </button>
        </>
      )}

      {(state.mode === "choir-ensemble" || state.mode === "theater-play") && (
        <button 
          onClick={() => directorEngine.setActiveSpeaker(state.activeSpeakerId ? null : state.primaryCameraId)}
          className="bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 text-xs py-2 px-3 rounded-lg transition-colors font-bold uppercase tracking-wider"
        >
          {state.layout === 'pip' ? "Return to Mosaic" : "Focus Active Soloist"}
        </button>
      )}
    </div>
  );
}