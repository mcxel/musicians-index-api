/**
 * ChatTranslationEngine.ts
 *
 * Real-time chat message translation for rooms, battles, venues, and live streams.
 * Handles:
 * - Individual message translation
 * - User language preferences (sticky per session)
 * - Culture-aware slang/idiom explanation
 * - Conversation threading with translation history
 */

import TranslationEngine, { SupportedLanguage, LANGUAGE_NAMES } from './TranslationEngine';

export interface TranslatedMessage {
  messageId: string;
  original: string;
  translations: Record<SupportedLanguage, string>;
  sourceLanguage: SupportedLanguage;
  userId: string;
  roomId: string;
  timestamp: number;
  slangNotes?: Record<SupportedLanguage, string>;
}

export interface UserLanguagePreference {
  userId: string;
  preferredLanguage: SupportedLanguage;
  autoTranslateEnabled: boolean;
  updatedAt: number;
}

export interface ChatTranslationStats {
  totalMessages: number;
  translatedMessages: number;
  userLanguages: Map<string, SupportedLanguage>;
  avgConfidence: number;
}

export class ChatTranslationEngine {
  private static messageCache: Map<string, TranslatedMessage> = new Map();
  private static userPreferences: Map<string, UserLanguagePreference> = new Map();
  private static stats: ChatTranslationStats = {
    totalMessages: 0,
    translatedMessages: 0,
    userLanguages: new Map(),
    avgConfidence: 0,
  };
  private static MAX_CACHE = 5000;

  /**
   * Set user language preference
   */
  static setUserLanguagePreference(userId: string, language: SupportedLanguage): void {
    this.userPreferences.set(userId, {
      userId,
      preferredLanguage: language,
      autoTranslateEnabled: true,
      updatedAt: Date.now(),
    });
    this.stats.userLanguages.set(userId, language);
  }

  /**
   * Get user language preference
   */
  static getUserLanguagePreference(userId: string): SupportedLanguage {
    return this.userPreferences.get(userId)?.preferredLanguage ?? 'en';
  }

  /**
   * Toggle auto-translate for user
   */
  static toggleAutoTranslate(userId: string, enabled: boolean): void {
    const pref = this.userPreferences.get(userId);
    if (pref) {
      pref.autoTranslateEnabled = enabled;
      pref.updatedAt = Date.now();
    }
  }

  /**
   * Translate a chat message to target languages
   */
  static async translateChatMessage(
    messageId: string,
    originalText: string,
    sourceLanguage: SupportedLanguage,
    userId: string,
    roomId: string,
    targetLanguages: SupportedLanguage[]
  ): Promise<TranslatedMessage> {
    this.stats.totalMessages++;

    if (this.messageCache.has(messageId)) {
      return this.messageCache.get(messageId)!;
    }

    const translations: Record<SupportedLanguage, string> = {
      [sourceLanguage]: originalText,
    } as Record<SupportedLanguage, string>;

    let confidenceSum = 1.0;
    let translationCount = 1;

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue;

      const result = await TranslationEngine.translate(
        originalText,
        targetLang,
        sourceLanguage
      );

      translations[targetLang] = result.translated;
      confidenceSum += result.confidence;
      translationCount++;
    }

    this.stats.translatedMessages++;
    this.stats.avgConfidence =
      (this.stats.avgConfidence * (this.stats.translatedMessages - 1) +
        confidenceSum / translationCount) /
      this.stats.translatedMessages;

    const message: TranslatedMessage = {
      messageId,
      original: originalText,
      translations,
      sourceLanguage,
      userId,
      roomId,
      timestamp: Date.now(),
    };

    if (this.messageCache.size >= this.MAX_CACHE) {
      const firstKey = this.messageCache.keys().next().value as string | undefined;
      if (firstKey !== undefined) this.messageCache.delete(firstKey);
    }
    this.messageCache.set(messageId, message);

    return message;
  }

  /**
   * Get slang/idiom explanation
   */
  static async explainSlang(
    text: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage
  ): Promise<Record<SupportedLanguage, string>> {
    const explanations = {} as Record<SupportedLanguage, string>;

    try {
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
              content: `You are a language and culture expert. Explain idioms, slang, and cultural references in the given text. Be concise and explain in simple terms. If there are no idioms or slang, respond with "no idioms found".`,
            },
            { role: 'user', content: `Explain any slang/idioms in this ${LANGUAGE_NAMES[sourceLanguage]} text: "${text}"` },
          ],
        }),
      });

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const explanation = data?.choices?.[0]?.message?.content?.trim() ?? 'no idioms found';
      explanations[sourceLanguage] = explanation;

      if (targetLanguage !== sourceLanguage) {
        const translation = await TranslationEngine.translate(
          explanation,
          targetLanguage,
          sourceLanguage
        );
        explanations[targetLanguage] = translation.translated;
      }
    } catch (error) {
      console.error('[ChatTranslationEngine] Slang explanation error:', error);
    }

    return explanations;
  }

  /**
   * Translate message for specific room participants
   */
  static async translateForRoom(
    messageId: string,
    originalText: string,
    sourceLanguage: SupportedLanguage,
    userId: string,
    roomId: string,
    participantLanguages: SupportedLanguage[]
  ): Promise<Map<SupportedLanguage, string>> {
    const uniqueLanguages = [...new Set([sourceLanguage, ...participantLanguages])];
    const message = await this.translateChatMessage(
      messageId,
      originalText,
      sourceLanguage,
      userId,
      roomId,
      uniqueLanguages
    );

    const result = new Map<SupportedLanguage, string>();
    for (const lang of uniqueLanguages) {
      result.set(lang, message.translations[lang] ?? originalText);
    }
    return result;
  }

  /**
   * Get message translation history
   */
  static getMessageTranslationHistory(messageId: string): TranslatedMessage | null {
    return this.messageCache.get(messageId) ?? null;
  }

  /**
   * Get statistics
   */
  static getStats(): ChatTranslationStats {
    return {
      totalMessages: this.stats.totalMessages,
      translatedMessages: this.stats.translatedMessages,
      userLanguages: new Map(this.stats.userLanguages),
      avgConfidence: this.stats.avgConfidence,
    };
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.messageCache.clear();
  }

  /**
   * Get top user languages
   */
  static getTopUserLanguages(limit = 10): Array<[SupportedLanguage, number]> {
    const counts = new Map<SupportedLanguage, number>();
    for (const lang of this.stats.userLanguages.values()) {
      counts.set(lang, (counts.get(lang) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }
}

export default ChatTranslationEngine;
