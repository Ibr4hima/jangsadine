'use client'
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'

type PisteAudio = {
  id: string
  titre: string
  sheikh: string
  url: string
  duree?: string
  href?: string
}

type AudioContextType = {
  piste: PisteAudio | null
  enLecture: boolean
  progression: number
  dureeTotal: number
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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.addEventListener('timeupdate', () => {
      setProgression((audio.currentTime / audio.duration) * 100 || 0)
      if (Math.floor(audio.currentTime) % 5 === 0) {
        localStorage.setItem('derniere_position', String(Math.floor(audio.currentTime)))
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

  function jouer(nouvellePiste: PisteAudio) {
    if (!audioRef.current) return
    if (piste?.id === nouvellePiste.id) {
      toggleLecture()
      return
    }
    audioRef.current.src = nouvellePiste.url
    audioRef.current.play()
    setPiste(nouvellePiste)
    localStorage.setItem('derniere_piste', JSON.stringify(nouvellePiste))
    setProgression(0)
    setDureeTotal(0)

    // Titre et sheikh sur l'écran de verrouillage
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nouvellePiste.titre,
        artist: nouvellePiste.sheikh,
        album: 'Jàng sa Diné',
        artwork: [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }]
      })
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
    setPiste(null); setEnLecture(false); setProgression(0)
  }

  return (
    <AudioCtx.Provider value={{ piste, enLecture, progression, dureeTotal, jouer, toggleLecture, seeker, reculer, avancer, fermer }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio doit etre utilise dans AudioProvider')
  return ctx
}