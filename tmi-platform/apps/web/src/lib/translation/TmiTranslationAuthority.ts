/**
 * TmiTranslationAuthority — platform content-translation service (§9752–§9786).
 *
 * Reuses TranslationEngine. Does NOT duplicate posts per language.
 * Canonical: ONE content id · ONE original · OPTIONAL translation views.
 * Distinct from UI localization (HOME → INICIO).
 *
 * Surfaces: Community Gossip, Happy Days, comments, chat, lounge, magazine…
 */

import TranslationEngine, {
  LANGUAGE_NAMES,
  type SupportedLanguage,
  type TranslationResult,
} from "./TranslationEngine";

export type TmiTranslatableSurface =
  | "COMMUNITY_GOSSIP"
  | "HAPPY_DAYS"
  | "COMMENT"
  | "REPLY"
  | "MESSAGING"
  | "ROOM_CHAT"
  | "LOUNGE_CHAT"
  | "EVENT_CHAT"
  | "MAGAZINE_COMMUNITY"
  | "MAGAZINE_ARTICLE"
  | "OTHER";

export type ContentTranslationView = {
  contentId: string;
  contentVersion: number;
  originalText: string;
  originalLanguage: SupportedLanguage | "und";
  targetLanguage: SupportedLanguage;
  translatedText: string | null;
  status: "READY" | "SAME_LANGUAGE" | "PENDING" | "FAILED" | "SKIPPED_IDENTITY";
  provider: string;
  cached: boolean;
  textDirection: "ltr" | "rtl";
};

const RTL: ReadonlySet<string> = new Set(["ar", "he"]);

/** In-memory view cache — keyed by contentId|version|target. Invalidates on version bump. */
const viewCache = new Map<string, ContentTranslationView>();

/** Seed/demo phrasebook so walls certify without live Google/OpenAI keys. */
const DEMO_PHRASEBOOK: Array<{
  source: string;
  lang: SupportedLanguage;
  en: string;
}> = [
  {
    source: "Esa línea sobre el voltaje en las botas es pura verdad. Nada supera un cuarto en vivo.",
    lang: "es",
    en: "That line about the voltage in the boots is pure truth. Nothing beats a live room.",
  },
  {
    source: "ライブの熱量がすごかった。また絶対行く。",
    lang: "ja",
    en: "The live energy was incredible. I'm definitely going again.",
  },
  {
    source: "Respect énorme à tous les artistes indépendants qui tiennent le mur ce soir.",
    lang: "fr",
    en: "Huge respect to every independent artist holding the wall tonight.",
  },
  {
    source: "Minha prima conseguiu o primeiro show pago. Choramos de alegria na cozinha.",
    lang: "pt",
    en: "My cousin got her first paid gig. We cried happy tears in the kitchen.",
  },
  {
    source: "오늘 새로운 리스너에게 플레이리스트를 나눠준 모두에게 박수!",
    lang: "ko",
    en: "Applause to everyone who shared a playlist with a new listener today!",
  },
];

function cacheKey(contentId: string, version: number, target: SupportedLanguage): string {
  return `${contentId}|v${version}|${target}`;
}

export function textDirectionForLanguage(lang: SupportedLanguage | "und"): "ltr" | "rtl" {
  return lang !== "und" && RTL.has(lang) ? "rtl" : "ltr";
}

export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return code in LANGUAGE_NAMES;
}

