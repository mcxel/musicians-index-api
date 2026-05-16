// MagazineVoiceArticleEngine
// Voice/audio article read support — converts article text to audio metadata.
// Handles playback state, TTS pointers, and listener engagement signals.

export type VoiceArticleStatus = "available" | "processing" | "unavailable";

export interface VoiceArticle {
  articleId: string;
  audioUrl?: string;       // URL to hosted audio file
  ttsDuration: number;     // estimated seconds
  wordCount: number;
  status: VoiceArticleStatus;
  voice: "female-1" | "male-1" | "female-2" | "male-2";
  language: string;
  listenCount: number;
  completionRate: number;  // 0–1 (avg fraction of audio listened)
}

export interface ListenerSession {
  sessionId: string;
  articleId: string;
  listenerId?: string;
  startedAt: string;
  lastPositionSec: number;
  completed: boolean;
}

const _voiceArticles = new Map<string, VoiceArticle>();
const _sessions = new Map<string, ListenerSession>();

export function registerVoiceArticle(
  articleId: string,
  wordCount: number,
  audioUrl?: string,
  language = "en",
  voice: VoiceArticle["voice"] = "female-1",
): VoiceArticle {
  const wpm = 150;
  const ttsDuration = Math.round((wordCount / wpm) * 60);
  const entry: VoiceArticle = {
    articleId,
    audioUrl,
    ttsDuration,
    wordCount,
    status: audioUrl ? "available" : "unavailable",
    voice,
    language,
    listenCount: 0,
    completionRate: 0,
  };
  _voiceArticles.set(articleId, entry);
  return entry;
}

export function startListening(sessionId: string, articleId: string, listenerId?: string): ListenerSession {
  const session: ListenerSession = {
    sessionId,
    articleId,
    listenerId,
    startedAt: new Date().toISOString(),
    lastPositionSec: 0,
    completed: false,
  };
  _sessions.set(sessionId, session);

  const va = _voiceArticles.get(articleId);
  if (va) _voiceArticles.set(articleId, { ...va, listenCount: va.listenCount + 1 });

  return session;
}

export function updatePosition(sessionId: string, positionSec: number): void {
  const session = _sessions.get(sessionId);
  if (!session) return;

  const va = _voiceArticles.get(session.articleId);
  const completed = va ? positionSec >= va.ttsDuration * 0.9 : false;
  _sessions.set(sessionId, { ...session, lastPositionSec: positionSec, completed });
}

export function getVoiceArticle(articleId: string): VoiceArticle | null {
  return _voiceArticles.get(articleId) ?? null;
}
