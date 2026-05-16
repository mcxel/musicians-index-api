'use client';
import { ImageSlotWrapper } from '@/components/visual-enforcement';
// CountdownCard.tsx — Live countdown — numbers MUST animate (NUMBER_MOVEMENT_SYSTEM)
// Copilot wires: useCountdown(targetDate, onExpire)
// Color shifts: <30s = gold warning, <10s = red critical
// Proof: timer ticks, color shifts, onExpire fires at T=0
export interface CountdownCardProps {
  targetDate: Date;
  title: string;
  subtitle?: string;
  albumArtUrl?: string;
  onExpire?: () => void;
  variant?: 'premiere'|'event'|'battle'|'cypher'|'sponsor';
}
export function CountdownCard({ targetDate, title, subtitle, albumArtUrl, variant = 'premiere' }: CountdownCardProps) {
  return (
    <div className={`tmi-countdown-card tmi-countdown-card--${variant}`}>
      {albumArtUrl && (
        <ImageSlotWrapper
          imageId="countdown-card-art"
          roomId="lobby-countdown"
          priority="normal"
          fallbackUrl={albumArtUrl}
          altText="Countdown artwork"
          className="tmi-countdown-card__art"
        />
      )}
      <div className="tmi-countdown-card__content">
        <div className="tmi-countdown-card__label">
          {variant === 'premiere' ? 'World Premiere' : 'Event Starts'}
        </div>
        <div className="tmi-countdown-card__title">{title}</div>
        {subtitle && <div className="tmi-countdown-card__subtitle">{subtitle}</div>}
        <div className="tmi-countdown-card__digits" data-slot="countdown">
          {/* Copilot wires animated countdown — HH:MM:SS format */}
          <span className="tmi-countdown-num" data-unit="hours">00</span>
          <span className="tmi-countdown-sep">:</span>
          <span className="tmi-countdown-num" data-unit="minutes">00</span>
          <span className="tmi-countdown-sep">:</span>
          <span className="tmi-countdown-num" data-unit="seconds">00</span>
        </div>
      </div>
    </div>
  );
}
