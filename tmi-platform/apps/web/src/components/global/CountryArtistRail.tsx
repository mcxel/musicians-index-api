/**
 * CountryArtistRail.tsx
 *
 * Horizontal rail of artists from a specific country
 */

'use client';
import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';
import React from 'react';
import CountryFlagBadge from './CountryFlagBadge';

interface Artist {
  id: string;
  name: string;
  country: string;
  verified: boolean;
  followers: number;
  genres: string[];
  image?: string;
}

interface CountryArtistRailProps {
  countryCode: string;
  artists: Artist[];
  onArtistClick?: (artistId: string) => void;
  title?: string;
  className?: string;
}

export const CountryArtistRail: React.FC<CountryArtistRailProps> = ({
  countryCode,
  artists,
  onArtistClick,
  title,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-cyan-300">{title || 'Artists'}</h3>
          <CountryFlagBadge countryCode={countryCode} showName={false} size="sm" />
        </div>
        <span className="text-xs text-gray-400">{artists.length} artists</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scroll-smooth">
        {artists.map((artist) => (
          <button
            key={artist.id}
            onClick={() => onArtistClick?.(artist.id)}
            className="flex-shrink-0 w-32 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-cyan-500/50 transition-all group"
          >
            {artist.image && (
              <div className="w-full h-24 rounded-lg bg-gray-700 mb-2 overflow-hidden">
                <ImageSlotWrapper imageId="img-8mjmrr" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              </div>
            )}
            <div className="text-xs truncate font-medium text-white">
              {artist.verified ? '✓ ' : ''}{artist.name}
            </div>
            <div className="text-xs text-gray-400 truncate">{artist.genres[0]}</div>
            <div className="text-xs text-fuchsia-400 mt-1">{artist.followers.toLocaleString()} followers</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountryArtistRail;
