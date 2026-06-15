'use client';

import React from 'react';

export type TileShape = 'octagon' | 'hexagon' | 'pentagon' | 'circle' | 'diamond' | 'torn-edge' | 'glitch-rect';

interface MaskedVideoTileProps {
  participantId?: string;
  videoStreamUrl?: string; 
  streamUrl?: string;
  vibeState?: any; 
  isAudioActive?: boolean;
  isLive?: boolean;
  participantName?: string;
  performerName?: string;
  performerSlug?: string;
  rank?: number;
  viewerCount?: number;
  genre?: string;
  avatarEmoji?: string;
  avatarUrl?: string;
  accentColor?: string;
  size?: number;
  shape?: TileShape;
  showActions?: boolean;
  onJoin?: () => void;
  onTip?: () => void;
  onMessage?: () => void;
}

export const MaskedVideoTile: React.FC<MaskedVideoTileProps> = ({ 
  participantId,
  videoStreamUrl,
  streamUrl,
  vibeState = {},
  isAudioActive,
  isLive,
  participantName,
  performerName,
  rank,
  viewerCount,
  genre,
  avatarEmoji,
  accentColor = '#00FFFF',
  size = 200,
  shape = 'octagon',
  showActions,
  onJoin,
  onTip,
  onMessage
}) => {
  const activeStream = streamUrl || videoStreamUrl;
  const displayName = performerName || participantName || 'Unknown';

  const getShapeStyle = () => {
    switch (shape) {
      case 'octagon': return { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' };
      case 'hexagon': return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
      case 'pentagon': return { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' };
      case 'diamond': return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
      case 'circle': return { clipPath: 'circle(50% at 50% 50%)', borderRadius: '50%' };
      case 'torn-edge': return { clipPath: 'polygon(0% 5%, 5% 0%, 95% 2%, 100% 8%, 98% 95%, 92% 100%, 5% 98%, 0% 92%)' };
      case 'glitch-rect': return { clipPath: 'polygon(0 0, 100% 0, 100% 80%, 95% 80%, 95% 100%, 0 100%)' };
      default: return {};
    }
  };

  return (
    <div 
      className={`group relative overflow-hidden transition-all duration-300 ease-in-out ${isAudioActive ? 'scale-[1.02] z-20 shadow-[0_0_30px_var(--accent)]' : 'hover:scale-[1.01] hover:shadow-[0_0_20px_var(--accent)] shadow-2xl'} bg-black`}
      style={{ width: size, height: size, '--accent': accentColor } as any}
    >
      {/* Masking Layer applied to the container itself */}
      <div className="absolute inset-0 z-0 bg-[#050510]" style={{ ...getShapeStyle(), border: `2px solid ${accentColor}` }}></div>
      
      <div className="relative z-10 w-full h-full" style={getShapeStyle()}>
        {/* CRT Scanline & Grain Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 z-30 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]"></div>

        {/* Video / Fallback Content */}
        {activeStream && isLive !== false ? (
          <div className="relative w-full h-full">
             <video src={activeStream} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black/80 to-black/95">
             {isLive === false ? (
               <>
                 <span className="text-3xl mb-2 opacity-50 grayscale">📺</span>
                 <span className="font-bold tracking-widest text-[10px] uppercase text-gray-500 mb-4">Broadcast Ended</span>
                 <button onClick={() => window.location.href = '/arena'} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-[9px] font-bold uppercase transition-colors border border-white/20">Return to Arena</button>
               </>
             ) : (
               <>
                 {avatarEmoji && <span className="text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mb-2 animate-pulse">{avatarEmoji}</span>}
                 <span className="font-bold tracking-widest text-[9px] uppercase" style={{ color: accentColor }}>Waiting for Feed</span>
               </>
             )}
          </div>
        )}

        {/* Actions Menu (Hovers in over the video) */}
        {showActions && (
          <div className="absolute inset-x-0 bottom-[35%] z-50 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onJoin && <button onClick={onJoin} className="bg-cyan-500 text-black px-2 py-1 rounded text-[10px] font-bold uppercase hover:scale-105 transition-transform shadow-[0_0_10px_#00E5FF]">Join</button>}
            {onTip && <button onClick={onTip} className="bg-amber-500 text-black px-2 py-1 rounded text-[10px] font-bold uppercase hover:scale-105 transition-transform shadow-[0_0_10px_#FF8C00]">$ Tip</button>}
            {onMessage && <button onClick={onMessage} className="bg-fuchsia-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase hover:scale-105 transition-transform shadow-[0_0_10px_#FF2DAA]">Msg</button>}
          </div>
        )}

        {/* Performer HUD Bottom */}
        <div className="absolute bottom-0 inset-x-0 z-40 bg-gradient-to-t from-black via-black/80 to-transparent pt-6 pb-2 px-3 text-white flex flex-col items-center border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black tracking-widest uppercase drop-shadow-md">{displayName}</span>
            {(isLive || isAudioActive) && <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)] animate-pulse"></span>}
          </div>
          {genre && <span className="text-[8px] tracking-widest text-gray-400 uppercase mt-0.5">{genre}</span>}
        </div>
      </div>
    </div>
  );
};