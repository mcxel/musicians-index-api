/**
 * ReleasePartyDirectorEngine — director for release parties and album premieres.
 *
 * Manages countdown, song previews, album art fade, crowd rotation, sponsor moments.
 * Auto-triggered, no manual intervention needed.
 */

export type ReleaseEventPhase =
  | 'pre-countdown'  // waiting for start time
  | 'countdown'      // 5-4-3-2-1 overlay
  | 'intro'          // opening splash with album art
  | 'performing'     // main performance (director cycles camera)
  | 'intermission'   // between songs (album art, stats, sponsor)
  | 'closing'        // thank you screen, links, merch
  | 'archived';      // event ended, clip available

export type CameraMode = 'album-art' | 'performer' | 'crowd' | 'album-wide';

export interface ReleasePartyConfig {
  eventId: string;
  title: string;
  artistName: string;
  releaseName: string;        // album/EP/single title
  releaseArtUrl: string;       // album cover
  genre: string;
  startsAt: number;            // unix timestamp
  durationMinutes: number;
  songCount: number;
  performerCount: 1 | 2 | 3;  // solo artist, duo, or group
  hasSponsors: boolean;
}

export interface ReleasePartyState {
  phase: ReleaseEventPhase;
  elapsedMs: number;
  currentSongIndex: number;
  countdownRemainingSec?: number;
}

// ─── Phase timings ──────────────────────────────────────────────────────────

const PHASE_DURATIONS = {
  'countdown':    5000,   // 5 second visual countdown
  'intro':        8000,   // opening splash
  'song-avg':     240000, // ~4 minutes per song (estimate)
  'intermission': 20000,  // between songs
  'closing':      10000,  // thank you + links
} as const;

// ─── Camera rotation during performing phase ────────────────────────────────

function getPerformingCameraSequence(): CameraMode[] {
  return [
    'album-wide',  // wide shot: performer + album art in corner
    'performer',   // tight on performer
    'crowd',       // audience reaction
    'album-art',   // full album art (audio-only moment)
    'performer',   // back to performer
    'crowd',       // one more crowd moment
  ];
}

// ─── Current phase based on elapsed time ────────────────────────────────────

export function getCurrentPhase(config: ReleasePartyConfig, elapsedMs: number): ReleasePartyState {
  const startTimeMs = config.startsAt * 1000;
  const nowMs = Date.now();
  const timeUntilStartMs = startTimeMs - nowMs;

  // Event hasn't started yet
  if (timeUntilStartMs > 0) {
    const countdownRemainingSec = Math.ceil(timeUntilStartMs / 1000);
    return {
      phase: 'pre-countdown',
      elapsedMs: 0,
      currentSongIndex: 0,
      countdownRemainingSec: Math.min(countdownRemainingSec, 60), // max 60s display
    };
  }

  const totalDurationMs = config.durationMinutes * 60 * 1000;

  // Event has ended
  if (elapsedMs > totalDurationMs) {
    return {
      phase: 'archived',
      elapsedMs,
      currentSongIndex: config.songCount - 1,
    };
  }

  let accumulated = 0;

  // Countdown phase
  if (elapsedMs < PHASE_DURATIONS.countdown) {
    return {
      phase: 'countdown',
      elapsedMs,
      currentSongIndex: 0,
      countdownRemainingSec: Math.ceil((PHASE_DURATIONS.countdown - elapsedMs) / 1000),
    };
  }
  accumulated += PHASE_DURATIONS.countdown;

  // Intro phase
  if (elapsedMs < accumulated + PHASE_DURATIONS.intro) {
    return {
      phase: 'intro',
      elapsedMs,
      currentSongIndex: 0,
    };
  }
  accumulated += PHASE_DURATIONS.intro;

  // Performing + intermissions
  const avgSongDurationMs = PHASE_DURATIONS['song-avg'];
  const performingAndIntermissionsMs = totalDurationMs - accumulated - PHASE_DURATIONS.closing;
  const cycleTimeMs = avgSongDurationMs + PHASE_DURATIONS.intermission;
  const cyclePosition = (elapsedMs - accumulated) % cycleTimeMs;
  const songIndex = Math.floor((elapsedMs - accumulated) / cycleTimeMs);

  if (cyclePosition < avgSongDurationMs) {
    return {
      phase: 'performing',
      elapsedMs,
      currentSongIndex: Math.min(songIndex, config.songCount - 1),
    };
  } else {
    return {
      phase: 'intermission',
      elapsedMs,
      currentSongIndex: Math.min(songIndex, config.songCount - 1),
    };
  }
}

