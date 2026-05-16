/**
 * CountryLiveBadge.tsx
 *
 * Display live status and user count for a country
 */

'use client';

import React from 'react';

interface CountryLiveBadgeProps {
  userCount: number;
  roomCount: number;
  isLive: boolean;
  className?: string;
}

export const CountryLiveBadge: React.FC<CountryLiveBadgeProps> = ({
  userCount,
  roomCount,
  isLive,
  className = '',
}) => {
  if (!isLive) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/40 border border-red-500/50 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 animate-pulse" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
      </span>
      <span className="text-xs font-medium text-red-300">
        {roomCount} room{roomCount !== 1 ? 's' : ''} • {userCount} live
      </span>
    </div>
  );
};

export default CountryLiveBadge;
