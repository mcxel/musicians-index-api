/**
 * LanguageSelector.tsx
 *
 * Language selection dropdown for choosing translation target language
 */

'use client';

import React, { useState } from 'react';
import { SupportedLanguage, LANGUAGE_NAMES } from '@/lib/translation/TranslationEngine';
import ChatTranslationEngine from '@/lib/translation/ChatTranslationEngine';

interface LanguageSelectorProps {
  userId: string;
  onLanguageChange?: (language: SupportedLanguage) => void;
  defaultLanguage?: SupportedLanguage;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  userId,
  onLanguageChange,
  defaultLanguage = 'en',
}) => {
  const [selected, setSelected] = useState<SupportedLanguage>(defaultLanguage);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value as SupportedLanguage;
    setSelected(language);
    ChatTranslationEngine.setUserLanguagePreference(userId, language);
    onLanguageChange?.(language);
  };

  const languages = Object.entries(LANGUAGE_NAMES).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`lang-select-${userId}`} className="text-sm font-medium">
        Language:
      </label>
      <select
        id={`lang-select-${userId}`}
        value={selected}
        onChange={handleChange}
        className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-cyan-500 transition-colors"
      >
        {languages.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
