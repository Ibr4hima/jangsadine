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
  livreAudio: { url: string; titre: string; livreId: string } | null
  enLectureLivre: boolean
  progressionLivre: number
  jouerLivre: (url: string, titre: string, livreId: string) => void
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
  const mediaMetaRef = useRef<{ audio: HTMLAudioElement; metadata: MediaMetadataInit } | null>(null)
  // Oscillateur Web Audio API à gain=0 : maintient la session iOS sans créer de média visible
  const oscCtxRef = useRef<AudioContext | null>(null)
  const [livreAudio, setLivreAudio] = useState<{ url: string; titre: string; livreId: string } | null>(null)
  const [enLectureLivre, setEnLectureLivre] = useState(false)
  const [progressionLivre, setProgressionLivre] = useState(0)

  useEffect(() => {
    const audio = document.getElementById('audio-principal') as HTMLAudioElement
    const livreAudioEl = document.getElementById('audio-livre') as HTMLAudioElement
    audioRef.current = audio
    livreAudioRef.current = livreAudioEl

    const reveil = () => {
      if (!mediaMetaRef.current) return
      const { audio: a, metadata } = mediaMetaRef.current
      applyMediaSession(a, metadata)
      if ('mediaSession' in navigator)
        navigator.mediaSession.playbackState = a.paused ? 'paused' : 'playing'
      if (oscCtxRef.current?.state === 'suspended') {
        oscCtxRef.current.resume().catch(() => {})
      }
    }
    const onVisibilityChange = () => { if (!document.hidden) reveil() }
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) reveil() }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pageshow', onPageShow)

    // Listeners épisode
    audio.addEventListener('timeupdate', () => {
      setProgression((audio.currentTime / audio.duration) * 100 || 0)
      if (markersRef.current.length > 0) {
        const actuel = [...markersRef.current].reverse().find(m => m.temps_secondes <= audio.currentTime)
        setMarkerActuel(actuel || null)
      }
      if ('mediaSession' in navigator && audio.duration) {
        try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: audio.currentTime }) } catch { }
      }
    })
    audio.addEventListener('loadedmetadata', () => {
      setDureeTotal(audio.duration)
      const h = Math.floor(audio.duration / 3600)
      const m = Math.floor((audio.duration % 3600) / 60)
      const s = Math.floor(audio.duration % 60)
      setPiste(prev => prev ? { ...prev, duree: h > 0 ? h + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0') : m + ':' + s.toString().padStart(2, '0') } : prev)
    })
    audio.addEventListener('play', () => {
      setEnLecture(true)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
        if (mediaMetaRef.current?.audio === audio) applyMediaSession(audio, mediaMetaRef.current.metadata)
      }
    })
    audio.addEventListener('pause', () => {
      setEnLecture(false)
      oscCtxRef.current?.resume().catch(() => {})
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused'
        if (mediaMetaRef.current?.audio === audio) applyMediaSession(audio, mediaMetaRef.current.metadata)
        // Ré-affirme notre session 600ms après pour contrer une app tierce qui pourrait la récupérer
        setTimeout(() => {
          if (mediaMetaRef.current?.audio === audio && audio.paused) {
            navigator.mediaSession.playbackState = 'paused'
            applyMediaSession(audio, mediaMetaRef.current.metadata)
          }
        }, 600)
      }
    })
    audio.addEventListener('ended', () => { setEnLecture(false); setProgression(0) })

    // Listeners livre
    livreAudioEl.addEventListener('timeupdate', () => {
      setProgressionLivre((livreAudioEl.currentTime / livreAudioEl.duration) * 100 || 0)
      if ('mediaSession' in navigator && livreAudioEl.duration) {
        try { navigator.mediaSession.setPositionState({ duration: livreAudioEl.duration, playbackRate: livreAudioEl.playbackRate, position: livreAudioEl.currentTime }) } catch { }
      }
    })
    livreAudioEl.addEventListener('play', () => {
      setEnLectureLivre(true)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
        if (mediaMetaRef.current?.audio === livreAudioEl) applyMediaSession(livreAudioEl, mediaMetaRef.current.metadata)
      }
    })
    livreAudioEl.addEventListener('pause', () => {
      setEnLectureLivre(false)
      oscCtxRef.current?.resume().catch(() => {})
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused'
        if (mediaMetaRef.current?.audio === livreAudioEl) applyMediaSession(livreAudioEl, mediaMetaRef.current.metadata)
        setTimeout(() => {
          if (mediaMetaRef.current?.audio === livreAudioEl && livreAudioEl.paused) {
            navigator.mediaSession.playbackState = 'paused'
            applyMediaSession(livreAudioEl, mediaMetaRef.current.metadata)
          }
        }, 600)
      }
    })
    livreAudioEl.addEventListener('ended', () => { setEnLectureLivre(false); setProgressionLivre(0) })

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  useEffect(() => { markersRef.current = markers }, [markers])

  // Démarre un oscillateur muet dans le Web Audio API pour maintenir la session iOS active.
  // Contrairement à un <audio>, l'AudioContext n'apparaît pas comme un média dans le widget iOS.
  function initSession() {
    if (oscCtxRef.current) {
      if (oscCtxRef.current.state === 'suspended') oscCtxRef.current.resume().catch(() => {})
      return
    }
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      oscCtxRef.current = ctx
    } catch { }
  }

  function closeSession() {
    oscCtxRef.current?.suspend().catch(() => {})
  }

  function applyMediaSession(audio: HTMLAudioElement, metadata: MediaMetadataInit) {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata(metadata)
    navigator.mediaSession.setActionHandler('play', () => {
      oscCtxRef.current?.resume().catch(() => {})
      audio.play().catch(() => { setTimeout(() => audio.play().catch(console.error), 300) })
    })
    navigator.mediaSession.setActionHandler('pause', () => { audio.pause() })
    navigator.mediaSession.setActionHandler('seekbackward', (d) => { audio.currentTime = Math.max(0, audio.currentTime - (d?.seekOffset || 10)) })
    navigator.mediaSession.setActionHandler('seekforward', (d) => { audio.currentTime = Math.min(audio.duration, audio.currentTime + (d?.seekOffset || 10)) })
    navigator.mediaSession.setActionHandler('seekto', (d) => { if (d.seekTime !== undefined) audio.currentTime = d.seekTime })
  }

  function setupMediaSession(audio: HTMLAudioElement, metadata: MediaMetadataInit) {
    if (!('mediaSession' in navigator)) return
    mediaMetaRef.current = { audio, metadata }
    applyMediaSession(audio, metadata)
    navigator.mediaSession.playbackState = 'playing'
  }

  function jouer(nouvellePiste: PisteAudio) {
    const audio = audioRef.current
    if (!audio) return
    if (piste?.id === nouvellePiste.id) { toggleLecture(); return }

    if (livreAudioRef.current) livreAudioRef.current.pause()
    setLivreAudio(null); setEnLectureLivre(false); setProgressionLivre(0)

    initSession()

    const source = document.getElementById('source-principal') as HTMLSourceElement
    if (source) source.src = nouvellePiste.url
    audio.load()
    audio.play().catch(console.error)

    setPiste(nouvellePiste); setProgression(0); setDureeTotal(0); setMarkers([]); setMarkerActuel(null)

    supabase.from('episode_markers').select('*').eq('episode_id', nouvellePiste.id).order('temps_secondes')
      .then(({ data }) => { if (data && data.length > 0) setMarkers(data) })

    setupMediaSession(audio, {
      title: nouvellePiste.titre, artist: nouvellePiste.sheikh, album: 'Jàng sa Diné',
      artwork: [{ src: window.location.origin + '/logo.png', sizes: '512x512', type: 'image/png' }]
    })
  }

  function jouerLivre(url: string, titre: string, livreId: string) {
    const livreAudioEl = livreAudioRef.current
    if (!livreAudioEl) return

    if (audioRef.current) audioRef.current.pause()
    setPiste(null); setEnLecture(false); setProgression(0); setMarkers([]); setMarkerActuel(null)

    initSession()

    const source = document.getElementById('source-livre') as HTMLSourceElement
    if (source) source.src = url
    livreAudioEl.load()
    livreAudioEl.play().catch(console.error)

    setLivreAudio({ url, titre, livreId }); setProgressionLivre(0)

    setupMediaSession(livreAudioEl, {
      title: titre, artist: 'Jàng sa Diné', album: 'Livre audio',
      artwork: [{ src: window.location.origin + '/logo.png', sizes: '512x512', type: 'image/png' }]
    })
  }

  function toggleLivre() {
    const audio = livreAudioRef.current
    if (!audio) return
    enLectureLivre ? audio.pause() : audio.play().catch(console.error)
  }

  function toggleLecture() {
    const audio = audioRef.current
    if (!audio) return
    enLecture ? audio.pause() : audio.play().catch(console.error)
  }

  function seeker(pct: number) {
    if (!audioRef.current) return
    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
  }

  function reculer() { if (audioRef.current) audioRef.current.currentTime -= 10 }
  function avancer() { if (audioRef.current) audioRef.current.currentTime += 10 }

  function fermer() {
    closeSession()
    if (audioRef.current) { audioRef.current.pause(); const s = document.getElementById('source-principal') as HTMLSourceElement; if (s) s.src = '' }
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = null
    mediaMetaRef.current = null
    setPiste(null); setEnLecture(false); setProgression(0); setMarkers([]); setMarkerActuel(null)
  }

  function fermerLivre() {
    closeSession()
    if (livreAudioRef.current) { livreAudioRef.current.pause(); const s = document.getElementById('source-livre') as HTMLSourceElement; if (s) s.src = '' }
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = null
    mediaMetaRef.current = null
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
