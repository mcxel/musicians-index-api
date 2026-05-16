/**
 * CaptionOverlay.tsx
 *
 * Live caption overlay component for video streams and live rooms
 * Displays translated subtitles with speaker identification
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SupportedLanguage, LANGUAGE_NAMES } from '@/lib/translation/TranslationEngine';
import LiveCaptionEngine, { Caption } from '@/lib/translation/LiveCaptionEngine';

interface CaptionOverlayProps {
  trackId: string;
  targetLanguage: SupportedLanguage;
  currentTime?: number;
  autoScroll?: boolean;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  trackId,
  targetLanguage,
  currentTime = 0,
  autoScroll = true,
}) => {
  const [currentCaption, setCurrentCaption] = useState<Caption | null>(null);
  const [upcomingCaptions, setUpcomingCaptions] = useState<Caption[]>([]);

  useEffect(() => {
    const caption = LiveCaptionEngine.getCaptionAtTime(trackId, currentTime, targetLanguage);
    setCurrentCaption(caption);

    const upcoming = LiveCaptionEngine.getCaptionsForTimeRange(
      trackId,
      currentTime,
      currentTime + 5000,
      targetLanguage
    ).slice(0, 3);
    setUpcomingCaptions(upcoming);
  }, [trackId, targetLanguage, currentTime]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-4">
      {currentCaption && (
        <div className="text-center text-lg font-semibold">
          {currentCaption.text}
          {currentCaption.speaker && (
            <div className="text-sm text-gray-300 mt-1">{currentCaption.speaker}</div>
          )}
        </div>
      )}
      {upcomingCaptions.length > 0 && autoScroll && (
        <div className="text-sm text-gray-400 mt-2 space-y-1">
          {upcomingCaptions.map((cap) => (
            <div key={cap.id} className="opacity-50">
              {cap.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaptionOverlay;
