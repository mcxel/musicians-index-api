"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { logger } from '@/lib/logger'
import { resolveDurablePlayableSrc } from '@/lib/media/durablePlayableUrl'
import { processSample, type PlaybackSessionState } from '@/lib/music/PlaybackSessionTracker'
import { decideReceiptAttempt } from '@/lib/music/PlaybackReceiptOrchestrator'
import { reportQualifiedPlayEvidence, type PlaybackContext } from '@/lib/music/PlaybackReceiptClient'
import { resolveTrackPlaybackContext, toQueueContext, type QueueContext } from '@/lib/music/QueuePlaybackContext'

export interface AudioTrack {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  artwork?: string
  /**
   * Track-level provenance (owner's queue-provenance correction, 2026-10-29).
   * Distinct from queue-level context (discoverySource/playlistId/stationId/
   * programId), which lives on the ambient QueueContext, not per-track — see
   * QueuePlaybackContext.ts. mediaType defaults to 'SONG' when omitted:
   * AudioProvider only ever plays audio; a canonical video playback
   * authority does not exist yet (separate, explicitly tracked gap).
   */
  mediaType?: 'SONG' | 'VIDEO'
  submissionId?: string
  programEntryId?: string
  queueEntryId?: string
  boostCampaignId?: string
}

export interface AudioPlayOptions {
  loop?: boolean
  muted?: boolean
  startSec?: number
}

export type RepeatMode = 'off' | 'one' | 'all'

interface AudioContextType {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playlist: AudioTrack[]
  /**
   * playbackContext, when given, attaches atomically with this exact play
   * command — never as a separate call afterward (owner correction,
   * 2026-10-29: "prefer play(track, playbackContext)" over two loosely
   * coupled operations, to make Track-A-context-bleeding-into-Track-B
   * structurally impossible rather than merely a caller-discipline convention).
   */
  play: (track?: AudioTrack, opts?: AudioPlayOptions, playbackContext?: PlaybackContext) => Promise<boolean>
  pause: () => void
  stop: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  addToPlaylist: (track: AudioTrack) => void
  removeFromPlaylist: (track: AudioTrack) => void
  clearPlaylist: () => void
  /** Replaces the queue wholesale (e.g. "play this playlist/album") and optionally starts playback. */
  loadQueue: (tracks: AudioTrack[], startIndex?: number, playbackContext?: PlaybackContext) => Promise<boolean>
  reorderPlaylist: (fromIndex: number, toIndex: number) => void
  repeatMode: RepeatMode
  setRepeatMode: (mode: RepeatMode) => void
  /** Cycles OFF -> ALL -> ONE -> OFF. */
  toggleRepeat: () => void
  shuffleMode: boolean
  toggleShuffle: () => void
  /** True while the browser is fetching/decoding and audible playback has not resumed yet. */
  isBuffering: boolean
  /** Human-readable reason the most recent play() attempt failed, if any. Cleared on next successful play. */
  playbackError: string | null
  /** True when the browser blocked the most recent play() attempt as an autoplay policy violation. */
  autoplayRejected: boolean
  /**
   * Canonical player adoption (2026-10-29): attaches real discovery/ownership
   * context for the CURRENTLY PLAYING track's mediaId. Qualification/session
   * tracking runs for every track regardless of this being called — but a
   * receipt is only ever actually reported once real context (mediaId,
   * mediaType, discoverySource) is attached, never fabricated. Callers that
   * know their media's canonical identity when they call play()/loadQueue()
   * should call this immediately after. See PlaybackReceiptClient.ts.
   */
  attachPlaybackContext: (context: PlaybackContext) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) throw new Error('useAudio must be used within an AudioProvider')
  return context
}

interface AudioProviderProps {
  children: ReactNode
}

