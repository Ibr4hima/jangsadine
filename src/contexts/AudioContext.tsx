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
  jouer: (piste: PisteAudio) => void
  toggleLecture: () => void
  seeker: (pct: number) => void
  reculer: () => void
  avancer: () => void
  fermer: () => void
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

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.addEventListener('timeupdate', () => {
      setProgression((audio.currentTime / audio.duration) * 100 || 0)
      // Détecter le marker actuel
      if (markersRef.current.length > 0) {
        const actuel = [...markersRef.current]
          .reverse()
          .find(m => m.temps_secondes <= audio.currentTime)
        setMarkerActuel(actuel || null)
      }
    })
    audio.addEventListener('loadedmetadata', () => setDureeTotal(audio.duration))
    audio.addEventListener('play', () => setEnLecture(true))
    audio.addEventListener('pause', () => setEnLecture(false))
    audio.addEventListener('ended', () => { setEnLecture(false); setProgression(0) })

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => audio.play())
      navigator.mediaSession.setActionHandler('pause', () => audio.pause())
      navigator.mediaSession.setActionHandler('seekbackward', () => { audio.currentTime -= 10 })
      navigator.mediaSession.setActionHandler('seekforward', () => { audio.currentTime += 10 })
    }

    return () => { audio.pause(); audio.src = '' }
  }, [])

  // Sync markersRef avec markers state
  useEffect(() => {
    markersRef.current = markers
  }, [markers])

  function jouer(nouvellePiste: PisteAudio) {
    if (!audioRef.current) return
    if (piste?.id === nouvellePiste.id) {
      toggleLecture()
      return
    }
    audioRef.current.src = nouvellePiste.url
    audioRef.current.play()
    setPiste(nouvellePiste)
    setProgression(0)
    setDureeTotal(0)
    setMarkers([])
    setMarkerActuel(null)

    // Charger les markers
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

      navigator.mediaSession.setActionHandler('previoustrack',
        nouvellePiste.precedente ? () => jouer(nouvellePiste.precedente!) : null
      )
      navigator.mediaSession.setActionHandler('nexttrack',
        nouvellePiste.suivante ? () => jouer(nouvellePiste.suivante!) : null
      )
    }
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

  return (
    <AudioCtx.Provider value={{ piste, enLecture, progression, dureeTotal, markers, markerActuel, jouer, toggleLecture, seeker, reculer, avancer, fermer }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio doit etre utilise dans AudioProvider')
  return ctx
}