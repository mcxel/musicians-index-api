'use client';

import React, { useMemo } from 'react';
import CountryFlagBadge from './CountryFlagBadge';

interface CountryPin {
  countryCode: string;
  activeRooms: number;
  genre: string;
  userCount: number;
}

interface WorldMusicMapProps {
  countries: CountryPin[];
  onCountryClick?: (countryCode: string) => void;
  className?: string;
}

export const WorldMusicMap: React.FC<WorldMusicMapProps> = ({
  countries,
  onCountryClick,
  className = '',
}) => {
  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => b.userCount - a.userCount),
    [countries]
  );

  return (
    <div className={`relative w-full rounded-lg bg-gradient-to-b from-gray-900 via-gray-950 to-black p-8 overflow-hidden ${className}`}>
      {/* Background effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,45,170,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">🌍 Global Music Map</h2>
          <p className="text-sm text-gray-400">{countries.length} countries active</p>
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedCountries.map((pin) => (
            <button
              key={pin.countryCode}
              onClick={() => onCountryClick?.(pin.countryCode)}
              className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <CountryFlagBadge countryCode={pin.countryCode} showName={false} size="sm" />
              </div>
              <div className="text-xs space-y-1">
                <div className="text-cyan-300 font-medium">{pin.genre}</div>
                <div className="text-gray-400">
                  {pin.activeRooms} rooms
                </div>
                <div className="text-fuchsia-400">
                  {pin.userCount} live
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-700/50 text-xs text-gray-400">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Rooms Active
          </span>
          <span className="inline-flex items-center gap-2 ml-4">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400" /> Users Live
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorldMusicMap;
