/**
 * ==================================================================================
 * PLAY WIDGET - MAIN COMPONENT
 * ==================================================================================
 * 
 * Universal action strip for emotes, reactions, tips
 * Supports multiple dock positions: bottom, left, right, top, floating
 * Extensible by subscription tier (Free, Premium, VIP, Sponsor, Overseer)
 * 
 * Features:
 * - Custom icons: Clap, Star, Heart, Settings/Cog, Play/Tip
 * - Runtime add/remove/reorder icons via config
 * - Reserved safe-zones for video areas
 * - Chevron navigation for emote carousel
 * 
 * ==================================================================================
 */

'use client';

import React, { useState } from 'react';
import { EmoteCarousel } from './EmoteCarousel';

export type EmoteType = 
  | 'clap' | 'star' | 'heart' | 'fire' | 'rocket' | 'trophy' 
  | 'diamond' | 'crown' | 'lightning' | 'boom' | 'sparkles';

export type UserTier = 'FREE' | 'PREMIUM' | 'VIP' | 'SPONSOR' | 'OVERSEER';

export type DockPosition = 'bottom' | 'left' | 'right' | 'top' | 'floating';

interface PlayWidgetProps {
  userId: string;
  userTier: UserTier;
  dockPosition?: DockPosition;
  ownedEmotes?: EmoteType[];
  onEmoteSelect?: (emote: EmoteType) => void;
  onTipClick?: () => void;
  onSettingsClick?: () => void;
}

interface ActionIcon {
  id: string;
  icon: string;
  label: string;
  action: () => void;
  tier: UserTier[];
  order: number;
}

export function PlayWidget({
  userId: _userId,
  userTier,
  dockPosition = 'bottom',
  ownedEmotes = ['clap', 'heart'],
  onEmoteSelect,
  onTipClick,
  onSettingsClick,
}: PlayWidgetProps) {
  const [showEmoteCarousel, setShowEmoteCarousel] = useState(false);

  // Define available action icons by tier
  const actionIcons: ActionIcon[] = [
    {
      id: 'clap',
      icon: '👏',
      label: 'Clap',
      action: () => onEmoteSelect?.('clap'),
      tier: ['FREE', 'PREMIUM', 'VIP', 'SPONSOR', 'OVERSEER'],
      order: 1,
    },
    {
      id: 'heart',
      icon: '❤️',
      label: 'Heart',
      action: () => onEmoteSelect?.('heart'),
      tier: ['FREE', 'PREMIUM', 'VIP', 'SPONSOR', 'OVERSEER'],
      order: 2,
    },
    {
      id: 'star',
      icon: '⭐',
      label: 'Star',
      action: () => onEmoteSelect?.('star'),
      tier: ['PREMIUM', 'VIP', 'SPONSOR', 'OVERSEER'],
      order: 3,
    },
    {
      id: 'emotes',
      icon: '😊',
      label: 'Emotes',
      action: () => setShowEmoteCarousel(!showEmoteCarousel),
      tier: ['FREE', 'PREMIUM', 'VIP', 'SPONSOR', 'OVERSEER'],
      order: 4,
    },
    {
      id: 'tip',
      icon: '💰',
      label: 'Tip',
      action: () => onTipClick?.(),
      tier: ['PREMIUM', 'VIP', 'SPONSOR', 'OVERSEER'],
      order: 5,
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      action: () => onSettingsClick?.(),
      tier: ['FREE', 'PREMIUM', 'VIP', 'SPONSOR', 'OVERSEER'],
      order: 6,
    },
  ];

  // Filter icons by user tier
  const availableIcons = actionIcons
    .filter(icon => icon.tier.includes(userTier))
    .sort((a, b) => a.order - b.order);

  // Position classes based on dock
  const dockClasses: Record<DockPosition, string> = {
    bottom: 'fixed bottom-0 left-0 right-0 flex justify-center',
    left: 'fixed left-0 top-1/2 -translate-y-1/2 flex flex-col',
    right: 'fixed right-0 top-1/2 -translate-y-1/2 flex flex-col',
    top: 'fixed top-0 left-0 right-0 flex justify-center',
    floating: 'fixed bottom-4 right-4 flex',
  };

  return (
    <>
      {/* Main Play Widget */}
      <div
        className={`${dockClasses[dockPosition]} z-40 opacity-100 translate-y-0 transition-all duration-300`}
      >
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-burgundy-600 rounded-full shadow-2xl p-3 flex gap-3">
          {availableIcons.map(icon => (
            <button
              key={icon.id}
              onClick={icon.action}
              className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-2xl shadow-lg transition-all hover:scale-110 active:scale-95"
              title={icon.label}
            >
              {icon.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Emote Carousel Popup */}
      {showEmoteCarousel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 opacity-100 transition-opacity"
          onClick={() => setShowEmoteCarousel(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl scale-100 transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Your Emotes</h3>
              <button
                onClick={() => setShowEmoteCarousel(false)}
                className="text-2xl hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <EmoteCarousel
              ownedEmotes={ownedEmotes}
              onEmoteSelect={(emote) => {
                onEmoteSelect?.(emote);
                setShowEmoteCarousel(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
