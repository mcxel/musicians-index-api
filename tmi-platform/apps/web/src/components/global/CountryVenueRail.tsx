/**
 * CountryVenueRail.tsx
 *
 * Horizontal rail of venues from a specific country
 */

'use client';

import React from 'react';
import CountryFlagBadge from './CountryFlagBadge';

interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  genres: string[];
  isActive: boolean;
}

interface CountryVenueRailProps {
  countryCode: string;
  venues: Venue[];
  onVenueClick?: (venueId: string) => void;
  title?: string;
  className?: string;
}

export const CountryVenueRail: React.FC<CountryVenueRailProps> = ({
  countryCode,
  venues,
  onVenueClick,
  title,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-cyan-300">{title || 'Venues'}</h3>
          <CountryFlagBadge countryCode={countryCode} showName={false} size="sm" />
        </div>
        <span className="text-xs text-gray-400">{venues.length} venues</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scroll-smooth">
        {venues.map((venue) => (
          <button
            key={venue.id}
            onClick={() => onVenueClick?.(venue.id)}
            className="flex-shrink-0 w-40 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-fuchsia-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm font-medium text-white truncate">{venue.name}</div>
              {venue.isActive && (
                <span className="flex-shrink-0 inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
            <div className="text-xs text-gray-400 mb-1">{venue.city}</div>
            <div className="text-xs text-cyan-300 mb-2">Capacity: {venue.capacity.toLocaleString()}</div>
            <div className="flex flex-wrap gap-1">
              {venue.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="inline-block px-2 py-0.5 rounded bg-gray-700/50 text-xs text-fuchsia-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountryVenueRail;
