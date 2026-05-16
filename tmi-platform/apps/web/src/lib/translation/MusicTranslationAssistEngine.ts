/**
 * MusicTranslationAssistEngine.ts
 *
 * Music meaning and context translation for:
 * - Genre explanations
 * - Musical style explanations
 * - Artist style translation
 * - Music history context
 * - Production technique explanations
 *
 * Helps listeners understand music across cultures and languages
 */

import TranslationEngine, { SupportedLanguage, LANGUAGE_NAMES } from './TranslationEngine';

export interface MusicExplanation {
  id: string;
  concept: string; // e.g., "Afrobeats", "K-hip hop", "reggaeton"
  sourceLanguage: SupportedLanguage;
  explanations: Record<SupportedLanguage, string>;
  examples: Record<SupportedLanguage, string[]>;
  relatedGenres: string[];
  culturalContext: Record<SupportedLanguage, string>;
  timestamp: number;
}

export interface ArtistStyleTranslation {
  artistId: string;
  artistName: string;
  style: string;
  sourceLanguage: SupportedLanguage;
  styleExplanations: Record<SupportedLanguage, string>;
  influences: Record<SupportedLanguage, string[]>;
  culturalBackground: Record<SupportedLanguage, string>;
  musicMeaning: Record<SupportedLanguage, string>;
}

export class MusicTranslationAssistEngine {
  private static explanationCache: Map<string, MusicExplanation> = new Map();
  private static artistStyleCache: Map<string, ArtistStyleTranslation> = new Map();
  private static MAX_CACHE = 1000;

  /**
   * Explain a music genre/concept in multiple languages
   */
  static async explainMusicConcept(
    concept: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): Promise<MusicExplanation> {
    const cacheKey = `${concept}_${sourceLanguage}`;
    const cached = this.explanationCache.get(cacheKey);
    if (cached) return cached;

    const explanations = {} as Record<SupportedLanguage, string>;
    const examples = {} as Record<SupportedLanguage, string[]>;
    const culturalContext = {} as Record<SupportedLanguage, string>;

    const baseExplanation = await this.generateExplanation(concept, sourceLanguage);
    explanations[sourceLanguage] = baseExplanation;
    examples[sourceLanguage] = await this.generateExamples(concept, sourceLanguage);
    culturalContext[sourceLanguage] = await this.generateCulturalContext(concept, sourceLanguage);

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue;

      const [explResult, examplesResult, contextResult] = await Promise.all([
        TranslationEngine.translate(baseExplanation, targetLang, sourceLanguage),
        this.translateExamples(
          examples[sourceLanguage],
          targetLang,
          sourceLanguage
        ),
        TranslationEngine.translate(culturalContext[sourceLanguage], targetLang, sourceLanguage),
      ]);

      explanations[targetLang] = explResult.translated;
      examples[targetLang] = examplesResult;
      culturalContext[targetLang] = contextResult.translated;
    }

    const explanation: MusicExplanation = {
      id: `mus_${concept}_${Date.now()}`,
      concept,
      sourceLanguage,
      explanations,
      examples,
      relatedGenres: await this.getRelatedGenres(concept),
      culturalContext,
      timestamp: Date.now(),
    };

    if (this.explanationCache.size >= this.MAX_CACHE) {
      const firstKey = this.explanationCache.keys().next().value as string | undefined;
      if (firstKey !== undefined) this.explanationCache.delete(firstKey);
    }
    this.explanationCache.set(cacheKey, explanation);

