/**
 * ==================================================================================
 * LIVE ROOMS - Shows active streaming rooms
 * ==================================================================================
 */

'use client';

import React from 'react';

interface LiveRoom {
  id: string;
  title: string;
  streamer: string;
  viewers: number;
  thumbnail?: string;
  category?: string;
}

interface LiveRoomsProps {
  rooms?: LiveRoom[];
}

const DEFAULT_ROOMS: LiveRoom[] = [
  { id: '1', title: 'Live Jazz Session', streamer: 'JazzCat99', viewers: 234, category: 'Music' },
  { id: '2', title: 'Indie Artists Showcase', streamer: 'IndieVibes', viewers: 156, category: 'Live' },
  { id: '3', title: 'Producer Beats', streamer: 'BeatMakerPro', viewers: 89, category: 'Beats' },
];

export function LiveRooms({ rooms = DEFAULT_ROOMS }: LiveRoomsProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Live Now</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all cursor-pointer"
          >
            {/* Thumbnail placeholder */}
            <div className="aspect-video bg-gray-800 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl opacity50">🎵</div>
              </div>
              {/* Live badge */}
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                LIVE
              </div>
              {/* Viewer count */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                👁 {room.viewers}
              </div>
            </div>
            
            {/* Room info */}
            <div className="p-4">
              <h3 className="font-semibold text-white truncate">{room.title}</h3>
              <p className="text-gray-400 text-sm">{room.streamer}</p>
              {room.category && (
                <span className="inline-block mt-2 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                  {room.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
