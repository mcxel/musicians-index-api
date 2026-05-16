/**
 * CultureGuideBotEngine.ts
 *
 * Autonomous culture guide bot for explaining cultural and musical context
 */

import MusicTranslationAssistEngine, {
  MusicExplanation,
  ArtistStyleTranslation,
} from '../translation/MusicTranslationAssistEngine';
import { SupportedLanguage } from '../translation/TranslationEngine';
import { getSpotlightByCountry, type CultureSpotlight } from '../global/CultureDiscoveryEngine';
import { searchMusicMeaning, type MusicMeaningCard } from '../global/MusicMeaningAssistEngine';

export interface CultureGuideContext {
  type: 'genre' | 'artist' | 'slang' | 'cultural-ref' | 'music-meaning';
  subject: string;
  languages: SupportedLanguage[];
  timestamp: number;
}

export interface CultureGuideBotStats {
  guidesProvided: number;
  uniqueTopics: number;
  avgLanguages: number;
  uptime: number;
}

export interface CultureBotMessage {
  messageId: string;
  userId: string;
  roomId: string;
  type: 'lesson-intro' | 'genre-guide' | 'slang-explain' | 'culture-spotlight' | 'recommendation';
  content: string;
  genreId?: string;
  countryCode?: string;
  lessonId?: string;
  timestamp: number;
}

const contextLog: CultureGuideContext[] = [];
const messageLog: CultureBotMessage[] = [];
const startTime = Date.now();
let guidesProvided = 0;
const uniqueTopics = new Set<string>();

export class CultureGuideBotEngine {
  /**
   * Explain a music genre
   */
  static async explainGenre(
    genre: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): Promise<MusicExplanation> {
    const explanation = await MusicTranslationAssistEngine.explainMusicConcept(
      genre,
      sourceLanguage,
      targetLanguages
    );

    recordContext({
      type: 'genre',
      subject: genre,
      languages: targetLanguages,
      timestamp: Date.now(),
    });

    return explanation;
  }

  /**
   * Explain an artist's style
   */
  static async explainArtistStyle(
    artistId: string,
    artistName: string,
    style: string,
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): Promise<ArtistStyleTranslation> {
    const explanation = await MusicTranslationAssistEngine.translateArtistStyle(
      artistId,
      artistName,
      style,
      sourceLanguage,
      targetLanguages
    );

    recordContext({
      type: 'artist',
      subject: artistName,
      languages: targetLanguages,
      timestamp: Date.now(),
    });

    return explanation;
  }

  /**
   * Bot sends culture guide message
   */
  static async sendCultureGuideMessage(
    userId: string,
    roomId: string,
    topic: string,
    type: 'genre' | 'artist' | 'music-meaning',
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[]
  ): Promise<CultureBotMessage> {
    let content = '';

    if (type === 'genre') {
      const guide = await this.explainGenre(topic, sourceLanguage, targetLanguages);
      content = guide.explanations[sourceLanguage] || `${topic} is a fascinating music genre.`;
    } else if (type === 'artist') {
      content = `Learn about ${topic} and their unique style.`;
    } else if (type === 'music-meaning') {
      const guide = await this.explainGenre(topic, sourceLanguage, targetLanguages);
      content = guide.culturalContext[sourceLanguage] || `Understanding the meaning of ${topic}...`;
    }

    const message: CultureBotMessage = {
      messageId: `cgbot-${Date.now()}`,
      userId,
      roomId,
      type: 'genre-guide',
      content,
      genreId: type === 'genre' ? topic : undefined,
      timestamp: Date.now(),
    };

    messageLog.push(message);
    return message;
  }

  /**
   * Get bot statistics
   */
  static getStats(): CultureGuideBotStats {
    const avgLanguages = contextLog.length > 0
      ? contextLog.reduce((sum, ctx) => sum + ctx.languages.length, 0) / contextLog.length
      : 0;

    return {
      guidesProvided,
      uniqueTopics: uniqueTopics.size,
      avgLanguages,
      uptime: Date.now() - startTime,
    };
  }

  /**
   * Get context log
   */
  static getContextLog(limit = 50): CultureGuideContext[] {
    return contextLog.slice(-limit);
  }

  /**
   * Get unique topics
   */
  static getUniqueTopics(): string[] {
    return Array.from(uniqueTopics);
  }

