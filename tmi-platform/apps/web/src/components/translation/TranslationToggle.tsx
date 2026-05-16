/**
 * TranslationToggle.tsx
 *
 * UI toggle for enabling/disabling auto-translation
 */

'use client';

import React, { useState } from 'react';
import ChatTranslationEngine from '@/lib/translation/ChatTranslationEngine';
import { SupportedLanguage } from '@/lib/translation/TranslationEngine';

interface TranslationToggleProps {
  userId: string;
  onToggle?: (enabled: boolean) => void;
}

export const TranslationToggle: React.FC<TranslationToggleProps> = ({ userId, onToggle }) => {
  const [enabled, setEnabled] = useState(true);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    ChatTranslationEngine.toggleAutoTranslate(userId, newState);
    onToggle?.(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        enabled
          ? 'bg-cyan-500 text-black hover:bg-cyan-400'
          : 'bg-gray-600 text-white hover:bg-gray-500'
      }`}
    >
      {enabled ? '✓ Translation ON' : '✗ Translation OFF'}
    </button>
  );
};

export default TranslationToggle;
