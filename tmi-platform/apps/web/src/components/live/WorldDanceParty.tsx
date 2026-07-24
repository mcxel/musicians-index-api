"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/lib/sound/playSound";
import { getAvatarProceduralDNA, type SwaggerProfile } from "@/lib/avatars/ProceduralStyleMatrix";
import { computeLiveAvatarState, type BehaviorWeights } from "@/lib/avatars/BehaviorConsumer";
import { computeVisualBlendState, type IntentType } from "@/lib/avatars/AnimationDirector";
import { avatarBehavioralDirector } from "@/lib/avatars/AvatarBehavioralDirector";
import { perceptionPipeline } from "@/lib/avatars/PerceptionPipeline";
import HostPresenter from "@/components/environment/HostPresenter";
import TmiVenueBackground from "@/components/environment/TmiVenueBackground";

interface Dancer {
  id: string;
  name: string;
  avatarEmoji: string;
  x: number; // coordinate percentage (0 - 100)
  y: number; // coordinate percentage (0 - 100)
  swagger: SwaggerProfile;
  intensity: number;
  timingOffsetMs: number;
  weights: BehaviorWeights;
  activeIntent: IntentType;
  lastIntentChange: number;
  activeBubble?: string;
  influenceRadius?: number;
}

interface WorldDancePartyProps {
  bpm: number;
  activeColor: string;
  ralphAnimLabel: string;
  ralphAnimColor: string;
  currentTrackTitle: string;
  currentTrackArtist: string;
}

const EMOJIS = ["👤", "👽", "🤖", "🦊", "🦁", "🐼", "🐻", "🐸"];
const BOT_NAMES = [
  "RapperFan", "MusicHead", "VibeMaster", "LofiExplorer",
  "BeatDrop", "Solfeggio", "AudioLover", "GoldMic",
  "Starlight", "HyperPop", "GlitchCat", "DivaCrew"
];

const BOT_PHRASES = [
  "Insane mix! 🔊", "Unlocking advanced grooves!", "Bass drop was heavy! 🔥",
  "Amapiano rhythms! 🌍", "Line dance incoming!", "This energy is wild"
];

