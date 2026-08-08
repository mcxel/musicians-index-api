"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GLOBAL_12_ARCHETYPES,
  DEFAULT_CANONICAL_AVATAR,
  CanonicalAvatarProfile,
  BodyTypeCategory,
  CreationPath,
  getArchetypeById,
} from "@/lib/avatars/CanonicalAvatarRegistry";

export interface AvatarStudioExperienceProps {
  onSaveProfile?: (profile: CanonicalAvatarProfile) => void;
  onClose?: () => void;
}

const HAIR_STYLES = [
  "locs",
  "braided-bun",
  "fade",
  "wavy-long",
  "buzz-cut",
  "curly-afro",
  "straight-fringe",
  "straight-bob",
  "slick-back",
  "long-braid",
  "mohawk",
];

const BODY_TYPES: BodyTypeCategory[] = ["SLIM", "ATHLETIC", "AVERAGE", "CURVY", "HEAVY", "TALL", "SHORT"];

const EXPRESSIONS = [
  { id: "IDLE", label: "Idle Breath", icon: "😌" },
  { id: "SMILE", label: "Smile / Laugh", icon: "😄" },
  { id: "CHEER", label: "Hype Cheer", icon: "🙌" },
  { id: "LIP_SYNC", label: "Voice Lip-Sync", icon: "🎤" },
  { id: "DANCE_BOB", label: "Bobblehead Dance", icon: "🕺" },
];

