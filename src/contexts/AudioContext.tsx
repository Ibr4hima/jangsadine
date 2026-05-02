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
  const markersRef = useRef<Marker[]>([])
  const [livreAudio, setLivreAudio] = useState<{ url: string; titre: string } | null>(null)
  const [enLectureLivre, setEnLectureLivre] = useState(false)
  const [progressionLivre, setProgressionLivre] = useState(0)
  const livreAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => {
      setProgression((audio.currentTime / audio.duration) * 100 || 0)
      if (markersRef.current.length > 0) {
        const actuel = [...markersRef.current].reverse().find(m => m.temps_secondes <= audio.currentTime)
        setMarkerActuel(actuel || null)
      }
      if ('mediaSession' in navigator && audio.duration) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        })
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

    audio.addEventListener('play', () => setEnLecture(true))
    audio.addEventListener('pause', () => setEnLecture(false))
    audio.addEventListener('ended', () => { setEnLecture(false); setProgression(0) })

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => audio.play())
      navigator.mediaSession.setActionHandler('pause', () => audio.pause())
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        audio.currentTime = Math.max(0, audio.currentTime - (details?.seekOffset || 10))
      })
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + (details?.seekOffset || 10))
      })
    }

    return () => { audio.pause(); audio.src = '' }
  }, [])

  useEffect(() => {
    markersRef.current = markers
  }, [markers])

  function jouer(nouvellePiste: PisteAudio) {
    const audio = audioRef.current
    if (!audio) return
    if (piste?.id === nouvellePiste.id) {
      toggleLecture()
      return
    }
    // Fermer le livre audio
    if (livreAudioRef.current) {
      livreAudioRef.current.pause()
      livreAudioRef.current.src = ''
    }
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

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nouvellePiste.titre,
        artist: nouvellePiste.sheikh,
        album: 'Jàng sa Diné',
        artwork: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }]
      })
    }
  }

  function jouerLivre(url: string, titre: string) {
    // Fermer l'épisode
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setPiste(null)
    setEnLecture(false)
    setProgression(0)
    setMarkers([])
    setMarkerActuel(null)

    if (livreAudioRef.current) {
      livreAudioRef.current.pause()
      livreAudioRef.current.src = ''
    }
    const audio = new Audio(url)
    livreAudioRef.current = audio
    audio.addEventListener('timeupdate', () => {
      setProgressionLivre((audio.currentTime / audio.duration) * 100 || 0)
    })
    audio.addEventListener('play', () => setEnLectureLivre(true))
    audio.addEventListener('pause', () => setEnLectureLivre(false))
    audio.addEventListener('ended', () => { setEnLectureLivre(false); setProgressionLivre(0) })
    audio.play()
    setLivreAudio({ url, titre })
  }

  function toggleLivre() {
    if (!livreAudioRef.current) return
    if (enLectureLivre) livreAudioRef.current.pause()
    else livreAudioRef.current.play()
  }

  function toggleLecture() {
    if (!audioRef.current) return
    if (enLecture) audioRef.current.pause()
    else audioRef.current.play()
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
    }}>      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio doit etre utilise dans AudioProvider')
  return ctx
}

