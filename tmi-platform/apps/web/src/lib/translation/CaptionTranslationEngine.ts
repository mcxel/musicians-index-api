import TranslationEngine from "./TranslationEngine";

export interface CaptionSegment {
  segmentId: string;
  text: string;
  startMs: number;
  endMs: number;
  speaker?: string;
  language: string;
}

export interface TranslatedCaption {
  segmentId: string;
  original: CaptionSegment;
  translated: string;
  targetLanguage: string;
}

const captionStore = new Map<string, CaptionSegment[]>();
let seg = 0;

export function addCaptionSegment(streamId: string, segment: Omit<CaptionSegment, "segmentId">): CaptionSegment {
  const s: CaptionSegment = { segmentId: `cap_${++seg}`, ...segment };
  const existing = captionStore.get(streamId) ?? [];
  captionStore.set(streamId, [...existing, s]);
  return s;
}

export function getCaptionSegments(streamId: string): CaptionSegment[] {
  return captionStore.get(streamId) ?? [];
}

export function translateCaptionSegment(segment: CaptionSegment, targetLanguage: string, _userId: string): TranslatedCaption {
  // Synchronous passthrough — async translation requires calling TranslationEngine.translate externally
  return {
    segmentId: segment.segmentId,
    original: segment,
    translated: segment.text,
    targetLanguage,
  };
}

export function translateAllCaptions(streamId: string, targetLanguage: string, userId: string): TranslatedCaption[] {
  const segments = getCaptionSegments(streamId);
  return segments.map(s => translateCaptionSegment(s, targetLanguage, userId));
}

export function getCurrentCaption(streamId: string, currentMs: number): CaptionSegment | null {
  const segments = getCaptionSegments(streamId);
  return segments.find(s => currentMs >= s.startMs && currentMs <= s.endMs) ?? null;
}
