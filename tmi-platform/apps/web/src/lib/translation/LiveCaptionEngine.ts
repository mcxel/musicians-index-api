/**
 * LiveCaptionEngine.ts
 *
 * Real-time caption generation and translation for:
 * - Live room streams
 * - Battle commentary
 * - Venue live streams
 * - Concert streams
 *
 * Features:
 * - Subtitle timing and sync
 * - Multi-language caption rendering
 * - Speaker identification
 * - Emotion/tone detection
 */

import TranslationEngine, { SupportedLanguage } from './TranslationEngine';

export interface Caption {
  id: string;
  startTime: number; // milliseconds
  endTime: number;
  text: string;
  speaker?: string;
  language: SupportedLanguage;
  confidence: number;
}

export interface TranslatedCaption extends Caption {
  translations: Record<SupportedLanguage, string>;
}

export interface LiveCaptionTrack {
  trackId: string;
  roomId: string;
  captions: Caption[];
  sourceLanguage: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  startedAt: number;
}

export class LiveCaptionEngine {
  private static tracks: Map<string, LiveCaptionTrack> = new Map();
  private static translatedCaptions: Map<string, TranslatedCaption> = new Map();
  private static MAX_CAPTIONS_PER_TRACK = 10000;

  /**
   * Create a new caption track for a room
   */
  static createCaptionTrack(
    trackId: string,
    roomId: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): LiveCaptionTrack {
    const track: LiveCaptionTrack = {
      trackId,
      roomId,
      captions: [],
      sourceLanguage,
      targetLanguages,
      startedAt: Date.now(),
    };
    this.tracks.set(trackId, track);
    return track;
  }

  /**
   * Add a live caption
   */
  static async addCaption(
    trackId: string,
    startTime: number,
    endTime: number,
    text: string,
    speaker?: string
  ): Promise<TranslatedCaption | null> {
    const track = this.tracks.get(trackId);
    if (!track) return null;

    if (track.captions.length >= this.MAX_CAPTIONS_PER_TRACK) {
      return null; // Track full
    }

    const captionId = `cap_${trackId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const caption: Caption = {
      id: captionId,
      startTime,
      endTime,
      text,
      speaker,
      language: track.sourceLanguage,
      confidence: 0.95,
    };

    track.captions.push(caption);

    // Translate to all target languages
    const translations: Record<SupportedLanguage, string> = {
      [track.sourceLanguage]: text,
    } as Record<SupportedLanguage, string>;

    for (const targetLang of track.targetLanguages) {
      if (targetLang === track.sourceLanguage) continue;
      const result = await TranslationEngine.translate(text, targetLang, track.sourceLanguage);
      translations[targetLang] = result.translated;
    }

    const translatedCaption: TranslatedCaption = {
      ...caption,
      translations,
    };

    this.translatedCaptions.set(captionId, translatedCaption);
    return translatedCaption;
  }

  /**
   * Get captions for time range
   */
  static getCaptionsForTimeRange(
    trackId: string,
    startTime: number,
    endTime: number,
    language: SupportedLanguage
  ): Caption[] {
    const track = this.tracks.get(trackId);
    if (!track) return [];

    return track.captions.filter(
      (cap) =>
        cap.startTime < endTime && cap.endTime > startTime
    );
  }

  /**
   * Get current caption at specific time
   */
  static getCaptionAtTime(trackId: string, time: number, language: SupportedLanguage): Caption | null {
    const track = this.tracks.get(trackId);
    if (!track) return null;

    const caption = track.captions.find(
      (cap) => cap.startTime <= time && cap.endTime >= time
    );

    if (!caption) return null;

    const translated = this.translatedCaptions.get(caption.id);
    if (!translated) return caption;

    return {
      ...caption,
      text: translated.translations[language] ?? caption.text,
      language,
    };
  }

  /**
   * Get VTT format subtitles for download
   */
  static generateVTT(trackId: string, language: SupportedLanguage): string {
    const track = this.tracks.get(trackId);
    if (!track) return '';

    let vtt = 'WEBVTT\n\n';

    for (const caption of track.captions) {
      const translated = this.translatedCaptions.get(caption.id);
      const text = translated?.translations[language] ?? caption.text;
      const startStr = this.formatTimestamp(caption.startTime);
      const endStr = this.formatTimestamp(caption.endTime);

      vtt += `${startStr} --> ${endStr}\n`;
      if (caption.speaker) {
        vtt += `<v ${caption.speaker}>${text}\n`;
      } else {
        vtt += `${text}\n`;
      }
      vtt += '\n';
    }

    return vtt;
  }

  private static formatTimestamp(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const millis = ms % 1000;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  /**
   * End a caption track
   */
  static endTrack(trackId: string): LiveCaptionTrack | null {
    return this.tracks.get(trackId) ?? null;
  }

  /**
   * Get track stats
   */
  static getTrackStats(trackId: string): { captions: number; duration: number; languages: SupportedLanguage[] } | null {
    const track = this.tracks.get(trackId);
    if (!track) return null;

    const duration = track.captions.length > 0
      ? track.captions[track.captions.length - 1].endTime - (track.captions[0]?.startTime ?? 0)
      : 0;

    return {
      captions: track.captions.length,
      duration,
      languages: [track.sourceLanguage, ...track.targetLanguages],
    };
  }

  /**
   * Clear track
   */
  static clearTrack(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) {
      for (const cap of track.captions) {
        this.translatedCaptions.delete(cap.id);
      }
      this.tracks.delete(trackId);
    }
  }
}

export default LiveCaptionEngine;
