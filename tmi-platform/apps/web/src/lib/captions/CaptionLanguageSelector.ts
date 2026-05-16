export interface CaptionLanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  available: boolean;
}

const CAPTION_LANGUAGES: CaptionLanguageOption[] = [
  { code: "en", label: "English",    nativeLabel: "English",  available: true },
  { code: "es", label: "Spanish",    nativeLabel: "Español",  available: true },
  { code: "fr", label: "French",     nativeLabel: "Français", available: true },
  { code: "pt", label: "Portuguese", nativeLabel: "Português",available: true },
  { code: "ko", label: "Korean",     nativeLabel: "한국어",    available: true },
  { code: "ja", label: "Japanese",   nativeLabel: "日本語",    available: true },
  { code: "hi", label: "Hindi",      nativeLabel: "हिन्दी",    available: true },
  { code: "ar", label: "Arabic",     nativeLabel: "العربية",   available: true },
  { code: "zh", label: "Chinese",    nativeLabel: "中文",      available: true },
  { code: "yo", label: "Yoruba",     nativeLabel: "Yorùbá",   available: false },
  { code: "sw", label: "Swahili",    nativeLabel: "Kiswahili",available: false },
];

const userSelections = new Map<string, string>();

export function getAvailableCaptionLanguages(): CaptionLanguageOption[] {
  return CAPTION_LANGUAGES.filter(l => l.available);
}

export function getAllCaptionLanguages(): CaptionLanguageOption[] {
  return CAPTION_LANGUAGES;
}

export function setUserCaptionLanguage(userId: string, languageCode: string): void {
  userSelections.set(userId, languageCode);
}

export function getUserCaptionLanguage(userId: string): string {
  return userSelections.get(userId) ?? "en";
}

export function isCaptionLanguageAvailable(code: string): boolean {
  return CAPTION_LANGUAGES.find(l => l.code === code)?.available ?? false;
}
