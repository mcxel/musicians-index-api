/**
 * SeasonCountdownPanel.tsx
 * TMI Grand Platform Contest — Season Deadline Countdown
 * BerntoutGlobal XXL
 *
 * Repo path: apps/web/src/components/contest/SeasonCountdownPanel.tsx
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface SeasonCountdownPanelProps {
  seasonName: string;
  deadline: Date;
  phase: 'registration' | 'sponsor_collection' | 'regionals' | 'semi_finals' | 'finals';
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(deadline: Date): TimeLeft {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const PHASE_LABELS: Record<string, string> = {
  registration: 'Registration closes in',
  sponsor_collection: 'Sponsor deadline in',
  regionals: 'Regionals start in',
  semi_finals: 'Semi-finals start in',
  finals: 'Grand Finals in',
};

const CONTEST_OPEN_DATE_LABEL = 'August 8';

export function SeasonCountdownPanel({
  seasonName,
  deadline,
  phase,
  compact = false,
}: SeasonCountdownPanelProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(computeTimeLeft(deadline));
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const tl = computeTimeLeft(deadline);
      setTimeLeft(tl);
      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        setExpired(true);
        clearInterval(iv);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [deadline]);

  if (compact) {
    return (
      <div className="countdown-compact">
        <Clock size={12} />
        <span className="compact-phase">{PHASE_LABELS[phase]}:</span>
        <span className="compact-time">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </span>
        <span className="compact-open-date">Opens {CONTEST_OPEN_DATE_LABEL}</span>
        <style jsx>{`
          .countdown-compact {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #ffd700;
            background: rgba(255, 215, 0, 0.08);
            border: 1px solid rgba(255, 215, 0, 0.2);
            padding: 5px 12px;
            border-radius: 20px;
          }
          .compact-phase { color: rgba(255,255,255,0.5); }
          .compact-time { font-weight: 700; }
          .compact-open-date {
            color: rgba(255,255,255,0.45);
            margin-left: 2px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="countdown-panel">
      <div className="countdown-header">
        <Calendar size={16} className="cal-icon" />
        <div>
          <p className="countdown-phase">{PHASE_LABELS[phase]}</p>
          <p className="countdown-season">{seasonName}</p>
          <p className="countdown-open-date">Contest opens {CONTEST_OPEN_DATE_LABEL}</p>
        </div>
      </div>

      {expired ? (
        <p className="expired-text">This phase has ended</p>
      ) : (
        <div className="time-blocks">
          {[
            { label: 'DAYS', value: timeLeft.days },
            { label: 'HRS', value: timeLeft.hours },
            { label: 'MIN', value: timeLeft.minutes },
            { label: 'SEC', value: timeLeft.seconds },
          ].map((unit, i) => (
            <div key={unit.label} className="time-block">
              <span className="time-value">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="time-label">{unit.label}</span>
              {i < 3 && <span className="separator">:</span>}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .countdown-panel {
          background: linear-gradient(135deg, #0d1117, #0a0f1a);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 20px 24px;
          color: #fff;
        }

        .countdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .cal-icon { color: #ffd700; flex-shrink: 0; }

        .countdown-phase {
          font-size: 12px;
          color: #ffd700;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }

        .countdown-season {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        .countdown-open-date {
          font-size: 11px;
          color: rgba(255, 215, 0, 0.7);
          margin: 2px 0 0;
        }

        .time-blocks {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .time-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .time-value {
          font-size: 36px;
          font-weight: 900;
          color: #ffd700;
          line-height: 1;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }

        .time-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.3);
          margin-top: 4px;
        }

        .separator {
          font-size: 28px;
          font-weight: 700;
          color: rgba(255, 215, 0, 0.3);
          margin: 0 4px;
          line-height: 1.1;
          align-self: flex-start;
          padding-top: 2px;
        }

        .expired-text {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default SeasonCountdownPanel;
