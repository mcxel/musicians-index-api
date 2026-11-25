/**
 * SpeechTextAdapter — §20985-14/15 thin browser-native speech adapters behind the
 * canonical HUD composer. The audit proved ZERO canonical SpeechRecognition/TTS
 * authority exists, so these are PERMITTED thin adapters — NOT new messaging,
 * composer, or speech engines. Both degrade gracefully to plain typing.
 *
 *   STT: Dictate → browser SpeechRecognition → fill the REAL editable composer.
 *        NEVER auto-sends. The user reviews/edits, then submits.
 *   TTS: explicit SPEAK → browser speechSynthesis → synthetic voice only.
 *        NEVER impersonates the user's real voice. NEVER auto-reads chat aloud.
 *
 *   DUPLICATE_SPEECH_ENGINE_CREATED = 0 · DUPLICATE_COMPOSER_ENGINE_CREATED = 0
 */

export const DUPLICATE_SPEECH_ENGINE_CREATED = 0 as const;
export const DUPLICATE_COMPOSER_ENGINE_CREATED = 0 as const;
export const STT_NEVER_AUTO_SENDS = true as const;
export const TTS_OPT_IN_ONLY = true as const;
export const NEVER_IMPERSONATE_REAL_VOICE = true as const;

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined;
  return Ctor ?? null;
}

export type SttAvailability = "available" | "unavailable" | "permission-denied";

export function sttAvailability(): SttAvailability {
  return getSpeechRecognitionCtor() ? "available" : "unavailable";
}

/**
 * Dictate into the canonical composer. Calls `onTranscript` with the recognized
 * text (which the caller merges into the editable composer buffer). Never sends.
 * Returns a handle to stop, or null when STT is unavailable (typing still works).
 */
export function dictateToComposer(input: {
  lang?: string;
  onTranscript: (text: string) => void;
  onEnd?: () => void;
  onError?: (reason: string) => void;
}): { stop: () => void } | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    input.onError?.("unavailable");
    return null;
  }
  const rec: SpeechRecognitionLike = new Ctor();
  rec.lang = input.lang ?? "en-US";
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (ev) => {
    const last = ev.results[ev.results.length - 1];
    const alt = last && last[0];
    if (alt?.transcript) input.onTranscript(alt.transcript);
  };
  rec.onerror = (ev) => input.onError?.(ev.error ?? "error");
  rec.onend = () => input.onEnd?.();
  try {
    rec.start();
  } catch {
    input.onError?.("start-failed");
    return null;
  }
  return { stop: () => rec.stop() };
}

export type TtsAvailability = "available" | "unavailable";

export function ttsAvailability(): TtsAvailability {
  if (typeof window === "undefined") return "unavailable";
  const w = window as unknown as Record<string, unknown>;
  return typeof w.speechSynthesis !== "undefined" ? "available" : "unavailable";
}

/**
 * Explicit SPEAK action: read a typed response aloud in a synthetic voice.
 * Opt-in only; returns false when TTS is unavailable (text submission remains).
 */
export function speakTypedResponse(input: { text: string; rate?: number; pitch?: number }): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { speechSynthesis?: SpeechSynthesis; SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance };
  if (!w.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return false;
  const text = input.text.trim();
  if (!text) return false;
  const u = new SpeechSynthesisUtterance(text);
  if (typeof input.rate === "number") u.rate = input.rate;
  if (typeof input.pitch === "number") u.pitch = input.pitch;
  w.speechSynthesis.cancel();
  w.speechSynthesis.speak(u);
  return true;
}

export function cancelSpeak(): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { speechSynthesis?: SpeechSynthesis };
  w.speechSynthesis?.cancel();
}