  /**
   * Get popular topics
   */
  static getPopularTopics(limit = 10): Array<[string, number]> {
    const counts = new Map<string, number>();
    for (const ctx of contextLog) {
      counts.set(ctx.subject, (counts.get(ctx.subject) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  /**
   * Get message log
   */
  static getMessageLog(limit = 50): CultureBotMessage[] {
    return messageLog.slice(-limit);
  }

  /**
   * Clear log
   */
  static clearLog(): void {
    contextLog.length = 0;
    messageLog.length = 0;
    guidesProvided = 0;
    uniqueTopics.clear();
  }
}

function recordContext(context: CultureGuideContext): void {
  contextLog.push(context);
  guidesProvided++;
  uniqueTopics.add(context.subject);
}

export interface CultureBotState {
  userId: string;
  roomId: string;
  messagesDelivered: number;
  lastInteraction: number;
}

const botStates = new Map<string, CultureBotState>();

function getStateKey(userId: string, roomId: string): string {
  return `${userId}:${roomId}`;
}

// Compatibility exports
export function initCultureBot(userId: string, roomId: string): CultureBotState {
  const key = getStateKey(userId, roomId);
  const state: CultureBotState = { userId, roomId, messagesDelivered: 0, lastInteraction: Date.now() };
  botStates.set(key, state);
  return state;
}

export function botExplainGenre(userId: string, roomId: string, genreId: string): CultureBotMessage {
  return {
    messageId: `cgbot-${Date.now()}`,
    userId,
    roomId,
    type: 'genre-guide',
    content: `Let me explain ${genreId}...`,
    genreId,
    timestamp: Date.now(),
  };
}

export function botExplainSlang(userId: string, roomId: string, term: string): CultureBotMessage {
  return {
    messageId: `cgbot-${Date.now()}`,
    userId,
    roomId,
    type: 'slang-explain',
    content: `"${term}" — cultural meaning and context...`,
    timestamp: Date.now(),
  };
}

export function botIntroLesson(userId: string, roomId: string, genreId: string): CultureBotMessage {
  return {
    messageId: `cgbot-${Date.now()}`,
    userId,
    roomId,
    type: 'lesson-intro',
    content: `Ready to learn about ${genreId}?`,
    genreId,
    timestamp: Date.now(),
  };
}

export function getCultureBotStats(): { messagesDelivered: number } {
  return { messagesDelivered: messageLog.length };
}

export default CultureGuideBotEngine;

export function botSpotlightCountry(userId: string, roomId: string, countryCode: string): CultureBotMessage {
  const spotlight: CultureSpotlight | null = getSpotlightByCountry(countryCode);
  const state = botStates.get(getStateKey(userId, roomId)) ?? initCultureBot(userId, roomId);

  const content = spotlight
    ? `Culture spotlight — ${spotlight.countryCode}: ${spotlight.featuredArtist} is leading the ${spotlight.genre} movement. "${spotlight.description}" Tags: ${spotlight.tags.join(", ")}`
    : `No spotlight yet for ${countryCode} — the world is watching though.`;

  const msg: CultureBotMessage = {
    messageId: `cgbot-${Date.now()}`,
    userId,
    roomId,
    type: "culture-spotlight",
    content,
    countryCode,
    timestamp: Date.now(),
  };

  state.messagesDelivered++;
  state.lastInteraction = Date.now();
  messageLog.push(msg);
  return msg;
}

export function botRecommendBySearch(userId: string, roomId: string, query: string): CultureBotMessage {
  const results = searchMusicMeaning(query);
  const state = botStates.get(getStateKey(userId, roomId)) ?? initCultureBot(userId, roomId);

  const content = results.length > 0
    ? `Found ${results.length} result(s) for "${query}": ${results.slice(0, 2).map((r: MusicMeaningCard) => `"${r.term}" (${r.origin})`).join(", ")}`
    : `Nothing matched "${query}" yet — try a genre name or slang term.`;

  const msg: CultureBotMessage = {
    messageId: `cgbot-${Date.now()}`,
    userId,
    roomId,
    type: "recommendation",
    content,
    timestamp: Date.now(),
  };

  state.messagesDelivered++;
  state.lastInteraction = Date.now();
  messageLog.push(msg);
  return msg;
}

export function getCultureBotState(userId: string, roomId: string): CultureBotState | null {
  return botStates.get(getStateKey(userId, roomId)) ?? null;
}

export function getCultureBotMessageLog(roomId: string): CultureBotMessage[] {
  return messageLog.filter(m => m.roomId === roomId);
}
