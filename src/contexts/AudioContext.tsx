'use client'
import { supabase } from '@/lib/supabase'
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'

type PisteAudio = {
  id: string
  titre: string
  sheikh: string
  url: string
  duree?: string
  href?: string
  precedente?: Omit<PisteAudio, 'precedente' | 'suivante'>
  suivante?: Omit<PisteAudio, 'precedente' | 'suivante'>
}

type Marker = { id: string; titre: string; temps_secondes: number }

type AudioContextType = {
  piste: PisteAudio | null
  enLecture: boolean
  progression: number
  dureeTotal: number
  markers: Marker[]
  markerActuel: Marker | null
  fermerLivre: () => void
  jouer: (piste: PisteAudio) => void
  toggleLecture: () => void
  seeker: (pct: number) => void
  reculer: () => void
  avancer: () => void
  fermer: () => void
  livreAudio: { url: string; titre: string } | null
  enLectureLivre: boolean
  progressionLivre: number
  jouerLivre: (url: string, titre: string) => void
  toggleLivre: () => void
}

const AudioCtx = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [piste, setPiste] = useState<PisteAudio | null>(null)
  const [enLecture, setEnLecture] = useState(false)
  const [progression, setProgression] = useState(0)
  const [dureeTotal, setDureeTotal] = useState(0)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [markerActuel, setMarkerActuel] = useState<Marker | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const livreAudioRef = useRef<HTMLAudioElement | null>(null)
  const markersRef = useRef<Marker[]>([])
  const [livreAudio, setLivreAudio] = useState<{ url: string; titre: string } | null>(null)
  const [enLectureLivre, setEnLectureLivre] = useState(false)
  const [progressionLivre, setProgressionLivre] = useState(0)

  useEffect(() => {
    const audio = document.getElementById('audio-principal') as HTMLAudioElement || new Audio()
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => {
      setProgression((audio.currentTime / audio.duration) * 100 || 0)
      if (markersRef.current.length > 0) {
        const actuel = [...markersRef.current].reverse().find(m => m.temps_secondes <= audio.currentTime)
        setMarkerActuel(actuel || null)
      }
      if ('mediaSession' in navigator && audio.duration) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
          })
        } catch { }
      }
    })

    audio.addEventListener('loadedmetadata', () => {
      setDureeTotal(audio.duration)
      const h = Math.floor(audio.duration / 3600)
      const m = Math.floor((audio.duration % 3600) / 60)
      const s = Math.floor(audio.duration % 60)
      const dureeReelle = h > 0
        ? h + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0')
        : m + ':' + s.toString().padStart(2, '0')
      setPiste(prev => prev ? { ...prev, duree: dureeReelle } : prev)
    })

    audio.addEventListener('play', () => {
      setEnLecture(true)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
    })

    audio.addEventListener('pause', () => {
      setEnLecture(false)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused'
      }
    })
    audio.addEventListener('ended', () => { setEnLecture(false); setProgression(0) })

    const livreAudioEl = document.getElementById('audio-livre') as HTMLAudioElement || new Audio()
    livreAudioRef.current = livreAudioEl

    livreAudioEl.addEventListener('timeupdate', () => {
      setProgressionLivre((livreAudioEl.currentTime / livreAudioEl.duration) * 100 || 0)
      if ('mediaSession' in navigator && livreAudioEl.duration) {
        try {
          navigator.mediaSession.setPositionState({
            duration: livreAudioEl.duration,
            playbackRate: livreAudioEl.playbackRate,
            position: livreAudioEl.currentTime,
          })
        } catch { }
      }
    })
    livreAudioEl.addEventListener('play', () => {
      setEnLectureLivre(true)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
    })

    livreAudioEl.addEventListener('pause', () => {
      setEnLectureLivre(false)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused'
      }
    })
    livreAudioEl.addEventListener('ended', () => { setEnLectureLivre(false); setProgressionLivre(0) })

    return () => {
      audio.pause(); audio.src = ''
      livreAudioEl.pause(); livreAudioEl.src = ''
    }
  }, [])

  useEffect(() => {
    markersRef.current = markers
  }, [markers])

  function setupMediaSession(audio: HTMLAudioElement, metadata: MediaMetadataInit) {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata(metadata)
    navigator.mediaSession.playbackState = 'playing'

    navigator.mediaSession.setActionHandler('play', () => {
      const pos = audio.currentTime
      audio.play().catch(() => {
        // Sur iOS : ne pas reload, juste reprendre
        audio.currentTime = pos
        audio.play().catch(console.error)
      })
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      audio.pause()
    })
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      audio.currentTime = Math.max(0, audio.currentTime - (details?.seekOffset || 10))
    })
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + (details?.seekOffset || 10))
    })
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) audio.currentTime = details.seekTime
    })
  }

  function jouer(nouvellePiste: PisteAudio) {
    const audio = audioRef.current
    if (!audio) return
    if (piste?.id === nouvellePiste.id) {
      toggleLecture()
      return
    }

    // Mettre en pause le livre audio
    if (livreAudioRef.current) livreAudioRef.current.pause()
    setLivreAudio(null)
    setEnLectureLivre(false)
    setProgressionLivre(0)

    audio.src = nouvellePiste.url
    audio.play()
    setPiste(nouvellePiste)
    setProgression(0)
    setDureeTotal(0)
    setMarkers([])
    setMarkerActuel(null)

    supabase.from('episode_markers')
      .select('*')
      .eq('episode_id', nouvellePiste.id)
      .order('temps_secondes')
      .then(({ data }) => {
        if (data && data.length > 0) setMarkers(data)
      })

    setupMediaSession(audio, {
      title: nouvellePiste.titre,
      artist: nouvellePiste.sheikh,
      album: 'Jàng sa Diné',
      artwork: [{ src: window.location.origin + '/logo.png', sizes: '512x512', type: 'image/png' }]
    })
  }

  function jouerLivre(url: string, titre: string) {
    const livreAudioEl = livreAudioRef.current
    if (!livreAudioEl) return

    // Mettre en pause l'épisode
    if (audioRef.current) audioRef.current.pause()
    setPiste(null)
    setEnLecture(false)
    setProgression(0)
    setMarkers([])
    setMarkerActuel(null)

    livreAudioEl.src = url
    livreAudioEl.play()
    setLivreAudio({ url, titre })
    setProgressionLivre(0)

    setupMediaSession(livreAudioEl, {
      title: titre,
      artist: 'Jàng sa Diné',
      album: 'Livre audio',
      artwork: [{ src: window.location.origin + '/logo.png', sizes: '512x512', type: 'image/png' }]
    })
  }

  function toggleLivre() {
    const audio = livreAudioRef.current
    if (!audio) return
    if (enLectureLivre) {
      audio.pause()
    } else {
      if (audio.paused) {
        audio.play().catch(() => {
          setTimeout(() => audio.play().catch(console.error), 300)
        })
      }
    }
  }

  function toggleLecture() {
    const audio = audioRef.current
    if (!audio) return
    if (enLecture) {
      audio.pause()
    } else {
      // Force la reprise sur iOS
      if (audio.paused) {
        audio.play().catch(() => {
          setTimeout(() => audio.play().catch(console.error), 300)
        })
      }
    }
  }

  function seeker(pct: number) {
    if (!audioRef.current) return
    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
  }

  function reculer() { if (audioRef.current) audioRef.current.currentTime -= 10 }
  function avancer() { if (audioRef.current) audioRef.current.currentTime += 10 }

  function fermer() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    setPiste(null); setEnLecture(false); setProgression(0); setMarkers([]); setMarkerActuel(null)
  }

  function fermerLivre() {
    if (livreAudioRef.current) { livreAudioRef.current.pause(); livreAudioRef.current.src = '' }
    setLivreAudio(null); setEnLectureLivre(false); setProgressionLivre(0)
  }

  return (
    <AudioCtx.Provider value={{
      piste, enLecture, progression, dureeTotal, markers, markerActuel,
      jouer, toggleLecture, seeker, reculer, avancer, fermer,
      livreAudio, enLectureLivre, progressionLivre, jouerLivre, toggleLivre, fermerLivre
    }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio doit etre utilise dans AudioProvider')
  return ctx
}