export default function AudioProvider({ children }: AudioProviderProps) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [playlist, setPlaylist] = useState<AudioTrack[]>([])
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off')
  const [shuffleMode, setShuffleMode] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [autoplayRejected, setAutoplayRejected] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loopRef = useRef(false)
  const [isMounted, setIsMounted] = useState(false)
  // Shuffle order is a permutation of playlist ids, independent of playlist's stored order,
  // so NEXT/PREVIOUS traverse one stable randomized sequence instead of re-randomizing per call.
  const shuffleOrderRef = useRef<string[]>([])
  const repeatModeRef = useRef<RepeatMode>('off')
  repeatModeRef.current = repeatMode

  // Canonical player adoption (2026-10-29): one session tracker, one
  // attempted-sessions set, one attached-context slot — all owned here at
  // the canonical playback authority, never duplicated per presentation
  // surface. See PlaybackSessionTracker.ts / PlaybackReceiptOrchestrator.ts.
  const playbackSessionRef = useRef<PlaybackSessionState | null>(null)
  const attemptedSessionIdsRef = useRef<Set<string>>(new Set())
  const playbackContextRef = useRef<{ mediaId: string; context: PlaybackContext } | null>(null)
  // Queue-level provenance (owner correction, 2026-10-29): the ambient
  // discoverySource/playlistId/stationId/programId for whatever queue is
  // currently loaded — separate from playbackContextRef's per-track slot.
  // Lets a caller that merely selects a different track inside an
  // already-loaded queue (e.g. Mini Player tapping Track B) inherit the
  // queue's real source without reconstructing it. See QueuePlaybackContext.ts.
  const queueContextRef = useRef<QueueContext | null>(null)
  const mintSessionId = useCallback(
    () => `pbs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    [],
  )

  const attachPlaybackContext = useCallback((context: PlaybackContext) => {
    playbackContextRef.current = { mediaId: context.mediaId, context }
  }, [])

  // Same URL + same track id does not reload src (skin/position must not restart).
  const play = useCallback(async (track?: AudioTrack, opts?: AudioPlayOptions, playbackContext?: PlaybackContext): Promise<boolean> => {
    const audio = audioRef.current
    if (!audio) return false

    // Attach atomically with this exact play command, BEFORE any track/audio
    // state changes below — so the session-tracking effect (which reads this
    // ref) can never observe the new track with the previous track's context,
    // or vice versa.
    if (track && playbackContext) {
      if (playbackContext.mediaId !== track.id) {
        logger.warn(`[AudioProvider] attachPlaybackContext mediaId (${playbackContext.mediaId}) does not match the track being played (${track.id}) — ignoring mismatched context.`)
      } else {
        attachPlaybackContext(playbackContext)
        // Explicit context establishes/REPLACES the ambient queue context —
        // "starting a genuinely new playback source replaces the applicable
        // queue/source context" (owner rule). Covers loadQueue's initial
        // track AND a direct play(track, opts, context) call that leaves a
        // previously loaded queue (e.g. a SEARCH play must not leave stale
        // PLAYLIST context behind for whatever's played next).
        queueContextRef.current = toQueueContext(playbackContext)
      }
    } else if (track && !playbackContext) {
      // No explicit context for this track. If it's a member of the
      // currently loaded queue (Mini Player tapping a different track in
      // the same queue, or advance()/next()/previous()/ended() landing on
      // the next queue track), inherit the queue's real, already-established
      // source — the caller is never required to reconstruct provenance.
      // If it's NOT a queue member, or no queue context exists yet,
      // provenance is genuinely unknown: leave it unattached rather than
      // fabricate one (the existing mediaId-mismatch gap-report below
      // already covers that honestly).
      const isQueueMember = playlist.some((t) => t.id === track.id)
      if (isQueueMember) {
        const derived = resolveTrackPlaybackContext(queueContextRef.current, track)
        if (derived) attachPlaybackContext(derived)
      }
    }

    if (opts?.loop != null) {
      loopRef.current = Boolean(opts.loop)
      audio.loop = loopRef.current
    }
    if (opts?.muted != null) {
      audio.muted = opts.muted
      setIsMuted(opts.muted)
    }

    if (track) {
      const playableSrc = resolveDurablePlayableSrc(track.url)
      if (!playableSrc) {
        logger.error('Refusing non-durable audio source (blob: or simulated CDN)')
        setIsPlaying(false)
        return false
      }
      const sameSource = currentTrack?.id === track.id && currentTrack.url === playableSrc
      setCurrentTrack({ ...track, url: playableSrc })
      if (!sameSource) {
        audio.src = playableSrc
        if (opts?.startSec != null && opts.startSec > 0) {
          const start = opts.startSec
          const onMeta = () => {
            audio.currentTime = start
            audio.removeEventListener('loadedmetadata', onMeta)
          }
          audio.addEventListener('loadedmetadata', onMeta)
        }
      }
      try {
        await audio.play()
        setIsPlaying(true)
        setPlaybackError(null)
        setAutoplayRejected(false)
        return true
      } catch (error) {
        logger.error('Failed to play audio:', error)
        setIsPlaying(false)
        setAutoplayRejected(error instanceof DOMException && error.name === 'NotAllowedError')
        setPlaybackError(error instanceof Error ? error.message : 'Playback failed')
        return false
      }
    }

    if (!currentTrack || !resolveDurablePlayableSrc(currentTrack.url)) {
      setIsPlaying(false)
      return false
    }
    try {
      await audio.play()
      setIsPlaying(true)
      setPlaybackError(null)
      setAutoplayRejected(false)
      return true
    } catch (error) {
      logger.error('Failed to play audio:', error)
      setIsPlaying(false)
      setAutoplayRejected(error instanceof DOMException && error.name === 'NotAllowedError')
      setPlaybackError(error instanceof Error ? error.message : 'Playback failed')
      return false
    }
  }, [currentTrack, attachPlaybackContext, playlist])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [])

  const buildShuffleOrder = useCallback((tracks: AudioTrack[], keepFirstId?: string): string[] => {
    const ids = tracks.map((t) => t.id)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = ids[i]!
      ids[i] = ids[j]!
      ids[j] = tmp
    }
    if (keepFirstId) {
      const idx = ids.indexOf(keepFirstId)
      if (idx > 0) {
        const tmp = ids[0]!
        ids[0] = ids[idx]!
        ids[idx] = tmp
      }
    }
    return ids
  }, [])

  const ensureShuffleOrder = useCallback(() => {
    if (shuffleOrderRef.current.length !== playlist.length || playlist.some((t) => !shuffleOrderRef.current.includes(t.id))) {
      shuffleOrderRef.current = buildShuffleOrder(playlist, currentTrack?.id)
    }
    return shuffleOrderRef.current
  }, [playlist, currentTrack, buildShuffleOrder])

  /** Returns false when, on an automatic end-of-queue advance with repeat OFF, there is nowhere left to go. */
  const advance = useCallback((direction: 1 | -1, isAutomatic: boolean): boolean => {
    if (playlist.length === 0 || !currentTrack) return false

    if (shuffleMode) {
      const order = ensureShuffleOrder()
      const pos = order.indexOf(currentTrack.id)
      const atEnd = direction === 1 && pos === order.length - 1
      if (isAutomatic && atEnd && repeatModeRef.current === 'off') return false
      const nextPos = ((pos + direction) % order.length + order.length) % order.length
      const nextId = order[nextPos]
      const nextTrack = playlist.find((t) => t.id === nextId)
      if (nextTrack) void play(nextTrack)
      return true
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id)
    const atEnd = direction === 1 && currentIndex === playlist.length - 1
    if (isAutomatic && atEnd && repeatModeRef.current === 'off') return false
    const nextIndex = ((currentIndex + direction) % playlist.length + playlist.length) % playlist.length
    void play(playlist[nextIndex])
    return true
  }, [playlist, currentTrack, play, shuffleMode, ensureShuffleOrder])

  const next = useCallback(() => {
    advance(1, false)
  }, [advance])

  const previous = useCallback(() => {
    advance(-1, false)
  }, [advance])

  // Initialize audio element on client — attached to document so GlobalAudioPlaybackGuard can coordinate.
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined' && !audioRef.current) {
      const el = new Audio()
      el.setAttribute('data-audio-owner', 'audio-provider')
      el.style.display = 'none'
      document.body.appendChild(el)
      audioRef.current = el
      el.volume = volume
    }

    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handlePlaying = () => setIsBuffering(false)
    const handleEnded = () => {
      if (loopRef.current) return
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0
        void audio.play().catch(() => undefined)
        return
      }
      // repeat ALL/OFF: advance() itself refuses to wrap when OFF and already at the end.
      advance(1, true)
    }
    const handleError = () => {
      logger.error('Audio playback error')
      setIsPlaying(false)
      setIsBuffering(false)
      setPlaybackError('This track could not be loaded.')
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [volume, advance])

  // Update volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Canonical player adoption (2026-10-29): advances ONE session tracker from
  // real currentTime/duration/isPlaying samples, keyed only by currentTrack.id
  // — never by which presentation component is mounted, so Main<->Mini<->any
  // other consumer of useAudio() share one playback session by construction.
  // Fires at most one qualified-play report per session (PlaybackReceiptOrchestrator),
  // and only when real context (mediaId/mediaType/discoverySource) has been
  // attached via attachPlaybackContext for the currently playing mediaId —
  // never a fabricated/guessed context. Purely additive observation: does not
  // alter any existing playback state or behavior.
  useEffect(() => {
    if (!currentTrack) {
      playbackSessionRef.current = null
      return
    }

    const isTabVisible = typeof document === 'undefined' ? true : document.visibilityState === 'visible'
    const nextState = processSample(
      playbackSessionRef.current,
      { mediaId: currentTrack.id, currentTime, duration, isPlaying, isTabVisible },
      mintSessionId,
    )
    playbackSessionRef.current = nextState

    const decision = decideReceiptAttempt(nextState, attemptedSessionIdsRef.current)
    if (!decision.shouldAttempt) return

    attemptedSessionIdsRef.current.add(nextState.playbackSessionId)

    const attachedContext = playbackContextRef.current
    if (!attachedContext || attachedContext.mediaId !== currentTrack.id) {
      // Real qualified listening occurred, but no caller has attached real
      // discovery/media-type context for this track yet — report the gap
      // rather than fabricate a context (owner requirement). Caller migration
      // to attachPlaybackContext() is a separate, explicitly tracked unit.
      logger.warn(
        `[AudioProvider] Qualified play detected for mediaId=${currentTrack.id} but no playback context was attached — receipt not reported.`,
      )
      return
    }

    void reportQualifiedPlayEvidence(
      {
        playbackSessionId: nextState.playbackSessionId,
        consumedSeconds: nextState.consumedSeconds,
        validDurationSeconds: nextState.validDurationSeconds,
      },
      attachedContext.context,
    )
  }, [currentTrack, currentTime, duration, isPlaying, mintSessionId])

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolume = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clamped)
  }

  const toggleMute = () => setIsMuted(prev => !prev)

  const addToPlaylist = (track: AudioTrack) => {
    const playableSrc = resolveDurablePlayableSrc(track.url)
    if (!playableSrc) return
    const next = { ...track, url: playableSrc }
    setPlaylist(prev => (prev.find(t => t.id === next.id) ? prev : [...prev, next]))
  }

  const removeFromPlaylist = (track: AudioTrack) => setPlaylist(prev => prev.filter(t => t.id !== track.id))

  const clearPlaylist = () => setPlaylist([])

  /** Wholesale queue replacement — e.g. "play this playlist/Yo Album" — then plays startIndex (or resumes). */
  const loadQueue = useCallback(async (tracks: AudioTrack[], startIndex = 0, playbackContext?: PlaybackContext): Promise<boolean> => {
    const resolved = tracks
      .map((t) => {
        const playableSrc = resolveDurablePlayableSrc(t.url)
        return playableSrc ? { ...t, url: playableSrc } : null
      })
      .filter((t): t is AudioTrack => t !== null)
    setPlaylist(resolved)
    shuffleOrderRef.current = []
    if (!playbackContext) {
      // A genuinely new queue with no supplied context must never inherit
      // the PREVIOUS queue's ambient context (stale context cannot cross a
      // session boundary — owner requirement). setPlaylist's new value isn't
      // committed yet when play() runs below, so play()'s own queue-member
      // fallback can't be trusted to self-correct here; clear explicitly.
      queueContextRef.current = null
    }
    const start = resolved[Math.max(0, Math.min(startIndex, resolved.length - 1))]
    if (!start) return false
    return play(start, undefined, playbackContext)
  }, [play])

  const reorderPlaylist = useCallback((fromIndex: number, toIndex: number) => {
    setPlaylist((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) return prev
      const copy = [...prev]
      const [moved] = copy.splice(fromIndex, 1)
      if (!moved) return prev
      copy.splice(toIndex, 0, moved)
      return copy
    })
    // Explicit queue order just changed — stale shuffle permutation would no longer be coherent.
    shuffleOrderRef.current = []
  }, [])

  const setRepeatMode = useCallback((mode: RepeatMode) => setRepeatModeState(mode), [])

  const toggleRepeat = useCallback(() => {
    setRepeatModeState((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffleMode((prev) => {
      const next = !prev
      shuffleOrderRef.current = next ? buildShuffleOrder(playlist, currentTrack?.id) : []
      return next
    })
  }, [playlist, currentTrack, buildShuffleOrder])

  const value: AudioContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playlist,
    play,
    pause,
    stop,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    loadQueue,
    reorderPlaylist,
    repeatMode,
    setRepeatMode,
    toggleRepeat,
    shuffleMode,
    toggleShuffle,
    isBuffering,
    playbackError,
    autoplayRejected,
    attachPlaybackContext,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}