/**
 * Returns the camera mode for the current moment during a performing phase.
 */
export function getPerformingCameraMode(elapsedInSongMs: number): CameraMode {
  const sequence = getPerformingCameraSequence();
  const shotDurations = [6000, 5000, 4000, 8000, 5000, 4000]; // ms per shot
  const cycleLength = shotDurations.reduce((a, b) => a + b, 0);

  const cyclePosition = elapsedInSongMs % cycleLength;
  let accumulated = 0;

  for (let i = 0; i < sequence.length; i++) {
    if (cyclePosition < accumulated + shotDurations[i]!) {
      return sequence[i]!;
    }
    accumulated += shotDurations[i]!;
  }

  return 'performer'; // fallback
}

/**
 * Returns overlay content for intermission moments (sponsor, stats, next song).
 */
export function getIntermissionContent(
  config: ReleasePartyConfig,
  state: ReleasePartyState,
): {
  type: 'sponsor' | 'stats' | 'next-song' | 'artist-promo';
  title: string;
  subtitle?: string;
} {
  const nextSongIdx = state.currentSongIndex + 1;
  const showSponsors = config.hasSponsors && state.currentSongIndex % 2 === 0;

  if (showSponsors) {
    return {
      type: 'sponsor',
      title: 'Thank you to our sponsor',
      subtitle: 'Check them out',
    };
  }

  if (nextSongIdx < config.songCount) {
    return {
      type: 'next-song',
      title: `Up Next — Song ${nextSongIdx + 1} of ${config.songCount}`,
      subtitle: config.releaseName,
    };
  }

  return {
    type: 'artist-promo',
    title: `Stream ${config.releaseName}`,
    subtitle: `Out now on all platforms`,
  };
}

/**
 * Countdown display (for pre-show).
 */
export function getCountdownDisplay(remainingSec: number): string {
  if (remainingSec > 0) {
    return String(remainingSec);
  }
  return '🎉';
}

/**
 * Returns animation config for transition into release party.
 */
export function getIntroAnimation(): {
  albumArtScale: number;
  titleOpacity: number;
  artistOpacity: number;
  releaseNameOpacity: number;
} {
  // Animate in: album art zooms from 0.8 → 1, text fades in
  return {
    albumArtScale: 1,
    titleOpacity: 1,
    artistOpacity: 1,
    releaseNameOpacity: 1,
  };
}

/**
 * Closing screen data — thank you + links.
 */
export function getClosingScreen(config: ReleasePartyConfig): {
  headline: string;
  links: Array<{ label: string; href: string }>;
} {
  return {
    headline: `Thank you for listening to ${config.releaseName}`,
    links: [
      { label: '🎵 Stream Now', href: 'https://open.spotify.com' },
      { label: '💬 Join Discord', href: 'https://discord.gg/tmi' },
      { label: '👤 Follow Artist', href: `/performers/${config.artistName}` },
      { label: '🎫 Book Artist', href: `/booking/${config.artistName}` },
    ],
  };
}

/**
 * Preset: instant release party (just released, no scheduling).
 */
export function createInstantReleaseParty(config: Omit<ReleasePartyConfig, 'startsAt'>): ReleasePartyConfig {
  return {
    ...config,
    startsAt: Math.floor(Date.now() / 1000), // start now
  };
}

/**
 * Preset: scheduled release party (future event).
 */
export function createScheduledReleaseParty(
  config: Omit<ReleasePartyConfig, 'startsAt'>,
  startsAtUnix: number,
): ReleasePartyConfig {
  return {
    ...config,
    startsAt: startsAtUnix,
  };
}
