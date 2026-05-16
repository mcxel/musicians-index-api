/**
 * TranslationEngine.ts
 * 
 * Master translation orchestrator for:
 * - Chat messages
 * - Articles/content
 * - Captions (live + stored)
 * - Lyrics
 * - Music meaning/context
 * - Room feeds
 * 
 * Supports auto-detection, manual override, caching, and provider abstraction.
 */

export type SupportedLanguage =
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi'
  | 'tr' | 'pl' | 'nl' | 'sv' | 'da' | 'no' | 'fi' | 'he' | 'th' | 'vi' | 'id' | 'tl';

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  tr: 'Turkish',
  pl: 'Polish',
  nl: 'Dutch',
  sv: 'Swedish',
  da: 'Danish',
  no: 'Norwegian',
  fi: 'Finnish',
  he: 'Hebrew',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  tl: 'Tagalog',
};

export type TranslationContext = "chat" | "article" | "caption" | "lyric" | "profile" | "battle" | "venue" | "feed" | "music-meaning";

export interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  confidence: number; // 0-1
  provider: string;
  timestamp: number;
  cached: boolean;
}

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number; // 0-1
  isAutomatic: boolean;
}

export interface TranslationRecord {
  id: string;
  original: string;
  translated: string;
  fromLang: SupportedLanguage;
  toLang: SupportedLanguage;
  context: TranslationContext;
  requestedBy: string;
  createdAt: string;
  approved: boolean;
}

interface TranslationCache {
  key: string; // hash of (text + source + target)
  result: TranslationResult;
  expiresAt: number;
}

interface TranslationProvider {
  translate(text: string, sourceLang: SupportedLanguage, targetLang: SupportedLanguage): Promise<string>;
  detectLanguage(text: string): Promise<SupportedLanguage>;
}

class GoogleTranslateProvider implements TranslationProvider {
  async translate(text: string, sourceLang: SupportedLanguage, targetLang: SupportedLanguage): Promise<string> {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY missing');

    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        q: text,
        source_language: sourceLang,
        target_language: targetLang,
      }),
    });

    const data = (await response.json()) as { data?: { translations?: Array<{ translatedText: string }> } };
    return data?.data?.translations?.[0]?.translatedText ?? text;
  }

  async detectLanguage(text: string): Promise<SupportedLanguage> {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY missing');

    const response = await fetch('https://translation.googleapis.com/language/translate/v2/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        q: text,
      }),
    });

    const data = (await response.json()) as { data?: { detections?: Array<Array<{ language: string }>> } };
    const detected = data?.data?.detections?.[0]?.[0]?.language ?? 'en';
    return (detected as SupportedLanguage) || 'en';
  }
}

class OpenAITranslationProvider implements TranslationProvider {
  async translate(text: string, sourceLang: SupportedLanguage, targetLang: SupportedLanguage): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY missing');

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
            content: `You are a translation expert. Translate the following text from ${LANGUAGE_NAMES[sourceLang]} to ${LANGUAGE_NAMES[targetLang]}. Return ONLY the translation, no explanations.`,
          },
          { role: 'user', content: text },
        ],
      }),
    });

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data?.choices?.[0]?.message?.content?.trim() ?? text;
  }

  async detectLanguage(text: string): Promise<SupportedLanguage> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY missing');

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
            content: `You are a language detection expert. Identify the language of the text and respond with ONLY a language code from this list: ${Object.keys(LANGUAGE_NAMES).join(', ')}. Default to 'en' if unsure.`,
          },
          { role: 'user', content: text },
        ],
      }),
    });

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const detected = data?.choices?.[0]?.message?.content?.trim().toLowerCase() ?? 'en';
    return (detected as SupportedLanguage) || 'en';
  }
}

export class TranslationEngine {
  private static cache: Map<string, TranslationCache> = new Map();
  private static provider: TranslationProvider;
  private static store: Map<string, TranslationRecord> = new Map();
  private static seq = 0;
  private static CACHE_TTL_MS = 86400000; // 24 hours

  static {
    const providerName = (process.env.TRANSLATION_PROVIDER || 'google').toLowerCase();
    if (providerName === 'openai') {
      this.provider = new OpenAITranslationProvider();
    } else {
      this.provider = new GoogleTranslateProvider();
    }
  }

