'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  CANONICAL_EXPERIENCES,
  type ExperienceCategory,
  type ExperienceDef,
} from '@/lib/rooms/canonicalExperiences';

interface MediaLockerItem {
  id: string;
  title: string;
  audioUrl?: string;
  videoUrl?: string;
  genre?: string;
  duration?: number;
  coverUrl?: string;
  thumbnailUrl?: string;
}

export default function CreateRoomPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ExperienceCategory>('ALL');
  const [selectedExpId, setSelectedExpId] = useState<string>('regular-go-live');
  const [title, setTitle] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<string | null>(null);

  // Scheduled event fields
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState<string>('20:00');
  const [timezone, setTimezone] = useState<string>('America/New_York');
  const [ticketRequested, setTicketRequested] = useState<boolean>(false);
  const [ticketPrice, setTicketPrice] = useState<string>('2.99');

  // Media selection for Release & Premiere
  const [mediaItems, setMediaItems] = useState<MediaLockerItem[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');
  const [loadingMedia, setLoadingMedia] = useState<boolean>(false);

  const selectedExp = CANONICAL_EXPERIENCES.find((e) => e.id === selectedExpId) ?? CANONICAL_EXPERIENCES[0];

  const isReleaseOrPremiere = selectedExp.type === 'RELEASE' || selectedExp.type === 'PREMIERE';

  // Load media from Media Locker when Release or Premiere is selected
  useEffect(() => {
    if (!isReleaseOrPremiere) {
      setMediaItems([]);
      setSelectedMediaId('');
      return;
    }

    let cancelled = false;
    const mediaType = selectedExp.type === 'PREMIERE' ? 'videos' : 'songs';
    setLoadingMedia(true);

    fetch(`/api/media/locker?type=${mediaType}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.items && Array.isArray(data.items)) {
          setMediaItems(data.items);
          if (data.items.length > 0 && !selectedMediaId) {
            setSelectedMediaId(data.items[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingMedia(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedExp.type, isReleaseOrPremiere]);

  const filteredExperiences =
    selectedCategory === 'ALL'
      ? CANONICAL_EXPERIENCES
      : CANONICAL_EXPERIENCES.filter((e) => e.category === selectedCategory);

  async function handleLaunch() {
    if (!title.trim()) {
      setErrorMessage('Please enter an event or room title.');
      return;
    }

    // Media requirement enforcement for Release & Premiere
    if (isReleaseOrPremiere && !selectedMediaId) {
      setErrorMessage('Please select an authorized media asset from your Media Locker for this release/premiere.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setUpgradePrompt(null);

    // If Regular Go Live, route to canonical Go Live entry
    if (selectedExp.id === 'regular-go-live') {
      router.push('/hub/performer?golive=1');
      return;
    }

    // World Scheduled Events (Concert, Release, Premiere): call canonical POST /api/events/shows-releases
    if (selectedExp.isScheduled) {
      try {
        const scheduledStartIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
        const priceNum = ticketRequested ? parseFloat(ticketPrice) || 2.99 : null;

        const kind =
          selectedExp.type === 'CONCERT'
            ? 'LIVE_ONLINE_CONCERT'
            : selectedExp.type === 'PREMIERE'
            ? 'WORLD_PREMIERE'
            : 'WORLD_RELEASE';

        const res = await fetch('/api/events/shows-releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            kind,
            title: title.trim(),
            scheduledStartIso,
            timezone,
            ticketRequested,
            requestedPriceUsd: priceNum,
            mediaId: isReleaseOrPremiere ? selectedMediaId : undefined,
            mediaType: selectedExp.type === 'PREMIERE' ? 'video' : 'song',
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          setErrorMessage('Sign in required. Please sign in to schedule an event.');
          return;
        }

        if (res.status === 403) {
          setErrorMessage(data.message || data.error || 'Permission denied. Performer Gold or higher required to schedule global events.');
          return;
        }

        if (!res.ok || !data.ok) {
          setErrorMessage(data.message || data.error || 'Failed to schedule event.');
          return;
        }

        // Navigate to exact joinHref
        const dest = data.event?.joinHref || (selectedExp.type === 'PREMIERE' ? `/rooms/world-premiere?roomId=${encodeURIComponent(data.event.roomId)}&eventId=${encodeURIComponent(data.event.eventId)}` : `/rooms/release/${encodeURIComponent(data.event.roomId)}?eventId=${encodeURIComponent(data.event.eventId)}&scope=world`);
        router.push(dest);
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Network error while scheduling event.');
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // Mini Releases & Premieres: Call POST /api/events/shows-releases with isMini: true
    if (isReleaseOrPremiere && selectedExp.scope === 'mini') {
      try {
        const kind = selectedExp.type === 'PREMIERE' ? 'MINI_PREMIERE' : 'MINI_RELEASE';
        const res = await fetch('/api/events/shows-releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            kind,
            title: title.trim(),
            mediaId: selectedMediaId,
            mediaType: selectedExp.type === 'PREMIERE' ? 'video' : 'song',
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          setErrorMessage('Sign in required. Please sign in to start a release.');
          return;
        }

        if (res.status === 403) {
          setErrorMessage(data.message || data.error || 'Permission denied.');
          return;
        }

        if (!res.ok || !data.ok) {
          setErrorMessage(data.message || data.error || 'Failed to start release.');
          return;
        }

        const dest = data.liveRoomUrl || data.event?.joinHref || `/rooms/release/${encodeURIComponent(data.event.roomId)}?scope=mini`;
        router.push(dest);
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Network error while starting release.');
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // On-Demand Experiences (Mini Concert, Battles, Challenges, Social): Call canonical POST /api/rooms
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: title.trim(),
          type: selectedExp.type,
          format: selectedExp.format,
          metadata: {
            scope: selectedExp.scope ?? 'mini',
            isGame: selectedExp.category === 'GAMES',
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setErrorMessage('Sign in required. Please sign in to launch a live room.');
        return;
      }

      if (res.status === 403) {
        if (data.code === 'ENTITLEMENT_DENIED') {
          setUpgradePrompt(data.error || 'Room creation requires SILVER or higher subscription.');
        } else {
          setErrorMessage(data.error || 'Access denied.');
        }
        return;
      }

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || 'Failed to create room.');
        return;
      }

      if (data.href) {
        router.push(data.href);
      } else if (data.roomId) {
        router.push(`/live/rooms/${encodeURIComponent(data.roomId)}?from=live-lobby`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error while creating room.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050510',
        color: '#fff',
        padding: '24px 16px 80px',
        boxSizing: 'border-box',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Link
            href="/live/rooms"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ← Back to Rooms
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>/</span>
          <span style={{ color: '#00FFFF', fontSize: 12, fontWeight: 800 }}>Create Room</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 900,
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              Create Live Experience
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(12px, 2vw, 14px)',
                color: 'rgba(255,255,255,0.65)',
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              Launch an on-demand live stage or schedule a marquee event. Battles, Cyphers, and Lounges require Silver or higher.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href="/hub/performer"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              PERFORMER HUB
            </Link>
            <Link
              href="/settings/subscription"
              style={{
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.3)',
                color: '#FFD700',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              VIEW TIERS
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 20,
          scrollbarWidth: 'none',
        }}
      >
        {(
          [
            { key: 'ALL', label: 'ALL EXPERIENCES' },
            { key: 'BROADCAST', label: 'STAGE' },
            { key: 'COMPETITION', label: 'COMPETITION' },
            { key: 'SOCIAL', label: 'SOCIAL & LOUNGE' },
            { key: 'SHOWS_RELEASES', label: 'SHOWS & RELEASES' },
            { key: 'GAMES', label: 'GAMES' },
          ] as const
        ).map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            style={{
              background:
                selectedCategory === cat.key
                  ? 'rgba(0,255,255,0.15)'
                  : 'rgba(255,255,255,0.04)',
              border:
                selectedCategory === cat.key
                  ? '1px solid #00FFFF'
                  : '1px solid rgba(255,255,255,0.1)',
              color: selectedCategory === cat.key ? '#00FFFF' : 'rgba(255,255,255,0.7)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Experience Selection Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        {filteredExperiences.map((exp) => {
          const isSelected = selectedExpId === exp.id;
          return (
            <div
              key={exp.id}
              data-testid={`room-card-${exp.id}`}
              onClick={() => setSelectedExpId(exp.id)}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, rgba(12,18,36,0.95), rgba(20,28,52,0.95))`
                  : 'rgba(255,255,255,0.02)',
                border: isSelected ? `1.5px solid ${exp.accent}` : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 0 20px ${exp.accent}33` : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      color: exp.badgeColor,
                      background: `${exp.badgeColor}18`,
                      border: `1px solid ${exp.badgeColor}44`,
                      borderRadius: 4,
                      padding: '2px 6px',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {exp.badge}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: 12, color: exp.accent, fontWeight: 900 }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                  {exp.name}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                  {exp.desc}
                </div>
              </div>

              {exp.requiresSilver && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#FFD700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>★</span>
                  <span>Rule 38: Silver or higher</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Configuration Form */}
      <div
        style={{
          background: 'rgba(10,14,28,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '20px 24px',
        }}
      >
        <div
          style={{
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: selectedExp.accent, letterSpacing: '0.1em' }}>
              TARGET EXPERIENCE SELECTED
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 2 }}>
              {selectedExp.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
              {selectedExp.desc}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                color: selectedExp.requiresSilver ? '#FFD700' : selectedExp.isScheduled ? '#00FFFF' : '#00FF88',
                background: selectedExp.requiresSilver ? 'rgba(255,215,0,0.1)' : selectedExp.isScheduled ? 'rgba(0,255,255,0.1)' : 'rgba(0,255,136,0.1)',
                border: `1px solid ${selectedExp.requiresSilver ? '#FFD700' : selectedExp.isScheduled ? '#00FFFF' : '#00FF88'}44`,
                padding: '4px 10px',
                borderRadius: 20,
              }}
            >
              {selectedExp.requiresSilver
                ? 'RULE 38: SILVER+ PERMITTED'
                : selectedExp.isScheduled
                ? 'WORLD: SCHEDULED EVENT'
                : 'MINI: ON-DEMAND ACCESS'}
            </span>
          </div>
        </div>

        {/* Error / Upgrade Alerts */}
        {errorMessage && (
          <div
            data-testid="creation-error-banner"
            style={{
              background: 'rgba(255,45,45,0.12)',
              border: '1px solid #FF2D2D',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#FF8A8A',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {errorMessage}
          </div>
        )}

        {upgradePrompt && (
          <div
            data-testid="upgrade-prompt-banner"
            style={{
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid #FFD700',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#FFD700',
              fontSize: 12,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{upgradePrompt}</span>
            <Link
              href="/settings/subscription"
              style={{
                background: '#FFD700',
                color: '#050510',
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 900,
                textDecoration: 'none',
              }}
            >
              UPGRADE TO SILVER →
            </Link>
          </div>
        )}

        {/* Title Input */}
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="room-title-input"
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 800,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 6,
              letterSpacing: '0.04em',
            }}
          >
            EVENT / ROOM TITLE
          </label>
          <input
            id="room-title-input"
            data-testid="room-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. ${selectedExp.name} — Live from Studio A`}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {/* Media Selection for Release & Premiere */}
        {isReleaseOrPremiere && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 8,
              background: 'rgba(255,140,0,0.06)',
              border: '1px solid rgba(255,140,0,0.25)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: '#FF8C00', marginBottom: 6, letterSpacing: '0.06em' }}>
              SELECT AUTHORIZED MEDIA FROM YOUR MEDIA LOCKER
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>
              {selectedExp.type === 'PREMIERE'
                ? 'Select a video from your Media Locker for this Premiere screening.'
                : 'Select an audio track from your Media Locker for this Release party.'}
            </p>

            {loadingMedia ? (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Loading your Media Locker items…</div>
            ) : mediaItems.length === 0 ? (
              <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px dashed rgba(255,255,255,0.15)' }}>
                <p style={{ fontSize: 11, color: '#FFD700', margin: '0 0 6px' }}>
                  No {selectedExp.type === 'PREMIERE' ? 'videos' : 'songs'} found in your Media Locker.
                </p>
                <Link
                  href="/hub/performer"
                  style={{ color: '#00FFFF', fontSize: 11, fontWeight: 800, textDecoration: 'none' }}
                >
                  Go to Performer Hub to upload media →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {mediaItems.map((item) => (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      background: selectedMediaId === item.id ? 'rgba(255,140,0,0.15)' : 'rgba(255,255,255,0.03)',
                      border: selectedMediaId === item.id ? '1px solid #FF8C00' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="media-locker-selection"
                      checked={selectedMediaId === item.id}
                      onChange={() => setSelectedMediaId(item.id)}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                        {item.genre ?? 'Uncategorized'} {item.duration ? `· ${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : ''}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Configuration for World Events */}
        {selectedExp.isScheduled && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 8,
              background: 'rgba(0,255,255,0.04)',
              border: '1px solid rgba(0,255,255,0.2)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: '#00FFFF', marginBottom: 12, letterSpacing: '0.06em' }}>
              SCHEDULE & GLOBAL BROADCAST SETTINGS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  EVENT DATE
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  START TIME
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  CANONICAL TIMEZONE
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(10,14,28,0.95)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC (Universal)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                </select>
              </div>
            </div>

            {/* Ticket Admission Settings */}
            <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <input
                  id="ticket-checkbox"
                  type="checkbox"
                  checked={ticketRequested}
                  onChange={(e) => setTicketRequested(e.target.checked)}
                />
                <label htmlFor="ticket-checkbox" style={{ fontSize: 12, fontWeight: 800, color: '#fff', cursor: 'pointer' }}>
                  Enable Ticket Admission (Paid Concert / Event)
                </label>
              </div>

              {ticketRequested && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    Standard Ticket Price (USD):
                  </label>
                  <input
                    type="number"
                    min="0.99"
                    max="499.99"
                    step="0.50"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    style={{
                      width: 90,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 4,
                      padding: '6px 10px',
                      color: '#00FF88',
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                    Recommended: $1.99 – $9.99 (Policy floor: $0.99)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Launch Action Button */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            data-testid="launch-room-btn"
            onClick={handleLaunch}
            disabled={submitting}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #00FFFF, #FF2DAA)',
              border: 'none',
              borderRadius: 8,
              padding: '14px 28px',
              color: '#050510',
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '0.08em',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'opacity 0.2s',
              boxShadow: '0 4px 20px rgba(0,255,255,0.3)',
            }}
          >
            {submitting
              ? 'LAUNCHING EXPERIENCE...'
              : selectedExp.isScheduled
              ? `SCHEDULE ${selectedExp.name.toUpperCase()} →`
              : `START ${selectedExp.name.toUpperCase()} NOW →`}
          </button>
        </div>
      </div>
    </main>
  );
}
