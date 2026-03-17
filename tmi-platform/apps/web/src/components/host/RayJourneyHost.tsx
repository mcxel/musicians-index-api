/**
 * RayJourneyHost.tsx
 * TMI Grand Platform Contest — Ray Journey Host Avatar
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/components/host/RayJourneyHost.tsx
 * Dependencies: RayJourneyAvatarSpec, HostCuePanel
 * Wiring: Connect to HostScriptBot output, WebSocket for live cue triggers
 *
 * Ray Journey: White male, 30s, charismatic, energetic futuristic show host
 * Visual style matches TMI neon/retro dark aesthetic
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, VolumeX, Play, Pause, ChevronRight } from 'lucide-react';

export type HostEmotion = 'neutral' | 'excited' | 'announcing' | 'revealing' | 'crowd' | 'sponsor';

export interface HostScript {
  id: string;
  type: 'contestant_intro' | 'sponsor_shoutout' | 'prize_reveal' | 'round_transition' | 'winner_announce' | 'crowd_hype';
  text: string;
  emotion: HostEmotion;
}

interface RayJourneyHostProps {
  currentScript?: HostScript | null;
  emotion?: HostEmotion;
  isLive?: boolean;
  muted?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'stage';
  onScriptComplete?: () => void;
  onMuteToggle?: () => void;
}

const EMOTION_COLORS: Record<HostEmotion, string> = {
  neutral: '#00e5ff',
  excited: '#ff6b1a',
  announcing: '#ffd700',
  revealing: '#ff00ff',
  crowd: '#00ff88',
  sponsor: '#ffd700',
};

const SAMPLE_SCRIPTS: Record<string, string> = {
  contestant_intro: "Ladies and gentlemen — welcome to the BerntoutGlobal Grand Platform Contest! Let's give it up for our next contestant!",
  sponsor_shoutout: "Tonight's performance is brought to you by our incredible sponsors — thank you for making this show possible!",
  prize_reveal: "And now… the moment you've ALL been waiting for. Let's reveal tonight's grand prize!",
  round_transition: "That was INCREDIBLE! We're moving on to the next round — stay locked in, this just keeps getting better!",
  winner_announce: "The votes are in. The crowd has spoken. And your winner of the BerntoutGlobal Grand Platform Contest is…",
  crowd_hype: "I need EVERYONE to make some noise right now! Show our artists what you came here for!",
};

export function RayJourneyHost({
  currentScript,
  emotion = 'neutral',
  isLive = false,
  muted = false,
  size = 'md',
  onScriptComplete,
  onMuteToggle,
}: RayJourneyHostProps) {
  const [speaking, setSpeaking] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<HostEmotion>(emotion);
  const [pulse, setPulse] = useState(false);
  const typeInterval = useRef<NodeJS.Timeout | null>(null);

  const scriptText = currentScript?.text || '';

  // Typewriter effect for script display
  useEffect(() => {
    if (!scriptText) { setDisplayText(''); return; }
    setSpeaking(true);
    setCurrentEmotion(currentScript?.emotion || emotion);
    setCharIndex(0);
    setDisplayText('');

    typeInterval.current = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= scriptText.length) {
          clearInterval(typeInterval.current!);
          setSpeaking(false);
          onScriptComplete?.();
          return prev;
        }
        setDisplayText(scriptText.slice(0, prev + 1));
        return prev + 1;
      });
    }, 30);

    return () => { if (typeInterval.current) clearInterval(typeInterval.current); };
  }, [scriptText]);

  // Pulse for live indicator
  useEffect(() => {
    if (!isLive) return;
    const iv = setInterval(() => setPulse((p) => !p), 1000);
    return () => clearInterval(iv);
  }, [isLive]);

  const accentColor = EMOTION_COLORS[currentEmotion];
  const sizeMap = { sm: 80, md: 120, lg: 180, stage: 260 };
  const avatarSize = sizeMap[size];

  return (
    <div className={`ray-host ray-host-${size}`}>
      {/* Live indicator */}
      {isLive && (
        <div className="live-indicator">
          <span className={`live-dot ${pulse ? 'dot-on' : 'dot-off'}`} />
          LIVE
        </div>
      )}

      {/* Avatar container */}
      <div
        className="avatar-container"
        style={{
          width: avatarSize,
          height: avatarSize,
          '--accent': accentColor,
        } as React.CSSProperties}
      >
        {/* Glow ring */}
        <div className="avatar-glow-ring" />

        {/* Ray Journey SVG Avatar */}
        <svg
          viewBox="0 0 200 200"
          width={avatarSize}
          height={avatarSize}
          xmlns="http://www.w3.org/2000/svg"
          className={`host-svg ${speaking ? 'svg-speaking' : ''}`}
        >
          {/* Background circle */}
          <circle cx="100" cy="100" r="95" fill="#0d1117" stroke={accentColor} strokeWidth="2" />

          {/* Suit body */}
          <ellipse cx="100" cy="168" rx="52" ry="36" fill="#1a1f2e" />
          <rect x="75" y="140" width="50" height="50" rx="4" fill="#1e2535" />

          {/* Tie */}
          <polygon points="100,138 94,148 100,175 106,148" fill={accentColor} opacity="0.8" />

          {/* Lapels */}
          <polygon points="75,138 88,138 82,155 68,155" fill="#252d42" />
          <polygon points="125,138 112,138 118,155 132,155" fill="#252d42" />

          {/* Neck */}
          <rect x="90" y="118" width="20" height="22" rx="4" fill="#f0c8a0" />

          {/* Head */}
          <ellipse cx="100" cy="100" rx="36" ry="40" fill="#f0c8a0" />

          {/* Hair - styled side part */}
          <path d="M 68 88 Q 72 68 100 70 Q 125 68 132 82 Q 136 90 134 95 Q 128 78 100 76 Q 76 76 70 92 Z" fill="#8B6914" />
          <path d="M 68 88 Q 70 80 78 76" stroke="#8B6914" strokeWidth="3" fill="none" />

          {/* Eyes */}
          <ellipse cx="88" cy="97" rx="5" ry="5.5" fill="#fff" />
          <ellipse cx="112" cy="97" rx="5" ry="5.5" fill="#fff" />
          <circle cx="89" cy="97" r="3" fill="#3a2a10" />
          <circle cx="113" cy="97" r="3" fill="#3a2a10" />
          <circle cx="90" cy="96" r="1" fill="#fff" />
          <circle cx="114" cy="96" r="1" fill="#fff" />

          {/* Eyebrows */}
          <path d="M 83 90 Q 88 87 94 89" stroke="#7a5a10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 106 89 Q 112 87 117 90" stroke="#7a5a10" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 100 102 Q 97 109 93 111 Q 100 114 107 111 Q 103 109 100 102 Z" fill="#dba882" />

          {/* Mouth - changes with speaking */}
          {speaking ? (
            <ellipse cx="100" cy="120" rx="10" ry="7" fill="#c06050" />
          ) : (
            <path d="M 88 118 Q 100 126 112 118" stroke="#c06050" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          {/* Ear */}
          <ellipse cx="65" cy="103" rx="5" ry="8" fill="#f0c8a0" />
          <ellipse cx="135" cy="103" rx="5" ry="8" fill="#f0c8a0" />

          {/* Mic (right hand area) */}
          <rect x="130" y="145" width="10" height="28" rx="5" fill="#333" />
          <ellipse cx="135" cy="143" rx="8" ry="10" fill={accentColor} opacity="0.9" />

          {/* Neon accent lines */}
          <line x1="5" y1="100" x2="20" y2="100" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
          <line x1="180" y1="100" x2="195" y2="100" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />

          {/* Name plate at bottom */}
          <rect x="60" y="182" width="80" height="14" rx="3" fill={accentColor} opacity="0.15" />
          <text x="100" y="192" textAnchor="middle" fill={accentColor} fontSize="8" fontWeight="700" letterSpacing="1">
            RAY JOURNEY
          </text>
        </svg>
      </div>

      {/* Name + title */}
      {size !== 'sm' && (
        <div className="host-identity">
          <span className="host-name" style={{ color: accentColor }}>Ray Journey</span>
          <span className="host-title">Grand Platform Contest Host</span>
        </div>
      )}

      {/* Script display */}
      {size !== 'sm' && (
        <div className="script-display">
          {displayText ? (
            <p className="script-text">
              {displayText}
              {speaking && <span className="cursor-blink">|</span>}
            </p>
          ) : (
            <p className="script-placeholder">
              {isLive ? 'Awaiting cue…' : 'Select a script to queue Ray Journey'}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      {size !== 'sm' && (
        <div className="host-controls">
          <button
            className="ctrl-btn"
            onClick={onMuteToggle}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <div className="emotion-indicator" style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}44` }}>
            <span style={{ color: accentColor, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {currentEmotion}
            </span>
          </div>
          {speaking && (
            <div className="speaking-indicator">
              <span className="speaking-bar" style={{ background: accentColor }} />
              <span className="speaking-bar" style={{ background: accentColor, animationDelay: '0.15s' }} />
              <span className="speaking-bar" style={{ background: accentColor, animationDelay: '0.3s' }} />
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .ray-host {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .live-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          display: flex;
          align-items: center;
          gap: 5px;
          background: #1a0a0a;
          border: 1px solid #ff3030;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 800;
          color: #ff3030;
          letter-spacing: 0.1em;
          z-index: 10;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff3030;
          transition: opacity 0.5s;
        }
        .dot-on { opacity: 1; }
        .dot-off { opacity: 0.2; }

        .avatar-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-glow-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--accent), transparent, var(--accent));
          opacity: 0.4;
          animation: spin-glow 4s linear infinite;
        }

        @keyframes spin-glow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .host-svg {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 0 12px var(--accent, rgba(0,229,255,0.3)));
          transition: filter 0.3s;
          border-radius: 50%;
          overflow: hidden;
        }

        .svg-speaking {
          filter: drop-shadow(0 0 20px var(--accent, rgba(0,229,255,0.5)));
        }

        .host-identity {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .host-name {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .host-title {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .script-display {
          width: 100%;
          min-height: 64px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 14px 16px;
          box-sizing: border-box;
        }

        .script-text {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.85);
          margin: 0;
          font-style: italic;
        }

        .script-placeholder {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          margin: 0;
          text-align: center;
          padding: 8px 0;
        }

        .cursor-blink {
          animation: blink 0.7s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .host-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .ctrl-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .ctrl-btn:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        .emotion-indicator {
          padding: 5px 12px;
          border-radius: 20px;
        }

        .speaking-indicator {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-left: auto;
        }

        .speaking-bar {
          width: 3px;
          height: 16px;
          border-radius: 2px;
          animation: audio-bar 0.5s ease-in-out infinite alternate;
        }

        @keyframes audio-bar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default RayJourneyHost;
