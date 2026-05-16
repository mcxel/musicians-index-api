import TranslationEngine, { type SupportedLanguage } from "@/lib/translation/TranslationEngine";
import { getLanguage, type SupportedLanguage as LangSupportedLanguage } from "@/lib/global/LanguageAssistEngine";
import { getUserCaptionLanguage } from "@/lib/captions/CaptionLanguageSelector";

export interface TranslationBotAction {
  botId: string;
  roomId: string;
  userId: string;
  sourceLang: string;
  targetLang: string;
  action: "translate-chat" | "caption-assist" | "lyric-assist" | "idle";
  timestamp: number;
}

export interface TranslationBotSession {
  sessionId: string;
  roomId: string;
  activeUsers: string[];
  detectedLanguages: string[];
  translationCount: number;
  captionCount: number;
  startedAt: number;
}

const activeSessions = new Map<string, TranslationBotSession>();
const botActionLog: TranslationBotAction[] = [];

export function startTranslationBotSession(roomId: string, users: string[]): TranslationBotSession {
  const existing = activeSessions.get(roomId);
  if (existing) return existing;

  const session: TranslationBotSession = {
    sessionId: `tbot-${roomId}-${Date.now()}`,
    roomId,
    activeUsers: users,
    detectedLanguages: detectLanguagesInRoom(users),
    translationCount: 0,
    captionCount: 0,
    startedAt: Date.now(),
  };

  activeSessions.set(roomId, session);
  return session;
}

function detectLanguagesInRoom(userIds: string[]): string[] {
  const langs = new Set<string>();
  for (const userId of userIds) {
    langs.add(getUserCaptionLanguage(userId));
  }
  return [...langs];
}

export function botTranslateChat(roomId: string, message: string, fromLang: string, toLang: string): string {
  const session = activeSessions.get(roomId);
  if (session) {
    session.translationCount++;
    session.detectedLanguages = [...new Set([...session.detectedLanguages, fromLang, toLang])];
  }

  TranslationEngine.recordTranslation(
    message,
    `[${toLang}] ${message}`,
    fromLang as SupportedLanguage,
    toLang as SupportedLanguage,
    "chat",
    "translation-bot"
  );

  botActionLog.push({
    botId: "translation-bot",
    roomId,
    userId: "bot-system",
    sourceLang: fromLang,
    targetLang: toLang,
    action: "translate-chat",
    timestamp: Date.now(),
  });

  return `[${toLang}] ${message}`;
}

export function botProvideCaptionAssist(roomId: string, userId: string, captionText: string): string {
  const targetLang = getUserCaptionLanguage(userId);
  const profile = getLanguage(targetLang as LangSupportedLanguage);

  if (!profile?.captionSupported) {
    return captionText;
  }

  const session = activeSessions.get(roomId);
  if (session) session.captionCount++;

  TranslationEngine.recordTranslation(
    captionText,
    `[${targetLang}] ${captionText}`,
    "en" as SupportedLanguage,
    targetLang as SupportedLanguage,
    "caption",
    "caption-bot"
  );

  botActionLog.push({
    botId: "translation-bot",
    roomId,
    userId,
    sourceLang: "en",
    targetLang,
    action: "caption-assist",
    timestamp: Date.now(),
  });

  return `[${targetLang}] ${captionText}`;
}

export function getTranslationBotSession(roomId: string): TranslationBotSession | null {
  return activeSessions.get(roomId) ?? null;
}

export function getActiveBotRooms(): string[] {
  return [...activeSessions.keys()];
}

export function getTranslationBotStats(): { totalSessions: number; totalTranslations: number; totalCaptions: number } {
  let totalTranslations = 0;
  let totalCaptions = 0;
  for (const session of activeSessions.values()) {
    totalTranslations += session.translationCount;
    totalCaptions += session.captionCount;
  }
  return { totalSessions: activeSessions.size, totalTranslations, totalCaptions };
}

export function endTranslationBotSession(roomId: string): void {
  activeSessions.delete(roomId);
}
