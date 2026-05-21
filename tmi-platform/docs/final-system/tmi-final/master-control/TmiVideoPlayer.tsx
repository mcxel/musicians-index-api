import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'; // Assuming lucide-react for icons

interface TmiVideoPlayerProps {
  streamUrl?: string;
  fallbackAsset?: string;
  isLive?: boolean;
  title: string;
  performer: string;
}

export const TmiVideoPlayer: React.FC<TmiVideoPlayerProps> = ({
  streamUrl,
  fallbackAsset,
  isLive = false,
  title,
  performer
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-emerald-500/30 group shadow-2xl">
      {/* Video / Fallback Layer */}
      {streamUrl ? (
        <video ref={videoRef} src={streamUrl} className="w-full h-full object-cover" muted={isMuted} loop autoPlay playsInline />
      ) : (
        <img src={fallbackAsset} alt={title} className="w-full h-full object-cover opacity-60" />
      )}

      {/* Top Status Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
          {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          <span className="text-white text-xs font-bold tracking-widest">{isLive ? 'LIVE' : 'VOD'}</span>
        </div>
        <div className="text-right">
          <h3 className="text-white font-black drop-shadow-md">{title}</h3>
          <p className="text-emerald-400 text-xs font-bold drop-shadow-md">{performer}</p>
        </div>
      </div>

      {/* Bottom Controls (Visible on hover) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
        <div className="flex gap-4">
          <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors">
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-emerald-400 transition-colors">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};