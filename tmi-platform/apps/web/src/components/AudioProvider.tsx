'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

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
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
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

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
    }

    const audio = audioRef.current

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      next()
    }

    const handleError = () => {
      console.error('Audio playback error')
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
  }, [])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const play = async (track?: AudioTrack) => {
    if (track) {
      setCurrentTrack(track)
      if (audioRef.current) {
        audioRef.current.src = track.url
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.error('Failed to play audio:', error)
        }
      }
    } else if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('Failed to play audio:', error)
      }
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  const next = () => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id)
      const nextIndex = (currentIndex + 1) % playlist.length
      play(playlist[nextIndex])
    }
  }

  const previous = () => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(track => track.id === currentTrack.id)
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
      play(playlist[prevIndex])
    }
  }

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const addToPlaylist = (track: AudioTrack) => {
    setPlaylist(prev => {
      if (!prev.find(t => t.id === track.id)) {
        return [...prev, track]
      }
      return prev
    })
  }

  const removeFromPlaylist = (track: AudioTrack) => {
    setPlaylist(prev => prev.filter(t => t.id !== track.id))
  }

  const clearPlaylist = () => {
    setPlaylist([])
  }

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
    clearPlaylist
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}
