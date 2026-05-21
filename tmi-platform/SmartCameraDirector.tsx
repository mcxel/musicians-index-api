"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { directorEngine, DirectorState } from "@/lib/director/SmartCameraDirectorEngine";
import DirectorOverlayControls from "./DirectorOverlayControls";

export default function SmartCameraDirector() {
  const [state, setState] = useState<DirectorState | null>(null);

  useEffect(() => {
    setState(directorEngine.getState());
    const unsub = directorEngine.subscribe(setState);
    return unsub;
  }, []);

  if (!state) return null;

  const { mode, layout, isMediaPlaying, votingActive, primaryCameraId, secondaryCameraId, mediaId } = state;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center font-mono">
      {mode === "world-release" && (
        <WorldReleaseLayout 
          isMediaPlaying={isMediaPlaying} 
          mediaId={mediaId} 
          primaryCameraId={primaryCameraId} 
          layout={layout} 
        />
      )}
      {mode === "versus-2026" && (
        <VersusLayout 
          votingActive={votingActive} 
          primaryCameraId={primaryCameraId} 
          secondaryCameraId={secondaryCameraId} 
          layout={layout} 
        />
      )}
      {mode === "guest-jam" && (
        <GuestJamLayout 
          primaryCameraId={primaryCameraId} 
          secondaryCameraId={secondaryCameraId} 
          layout={layout} 
        />
      )}
      {(mode === "dj-residency" || mode === "comedy-room" || mode === "dance-battle") && (
        <UniversalSoloLayout 
          primaryCameraId={primaryCameraId}
          secondaryCameraId={secondaryCameraId}
          layout={layout}
          mode={mode}
        />
      )}
      {(mode === "choir-ensemble" || mode === "theater-play") && (
        <MosaicEnsembleLayout 
          primaryCameraId={primaryCameraId}
          layout={layout}
          mode={mode}
        />
      )}

      {/* Director Tools (Visible to Host/Operator only) */}
      <DirectorOverlayControls state={state} />
    </div>
  );
}

function WorldReleaseLayout({ isMediaPlaying, mediaId, primaryCameraId, layout }: any) {
  return (
    <>
      <AnimatePresence>
        {isMediaPlaying && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950"
          >
            <div className="text-zinc-600 font-bold uppercase tracking-widest">Media Canvas: {mediaId || "Awaiting Source"}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={{
          width: layout === "pip" ? "280px" : "100%",
          height: layout === "pip" ? "158px" : "100%",
          bottom: layout === "pip" ? "30px" : "0px",
          right: layout === "pip" ? "30px" : "0px",
          zIndex: layout === "pip" ? 50 : 5,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className={`absolute overflow-hidden ${layout === 'pip' ? 'rounded-2xl border-2 border-cyan-500 shadow-[0_0_30px_rgba(0,255,255,0.3)]' : ''}`}
      >
        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-cyan-500 font-bold">
          Primary Cam: {primaryCameraId}
        </div>
      </motion.div>
    </>
  );
}

function VersusLayout({ votingActive, primaryCameraId, secondaryCameraId, layout }: any) {
  return (
    <div className="w-full h-full relative flex">
      <motion.div 
        animate={{ width: layout === "split" ? "50%" : "100%", zIndex: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="h-full bg-zinc-900 border-r-2 border-magenta-500/50 flex items-center justify-center text-magenta-400 font-bold"
      >
        Active Performer: {primaryCameraId}
      </motion.div>

      {secondaryCameraId && (
        <motion.div
          animate={{
            width: layout === "split" ? "50%" : "240px",
            height: layout === "split" ? "100%" : "135px",
            top: layout === "split" ? "0px" : "30px",
            right: layout === "split" ? "0px" : "30px",
            position: layout === "split" ? "relative" : "absolute",
            zIndex: 20
          }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className={`bg-zinc-950 flex items-center justify-center text-zinc-500 font-bold overflow-hidden ${layout === 'pip' ? 'rounded-xl border border-zinc-700 shadow-xl' : ''}`}
        >
          Opponent: {secondaryCameraId}
        </motion.div>
      )}

      <AnimatePresence>
        {votingActive && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-black/80 px-10 py-5 rounded-full border border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.2)] backdrop-blur-md"
          >
            <div className="text-yellow-500 font-black tracking-[0.3em] uppercase text-sm">Audience Voting Open</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuestJamLayout({ primaryCameraId, secondaryCameraId, layout }: any) {
  return (
    <div className="w-full h-full relative flex">
      <motion.div 
        animate={{ width: layout === "split" ? "50%" : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="h-full bg-zinc-900 flex items-center justify-center text-emerald-400 font-bold"
      >
        Host: {primaryCameraId}
      </motion.div>
      {secondaryCameraId && (
        <motion.div 
          animate={{
            width: layout === "split" ? "50%" : "280px",
            height: layout === "split" ? "100%" : "158px",
            bottom: layout === "split" ? "0px" : "30px",
            left: layout === "split" ? "0px" : "30px",
            position: layout === "split" ? "relative" : "absolute",
            zIndex: 20
          }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className={`bg-zinc-950 flex items-center justify-center text-emerald-600 font-bold overflow-hidden ${layout === 'pip' ? 'rounded-2xl border border-emerald-500/30 shadow-xl' : ''}`}
        >
          Guest: {secondaryCameraId}
        </motion.div>
      )}
    </div>
  );
}

function UniversalSoloLayout({ primaryCameraId, secondaryCameraId, layout, mode }: any) {
  return (
    <div className="w-full h-full relative">
      <motion.div 
        animate={{
          scale: layout === "hand-cam" ? 1.5 : 1, // Cinematic zoom for DJs
          y: layout === "hand-cam" ? "20%" : "0%",
        }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-cyan-400 font-bold"
      >
        <div>{mode.toUpperCase()} MODE</div>
        <div className="text-2xl text-white">{primaryCameraId}</div>
      </motion.div>
      {layout === "pip" && secondaryCameraId && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-[30px] right-[30px] w-[280px] h-[158px] bg-zinc-950 flex flex-col items-center justify-center rounded-2xl border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] z-20"
        >
          <div className="text-xs text-yellow-500 uppercase">Reaction / Crowd</div>
          <div className="font-bold text-white">{secondaryCameraId}</div>
        </motion.div>
      )}
    </div>
  );
}

function MosaicEnsembleLayout({ primaryCameraId, layout, mode }: any) {
  // Simulating a 4-person band / cast or wide theater stage
  return (
    <div className="w-full h-full bg-black p-4">
      <motion.div 
        animate={{ 
          gap: layout === "scene-wide" ? "0px" : "16px",
          padding: layout === "pip" ? "40px" : "0px",
        }}
        className={`w-full h-full ${layout !== 'pip' ? 'grid grid-cols-2 grid-rows-2' : 'flex items-center justify-center'}`}
      >
        <div className={`bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold ${layout === 'pip' ? 'w-full h-full rounded-2xl border-cyan-500 shadow-2xl' : 'w-full h-full'}`}>
          {layout === 'pip' ? `Active Actor/Soloist: ${primaryCameraId}` : `${mode === 'theater-play' ? 'Stage View' : 'Ensemble Grid'}`}
        </div>
      </motion.div>
    </div>
  );
}