    return explanation;
  }

  /**
   * Translate artist style and musical meaning
   */
  static async translateArtistStyle(
    artistId: string,
    artistName: string,
    style: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): Promise<ArtistStyleTranslation> {
    const cacheKey = `artist_${artistId}_${sourceLanguage}`;
    const cached = this.artistStyleCache.get(cacheKey);
    if (cached) return cached;

    const styleExplanations = {} as Record<SupportedLanguage, string>;
    const influences = {} as Record<SupportedLanguage, string[]>;
    const culturalBackground = {} as Record<SupportedLanguage, string>;
    const musicMeaning = {} as Record<SupportedLanguage, string>;

    const styleExp = await this.generateExplanation(style, sourceLanguage);
    const styleInf = await this.getInfluences(style, sourceLanguage);
    const styleCultural = await this.generateCulturalContext(style, sourceLanguage);
    const styleMeaning = await this.generateMusicMeaning(artistName, style, sourceLanguage);

    styleExplanations[sourceLanguage] = styleExp;
    influences[sourceLanguage] = styleInf;
    culturalBackground[sourceLanguage] = styleCultural;
    musicMeaning[sourceLanguage] = styleMeaning;

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue;

      const [expResult, infResult, cultResult, meaningResult] = await Promise.all([
        TranslationEngine.translate(styleExp, targetLang, sourceLanguage),
        this.translateExamples(styleInf, targetLang, sourceLanguage),
        TranslationEngine.translate(styleCultural, targetLang, sourceLanguage),
        TranslationEngine.translate(styleMeaning, targetLang, sourceLanguage),
      ]);

      styleExplanations[targetLang] = expResult.translated;
      influences[targetLang] = infResult;
      culturalBackground[targetLang] = cultResult.translated;
      musicMeaning[targetLang] = meaningResult.translated;
    }

    const translation: ArtistStyleTranslation = {
      artistId,
      artistName,
      style,
      sourceLanguage,
      styleExplanations,
      influences,
      culturalBackground,
      musicMeaning,
    };

    if (this.artistStyleCache.size >= this.MAX_CACHE) {
      const firstKey = this.artistStyleCache.keys().next().value as string | undefined;
      if (firstKey !== undefined) this.artistStyleCache.delete(firstKey);
    }
    this.artistStyleCache.set(cacheKey, translation);

    return translation;
  }

  private static async generateExplanation(concept: string, language: SupportedLanguage): Promise<string> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return `${concept} is a music genre/style.`;

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
              content: `You are a music expert. Explain the music genre or concept in 2-3 sentences in simple terms. Focus on what makes it unique.`,
            },
            { role: 'user', content: `Explain "${concept}" in ${LANGUAGE_NAMES[language]}` },
          ],
        }),
      });

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data?.choices?.[0]?.message?.content?.trim() ?? `${concept} is a music style.`;
    } catch {
      return `${concept} is a music style.`;
    }
  }

  private static async generateExamples(concept: string, language: SupportedLanguage): Promise<string[]> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return [];

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
              content: `List 3 famous artists or songs of the "${concept}" genre. Return as comma-separated list.`,
            },
            { role: 'user', content: `Examples of ${concept}` },
          ],
        }),
      });

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
      return text.split(',').map((s) => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  private static async generateCulturalContext(concept: string, language: SupportedLanguage): Promise<string> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return '';

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
              content: `Provide cultural and historical context for this music genre in 2-3 sentences.`,
            },
            { role: 'user', content: `Cultural context for ${concept}` },
          ],
        }),
      });

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data?.choices?.[0]?.message?.content?.trim() ?? '';
    } catch {
      return '';
    }
  }

  private static async generateMusicMeaning(artistName: string, style: string, language: SupportedLanguage): Promise<string> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return '';

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
              content: `Explain what this music style means to artists and communities in 2-3 sentences.`,
            },
            { role: 'user', content: `What does ${style} mean in the music world?` },
          ],
        }),
      });

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data?.choices?.[0]?.message?.content?.trim() ?? '';
    } catch {
      return '';
    }
  }

  private static async getRelatedGenres(concept: string): Promise<string[]> {
    const genreMap: Record<string, string[]> = {
      'hip-hop': ['rap', 'trap', 'lo-fi'],
      'afrobeats': ['amapiano', 'afrohouse', 'gqom'],
      'reggaeton': ['dembow', 'trap latino', 'reggaeton fusion'],
      'k-pop': ['k-hip-hop', 'k-R&B', 'k-indie'],
      'house': ['techno', 'deep house', 'house fusion'],
    };

    return genreMap[concept.toLowerCase()] ?? [
      `${concept} fusion`,
      `experimental ${concept}`,
      `${concept} remix`,
    ];
  }

  private static async getInfluences(style: string, language: SupportedLanguage): Promise<string[]> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return [];

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
              content: `List 3-4 genres or styles that influenced "${style}". Return as comma-separated list.`,
            },
            { role: 'user', content: `What influenced ${style}?` },
          ],
        }),
      });

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
      return text.split(',').map((s) => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  private static async translateExamples(
    examples: string[],
    targetLanguage: SupportedLanguage,
    sourceLanguage: SupportedLanguage
  ): Promise<string[]> {
    const results = await TranslationEngine.translateBatch(examples, targetLanguage, sourceLanguage);
    return results.map((r) => r.translated);
  }

  static getMusicExplanation(concept: string, sourceLanguage: SupportedLanguage): MusicExplanation | null {
    return this.explanationCache.get(`${concept}_${sourceLanguage}`) ?? null;
  }

  static getArtistStyle(artistId: string, sourceLanguage: SupportedLanguage): ArtistStyleTranslation | null {
    return this.artistStyleCache.get(`artist_${artistId}_${sourceLanguage}`) ?? null;
  }

  static clearCache(): void {
    this.explanationCache.clear();
    this.artistStyleCache.clear();
  }

  static getCacheStats(): { concepts: number; artists: number } {
    return {
      concepts: this.explanationCache.size,
      artists: this.artistStyleCache.size,
    };
  }
}

export default MusicTranslationAssistEngine;
