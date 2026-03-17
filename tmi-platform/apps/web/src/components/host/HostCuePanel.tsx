/**
 * HostCuePanel.tsx
 * TMI Grand Platform Contest — Ray Journey Host Cue Panel
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/components/host/HostCuePanel.tsx
 * Dependencies: RayJourneyHost, RayJourneyAvatarSpec
 * Wiring: Admin/host dashboard only — require role 'admin' or 'host'
 *         Connect to /api/contest/host/cue for live triggering
 */

'use client';

import { useState } from 'react';
import { Play, Mic, Trophy, Star, Users, Zap, Volume2, ChevronRight } from 'lucide-react';
import { RAY_SCRIPT_TEMPLATES, type RayScriptType } from './RayJourneyAvatarSpec';

interface CuePanelProps {
  contestantName?: string;
  sponsorNames?: string[];
  category?: string;
  roundName?: string;
  seasonNumber?: number;
  onTriggerCue?: (scriptType: RayScriptType, resolvedText: string) => Promise<void>;
}

const CUE_CATEGORIES: Array<{
  id: RayScriptType;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  { id: 'season_open', label: 'Season Open', icon: <Zap size={14} />, color: '#ff6b1a' },
  { id: 'contestant_intro', label: 'Contestant Intro', icon: <Mic size={14} />, color: '#00e5ff' },
  { id: 'sponsor_shoutout', label: 'Sponsor Shoutout', icon: <Star size={14} />, color: '#ffd700' },
  { id: 'prize_reveal', label: 'Prize Reveal', icon: <Trophy size={14} />, color: '#ff00ff' },
  { id: 'round_transition', label: 'Round Transition', icon: <ChevronRight size={14} />, color: '#00ff88' },
  { id: 'winner_announce', label: 'Winner Announce', icon: <Trophy size={14} />, color: '#ffd700' },
  { id: 'crowd_hype', label: 'Crowd Hype', icon: <Users size={14} />, color: '#ff6b1a' },
  { id: 'season_close', label: 'Season Close', icon: <Volume2 size={14} />, color: '#00e5ff' },
];

function resolveTemplate(
  template: string,
  vars: Record<string, string | undefined>,
): string {
  let result = template;
  Object.entries(vars).forEach(([key, val]) => {
    if (val) result = result.replace(new RegExp(`{{${key}}}`, 'g'), val);
  });
  return result;
}

export function HostCuePanel({
  contestantName,
  sponsorNames = [],
  category,
  roundName,
  seasonNumber = 1,
  onTriggerCue,
}: CuePanelProps) {
  const [selectedType, setSelectedType] = useState<RayScriptType>('contestant_intro');
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [triggering, setTriggering] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  const templateVars: Record<string, string | undefined> = {
    artistName: contestantName,
    sponsorName: sponsorNames[0],
    titleSponsor: sponsorNames[0],
    category: category,
    roundName: roundName,
    seasonNumber: String(seasonNumber),
    hometown: undefined, // fill from entry data
  };

  const templates = RAY_SCRIPT_TEMPLATES[selectedType] || [];
  const rawTemplate = templates[selectedVariant] || templates[0] || '';
  const resolvedText = resolveTemplate(rawTemplate, templateVars);

  const handleTrigger = async () => {
    if (!resolvedText || triggering) return;
    setTriggering(true);
    try {
      await onTriggerCue?.(selectedType, resolvedText);
      setLastTriggered(selectedType);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="cue-panel">
      <div className="panel-header">
        <h3 className="panel-title">Ray Journey — Host Cue Panel</h3>
        <div className="live-chip">
          <span className="live-dot" />
          LIVE CONTROL
        </div>
      </div>

      {/* Cue type selector */}
      <div className="cue-types">
        {CUE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`cue-type-btn ${selectedType === cat.id ? 'cue-type-active' : ''}`}
            style={{ '--cue-color': cat.color } as React.CSSProperties}
            onClick={() => { setSelectedType(cat.id); setSelectedVariant(0); }}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Script variants */}
      {templates.length > 1 && (
        <div className="variant-row">
          <span className="variant-label">Variant:</span>
          {templates.map((_, i) => (
            <button
              key={i}
              className={`variant-btn ${selectedVariant === i ? 'variant-active' : ''}`}
              onClick={() => setSelectedVariant(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Script preview */}
      <div className="script-preview">
        <span className="preview-label">SCRIPT PREVIEW</span>
        <p className="preview-text">{resolvedText}</p>
      </div>

      {/* Template variables status */}
      <div className="vars-status">
        {Object.entries(templateVars).map(([key, val]) =>
          rawTemplate.includes(`{{${key}}}`) ? (
            <span key={key} className={`var-chip ${val ? 'var-filled' : 'var-missing'}`}>
              {key}: {val || '⚠ missing'}
            </span>
          ) : null
        )}
      </div>

      {/* Trigger button */}
      <button
        className={`trigger-btn ${triggering ? 'triggering' : ''}`}
        onClick={handleTrigger}
        disabled={triggering}
      >
        <Play size={18} />
        {triggering ? 'Triggering…' : 'TRIGGER CUE'}
      </button>

      {lastTriggered && (
        <p className="last-triggered">Last triggered: {lastTriggered.replace(/_/g, ' ')}</p>
      )}

      <style jsx>{`
        .cue-panel {
          background: #0a0d14;
          border: 1px solid rgba(255, 107, 26, 0.25);
          border-radius: 12px;
          padding: 24px;
          color: #fff;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .panel-title {
          font-size: 16px;
          font-weight: 700;
          color: #ff6b1a;
          margin: 0;
        }

        .live-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #ff3030;
          border: 1px solid rgba(255, 48, 48, 0.3);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff3030;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .cue-types {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
          margin-bottom: 16px;
        }

        .cue-type-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .cue-type-active {
          background: rgba(var(--cue-color), 0.08);
          border-color: var(--cue-color);
          color: var(--cue-color);
        }

        .variant-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .variant-label {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }

        .variant-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .variant-active {
          border-color: #ff6b1a;
          color: #ff6b1a;
          background: rgba(255, 107, 26, 0.1);
        }

        .script-preview {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .preview-label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.25);
          margin-bottom: 10px;
        }

        .preview-text {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.85);
          margin: 0;
          font-style: italic;
        }

        .vars-status {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
          min-height: 24px;
        }

        .var-chip {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .var-filled {
          background: rgba(0, 200, 83, 0.1);
          border: 1px solid rgba(0, 200, 83, 0.3);
          color: #00c853;
        }

        .var-missing {
          background: rgba(255, 48, 48, 0.1);
          border: 1px solid rgba(255, 48, 48, 0.3);
          color: #ff5252;
        }

        .trigger-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          background: linear-gradient(135deg, #ff6b1a, #ff8c42);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .trigger-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 107, 26, 0.5);
        }

        .trigger-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .triggering {
          background: linear-gradient(135deg, #ffd700, #ffaa00) !important;
        }

        .last-triggered {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          text-align: center;
          margin: 12px 0 0;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}

export default HostCuePanel;
