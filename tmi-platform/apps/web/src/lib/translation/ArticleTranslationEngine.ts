/**
 * ArticleTranslationEngine.ts
 *
 * Article and content translation for magazine, profiles, events
 */

import TranslationEngine, { SupportedLanguage } from './TranslationEngine';

export interface TranslatedArticle {
  articleId: string;
  title: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  content: Record<SupportedLanguage, string>;
  tags: Record<SupportedLanguage, string[]>;
  sourceLanguage: SupportedLanguage;
  translatedLanguages: SupportedLanguage[];
  originalAuthor: string;
  translatedAt: number;
  translations: Map<SupportedLanguage, ArticleTranslation>;
}

export interface ArticleTranslation {
  language: SupportedLanguage;
  title: string;
  description: string;
  content: string;
  tags: string[];
  confidence: number;
  timestamp: number;
}

export interface ArticleTranslationRequest {
  articleId: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  sourceLanguage: SupportedLanguage;
  authorId: string;
  targetLanguages: SupportedLanguage[];
}

export class ArticleTranslationEngine {
  private static articleCache: Map<string, TranslatedArticle> = new Map();
  private static MAX_CACHE = 1000;

  static async translateArticle(
    request: ArticleTranslationRequest
  ): Promise<TranslatedArticle> {
    const cacheKey = `${request.articleId}_${request.sourceLanguage}`;
    const cached = this.articleCache.get(cacheKey);
    if (cached) return cached;

    const translations = new Map<SupportedLanguage, ArticleTranslation>();
    const titleMap: Record<SupportedLanguage, string> = {
      [request.sourceLanguage]: request.title,
    } as Record<SupportedLanguage, string>;
    const descriptionMap: Record<SupportedLanguage, string> = {
      [request.sourceLanguage]: request.description,
    } as Record<SupportedLanguage, string>;
    const contentMap: Record<SupportedLanguage, string> = {
      [request.sourceLanguage]: request.content,
    } as Record<SupportedLanguage, string>;
    const tagsMap: Record<SupportedLanguage, string[]> = {
      [request.sourceLanguage]: request.tags,
    } as Record<SupportedLanguage, string[]>;

    for (const targetLang of request.targetLanguages) {
      if (targetLang === request.sourceLanguage) {
        translations.set(targetLang, {
          language: targetLang,
          title: request.title,
          description: request.description,
          content: request.content,
          tags: request.tags,
          confidence: 1.0,
          timestamp: Date.now(),
        });
        continue;
      }

      const [titleResult, descriptionResult, contentResult, tagsResult] = await Promise.all([
        TranslationEngine.translate(request.title, targetLang, request.sourceLanguage),
        TranslationEngine.translate(request.description, targetLang, request.sourceLanguage),
        this.translateLongContent(request.content, targetLang, request.sourceLanguage),
        TranslationEngine.translateBatch(request.tags, targetLang, request.sourceLanguage),
      ]);

      titleMap[targetLang] = titleResult.translated;
      descriptionMap[targetLang] = descriptionResult.translated;
      contentMap[targetLang] = contentResult;
      tagsMap[targetLang] = tagsResult.map((r) => r.translated);

      const avgConfidence =
        (titleResult.confidence + descriptionResult.confidence) / 2;

      translations.set(targetLang, {
        language: targetLang,
        title: titleResult.translated,
        description: descriptionResult.translated,
        content: contentResult,
        tags: tagsResult.map((r) => r.translated),
        confidence: avgConfidence,
        timestamp: Date.now(),
      });
    }

    const article: TranslatedArticle = {
      articleId: request.articleId,
      title: titleMap,
      description: descriptionMap,
      content: contentMap,
      tags: tagsMap,
      sourceLanguage: request.sourceLanguage,
      translatedLanguages: request.targetLanguages,
      originalAuthor: request.authorId,
      translatedAt: Date.now(),
      translations,
    };

    if (this.articleCache.size >= this.MAX_CACHE) {
      const firstKey = this.articleCache.keys().next().value as string | undefined;
      if (firstKey !== undefined) this.articleCache.delete(firstKey);
    }
    this.articleCache.set(cacheKey, article);
    return article;
  }

  private static async translateLongContent(
    content: string,
    targetLanguage: SupportedLanguage,
    sourceLanguage: SupportedLanguage
  ): Promise<string> {
    const maxChunkSize = 2000;
    if (content.length <= maxChunkSize) {
      const result = await TranslationEngine.translate(content, targetLanguage, sourceLanguage);
      return result.translated;
    }

    const chunks = [];
    for (let i = 0; i < content.length; i += maxChunkSize) {
      chunks.push(content.slice(i, i + maxChunkSize));
    }

    const translatedChunks = await Promise.all(
      chunks.map((chunk) => TranslationEngine.translate(chunk, targetLanguage, sourceLanguage))
    );

    return translatedChunks.map((r) => r.translated).join('');
  }

  static getTranslatedArticle(
    articleId: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage
  ): ArticleTranslation | null {
    const cacheKey = `${articleId}_${sourceLanguage}`;
    const article = this.articleCache.get(cacheKey);
    return article?.translations.get(targetLanguage) ?? null;
  }

  static clearCache(): void {
    this.articleCache.clear();
  }

  static getCacheStats(): { size: number; articles: number } {
    return { size: this.articleCache.size, articles: this.articleCache.size };
  }
}

export default ArticleTranslationEngine;
