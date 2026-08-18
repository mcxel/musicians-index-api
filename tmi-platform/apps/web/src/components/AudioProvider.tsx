"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { logger } from '@/lib/logger'
import { resolveDurablePlayableSrc } from '@/lib/media/durablePlayableUrl'

interface AudioTrack {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  artwork?: string
}

interface AudioContextType {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playlist: AudioTrack[]
  play: (track?: AudioTrack) => void
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

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Hoist controls so effects can reference them
  const play = useCallback(async (track?: AudioTrack) => {
    if (track) {
      const playableSrc = resolveDurablePlayableSrc(track.url)
      if (!playableSrc) {
        logger.error('Refusing non-durable audio source (blob: or simulated CDN)')
        setIsPlaying(false)
        return
      }
      setCurrentTrack({ ...track, url: playableSrc })
      if (audioRef.current) {
        audioRef.current.src = playableSrc
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          logger.error('Failed to play audio:', error)
          setIsPlaying(false)
        }
      }
    } else if (audioRef.current && currentTrack) {
      if (!resolveDurablePlayableSrc(currentTrack.url)) {
        setIsPlaying(false)
        return
      }
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        logger.error('Failed to play audio:', error)
        setIsPlaying(false)
      }
    }
  }, [currentTrack])

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

  const next = useCallback(() => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id)
      const nextIndex = (currentIndex + 1) % playlist.length
      play(playlist[nextIndex])
    }
  }, [playlist, currentTrack, play])

  const previous = useCallback(() => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id)
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
      play(playlist[prevIndex])
    }
  }, [playlist, currentTrack, play])

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
    const handleEnded = () => next()
    const handleError = () => {
      logger.error('Audio playback error')
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [volume, next])

  // Update volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

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
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}
