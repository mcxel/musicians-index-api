/**
 * ==================================================================================
 * EMOTE CAROUSEL - CHEVRON NAVIGATION
 * ==================================================================================
 * 
 * Features:
 * - Chevron left/right navigation
 * - Reverse animation when reaching end (bounces back)
 * - Shows 5 emotes at a time
 * - Locked emotes shown with purchase option
 * 
 * ==================================================================================
 */

'use client';

import React, { useState } from 'react';
import type { EmoteType } from './PlayWidget';

interface EmoteCarouselProps {
  ownedEmotes: EmoteType[];
  onEmoteSelect: (emote: EmoteType) => void;
}

const ALL_EMOTES: Array<{ type: EmoteType; icon: string; name: string; tier: string }> = [
  { type: 'clap', icon: '👏', name: 'Clap', tier: 'FREE' },
  { type: 'heart', icon: '❤️', name: 'Heart', tier: 'FREE' },
  { type: 'star', icon: '⭐', name: 'Star', tier: 'PREMIUM' },
  { type: 'fire', icon: '🔥', name: 'Fire', tier: 'PREMIUM' },
  { type: 'rocket', icon: '🚀', name: 'Rocket', tier: 'PREMIUM' },
  { type: 'trophy', icon: '🏆', name: 'Trophy', tier: 'VIP' },
  { type: 'diamond', icon: '💎', name: 'Diamond', tier: 'VIP' },
  { type: 'crown', icon: '👑', name: 'Crown', tier: 'VIP' },
  { type: 'lightning', icon: '⚡', name: 'Lightning', tier: 'SPONSOR' },
  { type: 'boom', icon: '💥', name: 'Boom', tier: 'SPONSOR' },
  { type: 'sparkles', icon: '✨', name: 'Sparkles', tier: 'SPONSOR' },
];

export function EmoteCarousel({ ownedEmotes, onEmoteSelect }: EmoteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);

  const visibleCount = 5;
  const maxIndex = Math.max(0, ALL_EMOTES.length - visibleCount);

  const handleNext = () => {
    if (isAnimating) return;

    if (currentIndex >= maxIndex) {
      setDirection('reverse');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(0);
        setIsAnimating(false);
      }, 500);
    } else {
      setDirection('forward');
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  const handlePrev = () => {
    if (isAnimating) return;

    if (currentIndex <= 0) {
      setDirection('reverse');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(maxIndex);
        setIsAnimating(false);
      }, 500);
    } else {
      setDirection('forward');
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const visibleEmotes = ALL_EMOTES.slice(currentIndex, currentIndex + visibleCount);

  return (
    <div className="flex items-center gap-4">
      {/* Left Chevron */}
      <button
        onClick={handlePrev}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
        disabled={isAnimating}
      >
        <span className="text-2xl">◀</span>
      </button>

      {/* Emote Display */}
      <div className="flex gap-3 overflow-hidden">
        {visibleEmotes.map((emote, idx) => {
          const isOwned = ownedEmotes.includes(emote.type);

          return (
            <div
              key={`${emote.type}-${currentIndex}-${idx}`}
              className="relative transition-all duration-300"
            >
              <button
                onClick={() => isOwned && onEmoteSelect(emote.type)}
                disabled={!isOwned}
                className={`
                  w-20 h-20 rounded-xl flex flex-col items-center justify-center
                  ${isOwned 
                    ? 'bg-gradient-to-br from-white to-gray-100 hover:shadow-2xl cursor-pointer' 
                    : 'bg-gray-200 cursor-not-allowed opacity-50'
                  }
                  shadow-lg transition-all hover:scale-105
                `}
                title={isOwned ? emote.name : `${emote.name} - ${emote.tier}`}
              >
                <span className="text-3xl">{emote.icon}</span>
                <span className="text-xs font-semibold mt-1">{emote.name}</span>
                
                {!isOwned && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Right Chevron */}
      <button
        onClick={handleNext}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-burgundy-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
        disabled={isAnimating}
      >
        <span className="text-2xl">▶</span>
      </button>
    </div>
  );
}
