'use client'
import { useEffect, useRef, useState } from 'react'
type Props = { titre: string; sheikh: string; url: string; onFermer: () => void }
export default function LecteurSticky({ titre, sheikh, url, onFermer }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [enLecture, setEnLecture] = useState(false)
  const [progression, setProgression] = useState(0)
  const [dureeTotal, setDureeTotal] = useState(0)
  const [dureeActuelle, setDureeActuelle] = useState(0)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.play().then(() => setEnLecture(true)).catch(() => {})
    const onTime = () => { setDureeActuelle(audio.currentTime); setProgression((audio.currentTime / audio.duration) * 100) }
    const onLoaded = () => setDureeTotal(audio.duration)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onLoaded) }
  }, [url])
  function toggleLecture() {
    if (!audioRef.current) return
    if (enLecture) { audioRef.current.pause(); setEnLecture(false) } else { audioRef.current.play(); setEnLecture(true) }
  }
  function formaterTemps(s: number) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return m + ':' + sec.toString().padStart(2, '0')
  }
  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * audioRef.current.duration
  }
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1a1a2e', borderTop: '2px solid #d6ad3a', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 200 }}>
      <audio ref={audioRef} src={url} onEnded={() => setEnLecture(false)} />
      <button onClick={toggleLecture} style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#d6ad3a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {enLecture
          ? <div style={{ display: 'flex', gap: '3px' }}><div style={{ width: '3px', height: '14px', background: '#1a1a2e', borderRadius: '2px' }} /><div style={{ width: '3px', height: '14px', background: '#1a1a2e', borderRadius: '2px' }} /></div>
          : <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid #1a1a2e', marginLeft: '3px' }} />
        }
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titre}</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{sheikh}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', minWidth: '36px' }}>{formaterTemps(dureeActuelle)}</span>
          <div onClick={seekTo} style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: progression + '%', height: '100%', background: '#d6ad3a', borderRadius: '2px' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', minWidth: '36px', textAlign: 'right' }}>{formaterTemps(dureeTotal)}</span>
        </div>
      </div>
      <button onClick={onFermer} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', flexShrink: 0, padding: '4px' }}>x</button>
    </div>
  )
}