export default function AvatarStudioExperience({ onSaveProfile, onClose }: AvatarStudioExperienceProps) {
  const [profile, setProfile] = useState<CanonicalAvatarProfile>(DEFAULT_CANONICAL_AVATAR);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [activeTab, setActiveTab] = useState<"PATH" | "ARCHETYPE" | "BODY_RATIO" | "FACE_MORPHS" | "HAIR_OUTFIT" | "TEST_ANIM">("ARCHETYPE");
  const [activeExpression, setActiveExpression] = useState("IDLE");
  const [scanStep, setScanStep] = useState<"FRONT" | "LEFT" | "RIGHT" | "COMPLETE" | null>(null);

  const selectedArchetype = getArchetypeById(profile.archetypeId);

  const updateMorph = (field: keyof CanonicalAvatarProfile["morphs"], val: number) => {
    setProfile((prev) => ({
      ...prev,
      morphs: { ...prev.morphs, [field]: val },
    }));
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tmi-canonical-avatar", JSON.stringify(profile));
    }
    if (onSaveProfile) onSaveProfile(profile);
    if (onClose) onClose();
  };

  return (
    <div className="relative w-full h-[660px] bg-slate-950 text-white rounded-2xl overflow-hidden border border-cyan-500/40 flex flex-col justify-between p-6 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
      {/* Studio Header & Navigation Tabs */}
      <div className="flex items-center justify-between z-20 bg-black/80 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-spin">👤</span>
          <div>
            <h2 className="text-sm font-black tracking-widest text-cyan-400">CANONICAL AVATAR STUDIO</h2>
            <p className="text-[10px] text-white/50">UNIVERSAL RIG · ONE AVATAR ACROSS ALL VENUES</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
          {[
            { id: "PATH", label: "PATH" },
            { id: "ARCHETYPE", label: "ARCHETYPES (12)" },
            { id: "BODY_RATIO", label: "BOBBLEHEAD" },
            { id: "FACE_MORPHS", label: "FACE" },
            { id: "HAIR_OUTFIT", label: "HAIR/STYLE" },
            { id: "TEST_ANIM", label: "TEST ANIM" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded text-[10px] font-black tracking-wider transition ${
                activeTab === tab.id
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Studio Preview Viewport + Customization Drawer */}
      <div className="relative flex-1 my-4 bg-gradient-to-b from-slate-900 via-black to-slate-950 rounded-xl border border-cyan-500/20 overflow-hidden flex items-center justify-between p-6">
        {/* Studio Pedestal & Avatar 360 Viewport */}
        <div className="relative flex-1 h-full flex flex-col items-center justify-center">
          {/* Spotlight Effect */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00ffff_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* Rendered Avatar Rig & Bobblehead Ratio */}
          <motion.div
            animate={{ rotateY: rotationDeg }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative flex flex-col items-center group cursor-grab active:cursor-grabbing z-10"
          >
            {/* Expression Indicator */}
            <div className="absolute -top-10 bg-black/80 border border-cyan-400/50 px-3 py-1 rounded-full text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg">
              <span>{EXPRESSIONS.find((e) => e.id === activeExpression)?.icon}</span>
              <span>{activeExpression.replace("_", " ")}</span>
            </div>

            {/* Avatar Head (Bobblehead Scale Applied) */}
            <div
              className="w-28 h-28 rounded-full border-4 border-cyan-400 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-transform"
              style={{
                backgroundColor: profile.skinToneHex,
                transform: `scale(${profile.bobbleheadRatio})`,
              }}
            >
              🧔🏿
            </div>

            {/* Avatar Body (Canonical Universal Rig) */}
            <div className="w-24 h-40 bg-slate-800 border-2 border-white/20 rounded-2xl mt-2 flex flex-col items-center justify-end p-2 shadow-xl">
              <span className="text-[9px] font-black text-amber-400 bg-black/80 px-2 py-0.5 rounded">
                {profile.bodyType}
              </span>
            </div>
          </motion.div>

          {/* 360 Rotation Controls */}
          <div className="absolute bottom-4 z-20 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-white/50">360° ROTATE:</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={rotationDeg}
              onChange={(e) => setRotationDeg(Number(e.target.value))}
              className="w-40 accent-cyan-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-cyan-400">{rotationDeg}°</span>
          </div>
        </div>

        {/* Customization Drawer Panel */}
        <div className="w-80 h-full bg-black/70 backdrop-blur-xl border-l border-white/10 rounded-xl p-5 overflow-y-auto flex flex-col justify-between z-20">
          <div>
            {/* Tab: Path Choice (Face Scan vs Archetypes) */}
            {activeTab === "PATH" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black text-cyan-400 tracking-wider">CHOOSE CREATION PATH</h3>
                <button
                  onClick={() => {
                    setProfile((p) => ({ ...p, creationPath: "STARTER_ARCHETYPE" }));
                    setActiveTab("ARCHETYPE");
                  }}
                  className={`p-4 rounded-xl border text-left ${
                    profile.creationPath === "STARTER_ARCHETYPE" ? "bg-cyan-500/20 border-cyan-400" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="text-xs font-bold text-white">🎭 12 Global Archetypes</div>
                  <div className="text-[10px] text-white/50 mt-1">Pick from 12 professionally rigged base characters representing world facial structures.</div>
                </button>
                <button
                  onClick={() => {
                    setProfile((p) => ({ ...p, creationPath: "FACE_SCAN" }));
                    setScanStep("FRONT");
                  }}
                  className={`p-4 rounded-xl border text-left ${
                    profile.creationPath === "FACE_SCAN" ? "bg-amber-500/20 border-amber-400" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="text-xs font-bold text-white">📸 AI Face Scan</div>
                  <div className="text-[10px] text-white/50 mt-1">Scan Front, Left, and Right angles for a portrait plate on 3D Avatar Runtime v0 (evolving — not a finished mesh pipeline).</div>
                </button>
              </div>
            )}

            {/* Tab: 12 Global Archetypes */}
            {activeTab === "ARCHETYPE" && (
              <div>
                <h3 className="text-xs font-black text-cyan-400 tracking-wider mb-3">12 GLOBAL ARCHETYPES</h3>
                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {GLOBAL_12_ARCHETYPES.map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() => setProfile((p) => ({ ...p, archetypeId: arch.id, skinToneHex: arch.baseSkinTone }))}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        profile.archetypeId === arch.id
                          ? "bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-[10px] font-bold text-white truncate">{arch.name}</div>
                      <div className="text-[8px] text-white/40">{arch.ethnicityRegion}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Bobblehead & Body Type */}
            {activeTab === "BODY_RATIO" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black text-cyan-400 tracking-wider">BOBBLEHEAD & BODY PROPORTIONS</h3>
                <div>
                  <label className="text-[10px] font-bold text-white/70 flex justify-between mb-1">
                    <span>SIGNATURE BOBBLEHEAD RATIO:</span>
                    <span className="text-cyan-400 font-mono">{profile.bobbleheadRatio.toFixed(2)}x</span>
                  </label>
                  <input
                    type="range"
                    min={1.0}
                    max={1.6}
                    step={0.05}
                    value={profile.bobbleheadRatio}
                    onChange={(e) => setProfile((p) => ({ ...p, bobbleheadRatio: Number(e.target.value) }))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-2">BODY TYPE CATEGORY:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BODY_TYPES.map((bt) => (
                      <button
                        key={bt}
                        onClick={() => setProfile((p) => ({ ...p, bodyType: bt }))}
                        className={`p-2 rounded border text-[10px] font-bold text-center ${
                          profile.bodyType === bt ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-white/5 border-white/10"
                        }`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Face Morphs */}
            {activeTab === "FACE_MORPHS" && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black text-cyan-400 tracking-wider mb-1">CANONICAL FACE MORPHS</h3>
                {Object.keys(profile.morphs).map((mKey) => (
                  <div key={mKey}>
                    <label className="text-[9px] font-bold text-white/60 flex justify-between mb-1">
                      <span>{mKey.toUpperCase()}:</span>
                      <span className="text-cyan-400 font-mono">{(profile.morphs as any)[mKey].toFixed(2)}</span>
                    </label>
                    <input
                      type="range"
                      min={-1.0}
                      max={1.0}
                      step={0.05}
                      value={(profile.morphs as any)[mKey]}
                      onChange={(e) => updateMorph(mKey as any, Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Hair & Style */}
            {activeTab === "HAIR_OUTFIT" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black text-cyan-400 tracking-wider">MODULAR HAIRSTYLES</h3>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs}
                      onClick={() => setProfile((p) => ({ ...p, hairStyleId: hs }))}
                      className={`p-2 rounded border text-[10px] font-bold text-center ${
                        profile.hairStyleId === hs ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-white/5 border-white/10"
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Test Animation & Lip-Sync */}
            {activeTab === "TEST_ANIM" && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black text-cyan-400 tracking-wider">TEST EXPRESSIONS & VOICE</h3>
                {EXPRESSIONS.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setActiveExpression(exp.id)}
                    className={`p-3 rounded-lg border text-left flex items-center gap-3 ${
                      activeExpression === exp.id ? "bg-cyan-500/20 border-cyan-400" : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span className="text-xl">{exp.icon}</span>
                    <span className="text-xs font-bold">{exp.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <button
            onClick={handleSave}
            className="w-full py-3 mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs tracking-widest rounded-xl hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-500/30"
          >
            SAVE CANONICAL AVATAR PROFILE
          </button>
        </div>
      </div>
    </div>
  );
}