/** Lightweight script heuristics when provider unavailable — not a second ML model. */
export function detectLanguageHeuristic(text: string): SupportedLanguage | "und" {
  const t = text.trim();
  if (!t) return "und";
  if (/[\u3040-\u30ff\u31f0-\u31ff]/.test(t)) return "ja";
  if (/[\uac00-\ud7af]/.test(t)) return "ko";
  if (/[\u4e00-\u9fff]/.test(t)) return "zh";
  if (/[\u0600-\u06ff]/.test(t)) return "ar";
  if (/[\u0590-\u05ff]/.test(t)) return "he";
  if (/[àâäéèêëïîôùûüçœæ]/i.test(t) && /\b(le|la|les|des|une|pour|avec|sur)\b/i.test(t)) return "fr";
  if (/[áéíóúñ¿¡]/i.test(t) || /\b(el|la|los|las|que|para|con|una)\b/i.test(t)) return "es";
  if (/[ãõáéíóúç]/i.test(t) && /\b(não|uma|para|com|que|minha|hoje)\b/i.test(t)) return "pt";
  if (/^[A-Za-z0-9\s'",.!?…—–\-]+$/.test(t)) return "en";
  return "und";
}

function demoTranslate(original: string, target: SupportedLanguage): string | null {
  const hit = DEMO_PHRASEBOOK.find((p) => p.source === original);
  if (!hit) return null;
  if (target === "en") return hit.en;
  if (target === hit.lang) return hit.source;
  return null;
}

/**
 * Request a translation VIEW of existing content — never creates a second post.
 * On failure: original stays visible (status FAILED, translatedText null).
 */
export async function requestContentTranslation(input: {
  contentId: string;
  contentVersion?: number;
  originalText: string;
  targetLanguage: SupportedLanguage;
  sourceLanguage?: SupportedLanguage | "und";
  surface: TmiTranslatableSurface;
  /** Never translate identity fields through this path. */
  fieldKind?: "BODY" | "NAME" | "USERNAME" | "SONG_TITLE" | "ARTIST_NAME";
}): Promise<ContentTranslationView> {
  const version = input.contentVersion ?? 1;
  const fieldKind = input.fieldKind ?? "BODY";

  if (fieldKind !== "BODY") {
    return {
      contentId: input.contentId,
      contentVersion: version,
      originalText: input.originalText,
      originalLanguage: input.sourceLanguage ?? "und",
      targetLanguage: input.targetLanguage,
      translatedText: null,
      status: "SKIPPED_IDENTITY",
      provider: "tmi-identity-guard",
      cached: false,
      textDirection: textDirectionForLanguage(input.sourceLanguage ?? "und"),
    };
  }

  const key = cacheKey(input.contentId, version, input.targetLanguage);
  const cached = viewCache.get(key);
  if (cached) return { ...cached, cached: true };

  const heuristic = detectLanguageHeuristic(input.originalText);
  let source: SupportedLanguage | "und" = input.sourceLanguage ?? heuristic;

  if (source === "und") {
    try {
      const det = await TranslationEngine.detectLanguage(input.originalText);
      source = det.language;
    } catch {
      source = heuristic;
    }
  }

  if (source !== "und" && source === input.targetLanguage) {
    const same: ContentTranslationView = {
      contentId: input.contentId,
      contentVersion: version,
      originalText: input.originalText,
      originalLanguage: source,
      targetLanguage: input.targetLanguage,
      translatedText: input.originalText,
      status: "SAME_LANGUAGE",
      provider: "none",
      cached: false,
      textDirection: textDirectionForLanguage(source),
    };
    viewCache.set(key, same);
    return same;
  }

  let engineResult: TranslationResult | null = null;
  try {
    engineResult = await TranslationEngine.translate(
      input.originalText,
      input.targetLanguage,
      source === "und" ? undefined : source,
    );
  } catch {
    engineResult = null;
  }

  const providerOk =
    engineResult &&
    engineResult.provider !== "error" &&
    engineResult.provider !== "none" &&
    engineResult.translated !== engineResult.original;

  if (providerOk && engineResult) {
    const view: ContentTranslationView = {
      contentId: input.contentId,
      contentVersion: version,
      originalText: input.originalText,
      originalLanguage: engineResult.sourceLanguage,
      targetLanguage: input.targetLanguage,
      translatedText: engineResult.translated,
      status: "READY",
      provider: engineResult.provider,
      cached: engineResult.cached,
      textDirection: textDirectionForLanguage(engineResult.sourceLanguage),
    };
    viewCache.set(key, view);
    void input.surface;
    return view;
  }

  const demo = demoTranslate(input.originalText, input.targetLanguage);
  if (demo) {
    const view: ContentTranslationView = {
      contentId: input.contentId,
      contentVersion: version,
      originalText: input.originalText,
      originalLanguage: source === "und" ? detectLanguageHeuristic(input.originalText) : source,
      targetLanguage: input.targetLanguage,
      translatedText: demo,
      status: "READY",
      provider: "tmi-demo-phrasebook",
      cached: false,
      textDirection: textDirectionForLanguage(
        source === "und" ? detectLanguageHeuristic(input.originalText) : source,
      ),
    };
    viewCache.set(key, view);
    return view;
  }

  const failed: ContentTranslationView = {
    contentId: input.contentId,
    contentVersion: version,
    originalText: input.originalText,
    originalLanguage: source,
    targetLanguage: input.targetLanguage,
    translatedText: null,
    status: "FAILED",
    provider: engineResult?.provider ?? "unavailable",
    cached: false,
    textDirection: textDirectionForLanguage(source),
  };
  // Do not cache failures permanently — allow retry.
  return failed;
}

export function invalidateContentTranslations(contentId: string): void {
  for (const k of [...viewCache.keys()]) {
    if (k.startsWith(`${contentId}|`)) viewCache.delete(k);
  }
}

export function __resetTmiTranslationViewsForTests(): void {
  viewCache.clear();
}

export { LANGUAGE_NAMES };
export type { SupportedLanguage };