  private static getCacheKey(text: string, source: SupportedLanguage, target: SupportedLanguage): string {
    const str = `${text}|${source}|${target}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `trans_${Math.abs(hash)}`;
  }

  private static genId(): string {
    return `tr_${Date.now()}_${++this.seq}`;
  }

  /**
   * Detect language of input text
   */
  static async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      const language = await this.provider.detectLanguage(text);
      return { language, confidence: 0.95, isAutomatic: true };
    } catch (error) {
      console.error('[TranslationEngine] Language detection error:', error);
      return { language: 'en', confidence: 0.5, isAutomatic: false };
    }
  }

  /**
   * Translate text with caching
   */
  static async translate(
    text: string,
    targetLanguage: SupportedLanguage,
    sourceLanguage?: SupportedLanguage
  ): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
      return {
        original: text,
        translated: text,
        sourceLanguage: sourceLanguage ?? 'en',
        targetLanguage,
        confidence: 1.0,
        provider: 'none',
        timestamp: Date.now(),
        cached: false,
      };
    }

    let source = sourceLanguage ?? 'en';
    if (!sourceLanguage) {
      const detection = await this.detectLanguage(text);
      source = detection.language;
    }

    if (source === targetLanguage) {
      return {
        original: text,
        translated: text,
        sourceLanguage: source,
        targetLanguage,
        confidence: 1.0,
        provider: 'none',
        timestamp: Date.now(),
        cached: false,
      };
    }

    const cacheKey = this.getCacheKey(text, source, targetLanguage);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.result, cached: true };
    }

    try {
      const translated = await this.provider.translate(text, source, targetLanguage);
      const result: TranslationResult = {
        original: text,
        translated,
        sourceLanguage: source,
        targetLanguage,
        confidence: 0.92,
        provider: process.env.TRANSLATION_PROVIDER || 'google',
        timestamp: Date.now(),
        cached: false,
      };

      this.cache.set(cacheKey, {
        key: cacheKey,
        result,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });

      return result;
    } catch (error) {
      console.error('[TranslationEngine] Translation error:', error);
      return {
        original: text,
        translated: text,
        sourceLanguage: source,
        targetLanguage,
        confidence: 0.0,
        provider: 'error',
        timestamp: Date.now(),
        cached: false,
      };
    }
  }

  /**
   * Batch translate multiple texts
   */
  static async translateBatch(
    texts: string[],
    targetLanguage: SupportedLanguage,
    sourceLanguage?: SupportedLanguage
  ): Promise<TranslationResult[]> {
    return Promise.all(
      texts.map((text) => this.translate(text, targetLanguage, sourceLanguage))
    );
  }

  /**
   * Record translation for audit/cache
   */
  static recordTranslation(
    original: string,
    translated: string,
    fromLang: SupportedLanguage,
    toLang: SupportedLanguage,
    context: TranslationContext,
    requestedBy: string
  ): TranslationRecord {
    const record: TranslationRecord = {
      id: this.genId(),
      original,
      translated,
      fromLang,
      toLang,
      context,
      requestedBy,
      createdAt: new Date().toISOString(),
      approved: true,
    };
    this.store.set(record.id, record);
    return record;
  }

  /**
   * Get translation record by ID
   */
  static getTranslation(id: string): TranslationRecord | null {
    return this.store.get(id) ?? null;
  }

  /**
   * Get user translations
   */
  static getUserTranslations(userId: string, limit = 10): TranslationRecord[] {
    return [...this.store.values()]
      .filter((t) => t.requestedBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get translations by context
   */
  static getTranslationsByContext(context: TranslationContext): TranslationRecord[] {
    return [...this.store.values()].filter((t) => t.context === context);
  }

  /**
   * Check if language pair supported
   */
  static isTranslationSupported(fromLang: string, toLang: string): boolean {
    return fromLang in LANGUAGE_NAMES && toLang in LANGUAGE_NAMES;
  }

  /**
   * Clear cache (testing/memory)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  static getCacheStats(): { size: number; entries: number } {
    let entries = 0;
    for (const cached of this.cache.values()) {
      if (cached.expiresAt > Date.now()) {
        entries++;
      }
    }
    return { size: this.cache.size, entries };
  }

  /**
   * Prune expired entries
   */
  static pruneCache(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, cached] of this.cache) {
      if (cached.expiresAt < now) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}

export default TranslationEngine;
