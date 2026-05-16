export type SupportedLanguage = "en" | "es" | "fr" | "pt" | "ko" | "ja" | "hi" | "yo" | "sw" | "ar" | "zh" | "pa";

export interface LanguageProfile {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  captionSupported: boolean;
  translationSupported: boolean;
  chatTranslationSupported: boolean;
}

export interface TranslationAssistResult {
  original: string;
  translated: string;
  fromLanguage: SupportedLanguage;
  toLanguage: SupportedLanguage;
  confidence: "high" | "medium" | "low";
  culturalNote?: string;
}

const LANGUAGES: LanguageProfile[] = [
  { code: "en", name: "English",    nativeName: "English",    flag: "🇺🇸", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "es", name: "Spanish",    nativeName: "Español",    flag: "🇪🇸", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "fr", name: "French",     nativeName: "Français",   flag: "🇫🇷", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "pt", name: "Portuguese", nativeName: "Português",  flag: "🇧🇷", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "ko", name: "Korean",     nativeName: "한국어",       flag: "🇰🇷", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "ja", name: "Japanese",   nativeName: "日本語",       flag: "🇯🇵", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "hi", name: "Hindi",      nativeName: "हिन्दी",       flag: "🇮🇳", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "yo", name: "Yoruba",     nativeName: "Yorùbá",     flag: "🇳🇬", rtl: false, captionSupported: false, translationSupported: true, chatTranslationSupported: false },
  { code: "sw", name: "Swahili",    nativeName: "Kiswahili",  flag: "🇰🇪", rtl: false, captionSupported: false, translationSupported: true, chatTranslationSupported: false },
  { code: "ar", name: "Arabic",     nativeName: "العربية",     flag: "🇸🇦", rtl: true,  captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "zh", name: "Chinese",    nativeName: "中文",         flag: "🇨🇳", rtl: false, captionSupported: true,  translationSupported: true, chatTranslationSupported: true },
  { code: "pa", name: "Punjabi",    nativeName: "ਪੰਜਾਬੀ",      flag: "🇮🇳", rtl: false, captionSupported: false, translationSupported: true, chatTranslationSupported: false },
];

const langMap = new Map(LANGUAGES.map(l => [l.code, l]));

export function getAllLanguages(): LanguageProfile[] {
  return LANGUAGES;
}

export function getLanguage(code: SupportedLanguage): LanguageProfile | null {
  return langMap.get(code) ?? null;
}

export function getTranslationSupportedLanguages(): LanguageProfile[] {
  return LANGUAGES.filter(l => l.translationSupported);
}

export function getCaptionSupportedLanguages(): LanguageProfile[] {
  return LANGUAGES.filter(l => l.captionSupported);
}

export function requestTranslationAssist(
  text: string,
  from: SupportedLanguage,
  to: SupportedLanguage,
): TranslationAssistResult {
  return {
    original: text,
    translated: `[${to.toUpperCase()}] ${text}`,
    fromLanguage: from,
    toLanguage: to,
    confidence: "high",
    culturalNote: from !== to ? `Translation from ${langMap.get(from)?.name ?? from} to ${langMap.get(to)?.name ?? to}` : undefined,
  };
}

export function getSubtitleAssistPreview(text: string, targetLanguage: SupportedLanguage): string {
  return `[${targetLanguage.toUpperCase()}] ${text}`;
}

export function detectLanguage(text: string): SupportedLanguage {
  const patterns: [RegExp, SupportedLanguage][] = [
    [/[À-ÿ]/, "fr"],
    [/[áéíóúñ¡¿]/, "es"],
    [/[àãâê]/, "pt"],
    [/[぀-ゟ゠-ヿ]/, "ja"],
    [/[가-힣]/, "ko"],
    [/[ऀ-ॿ]/, "hi"],
    [/[؀-ۿ]/, "ar"],
    [/[一-鿿]/, "zh"],
  ];
  for (const [pattern, lang] of patterns) {
    if (pattern.test(text)) return lang;
  }
  return "en";
}
