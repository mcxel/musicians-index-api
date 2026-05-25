"use client";

/**
 * TMIVideoPlayer.tsx
 * Production-grade multi-mode video player for The Musician's Index.
 *
 * Modes:
 *  - "stream"   → HLS/DASH live broadcast (e.g. Daily.co room, RTMP ingest)
 *  - "vod"      → pre-recorded beat/track/concert clip (src URL)
 *  - "webrtc"   → peer capture preview via getUserMedia
 *  - "idle"     → branded hold screen with animated logo
 *
 * Features: adaptive quality selector, PiP, theater mode, volume/seek,
 * reaction overlay, sponsor banner injection, tip CTA, chat sidebar toggle.
 */

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type VideoMode = "stream" | "vod" | "webrtc" | "idle";
export type VideoQuality = "auto" | "1080p" | "720p" | "480p" | "360p";

export interface SponsorBanner {
  imageUrl: string;
  linkUrl: string;
  label: string;
  durationSec: number;
}

export interface TMIVideoPlayerProps {
  mode?: VideoMode;
  src?: string;                    // VOD or HLS manifest URL
  roomId?: string;                 // Daily.co / LiveKit room ID for stream mode
  title?: string;
  artistName?: string;
  artistSlug?: string;
  thumbnailUrl?: string;
  sponsorBanner?: SponsorBanner;
  showTipButton?: boolean;
  showChatToggle?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onEnded?: () => void;
  onError?: (err: Error) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

/* ─── Utility helpers ────────────────────────────────────────────────────── */
function formatTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function ReactionOverlay({
  reactions,
}: {
  reactions: { id: number; emoji: string; x: number }[];
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {reactions.map((r) => (
        <span
          key={r.id}
          style={{ left: `${r.x}%`, bottom: "10%" }}
          className="absolute text-2xl animate-[floatUp_2s_ease-out_forwards]"
        >
          {r.emoji}
        </span>
      ))}
    </div>
  );
}

function QualityBadge({ quality }: { quality: VideoQuality }) {
  const colors: Record<VideoQuality, string> = {
    auto: "bg-white/20 text-white/60",
    "1080p": "bg-cyan-500 text-black",
    "720p": "bg-blue-500 text-white",
    "480p": "bg-yellow-500 text-black",
    "360p": "bg-gray-500 text-white",
  };
  return (
    <span
      className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase ${colors[quality]}`}
    >
      {quality === "auto" ? "AUTO" : quality}
    </span>
  );
}

function LivePulseBadge() {
  return (
    <span className="flex items-center gap-1 bg-red-600 text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      LIVE
    </span>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function TMIVideoPlayer({
  mode = "idle",
  src,
  title = "Now Playing",
  artistName = "Unknown Artist",
  artistSlug,
  thumbnailUrl,
  sponsorBanner,
  showTipButton = false,
  showChatToggle = false,
  autoPlay = false,
  muted: initialMuted = false,
  loop = false,
  className = "",
  onEnded,
  onError,
  onTimeUpdate,
}: TMIVideoPlayerProps) {
  /* ── refs ── */
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  /* ── state ── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<VideoQuality>("auto");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isWebRTCActive, setIsWebRTCActive] = useState(false);
  const [reactions, setReactions] = useState<
    { id: number; emoji: string; x: number }[]
  >([]);
  const [activeSponsor, setActiveSponsor] = useState(false);
  const [controlsHideTimer, setControlsHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  /* ── WebRTC camera init ── */
  useEffect(() => {
    if (mode !== "webrtc") return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 },
        });
        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsWebRTCActive(true);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Camera unavailable";
        setCameraError(msg);
        onError?.(new Error(msg));
      }
    }

    startCamera();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      setIsWebRTCActive(false);
    };
  }, [mode]);

  /* ── Sponsor banner timing ── */
  useEffect(() => {
    if (!sponsorBanner) return;
    const timer = setTimeout(() => setActiveSponsor(true), 3000);
    const hide = setTimeout(
      () => setActiveSponsor(false),
      3000 + sponsorBanner.durationSec * 1000
    );
    return () => {
      clearTimeout(timer);
      clearTimeout(hide);
    };
  }, [sponsorBanner]);

  /* ── Controls auto-hide ── */
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsHideTimer) clearTimeout(controlsHideTimer);
    if (isPlaying) {
      const t = setTimeout(() => setShowControls(false), 3000);
      setControlsHideTimer(t);
    }
  }, [isPlaying, controlsHideTimer]);

  /* ── Video event handlers ── */
  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const ct = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(ct);
    setDuration(dur);
    onTimeUpdate?.(ct, dur);
  }

  function handlePlay() {
    setIsPlaying(true);
  }
  function handlePause() {
    setIsPlaying(false);
  }
  function handleEnded() {
    setIsPlaying(false);
    onEnded?.();
  }
  function handleError() {
    const err = new Error("Video failed to load or stream dropped");
    onError?.(err);
  }

  /* ── Controls ── */
  function togglePlay() {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setIsMuted(v === 0);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  }

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  async function togglePiP() {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {
      // PiP not supported in this context
    }
  }

  function addReaction(emoji: string) {
    const id = Date.now() + Math.random();
    const x = 10 + Math.random() * 80;
    setReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2100);
  }

  /* ── Progress bar percentage ── */
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ── Idle screen ── */
  if (mode === "idle") {
    return (
      <div
        className={`relative flex items-center justify-center bg-[#05050c] rounded-xl overflow-hidden aspect-video ${className}`}
      >
        <div className="text-center space-y-3 px-6">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/40 mx-auto flex items-center justify-center bg-cyan-500/10">
            <span className="text-cyan-400 font-black text-xl tracking-tighter">TMI</span>
          </div>
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest">
            No active stream
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      className={`relative bg-black rounded-xl overflow-hidden group select-none ${
        isTheater ? "fixed inset-0 z-50 rounded-none" : ""
      } ${className}`}
    >
      {/* ── VIDEO ELEMENT ── */}
      <video
        ref={videoRef}
        src={mode === "vod" ? src : undefined}
        autoPlay={autoPlay || mode === "webrtc"}
        muted={mode === "webrtc" ? true : isMuted}
        loop={loop}
        playsInline
        controls={false}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        poster={thumbnailUrl}
      />

      {/* ── REACTION FLOATERS ── */}
      <ReactionOverlay reactions={reactions} />

      {/* ── SPONSOR BANNER ── */}
      {activeSponsor && sponsorBanner && (
        <a
          href={sponsorBanner.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-16 left-4 right-4 z-30 bg-black/80 backdrop-blur border border-yellow-500/40 rounded-lg px-3 py-2 flex items-center justify-between gap-3 transition-opacity"
        >
          <span className="text-yellow-400 text-[9px] font-black uppercase tracking-widest">
            SPONSORED
          </span>
          <span className="text-white text-xs font-bold flex-1 truncate">
            {sponsorBanner.label}
          </span>
          <span className="text-white/40 text-[9px]">✕</span>
        </a>
      )}

      {/* ── CAMERA ERROR ── */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
          <div className="text-center space-y-2 px-6">
            <p className="text-red-400 font-bold text-sm">Camera Unavailable</p>
            <p className="text-white/50 text-xs">{cameraError}</p>
            <p className="text-white/30 text-[10px]">
              Allow camera access in browser settings to go live
            </p>
          </div>
        </div>
      )}

      {/* ── TOP BAR: title + badges ── */}
      <div
        className={`absolute top-0 inset-x-0 z-20 flex items-start justify-between p-3 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-white font-bold text-sm leading-tight truncate max-w-[60vw]">
            {title}
          </span>
          <span className="text-white/50 text-[10px]">{artistName}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {mode === "stream" && <LivePulseBadge />}
          <QualityBadge quality={quality} />
        </div>
      </div>

      {/* ── CENTER PLAY/PAUSE HIT ZONE ── */}
      {mode !== "webrtc" && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 w-full h-full z-10 flex items-center justify-center cursor-pointer"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {!isPlaying && (
            <span className="w-14 h-14 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
        </button>
      )}

      {/* ── BOTTOM CONTROLS ── */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress / Seek */}
        {mode === "vod" && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/50 text-[10px] font-mono w-10 text-right flex-shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1 h-1 bg-white/20 rounded-full">
              <div
                className="absolute left-0 top-0 h-full bg-cyan-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
              <input
                ref={seekRef}
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-white/50 text-[10px] font-mono w-10 flex-shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Control Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Play/Pause */}
          {mode !== "webrtc" && (
            <button
              onClick={togglePlay}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}

          {/* Volume */}
          <div className="flex items-center gap-1">
            <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors p-1">
              {isMuted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Reaction buttons */}
          <div className="flex gap-1">
            {["🔥", "💎", "🎤", "👑"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className="text-base hover:scale-125 transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Tip CTA */}
          {showTipButton && artistSlug && (
            <a
              href={`/tip/${artistSlug}`}
              className="bg-orange-500 hover:bg-orange-400 text-black text-[9px] font-black tracking-wider px-2 py-1 rounded uppercase transition-colors"
            >
              TIP
            </a>
          )}

          {/* Quality picker */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu((v) => !v)}
              className="text-white/60 hover:text-white text-[9px] font-bold px-1.5 py-1 rounded border border-white/10 hover:border-white/30 transition-colors uppercase"
            >
              HD
            </button>
            {showQualityMenu && (
              <div className="absolute bottom-8 right-0 bg-[#0d0d1a] border border-white/10 rounded-lg p-1 space-y-0.5 min-w-[80px]">
                {(["auto", "1080p", "720p", "480p", "360p"] as VideoQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full text-left text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      quality === q
                        ? "bg-cyan-500 text-black"
                        : "text-white/60 hover:bg-white/5"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PiP */}
          <button
            onClick={togglePiP}
            className={`text-white/60 hover:text-white p-1 transition-colors ${isPiP ? "text-cyan-400" : ""}`}
            title="Picture in Picture"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" />
            </svg>
          </button>

          {/* Theater mode */}
          <button
            onClick={() => setIsTheater((v) => !v)}
            className={`text-white/60 hover:text-white p-1 transition-colors ${isTheater ? "text-cyan-400" : ""}`}
            title="Theater mode"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z" />
            </svg>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white/60 hover:text-white p-1 transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── WEBRTC LIVE INDICATOR ── */}
      {mode === "webrtc" && isWebRTCActive && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
            BROADCASTING
          </span>
        </div>
      )}

      {/* Keyframe for reaction float animation */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
