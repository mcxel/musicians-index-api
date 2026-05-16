/**
 * LyricTranslationAssistEngine.ts
 *
 * Lyric translation with cultural context for songs and poems
 */

import TranslationEngine, { SupportedLanguage, LANGUAGE_NAMES } from './TranslationEngine';

export interface LyricLine {
  lineNumber: number;
  original: string;
  translations: Record<SupportedLanguage, string>;
  notes?: string;
}

export interface TranslatedLyrics {
  songId: string;
  title: Record<SupportedLanguage, string>;
  artist: string;
  sourceLanguage: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  lines: LyricLine[];
  culturalNotes: Record<SupportedLanguage, string>;
  translatedAt: number;
}

const SLANG_NOTES: Record<string, string> = {
  "drip": "Drip = expensive fashion/jewelry (US slang)",
  "ting": "Ting = girlfriend/situation (UK/Caribbean slang)",
  "bredrins": "Bredrins = brothers/close friends (Jamaican patois)",
  "shaku": "Shaku shaku = a Nigerian dance step",
  "jollof": "Jollof = West African rice dish, cultural pride symbol",
  "vibes": "Vibes = the atmosphere/feeling of a moment",
  "riddim": "Riddim = rhythm/beat (Jamaican word for rhythm)",
  "wagwan": "Wagwan = 'what's going on' in Jamaican patois",
};

export class LyricTranslationAssistEngine {
  private static lyricsCache: Map<string, TranslatedLyrics> = new Map();
  private static MAX_CACHE = 500;

  /**
   * Translate lyrics with cultural context
   */
  static async translateLyrics(
    songId: string,
    title: string,
    artist: string,
    lyrics: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): Promise<TranslatedLyrics> {
    const cacheKey = `${songId}_${sourceLanguage}`;
    const cached = this.lyricsCache.get(cacheKey);
    if (cached) return cached;

    const lyricLines = lyrics.split('\n');
    const translatedLines: LyricLine[] = [];

    const titleTranslations: Record<SupportedLanguage, string> = {
      [sourceLanguage]: title,
    } as Record<SupportedLanguage, string>;

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue;
      const titleResult = await TranslationEngine.translate(title, targetLang, sourceLanguage);
      titleTranslations[targetLang] = titleResult.translated;
    }

    for (let i = 0; i < lyricLines.length; i++) {
      const line = lyricLines[i];
      if (!line.trim()) {
        translatedLines.push({
          lineNumber: i,
          original: line,
          translations: { [sourceLanguage]: line } as Record<SupportedLanguage, string>,
        });
        continue;
      }

      const translations: Record<SupportedLanguage, string> = {
        [sourceLanguage]: line,
      } as Record<SupportedLanguage, string>;

      for (const targetLang of targetLanguages) {
        if (targetLang === sourceLanguage) continue;
        const result = await TranslationEngine.translate(line, targetLang, sourceLanguage);
        translations[targetLang] = result.translated;
      }

      translatedLines.push({
        lineNumber: i,
        original: line,
        translations,
      });
    }

    const culturalNotes = await this.generateCulturalNotes(
      lyrics,
      title,
      artist,
      sourceLanguage,
      targetLanguages
    );

    const translatedLyrics: TranslatedLyrics = {
      songId,
      title: titleTranslations,
      artist,
      sourceLanguage,
      targetLanguages,
      lines: translatedLines,
      culturalNotes,
      translatedAt: Date.now(),
    };

    if (this.lyricsCache.size >= this.MAX_CACHE) {
      const firstKey = this.lyricsCache.keys().next().value as string | undefined;
      if (firstKey !== undefined) this.lyricsCache.delete(firstKey);
    }
    this.lyricsCache.set(cacheKey, translatedLyrics);

    return translatedLyrics;
  }

  /**
   * Generate cultural context notes
   */
  private static async generateCulturalNotes(
    lyrics: string,
    title: string,
    artist: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): Promise<Record<SupportedLanguage, string>> {
    const notes = {} as Record<SupportedLanguage, string>;

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error('OPENAI_API_KEY missing');

      for (const targetLang of targetLanguages) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a music translation and cultural expert. Provide 2-3 short cultural notes for someone reading this song in ${LANGUAGE_NAMES[targetLang]} to understand the context, idioms, and cultural references. Keep it concise.`,
              },
              {
                role: 'user',
                content: `Song: "${title}" by ${artist}\n\nLyrics:\n${lyrics}`,
              },
            ],
          }),
        });

        const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const culturalNote = data?.choices?.[0]?.message?.content?.trim() ?? '';
        notes[targetLang] = culturalNote;
      }
    } catch (error) {
      console.error('[LyricTranslationAssistEngine] Cultural notes error:', error);
    }

    return notes;
  }

  /**
   * Get translated lyrics
   */
  static getTranslatedLyrics(songId: string, sourceLanguage: SupportedLanguage): TranslatedLyrics | null {
    return this.lyricsCache.get(`${songId}_${sourceLanguage}`) ?? null;
  }

  /**
   * Get slang note
   */
  static getSlangNote(term: string): string | null {
    return SLANG_NOTES[term.toLowerCase()] ?? null;
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.lyricsCache.clear();
  }

  /**
   * Get cache stats
   */
  static getCacheStats(): { size: number; songs: number } {
    return { size: this.lyricsCache.size, songs: this.lyricsCache.size };
  }
}

export default LyricTranslationAssistEngine;
