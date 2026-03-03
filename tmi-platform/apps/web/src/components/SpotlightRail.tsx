/**
 * ==================================================================================
 * SPOTLIGHT RAIL - Horizontal scrolling featured content
 * ==================================================================================
 */

'use client';

import React from 'react';

interface SpotlightItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  badge?: string;
  link?: string;
}

interface SpotlightRailProps {
  title?: string;
  items?: SpotlightItem[];
}

const DEFAULT_ITEMS: SpotlightItem[] = [
  { id: '1', title: 'New Releases', subtitle: 'Fresh tracks this week', badge: 'NEW' },
  { id: '2', title: 'Top Charts', subtitle: 'Most played', badge: 'HOT' },
  { id: '3', title: 'Curated Playlists', subtitle: 'Handpicked mixes', badge: null },
  { id: '4', title: 'Live Sessions', subtitle: 'Catch them live', badge: 'LIVE' },
  { id: '5', title: 'Emerging Artists', subtitle: 'Up and coming', badge: null },
];

export function SpotlightRail({ 
  title = 'Featured', 
  items = DEFAULT_ITEMS 
}: SpotlightRailProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <button className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
          View All →
        </button>
      </div>
      
      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link || '#'}
            className="flex-shrink-0 w-64 group"
          >
            <div className="relative aspect-square bg-gray-800 rounded-xl overflow-hidden mb-3">
              {/* Placeholder gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 group-hover:scale-105 transition-transform duration-300" />
              
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              
              {/* Badge */}
              {item.badge && (
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    item.badge === 'NEW' ? 'bg-blue-500' :
                    item.badge === 'HOT' ? 'bg-red-500' :
                    item.badge === 'LIVE' ? 'bg-green-500' :
                    'bg-orange-500'
                  } text-white`}>
                    {item.badge}
                  </span>
                </div>
              )}
            </div>
            
            {/* Info */}
            <h3 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-sm text-gray-400 truncate">{item.subtitle}</p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