export default function WorldDanceParty({
  bpm,
  activeColor,
  ralphAnimLabel,
  ralphAnimColor,
  currentTrackTitle,
  currentTrackArtist,
}: WorldDancePartyProps) {
  const [dancers, setDancers] = useState<Dancer[]>([]);
  const [userPos, setUserPos] = useState({ x: 50, y: 65 });
  const [selectedDancerId, setSelectedDancerId] = useState<string | null>(null);
  const [reactionBurst, setReactionBurst] = useState<Array<{ id: string; x: number; y: number; text: string }>>([]);
  const [sprayActive, setSprayActive] = useState(false);

  const floorRef = useRef<HTMLDivElement>(null);
  // Ref holds the latest behavioral snapshot so the dancer update interval
  // can read it without needing it in the dependency array.
  const behavioralRef = useRef(avatarBehavioralDirector.getSnapshot());

  // Subscribe to behavioral director (sentiment / beat events from PerceptionPipeline)
  useEffect(() => {
    return avatarBehavioralDirector.registerListener((update) => {
      behavioralRef.current = update;
    });
  }, []);

  // Start perception pipeline for beat simulation (no live stream on dance floor)
  useEffect(() => {
    perceptionPipeline.startAudioAnalysis();
    return () => perceptionPipeline.stopAudioAnalysis();
  }, []);

  // Helper to generate deterministic behavior weights for dancers
  const makeWeights = (seed: string): BehaviorWeights => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    const val = (idx: number) => 0.2 + (Math.abs(hash + idx * 13) % 71) * 0.01;

    return {
      comedyAffinity: val(1),
      danceAffinity: val(2),
      competitionIntensity: val(3),
      socialParticipation: val(4),
      musicResponsiveness: val(5),
      calmness: val(6) * 0.4,
    };
  };

  // Seed initial dancers scattered on the open floor (no seats)
  useEffect(() => {
    const list: Dancer[] = [];
    for (let i = 0; i < 12; i++) {
      const id = `dancer-bot-${i}`;
      const dna = getAvatarProceduralDNA(id);
      list.push({
        id,
        name: BOT_NAMES[i % BOT_NAMES.length]!,
        avatarEmoji: EMOJIS[i % EMOJIS.length]!,
        x: 15 + Math.random() * 70,
        y: 35 + Math.random() * 45,
        swagger: dna.swagger,
        intensity: dna.intensityMultiplier,
        timingOffsetMs: dna.timingOffsetMs,
        weights: makeWeights(id),
        activeIntent: "IDLE",
        lastIntentChange: Date.now(),
      });
    }
    setDancers(list);
  }, []);

  // Floor click to glide user avatar
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!floorRef.current) return;
    const rect = floorRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setUserPos({ x, y });
    playSound("ui-whoosh-bubbles.mp3");
  };

  // Periodic AI dance state updates and local social influence cascade check
  useEffect(() => {
    const interval = setInterval(() => {
      setDancers((prev) =>
        prev.map((d) => {
          // If selected for interaction, bypass standard idle loops
          if (selectedDancerId === d.id) return d;

          // Check proximity to user or nearby active dancers to propagate social cascades
          // If another dancer is standing & dancing within 15px radius, this avatar gains dance affinity
          let localInfluence = false;
          const userDist = Math.sqrt((d.x - userPos.x) ** 2 + (d.y - userPos.y) ** 2);
          if (userDist < 16) {
            localInfluence = true;
          }

          // Drive intent from behavioral layer (perception pipeline → sentiment → emotion)
          const dna = getAvatarProceduralDNA(d.id);
          // Map BPM to crowd energy (0–100): 80 BPM → 0, 160 BPM → 96
          const crowdEnergy = Math.min(100, Math.max(0, (bpm - 80) * 1.2));
          const liveEmotion = computeLiveAvatarState(dna, d.weights, behavioralRef.current, crowdEnergy);

          let nextIntent: IntentType = d.activeIntent;
          // Proximity social influence overrides behavioral output for immersive cascade
          if (localInfluence) {
            nextIntent = "STAND_AND_DANCE";
          } else {
            switch (liveEmotion.animationState) {
              case "dancing":   nextIntent = "STAND_AND_DANCE"; break;
              case "clapping":  nextIntent = "CLAP";            break;
              case "shocked":   nextIntent = "SHOCK";           break;
              case "afraid":    nextIntent = "FLINCH";          break;
              case "listening": nextIntent = "LOOK_AT_STAGE";   break;
              default:          nextIntent = "IDLE";            break;
            }
          }

          // Speech bubble chance driven by behavioral layer's socialParticipation weight
          const bubble = Math.random() < liveEmotion.bubbleChance
            ? BOT_PHRASES[Math.floor(Math.random() * BOT_PHRASES.length)]
            : d.activeBubble;

          return {
            ...d,
            activeIntent: nextIntent,
            activeBubble: bubble,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [userPos, selectedDancerId]);

  // Social Interaction Commands
  const triggerSocialInteraction = (action: "dance" | "cheer" | "highfive" | "circle") => {
    if (!selectedDancerId) return;

    setDancers((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDancerId) return d;

        let nextIntent: IntentType = "STAND_AND_DANCE";
        let bubbleText = "";

        if (action === "dance") {
          nextIntent = "STAND_AND_DANCE";
          bubbleText = "Let's dance! 🕺✨";
          playSound("ui-whoosh-bubbles.mp3");
        } else if (action === "cheer") {
          nextIntent = "CLAP";
          bubbleText = "Clap it up! 🙌";
          playSound("battle_vs_gong.mp3");
        } else if (action === "highfive") {
          nextIntent = "SHOCK";
          bubbleText = "High five! 💥";
          playSound("ui-whoosh-bubbles.mp3");
        } else if (action === "circle") {
          nextIntent = "STAND_AND_DANCE";
          bubbleText = "DANCE CIRCLE FORMING! ⭕";
          playSound("battle_vs_gong.mp3");
        }

        return {
          ...d,
          activeIntent: nextIntent,
          activeBubble: bubbleText,
        };
      })
    );

    // Add visual reaction burst on screen
    const target = dancers.find((d) => d.id === selectedDancerId);
    if (target) {
      const burstId = `${Date.now()}-${Math.random()}`;
      setReactionBurst((prev) => [
        ...prev,
        { id: burstId, x: target.x, y: target.y - 12, text: action === "highfive" ? "💥" : "✨" },
      ]);
      setTimeout(() => {
        setReactionBurst((prev) => prev.filter((b) => b.id !== burstId));
      }, 1000);
    }
  };

  // Money Spray Cannon Action
  const triggerMoneySpray = () => {
    setSprayActive(true);
    playSound("battle_vs_gong.mp3");
    
    // Spread bursts everywhere
    const tempBursts: typeof reactionBurst = [];
    for (let i = 0; i < 8; i++) {
      tempBursts.push({
        id: `spray-${i}-${Date.now()}`,
        x: 20 + Math.random() * 60,
        y: 40 + Math.random() * 40,
        text: "💸",
      });
    }
    setReactionBurst((prev) => [...prev, ...tempBursts]);

    setTimeout(() => {
      setSprayActive(false);
      setReactionBurst((prev) => prev.filter((b) => !b.id.startsWith("spray")));
    }, 1500);
  };

  return (
    <div 
      ref={floorRef}
      onClick={handleFloorClick}
      className="relative w-full aspect-[16/9] min-h-[460px] bg-[#050510] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between"
    >
      <TmiVenueBackground
        mode="arena"
        showAudience={false}
        showGrid={false}
        style={{ position: "absolute", inset: 0, minHeight: "100%", width: "100%", zIndex: 0, pointerEvents: "none" }}
      />
      {/* 3D stage and back wall styling */}
      <div className="absolute top-0 inset-x-0 h-[38%] bg-gradient-to-b from-[#0a0a20] to-[#080818] border-b border-white/10 flex justify-center items-end pb-4 z-10 pointer-events-none">
        
        {/* Elevated DJ Booth Stage */}
        <div className="w-52 h-14 bg-gradient-to-r from-purple-950 to-indigo-950 border-2 border-cyan-400 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.35)] flex flex-col items-center justify-center p-2 relative pointer-events-auto">
          {/* Neon strobe lasers */}
          <div className="absolute -top-12 inset-x-0 flex justify-around">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.9, 0.2], height: [20, 48, 20] }}
                transition={{ repeat: Infinity, duration: 60 / bpm, delay: i * 0.15 }}
                style={{ backgroundColor: activeColor }}
                className="w-0.5 rounded-full blur-[1px]"
              />
            ))}
          </div>

          {/* DJ Record Ralph — real reference portrait, idle blink/sway motion,
              anchored above this booth specifically */}
          <div className="absolute -top-[128px] left-1/2 -translate-x-1/2 z-20 pointer-events-none scale-75 transform-gpu origin-bottom">
            <HostPresenter
              hostSlug="record-ralph"
              accentColor={ralphAnimColor}
              mode="booth"
            />
          </div>

          <span className="text-[10px] font-black tracking-widest text-white">{ralphAnimLabel}</span>
          <span className="text-[8px] text-white/50 truncate max-w-[160px] mt-0.5">
            {currentTrackTitle} — {currentTrackArtist}
          </span>
        </div>
      </div>

      {/* OPEN-CONCEPT 3D DANCE FLOOR (no seats) */}
      <div className="flex-1 w-full relative z-20 flex items-center justify-center">
        {/* Reflective floor layout plane */}
        <div 
          style={{ transform: "rotateX(52deg)", transformOrigin: "bottom center" }}
          className="absolute inset-x-4 bottom-2 aspect-[16/6] bg-cyan-950/5 border border-cyan-500/10 rounded-2xl pointer-events-none"
        />

        {/* Dynamic 3D Avatars (bot/user) positioned at various coords */}
        {dancers.map((d) => {
          const isSelected = selectedDancerId === d.id;
          
          // Compute visual states using the Animation Director
          const visualState = computeVisualBlendState(
            d.id,
            {
              type: d.activeIntent,
              priority: isSelected ? 0.9 : 0.6,
              duration: 3500,
              targetCol: isSelected ? 4 : undefined,
            },
            d.avatarEmoji
          );

          // Position matching coords mapping
          return (
            <div
              key={d.id}
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                zIndex: Math.round(d.y),
              }}
              onClick={(e) => {
                e.stopPropagation(); // prevent moving user to this coord
                setSelectedDancerId(isSelected ? null : d.id);
                playSound("ui-whoosh-bubbles.mp3");
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              {/* Avatar Body Mesh */}
              <div
                style={{
                  transform: `translateY(${visualState.torsoYOffset}px) scale(${visualState.scaleMultiplier})`,
                  animationDelay: `${d.timingOffsetMs}ms`,
                  ["--beat-duration" as any]: `${60 / bpm}s`,
                  ["--bob-scale" as any]: d.intensity.toString(),
                }}
                className="relative flex flex-col items-center justify-center animate-beat-sync"
              >
                {/* Avatar Head */}
                <div
                  style={{
                    transform: `rotateY(${visualState.gazeYaw}deg) rotateX(${visualState.gazePitch}deg)`,
                    borderColor: isSelected ? activeColor : "rgba(0,255,255,0.4)",
                    boxShadow: isSelected ? `0 0 15px ${activeColor}` : "0 0 8px rgba(0,0,0,0.4)",
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg bg-zinc-950 border-2 transition-all duration-300 ${
                    isSelected ? "scale-110" : ""
                  }`}
                >
                  {visualState.faceEmoji}
                </div>

                {/* Name Tag */}
                <span className="text-[6.5px] font-bold tracking-wider mt-1 text-white/50 bg-black/60 px-1 py-0.5 rounded uppercase font-mono group-hover:text-cyan-300">
                  {d.name.slice(0, 6)}
                </span>

                {/* Speech Bubble */}
                <AnimatePresence>
                  {d.activeBubble && (
                    <motion.div
                      initial={{ scale: 0, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: -4, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-10 bg-white text-black px-2 py-1 rounded-lg shadow-2xl border border-neutral-300 w-max max-w-[120px] text-[7.5px] font-extrabold leading-tight text-center z-50"
                    >
                      {d.activeBubble}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2.5 h-2.5 bg-white rotate-45 border-r border-b border-neutral-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* User Local Avatar */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1.0 }}
          style={{ left: `${userPos.x}%`, top: `${userPos.y}%`, zIndex: Math.round(userPos.y) }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
        >
          <div className="w-9 h-9 rounded-full bg-fuchsia-600/10 border-2 border-fuchsia-500 shadow-[0_0_15px_#FF2DAA] flex items-center justify-center text-lg bg-zinc-950">
            👤
          </div>
          <span className="text-[6.5px] font-black text-fuchsia-400 mt-1 bg-black/80 px-1.5 py-0.5 rounded font-mono tracking-wider">YOU</span>
        </motion.div>

        {/* Reaction Burst Animation Layer */}
        <AnimatePresence>
          {reactionBurst.map((b) => (
            <motion.div
              key={b.id}
              initial={{ scale: 0.2, opacity: 0, y: 15 }}
              animate={{ scale: 1.5, opacity: 1, y: -25 }}
              exit={{ opacity: 0 }}
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
              className="absolute text-xl pointer-events-none z-50"
            >
              {b.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BOTTOM ACTIONS / MONETIZATION BAR */}
      <div className="relative z-30 bg-black/60 backdrop-blur-md border-t border-white/10 p-3 flex justify-between items-center">
        {/* Interaction Toolbar */}
        <div className="flex gap-2">
          <button
            onClick={() => triggerSocialInteraction("dance")}
            disabled={!selectedDancerId}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
              selectedDancerId ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Dance Together
          </button>
          <button
            onClick={() => triggerSocialInteraction("cheer")}
            disabled={!selectedDancerId}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
              selectedDancerId ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Cheer Together
          </button>
          <button
            onClick={() => triggerSocialInteraction("highfive")}
            disabled={!selectedDancerId}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
              selectedDancerId ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            High Five
          </button>
          <button
            onClick={() => triggerSocialInteraction("circle")}
            disabled={!selectedDancerId}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
              selectedDancerId ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Join Circle
          </button>
        </div>

        {/* Spray & tip commands */}
        <div className="flex gap-2 items-center">
          <button
            onClick={triggerMoneySpray}
            className="px-4 py-1.5 bg-green-500 text-black text-[9px] font-black tracking-widest uppercase rounded-lg hover:bg-green-400 active:scale-95"
          >
            💸 Money Cannon
          </button>
          <button
            onClick={() => {
              playSound("battle_vs_gong.mp3");
              const id = `${Date.now()}`;
              setReactionBurst((prev) => [...prev, { id, x: 50, y: 55, text: "🔥" }]);
              setTimeout(() => setReactionBurst((prev) => prev.filter((b) => b.id !== id)), 1000);
            }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90"
          >
            🔥
          </button>
        </div>
      </div>
    </div>
  );
}
