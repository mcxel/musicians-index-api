import type { PhonemeGroup } from "@/lib/avatar/AvatarLipSyncDirectiveEngine";

export interface AvatarVoicePreviewState {
  talking: boolean;
  phoneme: PhonemeGroup | null;
}

/** Amplitude-reactive mouth pose; this is not speech recognition or transcription. */
export function resolveAvatarVoicePreview(level: number, talking: boolean): AvatarVoicePreviewState {
  if (!talking) return { talking: false, phoneme: null };
  if (level >= 0.14) return { talking: true, phoneme: "vowel-open" };
  if (level >= 0.075) return { talking: true, phoneme: "vowel-mid" };
  return { talking: true, phoneme: "vowel-close" };
}