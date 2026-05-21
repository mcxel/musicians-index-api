// apps/web/src/lib/engines/audioProtection.engine.ts
// Prevents clipping, distortion, and bad audio quality in live rooms.
// Runs as a continuous check during any live stream or performance.

export interface AudioAnalysis {
  inputLevel: number;      // 0-100 (dB normalized)
  clippingRisk: "safe" | "warning" | "clipping";
  gainLevel: number;       // current gain
  noiseFloor: number;      // ambient noise level
  bassLevel: number;       // bass frequency level
  voiceClarity: number;    // 0-100 voice clarity score
  crowdNoise: number;      // 0-100 ambient crowd noise
  latencyMs: number;       // audio latency
  recommendedPreset?: string;
}

export type AudioPresetId =
  | "vocal_clean"
  | "vocal_loud"
  | "rap_spoken"
  | "singing_warm"
  | "acoustic"
  | "concert_music"
  | "battle_mode"
  | "cypher_mode"
  | "podcast_host"
  | "rehearsal_safe";

export interface AudioPreset {
  id: AudioPresetId;
  label: string;
  description: string;
  gainTarget: number;       // 0-100
  compressionRatio: number; // 1:1 to 10:1
  noiseGateThreshold: number;
  eqBass: number;           // -12 to +12 dB
  eqMid: number;
  eqHigh: number;
  deEsserActive: boolean;
  bassEnhance: boolean;
  limiterCeiling: number;   // dB ceiling, e.g. -1 prevents clipping
  scene: string;
}

export const AUDIO_PRESETS: Record<AudioPresetId, AudioPreset> = {
  vocal_clean:    { id:"vocal_clean",   label:"Vocal Clean",    description:"Clear vocals, minimal noise",       gainTarget:70, compressionRatio:3, noiseGateThreshold:20, eqBass:-2, eqMid:2,  eqHigh:1,  deEsserActive:true,  bassEnhance:false, limiterCeiling:-1, scene:"all" },
  vocal_loud:     { id:"vocal_loud",    label:"Vocal Loud",     description:"Powerful projection, stage volume", gainTarget:85, compressionRatio:4, noiseGateThreshold:25, eqBass:-1, eqMid:3,  eqHigh:2,  deEsserActive:true,  bassEnhance:false, limiterCeiling:-1, scene:"concert" },
  rap_spoken:     { id:"rap_spoken",    label:"Rap / Spoken",   description:"Punchy and articulate",             gainTarget:75, compressionRatio:5, noiseGateThreshold:30, eqBass:1,  eqMid:2,  eqHigh:0,  deEsserActive:false, bassEnhance:true,  limiterCeiling:-1, scene:"battle" },
  singing_warm:   { id:"singing_warm",  label:"Singing Warm",   description:"Warm, rich, melodic tone",          gainTarget:72, compressionRatio:3, noiseGateThreshold:18, eqBass:2,  eqMid:1,  eqHigh:-1, deEsserActive:true,  bassEnhance:true,  limiterCeiling:-1, scene:"concert" },
  acoustic:       { id:"acoustic",      label:"Acoustic",       description:"Natural, open sound",               gainTarget:65, compressionRatio:2, noiseGateThreshold:15, eqBass:0,  eqMid:1,  eqHigh:1,  deEsserActive:false, bassEnhance:false, limiterCeiling:-2, scene:"listening_party" },
  concert_music:  { id:"concert_music", label:"Concert Music",  description:"Full music, all frequencies",       gainTarget:80, compressionRatio:4, noiseGateThreshold:20, eqBass:3,  eqMid:0,  eqHigh:1,  deEsserActive:false, bassEnhance:true,  limiterCeiling:-1, scene:"concert" },
  battle_mode:    { id:"battle_mode",   label:"Battle Mode",    description:"Tight, punchy, competitive",        gainTarget:78, compressionRatio:5, noiseGateThreshold:30, eqBass:2,  eqMid:3,  eqHigh:0,  deEsserActive:false, bassEnhance:true,  limiterCeiling:-1, scene:"battle" },
  cypher_mode:    { id:"cypher_mode",   label:"Cypher Mode",    description:"Raw energy, aggressive projection", gainTarget:82, compressionRatio:6, noiseGateThreshold:35, eqBass:3,  eqMid:2,  eqHigh:-1, deEsserActive:false, bassEnhance:true,  limiterCeiling:-1, scene:"cypher" },
  podcast_host:   { id:"podcast_host",  label:"Podcast / Host", description:"Broadcast-quality voice clarity",   gainTarget:68, compressionRatio:3, noiseGateThreshold:20, eqBass:-1, eqMid:2,  eqHigh:2,  deEsserActive:true,  bassEnhance:false, limiterCeiling:-2, scene:"talk_show" },
  rehearsal_safe: { id:"rehearsal_safe",label:"Rehearsal Safe", description:"Conservative levels for practice",  gainTarget:55, compressionRatio:2, noiseGateThreshold:10, eqBass:0,  eqMid:0,  eqHigh:0,  deEsserActive:false, bassEnhance:false, limiterCeiling:-3, scene:"rehearsal" },
};

export interface AudioCoachMessage {
  severity: "info" | "warning" | "critical";
  message: string;
  autoFix?: string; // suggested action
}

export function analyzeAudioHealth(level: number, noiseFloor: number): AudioAnalysis {
  const clippingRisk: AudioAnalysis["clippingRisk"] =
    level >= 90 ? "clipping" : level >= 75 ? "warning" : "safe";

  return {
    inputLevel: level,
    clippingRisk,
    gainLevel: Math.max(0, level - 10),
    noiseFloor,
    bassLevel: Math.round(level * 0.6 + Math.random() * 10),
    voiceClarity: Math.max(0, 100 - noiseFloor - (level > 85 ? 20 : 0)),
    crowdNoise: noiseFloor,
    latencyMs: Math.round(20 + Math.random() * 30),
    recommendedPreset: level > 80 ? "vocal_clean" : undefined,
  };
}

export function getCoachMessage(analysis: AudioAnalysis): AudioCoachMessage[] {
  const messages: AudioCoachMessage[] = [];
  if (analysis.clippingRisk === "clipping")
    messages.push({ severity:"critical", message:"You're clipping — back away from the mic", autoFix:"Lower gain slightly" });
  else if (analysis.clippingRisk === "warning")
    messages.push({ severity:"warning", message:"Getting close to clipping — watch your level", autoFix:"Back up a little" });
  if (analysis.noiseFloor > 50)
    messages.push({ severity:"warning", message:"Room noise is high — try to reduce background sound", autoFix:"Enable noise gate" });
  if (analysis.voiceClarity < 40)
    messages.push({ severity:"info", message:"Vocal clarity is low — try moving closer to the mic" });
  if (analysis.latencyMs > 100)
    messages.push({ severity:"warning", message:"High latency detected — check your internet connection" });
  if (messages.length === 0)
    messages.push({ severity:"info", message:"Audio looks great! 🎤" });
  return messages;
}
